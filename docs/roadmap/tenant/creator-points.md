# Creator Points (Tenant Gamification)

> **Status:** Concept
> **Priority:** Medium (Tier 4 - Gamification)
> **Category:** Tenant

---

## Overview

A circular incentives engine where business owners (tenants) earn "Creator Points" for building engaging customer experiences. These points are redeemable for real, physical merchandise that tenants can then use as exclusive rewards for their customers.

---

## Dependencies

- **Requires:**
  - Analytics data model (to track tenant engagement metrics)
  - Multi-tenant support (to compare across businesses)
  - Basic tenant dashboard

- **Enables:**
  - Physical rewards fulfillment system
  - Tenant leaderboards
  - Platform gamification
  - Viral marketing (branded merch as rewards)

---

## Roadmap Position

- **Tier:** 4 (Gamification)
- **Phase:** v2.0
- **Category:** Tenant

---

## Cross-References

- Related specs:
  - [Analytics & Reporting](./analytics-reporting.md)
  - [Physical Rewards](../customer/physical-rewards.md)
  - [Leaderboards](../customer/leaderboards.md)

---

## The Flywheel

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  Tenant creates gameplay    ──────►   Earns "Creator Points"   │
│  (rules, voyages, rewards)                                      │
│                                                                 │
│         ▲                                      │                │
│         │                                      ▼                │
│         │                                                       │
│  More engagement           Creator Points unlock               │
│  = more data/revenue  ◄──    REAL merch from platform          │
│                              (t-shirts, keychains, coasters)    │
│         │                                      │                │
│         │                                      ▼                │
│         │                                                       │
│  Customers chase          Tenant uses merch as                 │
│  exclusive merch     ◄──    SPECIAL rewards for customers      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## How Tenants Earn Creator Points

### Engagement Actions

| Action | Points | Notes |
|--------|--------|-------|
| First rule created | 50 | One-time bonus |
| First voyage created | 100 | One-time bonus |
| New customer enrolled | 20 | Per customer |
| Customer completes a voyage | 10 | Per completion |
| Customer redeems a reward | 5 | Per redemption |
| Active customer (per month) | 2 | Monthly recurring |
| Customer earns 100+ points in a month | 10 | High-value customer |
| Customer referral | 25 | Viral growth reward |

### Quality Bonuses

| Achievement | Bonus Points |
|-------------|--------------|
| 100+ active customers | 500 |
| First voyage with 50+ completions | 250 |
| 90%+ reward redemption rate | 300 |
| Customer retention > 3 months | 100/customer |

### Penalties (Prevent Gaming)

- No points for self-created test customers
- Points clawed back if customers are fake/bots
- Rate limiting on rapid enrollments

---

## Creator Points Rewards Catalog

### Tier 1: Starter (250-500 pts)
| Points | Reward |
|--------|--------|
| 250 | 50 branded stickers (business logo) |
| 500 | 12 keychains OR bottle openers |

### Tier 2: Growth (1000-2000 pts)
| Points | Reward |
|--------|--------|
| 1000 | 12 coasters OR magnets |
| 2000 | 6 t-shirts (business logo) |

### Tier 3: Established (3000-5000 pts)
| Points | Reward |
|--------|--------|
| 3000 | 6 branded mugs |
| 5000 | 3 premium hoodies |

### Tier 4: Elite (10000+ pts)
| Points | Reward |
|--------|--------|
| 10000 | 10 metal VIP cards (premium feel) |
| 20000 | Custom merch consultation |

---

## How Tenants Use Merch

Once tenants receive physical merchandise, they can:

1. **Add as Customer Rewards**
   - "Earn 1000 doubloons → Get exclusive Tony's t-shirt!"
   - Creates high-value, aspirational rewards

2. **Use for Promotions**
   - "Complete the Summer Voyage → Win a hoodie!"
   - Time-limited excitement

3. **VIP Customer Gifts**
   - Metal VIP cards for top customers
   - Creates brand ambassadors

4. **Staff Incentives**
   - Reward staff with branded gear
   - Builds team culture

---

## Tenant Dashboard UI

### Creator Points Section

