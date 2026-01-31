# Tenant Onboarding Journey

> **Status:** 🔷 Specified
> **Priority:** High - First impression for business owners
> **Category:** Tenant Experience

---

## Dependencies

- **Requires:**
  - Admin app
  - SMS verification service (Twilio)
  - Business/tenant database schema

- **Enables:**
  - Tenant access to admin dashboard
  - Business configuration
  - Staff management
  - Customer program setup

---

## Roadmap Position

- **Tier:** 1 (MVP)
- **Phase:** MVP
- **Category:** Tenant

---

## Overview

Tenant onboarding mirrors customer simplicity: phone number → verify → business info → dashboard. Total: 5 screens, under 2 minutes.

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│              │    │              │    │              │    │              │    │              │
│    Phone     │───►│   Verify     │───►│  Business    │───►│  Quick       │───►│  Dashboard   │
│    Number    │    │    Code      │    │    Info      │    │   Tour       │    │   (Done!)    │
│              │    │              │    │              │    │              │    │              │
└──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘
     10 sec              5 sec              30 sec             30 sec              Done!
```

### Design Principles

1. **Same auth as customers** - Phone number is universal identity
2. **Minimal required info** - Get them to value fast, collect details later
3. **Immediate value** - Trial starts instantly, no sales call required
4. **Show don't tell** - Brief tour of what they can do

---

## Entry Points

### How Tenants Find Us

| Entry Point | Experience |
|-------------|------------|
| **Direct URL** | rewardspirate.app/business |
| **Customer referral** | "The business I visited uses this..." |
| **Landing page CTA** | Footer link "For Businesses" |
| **Word of mouth** | Other business owner recommendation |
| **Sales/marketing** | Direct outreach with custom links |

### Landing Page: /business

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                 │
│  [Logo]                              [Just want rewards? →]                    │
│                                                                                 │
│  ═══════════════════════════════════════════════════════════════════════════   │
│                                                                                 │
│                                   🏴‍☠️                                         │
│                                                                                 │
│                    Turn Customers into Loyal Crew                              │
│                                                                                 │
│        Rewards Pirate helps local businesses build                            │
│        loyalty programs that customers actually love.                          │
│                                                                                 │
│                     [Start Free Trial →]                                       │
│                                                                                 │
│                    No credit card required                                     │
│                                                                                 │
│  ═══════════════════════════════════════════════════════════════════════════   │
│                                                                                 │
│  🎯 Simple Setup              📊 Real Insights           🎮 Gamified Experience │
│                                                                                 │
│  Create rewards in            See who's coming back      Points, quests, and   │
│  minutes, not hours           and why                    achievements keep     │
│                                                          customers engaged     │
│                                                                                 │
│  ═══════════════════════════════════════════════════════════════════════════   │
│                                                                                 │
│  "We tried punch cards for years. This actually works."                        │
│                              - Tony's Restaurant Group                          │
│                                                                                 │
│  ═══════════════════════════════════════════════════════════════════════════   │
│                                                                                 │
│  Pricing                                                                       │
│                                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐                │
│  │ STARTER         │  │ GROWTH          │  │ PRO             │                │
│  │ Free forever    │  │ $29/mo          │  │ $79/mo          │                │
│  │                 │  │                 │  │                 │                │
│  │ • 100 customers │  │ • Unlimited     │  │ • Everything    │                │
│  │ • Basic rewards │  │ • Custom quests │  │ • AI marketing  │                │
│  │ • 1 location    │  │ • 3 locations   │  │ • Unlimited loc │                │
│  │                 │  │                 │  │ • Priority help │                │
│  │ [Start Free]    │  │ [Start Trial]   │  │ [Contact Sales] │                │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘                │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Screen 1: Phone Number

Same flow as customer - phone is your ID.

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│ ← Back to landing                                                  │
│                                                                     │
│                              🏴‍☠️                                   │
│                                                                     │
│                     Captain's Quarters                              │
│                                                                     │
│            Your phone number is your login                          │
│            No passwords to remember                                 │
│                                                                     │
│         ┌─────────────────────────────────────────────────────┐    │
│         │  🇺🇸 +1  │  (555) 123-4567                          │    │
│         └─────────────────────────────────────────────────────┘    │
│                                                                     │
│                        [Send Code]                                  │
│                                                                     │
│  ─────────────────────────────────────────────────────────────────  │
│                                                                     │
│        Already have an account? We'll take you to your             │
│        dashboard after verification.                                │
│                                                                     │
│  ─────────────────────────────────────────────────────────────────  │
│                                                                     │
│         By continuing, you agree to our Terms of Service           │
│         and Privacy Policy.                                        │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Existing Tenant Detection

If phone matches an existing tenant:

```
Phone verified → Check if tenant exists
                     │
       ┌─────────────┴─────────────┐
       │                           │
       ▼                           ▼
  New tenant                 Existing tenant
       │                           │
       ▼                           ▼
 Business Info           Skip to Dashboard
    screen                (with welcome back)
