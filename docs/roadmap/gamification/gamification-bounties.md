# Gamification: Bounties

> **Status:** 🔷 Specified
> **Parent Spec:** [gamification-v2-overview.md](gamification-v2-overview.md)
> **Last Updated:** January 2025

## Dependencies

- **Requires:** Rules Engine, Currency Model, Multi-Tenant
- **Enables:** Tenant-specific challenges, customer engagement

## Roadmap Position

- **Tier:** 4 | **Phase:** v2.0 | **Category:** Tenant

---

## Overview

Bounties are tenant-created challenges that reward customers for specific actions. Unlike platform-wide quests, bounties are scoped to individual tenants.

---

## Bounty Types

### Visit Bounties
- First Visit ("Welcome newcomer!")
- Return Visit ("Come back this week!")
- Frequent Visitor ("Visit 5 times this month")
- Time-based ("Visit during happy hour")

### Purchase Bounties
- Spend Threshold ("Spend $50 today")
- Product Purchase ("Try our new latte")
- Combo Deal ("Buy entrée + dessert")

### Social Bounties
- Referral ("Bring a friend")
- Group Visit ("Visit with 3+ friends")
- Review ("Leave us a review")

### Collection Bounties
- Capture Hunt ("Catch a shark here!")
- Rarity Hunt ("Catch any legendary")

---

## Budget Controls

| Control | Purpose |
|---------|--------|
| Max Total Completions | Cap total payout |
| Max Per Customer | Prevent gaming |
| Reset Period | Daily/weekly/monthly |
| Time Window | Only during certain hours |
| End Date | Automatic expiration |

---

## Templates

| Template | Default Reward |
|----------|---------------|
| Welcome Bonus | 100 points |
| Weekend Warrior | 50 points |
| Happy Hour | 2x points |
| Loyalty Milestone | Increasing |
| Bring a Friend | $5 each |

---

## Database Schema

```sql
CREATE TABLE bounties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    name VARCHAR(200) NOT NULL,
    bounty_type VARCHAR(50) NOT NULL,
    trigger_conditions JSONB NOT NULL,
    reward_type VARCHAR(50) NOT NULL,
    reward_value JSONB NOT NULL,
    max_completions INTEGER,
    max_per_user INTEGER,
    reset_period VARCHAR(50),
    starts_at TIMESTAMPTZ,
    ends_at TIMESTAMPTZ,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE bounty_completions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bounty_id UUID NOT NULL REFERENCES bounties(id),
    user_id UUID NOT NULL REFERENCES users(id),
    trigger_type VARCHAR(50) NOT NULL,
    trigger_id UUID,
    points_earned INTEGER,
    completion_number INTEGER NOT NULL,
    period_key VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Entitlements

| Feature | Starter | Growth | Pro |
|---------|---------|--------|-----|
| Active bounties | 3 | 10 | Unlimited |
| Templates | Basic | All | All |
| Advanced conditions | - | ✓ | ✓ |

---

## Related Documentation

- [gamification-v2-overview.md](gamification-v2-overview.md) - Master spec
- [gamification-tenant-collaboration.md](gamification-tenant-collaboration.md) - Tenant dashboard
- [gamification-currency.md](gamification-currency.md) - Points rewards

---

*Last updated: January 30, 2026*