```
┌─────────────────────────────────────────────────────┐
│  🏆 Creator Points: 1,847                           │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 74%         │
│  153 points to next reward (6 T-Shirts)            │
│                                                     │
│  [View Rewards Catalog]  [Recent Activity]         │
└─────────────────────────────────────────────────────┘
```

### Recent Activity Feed

```
+ 20 pts  New customer: John D. enrolled
+ 10 pts  Voyage "Weekend Warrior" completed by Sarah M.
+ 5 pts   Reward redeemed: Free Appetizer
+ 2 pts   Monthly active: Mike T.
───────────────────────────────────
+37 pts today
```

### Rewards Catalog Modal

```
┌─────────────────────────────────────────────────────┐
│  📦 Redeem Creator Points                           │
├─────────────────────────────────────────────────────┤
│                                                     │
│  🎽 6 Custom T-Shirts         2,000 pts            │
│  [████████████████████░░░░] 1,847 / 2,000          │
│  153 more points needed                            │
│                                                     │
│  🧲 12 Branded Magnets        1,000 pts  [REDEEM]  │
│  You can afford this!                              │
│                                                     │
│  🏆 10 Metal VIP Cards        10,000 pts           │
│  [██░░░░░░░░░░░░░░░░░░░░░░] 1,847 / 10,000        │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## Implementation Plan

### Phase 1: Points Accumulation
- [ ] Define points schema (track earnings)
- [ ] Implement point triggers for each action
- [ ] Creator Points display in admin dashboard
- [ ] Activity feed showing recent point earnings

### Phase 2: Rewards Catalog
- [ ] Define reward tiers and items
- [ ] Build catalog UI in admin app
- [ ] Redemption request flow
- [ ] Integration with fulfillment (manual initially)

### Phase 3: Gamification
- [ ] Tenant leaderboard (opt-in)
- [ ] Achievement badges for tenants
- [ ] Milestone notifications
- [ ] "Share your achievement" social features

### Phase 4: Fulfillment
- [ ] Partner with print-on-demand service
- [ ] Automated order creation
- [ ] Tracking and delivery updates
- [ ] Quality control process

---

## Database Schema

```sql
-- Tenant creator points balance
CREATE TABLE tenant_creator_points (
  business_id TEXT PRIMARY KEY,
  current_balance INT DEFAULT 0,
  lifetime_earned INT DEFAULT 0,
  lifetime_redeemed INT DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Points transaction log
CREATE TABLE creator_points_log (
  id TEXT PRIMARY KEY,           -- 'cpl_' prefix
  business_id TEXT NOT NULL,
  points INT NOT NULL,           -- Positive = earned, negative = spent
  reason TEXT NOT NULL,          -- 'customer_enrolled', 'voyage_completed', 'redemption'
  reference_id TEXT,             -- Related entity ID
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Redemption orders
CREATE TABLE creator_rewards_orders (
  id TEXT PRIMARY KEY,           -- 'cro_' prefix
  business_id TEXT NOT NULL,
  reward_type TEXT NOT NULL,     -- 'tshirt_6', 'keychain_12', etc.
  points_spent INT NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, processing, shipped, delivered
  shipping_address JSONB,
  tracking_number TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ
);
```

---

## Fulfillment Strategy

### Initial (Manual)
1. Tenant redeems points in dashboard
2. Platform admin receives notification
3. Admin orders from print service (Printful, CustomInk, etc.)
4. Ships directly to tenant
5. Admin marks as shipped/delivered

### Future (Automated)
1. Integrate with Printful API
2. Auto-generate orders on redemption
3. Direct shipping to tenant
4. Automated tracking updates

---

## Metrics to Track

- Creator Points earned per tenant (monthly)
- Redemption rate
- Most popular rewards
- Correlation: Creator Points ↔ Customer engagement
- ROI of merchandise program

---

## Open Questions

1. **Fulfillment partner?** Printful vs CustomInk vs local print shop
2. **International shipping?** Start US-only or global?
3. **Custom designs?** Allow tenant to upload logo, or template only?
4. **Quality tiers?** Basic vs premium merchandise options?

---

*Last updated: January 2025*