```

---

## Screen 2: Verify Code

Identical to customer verification (reuse component).

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│ ← Back                                                             │
│                                                                     │
│                              🏴‍☠️                                   │
│                                                                     │
│                    Enter your code                                  │
│                                                                     │
│              We sent a code to (555) 123-4567                      │
│                                                                     │
│                   ┌───┐ ┌───┐ ┌───┐ ┌───┐                         │
│                   │ 1 │ │ 2 │ │ 3 │ │ 4 │                         │
│                   └───┘ └───┘ └───┘ └───┘                         │
│                                                                     │
│                   Didn't get a code?                               │
│                   [Resend] (available in 30s)                      │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Screen 3: Business Info

Collect minimum info to get started. Everything else can be configured later.

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│                              🏴‍☠️                                   │
│                                                                     │
│                   Tell us about your ship                           │
│                                                                     │
│        We'll use this to set up your loyalty program               │
│                                                                     │
│  ─────────────────────────────────────────────────────────────────  │
│                                                                     │
│  Business Name *                                                    │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ Tony's Pizza                                                  │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  What type of business? *                                          │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ Restaurant / Food Service                                  ▼  │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  How many locations?                                               │
│                                                                     │
│     ┌───────┐  ┌───────┐  ┌───────┐  ┌───────┐                    │
│     │   1   │  │  2-5  │  │  6-10 │  │  10+  │                    │
│     └───────┘  └───────┘  └───────┘  └───────┘                    │
│        ▲                                                           │
│     selected                                                       │
│                                                                     │
│  Your email (optional, for receipts)                               │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ tony@tonys.com                                                │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  ─────────────────────────────────────────────────────────────────  │
│                                                                     │
│                       [Continue]                                   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Business Type Options

```
Restaurant / Food Service
Coffee Shop / Café
Bar / Brewery / Winery
Retail Store
Salon / Spa / Beauty
Fitness / Gym / Studio
Auto / Service Center
Entertainment / Recreation
Other
```

### Why We Ask

| Field | Why |
|-------|-----|
| **Business Name** | Display in customer app, branding |
| **Type** | Pre-populate reward templates, vertical-specific features |
| **Locations** | Tier recommendation, multi-location setup |
| **Email** | Receipts, important notifications (optional) |

---

## Screen 4: Quick Tour (Optional)

Brief orientation. Can be skipped.

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│                              🎉                                    │
│                                                                     │
│                 Welcome aboard, Captain!                            │
│                                                                     │
│           Tony's Pizza is ready to reward customers                 │
│                                                                     │
│  ─────────────────────────────────────────────────────────────────  │
│                                                                     │
│  Let me show you the ropes...                                      │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                                                             │   │
│  │  📍 Step 1: Add your location                              │   │
│  │                                                             │   │
│  │     We've created a default location.                      │   │
│  │     You can add more anytime.                              │   │
│  │                                                             │   │
│  │              ● ○ ○ ○                                       │   │
│  │                                                             │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│                        [Next]                                      │
│                                                                     │
│                      [Skip tour]                                   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Tour Steps (4 slides)

1. **Location** - "Add your location" (we create a default)
2. **Staff PINs** - "Set up staff access" (tablet check-in)
3. **Rewards** - "Create your first reward" (templates available)
4. **Go Live** - "Share with customers" (QR code + link)

Each slide: 3-5 seconds read time, swipe or tap Next.

---

## Screen 5: Dashboard (Done!)

Land on admin dashboard. Tour complete.

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│ Tony's Pizza                              [Settings ⚙️]            │
│ ▼ Downtown Location                                                │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ 📊 QUICK STATS                                                     │
│                                                                     │
│ ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │
│ │     0        │  │     0        │  │     0        │               │
│ │   Members    │  │  Check-ins   │  │   Rewards    │               │
│ │              │  │   Today      │  │   Claimed    │               │
│ └──────────────┘  └──────────────┘  └──────────────┘               │
│                                                                     │
│ ─────────────────────────────────────────────────────────────────   │
│                                                                     │
│ 🚀 GET STARTED                                                     │
│                                                                     │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ [ ] Add your first location details                             │ │
│ │ [ ] Create a staff PIN for check-ins                            │ │
│ │ [ ] Set up your first reward                                    │ │
│ │ [ ] Share your QR code with customers                           │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ ─────────────────────────────────────────────────────────────────   │
│                                                                     │
│ 💡 TIP: Customers can earn points just by checking in!             │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│ [📊 Dashboard] [📍 Locations] [🎁 Rewards] [📜 Rules] [👥 Staff]  │
└─────────────────────────────────────────────────────────────────────┘
```

