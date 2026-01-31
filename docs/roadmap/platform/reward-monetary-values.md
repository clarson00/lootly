# Reward Monetary Values

> **Status:** 📋 Planned
> **Priority:** High - Infrastructure that enables budget tracking and gift cards
> **Entitlement:** All tiers

---

## Dependencies

- **Requires:**
  - Rewards system (existing)
  - Rules engine (existing)
  - Admin UI for reward management (existing)

- **Enables:**
  - Budget Tracking Dashboard (can't track spend without values)
  - Gift Card Redemption (need to calculate card worth)
  - ROI Analytics (cost per reward, campaign ROI)
  - AI Marketing Assistant (cost-aware recommendations)

---

## Roadmap Position

- **Tier:** 2 (Core Infrastructure)
- **Phase:** v1.1
- **Category:** Platform

---

## Cross-References

- Related specs:
  - [Budget Tracking](../tenant/budget-tracking.md)
  - [Gift Card Redemption](../customer/gift-card-redemption.md)
  - [Analytics & Reporting](../tenant/analytics-reporting.md)
  - [Rules Engine](../../RULES_ENGINE.md)

---

## Overview

Allow tenants to assign monetary values to rewards, enabling cost tracking, budgeting, and ROI analysis. This is foundational infrastructure that multiple features depend on.

---

## The Problem

Currently, rewards have no cost associated with them:
- "Free Appetizer" - what does it cost the business?
- "20% Off" - what's the average discount value?
- "Free T-Shirt" - what's the merchandise cost?

Without monetary values, tenants can't:
- Track reward program costs
- Set budgets
- Calculate ROI
- Make cost-aware decisions

---

## Solution

### Reward Value Types

| Type | Description | Example |
|------|-------------|---------|
| **Fixed Cost** | Exact dollar amount | T-shirt costs $8.50 |
| **Percentage Estimate** | % of average transaction | 20% off ≈ $4.20 (avg txn $21) |
| **Variable/Manual** | Tenant enters at redemption | Custom reward |
| **No Cost** | Digital/free rewards | Badge, status upgrade |

### Database Schema Changes

```sql
-- Add to rewards table
ALTER TABLE rewards ADD COLUMN cost_type TEXT;  -- 'fixed', 'percentage', 'variable', 'none'
ALTER TABLE rewards ADD COLUMN cost_value DECIMAL(10,2);  -- Dollar amount or percentage
ALTER TABLE rewards ADD COLUMN cost_notes TEXT;  -- Optional notes

-- Track actual costs at redemption time
ALTER TABLE transactions ADD COLUMN reward_cost DECIMAL(10,2);  -- Actual cost recorded
```

### Reward Configuration UI

```
┌─────────────────────────────────────────────────────────────┐
│ Edit Reward: Free Appetizer                                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Name: [Free Appetizer                    ]                  │
│ Points Required: [500                    ]                  │
│                                                             │
│ ─── Cost Tracking ───────────────────────────────────────   │
│                                                             │
│ Cost Type: [Fixed Amount ▼]                                 │
│                                                             │
│   ○ Fixed Amount      → $[8.00    ]                        │
│   ○ Percentage        → [  ]% of avg transaction           │
│   ○ Variable          → Staff enters at redemption         │
│   ○ No Cost           → Digital reward / no business cost  │
│                                                             │
│ Notes: [Average appetizer cost across menu    ]            │
│                                                             │
│ [Save]  [Cancel]                                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Points Value Configuration

Tenants should also be able to set the "cost" of points themselves:

```
┌─────────────────────────────────────────────────────────────┐
│ Program Economics                                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Point Earning Rate: 1 point per $[1.00] spent              │
│                                                             │
│ Point Value (for budgeting):                               │
│ Each point costs approximately $[0.01] in rewards          │
│                                                             │
│ ℹ️ This helps estimate program costs. If customers earn    │
│    1 point per $1 and redeem 500 points for an $8 reward,  │
│    each point costs ~$0.016.                               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## API Changes

### Reward Endpoints

```typescript
// Create/Update reward with cost
PUT /api/admin/rewards/:id
{
  name: "Free Appetizer",
  pointsCost: 500,
  // NEW: Cost tracking fields
  costType: "fixed",      // 'fixed' | 'percentage' | 'variable' | 'none'
  costValue: 8.00,        // Dollar amount or percentage
  costNotes: "Average appetizer cost"
}

// Record cost at redemption (for variable cost rewards)
POST /api/staff/redeem/:rewardId
{
  customerId: "cust_123",
  // NEW: Optional actual cost (for variable rewards)
  actualCost: 12.50
}
```

### Reporting Endpoints

```typescript
// Get reward costs summary
GET /api/admin/analytics/reward-costs
?startDate=2025-01-01
&endDate=2025-01-31

// Response
{
  totalRedemptions: 156,
  totalCost: 1248.00,
  avgCostPerRedemption: 8.00,
  byReward: [
    { rewardId: "reward_1", name: "Free Appetizer", redemptions: 45, totalCost: 360.00 },
    { rewardId: "reward_2", name: "20% Off", redemptions: 78, totalCost: 624.00 },
    ...
  ]
}
```

---

## Implementation Plan

### Phase 1: Schema & API
- [ ] Add cost fields to rewards table
- [ ] Add reward_cost to transactions table
- [ ] Update reward CRUD endpoints
- [ ] Record costs on redemption

### Phase 2: Admin UI
- [ ] Add cost configuration to reward editor
- [ ] Add program economics settings page
- [ ] Show cost in reward list view

### Phase 3: Reporting Foundation
- [ ] Create reward costs summary endpoint
- [ ] Basic cost report in admin dashboard
- [ ] Export functionality

---

## Migration Strategy

Existing rewards will have:
- `cost_type: 'none'` (default)
- `cost_value: null`

Tenants can optionally add costs to existing rewards. No breaking changes.

---

## Future Considerations

- **Automatic percentage calculation:** Use historical transaction data to estimate percentage discounts
- **Cost alerts:** Notify when reward costs exceed thresholds
- **Seasonal cost variations:** Different costs at different times
- **Supplier cost integration:** For physical merchandise rewards

---

## Open Questions

1. **Default cost type?** Should new rewards default to "none" or prompt for cost?
2. **Required vs optional?** Should cost tracking be required or optional per reward?
3. **Historical backfill?** Should we estimate costs for past redemptions?

---

*Last updated: January 2025*
