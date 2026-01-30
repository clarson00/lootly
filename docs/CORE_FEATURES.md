# Core Features Spec

> **For Claude Code** — This defines the MVP feature set for the PostgreSQL/Drizzle migration.

---

## Overview

Three user types:
1. **Customer** — Earns points, redeems rewards
2. **Staff** — Checks in customers, records spend, processes redemptions
3. **Platform Admin** — Onboards tenants, manages subscriptions, administers platform

---

## 1. Phone Lookup Check-in

**What:** Staff enters customer phone number, system returns customer profile.

**Flow:**
1. Staff logs in (location + PIN)
2. Staff enters customer phone (10-digit)
3. System returns: name, points balance, available rewards
4. Staff enters spend amount
5. System calculates points (spend × rate × multiplier)
6. Staff confirms → points awarded

**API:**
```
POST /api/staff/lookup
Body: { phone: "5551234567" }
Returns: { customer, enrollment, availableRewards }

POST /api/staff/record-visit
Body: { customerId, spendAmount }
Returns: { pointsEarned, newBalance, rewardsUnlocked }
```

**Database:**
- `customers.phone` — indexed, unique
- `visits` — records each transaction
- `enrollments` — points balance per business

---

## 2. Points Balance

**What:** Customers earn points per business, tracked separately.

**Rules:**
- Points per dollar (configurable per business, default 1:1)
- Points multiplier (default 1.0, upgradeable)
- Points balance stored on `enrollments` table

**API:**
```
GET /api/customer/enrollment/:businessId
Returns: { pointsBalance, totalPointsEarned, totalSpend, multiplier }
```

---

## 3. Rewards System

**What:** Customers spend points to unlock rewards, redeem at locations.

**Flow:**
1. Customer views available rewards
2. Customer unlocks reward (points deducted)
3. Reward moves to "unlocked" status with redemption code
4. At location, staff looks up customer → sees unlocked rewards
5. Staff marks reward redeemed

**Metering (CRITICAL):**

| Limit | Free | Starter | Pro |
|-------|------|---------|-----|
| Active rewards per business | 3 | 10 | Unlimited |
| Milestone rewards | ❌ | ❌ | ✅ |
| Multiplier bonuses | ❌ | ❌ | ✅ |

**Enforcement:**
- `POST /api/rewards` checks count before creating
- Milestone/multiplier fields rejected if not entitled
- Frontend hides gated features, backend enforces

**API:**
```
GET /api/rewards/:businessId
Returns: { rewards[] } // filtered by active, entitled

POST /api/rewards (business admin)
Body: { name, pointsCost, type, ... }
Returns: { reward } or { error: "LIMIT_REACHED" }

POST /api/customer/rewards/:rewardId/unlock
Returns: { customerReward, redemptionCode }

POST /api/staff/redeem
Body: { redemptionCode }
Returns: { success, reward }
```

**Database:**
- `rewards.is_milestone` — boolean, gated to PRO
- `rewards.milestone_bonus_multiplier` — float, gated to PRO
- `customer_rewards` — tracks unlocked/redeemed status

---

## 4. Multi-location Tracking

**What:** Track which locations a customer has visited.

**Purpose:** Enables milestone rewards (e.g., "Visit all 4 locations")

**Implementation:**
- `visits.location_id` — FK to locations
- Query: `SELECT DISTINCT location_id FROM visits WHERE customer_id = ?`
- Milestone check runs after each visit

**API:**
```
GET /api/customer/locations-visited/:businessId
Returns: { visited: ["loc_1", "loc_2"], total: 4 }
```

---

## 5. Staff Auth

**What:** Staff log in with location + PIN.

**Flow:**
1. Staff selects location (dropdown or QR scan)
2. Staff enters 4-digit PIN
3. System validates against `staff` table
4. Returns JWT scoped to location

**API:**
```
POST /api/staff/login
Body: { locationId, pin }
Returns: { token, staff, location }
```

**Security:**
- PIN hashed with bcrypt
- JWT contains: staffId, locationId, businessId
- Token expires in 8 hours (shift length)

---

## 6. Customer Auth

**What:** Customers log in with phone + SMS code.

**Flow:**
1. Customer enters phone number
2. System sends 6-digit code via SMS (Twilio)
3. Customer enters code
4. System validates, returns JWT

**API:**
```
POST /api/auth/request-code
Body: { phone: "5551234567" }
Returns: { success: true }

POST /api/auth/verify-code
Body: { phone, code }
Returns: { token, customer, isNewCustomer }
```

**Notes:**
- Code expires in 10 minutes
- Max 3 attempts per code
- New customers auto-created on first verify

---

## 7. Multi-tenancy

**What:** All data scoped to business. No cross-tenant data leakage.

**Rules:**
- Every table with business data has `business_id` column
- Every query includes `WHERE business_id = ?`
- JWT contains `businessId` for staff/admin routes
- Customers can enroll in multiple businesses (via `enrollments`)