### First-Time Checklist

Persistent until completed. Shows progress and guides setup.

---

## Tenant vs Customer: How the System Knows

### Database Model

```sql
-- Users table (shared identity)
CREATE TABLE users (
  id TEXT PRIMARY KEY,           -- "usr_abc123"
  phone TEXT NOT NULL UNIQUE,    -- "+15551234567"
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customer profile (when they use customer app)
CREATE TABLE customers (
  id TEXT PRIMARY KEY,           -- "cust_abc"
  user_id TEXT REFERENCES users(id),
  display_name TEXT,
  -- ... customer-specific fields
);

-- Tenant profile (when they use admin app)
CREATE TABLE tenants (
  id TEXT PRIMARY KEY,           -- "tenant_abc"
  user_id TEXT REFERENCES users(id),
  -- ... tenant-specific fields
);

-- Businesses (owned by tenants)
CREATE TABLE businesses (
  id TEXT PRIMARY KEY,           -- "biz_abc"
  tenant_id TEXT REFERENCES tenants(id),
  name TEXT NOT NULL,
  category TEXT,
  -- ... business config
);
```

### One Phone, Multiple Roles

A single phone number can be:
- A customer at multiple businesses
- A tenant owning their own business
- Both simultaneously

The **app they open** determines which role they're using.

---

## Returning Tenant Flow

If phone exists in tenants table:

```
Phone verified → Tenant exists?
                     │
                    YES
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│                   Welcome back, Captain!                            │
│                                                                     │
│                   Tony's Pizza                                      │
│                                                                     │
│                   [Continue to Dashboard]                           │
│                                                                     │
│  ─────────────────────────────────────────────────────────────────  │
│                                                                     │
│                   Manage a different business?                      │
│                   [Add another business]                            │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Trial & Tier Assignment

### Automatic Trial Setup

On business creation:

```typescript
async function createBusiness(tenantId: string, info: BusinessInfo) {
  const business = await db.insert(businesses).values({
    id: generateId('biz'),
    tenantId,
    name: info.name,
    category: info.category,

    // Auto-assign trial tier
    tierId: 'tier_growth',  // Full features
    tierStatus: 'trial',
    trialEndsAt: addDays(new Date(), 14),

    // Default settings based on category
    ...getDefaultsForCategory(info.category)
  });

  // Create default location
  await createDefaultLocation(business.id, info.name);

  // Create default rewards from templates
  await createDefaultRewards(business.id, info.category);

  return business;
}
```

### What Happens at Trial End

```
Trial ends →
  │
  ├─ No payment method → Downgrade to Starter (free, limited)
  │
  └─ Payment method → Continue on selected tier
