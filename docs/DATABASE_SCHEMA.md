# Lootly Database Schema

> **OWNERSHIP:** Claude Code owns the actual schema in `backend/db/schema.js`.
> This doc is a **reference spec**, not a constraint. Modify the schema as needed—add columns, change types, add tables, refactor. Just keep seed data working and update this doc if making major changes.

> **Database:** PostgreSQL (Neon for production, local PostgreSQL for dev)
> **ORM:** Drizzle ORM
> **Location:** `backend/db/schema.js`

---

## Database Setup

**Provider:** [Neon](https://neon.tech) - Serverless PostgreSQL

**Connection:** Use `DATABASE_URL` environment variable
```
DATABASE_URL=postgres://user:pass@ep-xxx.us-east-1.aws.neon.tech/lootly?sslmode=require
```

**Local Dev:** Can use local PostgreSQL or Neon dev branch

---

## Entity Relationship Overview

```
┌─────────────────┐
│ platform_admins │  (Platform-level, no tenant)
└─────────────────┘
         │
         ▼
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│  businesses │──────<│  locations  │──────<│    staff    │
└─────────────┘       └─────────────┘       └─────────────┘
       │                     │
       │                     │
       ▼                     ▼
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│    rules    │       │transactions │──────>│  customers  │
└─────────────┘       └─────────────┘       └─────────────┘
       │                                           │
       ▼                                           ▼
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│   rewards   │──────<│  customer   │<──────│ enrollments │
└─────────────┘       │   rewards   │       └─────────────┘
                      └─────────────┘
```

**Key Relationships:**
- Platform Admin → manages all Businesses
- Business → many Locations (one owner, multiple restaurants)
- Location → many Staff
- Business → many Rules
- Business → many Rewards
- Customer → many Enrollments (one per business)
- Enrollment tracks points/status per business

---

## Tables

### platform_admins

Platform-level administrators who manage tenants, subscriptions, and platform config. Separate from tenant staff.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | TEXT | PK | `padmin_` prefix |
| email | TEXT | UNIQUE, NOT NULL | Login email |
| name | TEXT | NOT NULL | Display name |
| password_hash | TEXT | NOT NULL | bcrypt hash |
| role | TEXT | DEFAULT 'admin' | 'admin', 'superadmin' |
| is_active | BOOLEAN | DEFAULT true | |
| last_login_at | TIMESTAMPTZ | | |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | | |

**Roles:**
- `admin` — Can manage businesses, view metrics
- `superadmin` — Can manage other admins, platform config

---

### admin_audit_log

Audit trail for all platform admin actions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | TEXT | PK | `audit_` prefix |
| admin_id | TEXT | FK → platform_admins, NOT NULL | Who did it |
| action | TEXT | NOT NULL | 'create_business', 'update_subscription', etc. |
| target_type | TEXT | | 'business', 'subscription', 'feature_override' |
| target_id | TEXT | | ID of affected entity |
| details | JSONB | | Action-specific data |
| ip_address | TEXT | | Request IP |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |

**Common actions:**
- `create_business`
- `update_business`
- `suspend_business`
- `activate_business`
- `update_subscription`
- `set_feature_override`
- `impersonate_business`

---

### businesses

Top-level entity representing a business owner or organization. One business can have multiple locations.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | TEXT | PK | `biz_` prefix |
| name | TEXT | NOT NULL | "Freddie's Restaurant Group" |
| slug | TEXT | UNIQUE | URL-safe identifier |
| owner_name | TEXT | | "Freddie Guerrera" |
| owner_email | TEXT | | Contact email |
| owner_phone | TEXT | | Contact phone |
| logo_url | TEXT | | Business logo |
| subscription_tier | TEXT | DEFAULT 'free' | 'free', 'starter', 'pro', 'enterprise' |
| subscription_status | TEXT | DEFAULT 'active' | 'active', 'suspended', 'cancelled', 'trialing' |
| trial_ends_at | TIMESTAMPTZ | | When trial expires |
| feature_overrides | JSONB | DEFAULT '{}' | Per-tenant feature exceptions |
| settings | JSONB | | Business-wide settings |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | | |

**Subscription tiers:**
- `free` — 3 rewards, 1 location, no milestones/multipliers
- `starter` — 10 rewards, 3 locations, no milestones/multipliers
- `pro` — Unlimited rewards, 10 locations, milestones + multipliers
- `enterprise` — Unlimited everything

**feature_overrides JSONB structure:**
```json
{
  "maxRewards": 10,
  "maxLocations": 5,
  "milestonesEnabled": true,
  "multipliersEnabled": true
}
```

**Settings JSONB structure:**
```json
{
  "points_name": "points",
  "currency": "USD",
  "timezone": "America/New_York",
  "default_points_per_dollar": 1,
  "qr_style": "default"
}
```

---

### locations

Individual physical locations belonging to a business.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | TEXT | PK | `loc_` prefix |
| business_id | TEXT | FK → businesses | Parent business |
| name | TEXT | NOT NULL | "Honey Brook Pizza" |
| slug | TEXT | | URL-safe identifier |
| icon | TEXT | | Emoji: "🍕" |
| description | TEXT | | Short description |
| address_line1 | TEXT | | Street address |
| address_line2 | TEXT | | Suite, unit, etc. |
| city | TEXT | | |
| state | TEXT | | |
| postal_code | TEXT | | |
| country | TEXT | DEFAULT 'US' | |
| phone | TEXT | | Location phone |
| email | TEXT | | Location email |
| latitude | DOUBLE PRECISION | | For geo features |
| longitude | DOUBLE PRECISION | | For geo features |
| timezone | TEXT | | Override business timezone |
| hours | JSONB | | Operating hours |
| is_active | BOOLEAN | DEFAULT true | Soft disable |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | | |

**Hours JSONB structure:**
```json
{
  "monday": { "open": "11:00", "close": "21:00" },
  "tuesday": { "open": "11:00", "close": "21:00" },
  "wednesday": { "open": "11:00", "close": "21:00" },
  "thursday": { "open": "11:00", "close": "22:00" },
  "friday": { "open": "11:00", "close": "23:00" },
  "saturday": { "open": "11:00", "close": "23:00" },
  "sunday": { "open": "12:00", "close": "20:00" }
}
```

---

### location_groups

Logical groupings of locations for rules targeting.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | TEXT | PK | `grp_` prefix |
| business_id | TEXT | FK → businesses | |
| name | TEXT | NOT NULL | "All Locations", "Mexican Restaurants" |
| description | TEXT | | |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |

---

### location_group_members

Join table for location groups.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | TEXT | PK | |
| group_id | TEXT | FK → location_groups | |
| location_id | TEXT | FK → locations | |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |

**Unique constraint:** (group_id, location_id)

---

### staff

Staff members who can operate the tablet app.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | TEXT | PK | `staff_` prefix |
| location_id | TEXT | FK → locations | Primary location |
| name | TEXT | NOT NULL | Display name |
| pin | TEXT | NOT NULL | 4-6 digit PIN (hashed) |
| role | TEXT | DEFAULT 'staff' | 'staff', 'manager', 'admin' |
| can_void | BOOLEAN | DEFAULT false | Can void transactions |
| can_adjust_points | BOOLEAN | DEFAULT false | Can manually adjust |
| is_active | BOOLEAN | DEFAULT true | |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | | |

---

### customers

Global customer records (cross-business).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | TEXT | PK | `cust_` prefix |
| phone | TEXT | UNIQUE, NOT NULL | E.164 format |
| phone_verified | BOOLEAN | DEFAULT false | |
| name | TEXT | | Optional display name |
| email | TEXT | | Optional email |
| avatar_url | TEXT | | Profile picture |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | | |

---

### enrollments

Customer enrollment in a specific business's loyalty program. This is the join between customers and businesses, holding per-business loyalty state.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | TEXT | PK | `enroll_` prefix |
| customer_id | TEXT | FK → customers | |
| business_id | TEXT | FK → businesses | |
| points_balance | INTEGER | DEFAULT 0 | Current points |
| lifetime_points | INTEGER | DEFAULT 0 | Total ever earned |
| lifetime_spend | INTEGER | DEFAULT 0 | Cents |
| visit_count | INTEGER | DEFAULT 0 | Total visits |
| tier | TEXT | DEFAULT 'member' | 'member', 'silver', 'gold', etc. |
| points_multiplier | DOUBLE PRECISION | DEFAULT 1.0 | Active multiplier |
| multiplier_expires_at | TIMESTAMPTZ | | When multiplier resets |
| enrolled_at | TIMESTAMPTZ | DEFAULT NOW() | |
| last_visit_at | TIMESTAMPTZ | | |
| is_active | BOOLEAN | DEFAULT true | |

**Unique constraint:** (customer_id, business_id)

---

### transactions

Every check-in, purchase, or point-earning event.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | TEXT | PK | `txn_` prefix |
| enrollment_id | TEXT | FK → enrollments | |
| location_id | TEXT | FK → locations | Where it happened |
| staff_id | TEXT | FK → staff | Who processed it |
| type | TEXT | NOT NULL | 'check_in', 'purchase', 'adjustment', 'redemption' |
| amount_cents | INTEGER | | Purchase amount (if applicable) |
| points_earned | INTEGER | DEFAULT 0 | Points added |
| points_spent | INTEGER | DEFAULT 0 | Points redeemed |
| points_balance_after | INTEGER | | Snapshot of balance |
| notes | TEXT | | Staff notes |
| metadata | JSONB | | Additional data |
| voided | BOOLEAN | DEFAULT false | |
| voided_at | TIMESTAMPTZ | | |
| voided_by | TEXT | FK → staff | |
| void_reason | TEXT | | |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |

---

### rules

Composable rules engine for earning points and unlocking rewards.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | TEXT | PK | `rule_` prefix |
| business_id | TEXT | FK → businesses | |
| name | TEXT | NOT NULL | "Double Points Tuesday" |
| description | TEXT | | Customer-facing description |
| conditions | JSONB | NOT NULL | Rule conditions |
| award_type | TEXT | NOT NULL | 'points', 'points_per_dollar', 'multiplier', 'reward' |
| award_value | TEXT | NOT NULL | Amount or reward_id |
| priority | INTEGER | DEFAULT 0 | Higher = evaluated first |
| is_active | BOOLEAN | DEFAULT true | |
| is_repeatable | BOOLEAN | DEFAULT true | Can trigger multiple times |
| cooldown_days | INTEGER | | Min days between triggers |
| max_triggers | INTEGER | | Lifetime max (NULL = unlimited) |
| start_date | TIMESTAMPTZ | | Time-bound start |
| end_date | TIMESTAMPTZ | | Time-bound end |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | | |

**Conditions JSONB structure:** See rules engine documentation.

---

### rule_triggers

Track when rules have fired for a customer (for cooldowns, max triggers).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | TEXT | PK | |
| rule_id | TEXT | FK → rules | |
| enrollment_id | TEXT | FK → enrollments | |
| transaction_id | TEXT | FK → transactions | |
| triggered_at | TIMESTAMPTZ | DEFAULT NOW() | |

---

### rewards

Redeemable rewards.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | TEXT | PK | `reward_` prefix |
| business_id | TEXT | FK → businesses | |
| name | TEXT | NOT NULL | "Free Appetizer" |
| description | TEXT | | |
| icon | TEXT | | Emoji |
| image_url | TEXT | | |
| points_required | INTEGER | NOT NULL | 0 for milestone rewards |
| reward_type | TEXT | NOT NULL | 'points_redemption', 'milestone', 'birthday' |
| value_type | TEXT | | 'fixed_discount', 'percent_discount', 'free_item', 'multiplier' |
| value_amount | TEXT | | Dollar amount, percent, or item name |
| valid_locations | JSONB | | Array of location_ids (NULL = all) |
| terms | TEXT | | Fine print |
| is_milestone | BOOLEAN | DEFAULT false | **Gated: PRO+ only** |
| milestone_bonus_multiplier | DOUBLE PRECISION | | **Gated: PRO+ only** |
| is_active | BOOLEAN | DEFAULT true | |
| is_hidden | BOOLEAN | DEFAULT false | Don't show until unlocked |
| sort_order | INTEGER | DEFAULT 0 | Display order |
| expires_days | INTEGER | | Days until reward expires after earning |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | | |

**Gating notes:**
- `is_milestone` and `milestone_bonus_multiplier` require PRO tier or `feature_overrides.milestonesEnabled`
- Backend must reject creating milestone rewards for FREE/STARTER tiers
- Total active rewards per business limited by tier (see ENTITLEMENTS.md)

---

### customer_rewards

Rewards earned by customers (their "wallet").

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | TEXT | PK | `cr_` prefix |
| enrollment_id | TEXT | FK → enrollments | |
| reward_id | TEXT | FK → rewards | |
| source_type | TEXT | NOT NULL | 'points_redemption', 'rule_unlock', 'manual' |
| source_id | TEXT | | rule_id or staff_id |
| points_spent | INTEGER | DEFAULT 0 | Points used to redeem |
| status | TEXT | DEFAULT 'available' | 'available', 'redeemed', 'expired', 'voided' |
| earned_at | TIMESTAMPTZ | DEFAULT NOW() | |
| expires_at | TIMESTAMPTZ | | |
| redeemed_at | TIMESTAMPTZ | | |
| redeemed_location_id | TEXT | FK → locations | |
| redeemed_staff_id | TEXT | FK → staff | |
| redeemed_transaction_id | TEXT | FK → transactions | |

---

### qr_codes

QR codes for customer identification.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | TEXT | PK | `qr_` prefix |
| customer_id | TEXT | FK → customers | |
| code | TEXT | UNIQUE, NOT NULL | The scannable value |
| type | TEXT | DEFAULT 'primary' | 'primary', 'temporary', 'card' |
| is_active | BOOLEAN | DEFAULT true | |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |
| expires_at | TIMESTAMPTZ | | For temporary codes |
| last_used_at | TIMESTAMPTZ | | |

---

### verification_codes

SMS verification codes for phone auth.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | TEXT | PK | |
| phone | TEXT | NOT NULL | |
| code | TEXT | NOT NULL | 6-digit code |
| expires_at | TIMESTAMPTZ | NOT NULL | |
| verified | BOOLEAN | DEFAULT false | |
| attempts | INTEGER | DEFAULT 0 | Failed attempts |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |

---

### sessions

Auth sessions for customers, staff, and platform admins.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | TEXT | PK | |
| token | TEXT | UNIQUE, NOT NULL | Session token |
| type | TEXT | NOT NULL | 'customer', 'staff', 'platform_admin' |
| customer_id | TEXT | FK → customers | |
| staff_id | TEXT | FK → staff | |
| platform_admin_id | TEXT | FK → platform_admins | |
| device_info | JSONB | | User agent, etc. |
| expires_at | TIMESTAMPTZ | NOT NULL | |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |

---

## Indexes

```sql
-- High-priority lookups
CREATE INDEX idx_locations_business ON locations(business_id);
CREATE INDEX idx_staff_location ON staff(location_id);
CREATE INDEX idx_enrollments_customer ON enrollments(customer_id);
CREATE INDEX idx_enrollments_business ON enrollments(business_id);
CREATE INDEX idx_transactions_enrollment ON transactions(enrollment_id);
CREATE INDEX idx_transactions_location ON transactions(location_id);
CREATE INDEX idx_transactions_created ON transactions(created_at);
CREATE INDEX idx_rules_business ON rules(business_id);
CREATE INDEX idx_rewards_business ON rewards(business_id);
CREATE INDEX idx_customer_rewards_enrollment ON customer_rewards(enrollment_id);
CREATE INDEX idx_qr_codes_code ON qr_codes(code);
CREATE INDEX idx_qr_codes_customer ON qr_codes(customer_id);
CREATE INDEX idx_verification_phone ON verification_codes(phone);
CREATE INDEX idx_sessions_token ON sessions(token);

-- Platform admin indexes
CREATE INDEX idx_platform_admins_email ON platform_admins(email);
CREATE INDEX idx_admin_audit_log_admin ON admin_audit_log(admin_id);
CREATE INDEX idx_admin_audit_log_target ON admin_audit_log(target_type, target_id);
CREATE INDEX idx_admin_audit_log_created ON admin_audit_log(created_at);

-- JSONB indexes for rules engine
CREATE INDEX idx_rules_conditions ON rules USING GIN(conditions);
CREATE INDEX idx_businesses_feature_overrides ON businesses USING GIN(feature_overrides);
```

---

## Drizzle Setup

**Package:** `drizzle-orm` with `@neondatabase/serverless`

```typescript
// backend/db/index.ts
import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';
import * as schema from './schema';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });
```

**File structure:**
```
backend/
└── db/
    ├── schema.ts      # Drizzle schema definitions
    ├── index.ts       # DB connection & export
    ├── seed.ts        # Seed data script
    └── migrations/    # Generated migrations
```

---

## Notes for Implementation

1. **ID Generation:** Use nanoid or cuid2 with prefixes (`biz_`, `loc_`, `padmin_`, etc.)
2. **Timestamps:** Use `TIMESTAMPTZ` for all datetime columns
3. **JSON columns:** Use `JSONB` for indexable JSON data
4. **Soft deletes:** Use `is_active` flags, don't delete records
5. **Audit trail:** Platform admin actions logged to `admin_audit_log`
6. **Feature gating:** Check `subscription_tier` and `feature_overrides` before allowing gated features

---

*See [SEED_DATA.md](SEED_DATA.md) for pilot customer data.*
*See [CORE_FEATURES.md](CORE_FEATURES.md) for feature gating details.*
*See [ENTITLEMENTS.md](ENTITLEMENTS.md) for full entitlements system.*