**Pattern:**
```typescript
// Always scope queries
const rewards = await db.query.rewards.findMany({
  where: and(
    eq(rewards.business_id, businessId),
    eq(rewards.is_active, true)
  )
});
```

---

## 8. Platform Admin

**What:** Superuser role for Lootly platform operators. Manages tenants, subscriptions, and platform-level config.

### Capabilities

| Action | Description |
|--------|-------------|
| **Onboard tenant** | Create new business, set up initial config |
| **Set subscription tier** | FREE / STARTER / PRO / ENTERPRISE |
| **View all businesses** | List, search, filter tenants |
| **Impersonate business** | View as business admin (read-only for debugging) |
| **Suspend/activate business** | Disable access without deleting data |
| **View platform metrics** | Total businesses, customers, transactions |
| **Manage feature flags** | Enable/disable features globally or per-tenant |
| **Override limits** | Grant exceptions (e.g., extra rewards for pilot) |

### Database Tables

See `DATABASE_SCHEMA.md` for full definitions:
- `platform_admins` — Platform operator accounts
- `admin_audit_log` — Audit trail for all admin actions
- `businesses.subscription_tier` — FREE/STARTER/PRO/ENTERPRISE
- `businesses.subscription_status` — active/suspended/cancelled
- `businesses.feature_overrides` — JSONB for per-tenant exceptions

### API Routes

```
# Auth
POST   /api/admin/login
POST   /api/admin/logout

# Businesses
GET    /api/admin/businesses              # List all
GET    /api/admin/businesses/:id          # Get details
POST   /api/admin/businesses              # Onboard new tenant
PATCH  /api/admin/businesses/:id          # Update settings
POST   /api/admin/businesses/:id/suspend
POST   /api/admin/businesses/:id/activate

# Subscriptions
PATCH  /api/admin/businesses/:id/subscription
Body: { tier: 'pro', trialEndsAt?: date }

# Feature overrides
PATCH  /api/admin/businesses/:id/features
Body: { overrides: { maxRewards: 10, milestonesEnabled: true } }

# Platform metrics
GET    /api/admin/metrics
Returns: { totalBusinesses, totalCustomers, totalTransactions, mrr }

# Audit log
GET    /api/admin/audit-log
Query: { businessId?, adminId?, action?, limit, offset }
```

### Auth & Security

- Separate JWT issuer/audience from staff/customer tokens
- Require email + password (not phone)
- Optional: 2FA for superadmin role
- All actions logged to `admin_audit_log`
- Impersonation is read-only, logged

### UI (Admin Dashboard)

Separate app or protected routes:
- `/admin/login`
- `/admin/businesses` — table with search, filter by tier/status
- `/admin/businesses/:id` — detail view, subscription controls
- `/admin/metrics` — charts, KPIs
- `/admin/audit` — searchable log

---

## Feature Gating Implementation

### Tiers

| Tier | Price | Rewards | Milestones | Multipliers | Locations |
|------|-------|---------|------------|-------------|-----------||
| FREE | $0 | 3 | ❌ | ❌ | 1 |
| STARTER | $29/mo | 10 | ❌ | ❌ | 3 |
| PRO | $79/mo | Unlimited | ✅ | ✅ | 10 |
| ENTERPRISE | Custom | Unlimited | ✅ | ✅ | Unlimited |

### Middleware

```typescript
// Feature check middleware
const requireFeature = (feature: string) => {
  return async (req, res, next) => {
    const business = await getBusiness(req.businessId);
    const entitled = checkEntitlement(business, feature);
    
    if (!entitled) {
      return res.status(403).json({ 
        error: 'FEATURE_NOT_AVAILABLE',
        feature,
        currentTier: business.subscription_tier,
        requiredTier: getRequiredTier(feature)
      });
    }
    
    next();
  };
};

// Usage
app.post('/api/rewards', 
  requireAuth, 
  requireFeature('rewards.create'),
  createRewardHandler
);
```

### Limit Checks

```typescript
// Before creating reward
const checkRewardLimit = async (businessId: string) => {
  const business = await getBusiness(businessId);
  const limits = getTierLimits(business.subscription_tier);
  const currentCount = await countActiveRewards(businessId);
  
  // Check for override
  const override = business.feature_overrides?.maxRewards;
  const maxAllowed = override ?? limits.maxRewards;
  
  if (currentCount >= maxAllowed) {
    throw new LimitExceededError('rewards', currentCount, maxAllowed);
  }
};
```

---

## Summary

**Core features (all tiers):**
- Phone lookup check-in
- Points earning (per dollar)
- Basic rewards (points → reward)
- Multi-location tracking
- Staff/customer auth
- Multi-tenancy

**Gated features:**
- Milestone rewards (PRO+)
- Multiplier bonuses (PRO+)
- Rewards > 3 (STARTER+)
- Locations > 1 (STARTER+)

**Platform admin:**
- Tenant onboarding
- Subscription management
- Feature overrides
- Platform metrics
- Audit logging

---

*Last updated: January 30, 2025*