```

No hard cutoff - they keep data, just lose premium features.

---

## Default Setup by Category

When tenant selects business type, we pre-configure:

### Restaurant

```typescript
{
  defaultRewards: [
    { name: 'Free Appetizer', points: 500 },
    { name: 'Free Dessert', points: 300 },
    { name: '$5 Off', points: 200 }
  ],
  suggestedRules: [
    { name: 'Check-in Bonus', type: 'check_in', points: 10 },
    { name: 'Spend Points', type: 'spend', pointsPerDollar: 1 }
  ],
  terminology: {
    visit: 'dine',
    points: 'points'
  }
}
```

### Coffee Shop

```typescript
{
  defaultRewards: [
    { name: 'Free Drink', points: 100 },
    { name: 'Free Pastry', points: 75 },
    { name: 'Size Upgrade', points: 25 }
  ],
  suggestedRules: [
    { name: 'Buy 9, Get 1 Free', type: 'punch_card', count: 10 }
  ]
}
```

### Retail

```typescript
{
  defaultRewards: [
    { name: '10% Off', points: 500 },
    { name: '$10 Store Credit', points: 1000 },
    { name: 'Early Access', points: 250 }
  ],
  suggestedRules: [
    { name: 'Spend Points', type: 'spend', pointsPerDollar: 1 }
  ]
}
```

---

## Analytics Events

```typescript
// Track tenant onboarding funnel
const TENANT_EVENTS = {
  'tenant_landing_view': 'Viewed business landing page',
  'tenant_cta_click': 'Clicked Start Free Trial',
  'tenant_phone_entered': 'Entered phone number',
  'tenant_code_verified': 'Verified code',
  'tenant_info_submitted': 'Submitted business info',
  'tenant_tour_started': 'Started quick tour',
  'tenant_tour_skipped': 'Skipped quick tour',
  'tenant_tour_completed': 'Completed quick tour',
  'tenant_onboarding_complete': 'Reached dashboard',
  'tenant_first_reward_created': 'Created first reward',
  'tenant_first_staff_added': 'Added first staff PIN',
  'tenant_first_checkin': 'First customer checked in'
};
```

---

## Implementation Checklist

### Phase 1: Core Flow
- [ ] Tenant landing page (/business)
- [ ] Phone verification (reuse customer flow)
- [ ] Business info collection form
- [ ] Tenant record creation
- [ ] Business + default location creation
- [ ] Redirect to admin dashboard

### Phase 2: Smart Defaults
- [ ] Category-based reward templates
- [ ] Default location from business name
- [ ] Trial tier assignment

### Phase 3: Tour & Onboarding
- [ ] Quick tour slides (optional)
- [ ] First-time checklist on dashboard
- [ ] Progress tracking

### Phase 4: Polish
- [ ] Returning tenant detection
- [ ] Multi-business support
- [ ] Analytics events

---

## Tenant as Customer (QA Mode)

### Why This Matters

Tenants should be able to experience their own loyalty program as a customer:
- QA their reward setup
- Understand customer perspective
- Demo to potential customers
- Train staff on what customers see

### How It Works

Since phone number = identity, the tenant's phone is automatically a customer at their own business too.

```
Tenant creates business
         │
         ▼
System auto-enrolls tenant's phone as customer at their business
         │
         ▼
Tenant opens CUSTOMER app → sees their own business's rewards
```

### Admin Dashboard: "Preview as Customer"

Quick access from admin:

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│ Tony's Pizza Dashboard                                             │
│                                                                     │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ 👁️ Preview as Customer                                          │ │
│ │                                                                 │ │
│ │ See exactly what your customers see in the app.                │ │
│ │                                                                 │ │
│ │ [Open Customer View]  [Send Test Check-in to Myself]           │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Actions Available

| Action | What It Does |
|--------|--------------|
| **Open Customer View** | Opens customer app focused on their business |
| **Send Test Check-in** | Awards points to tenant's own account |
| **Claim Test Reward** | Walk through reward redemption flow |
| **Reset My Points** | Start fresh for another demo |

### Implementation

```typescript
// Auto-enroll tenant as customer on business creation
async function createBusiness(tenantId: string, info: BusinessInfo) {
  const business = await db.insert(businesses).values({...});

  // Get tenant's phone from their user record
  const tenant = await db.query.tenants.findFirst({
    where: eq(tenants.id, tenantId),
    with: { user: true }
  });

  // Create customer enrollment for tenant
  await enrollCustomer({
    phone: tenant.user.phone,
    businessId: business.id,
    source: 'owner_auto_enroll',
    isOwner: true  // Flag for potential special handling
  });

  return business;
}
```

### Separate or Same App?

**Same customer app** - Tenant uses the real customer app. No "fake" preview mode.

Advantages:
- See exactly what customers see (no simulation drift)
- Test real flows end-to-end
- Same codebase, no maintenance of parallel preview

The tenant knows they're also a customer because they signed up. Their experience is authentic.

---

## API Endpoints

```typescript
// Send verification code (same as customer)
POST /api/auth/send-code
Body: { phone: "+15551234567", context: "tenant" }

// Verify code (same as customer)
POST /api/auth/verify-code
Body: { phone: "+15551234567", code: "1234", context: "tenant" }
Response: {
  token: "jwt...",
  isNewTenant: true,
  existingBusiness: null  // or business object if returning
}

// Create business (new tenants only)
POST /api/tenant/business
Headers: { Authorization: "Bearer jwt..." }
Body: {
  name: "Tony's Pizza",
  category: "restaurant",
  locationCount: "1",
  email: "tony@tonys.com"  // optional
}
Response: {
  business: { id: "biz_abc", ... },
  location: { id: "loc_1", ... },
  defaultRewards: [...],
  dashboardUrl: "/admin/dashboard"
}
```

---

*Last updated: January 2025*
