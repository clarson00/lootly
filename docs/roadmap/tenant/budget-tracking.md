# Budget Tracking Dashboard

> **Status:** 📋 Planned
> **Priority:** High - Essential for business owners to manage costs
> **Entitlement:** Pro tier or Budget Add-on

---

## Dependencies

- **Requires:**
  - **Reward Monetary Values** (CRITICAL - can't track costs without values)
  - Analytics data model
  - Transaction history (existing)
  - Admin dashboard (existing)

- **Enables:**
  - Cost-aware AI Marketing Assistant
  - ROI optimization recommendations
  - Financial reporting

---

## Roadmap Position

- **Tier:** 3 (Engagement Layer)
- **Phase:** v1.1-v1.2
- **Category:** Tenant

---

## Cross-References

- Related specs:
  - [Reward Monetary Values](../platform/reward-monetary-values.md) - **BLOCKER**
  - [Analytics & Reporting](./analytics-reporting.md)
  - [AI Marketing Assistant](./ai-marketing-assistant.md)

---

## Overview

A dashboard for tenant admins to set reward budgets, track spending against those budgets, and analyze the performance and ROI of their loyalty program.

---

## The Problem

Business owners need to answer:
- "How much am I spending on my loyalty program?"
- "Am I over budget this month?"
- "Which rewards are costing me the most?"
- "What's my ROI on this promotion?"
- "Which voyages/rules are most cost-effective?"

Without budget tracking, loyalty programs can become a money pit with no visibility.

---

## Dashboard Design

### Budget Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│ 💰 Rewards Budget - January 2025                                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Monthly Budget: $500.00                                           │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 67%              │
│  Spent: $335.50                    Remaining: $164.50              │
│                                                                     │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐  │
│  │    156      │ │   $335.50   │ │    $2.15    │ │    4.2x     │  │
│  │ Redemptions │ │ Total Spent │ │ Avg Cost    │ │ Est. ROI    │  │
│  │   +23% ↑    │ │   +18% ↑    │ │   -5% ↓     │ │   +0.3 ↑    │  │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘  │
│                                                                     │
│  📊 Spending Trend                    🏆 Top Cost Drivers           │
│  ┌────────────────────────────┐      ┌────────────────────────────┐│
│  │     ╭─╮                    │      │ 1. Free Appetizer  $180.00 ││
│  │    ╭╯ ╰╮  ╭─╮             │      │ 2. 20% Off Entree   $98.50 ││
│  │ ───╯    ╰──╯ ╰───         │      │ 3. Free Dessert     $45.00 ││
│  │ Week1  Week2  Week3  Week4│      │ 4. Bonus Points     $12.00 ││
│  └────────────────────────────┘      └────────────────────────────┘│
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Performance Analytics

```
┌─────────────────────────────────────────────────────────────────────┐
│ 📈 Program Performance                                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ TOP PERFORMING RULES (by engagement)                               │
│ ─────────────────────────────────────────────────────────────────   │
│ Rank  Rule                    Triggers  Cost     ROI Est.          │
│ 1.    Taco Tuesday 2x         234       $0       ∞ (no cost)       │
│ 2.    Weekend Warrior         156       $312     3.8x              │
│ 3.    Happy Hour Bonus        98        $49      5.2x              │
│                                                                     │
│ TOP PERFORMING VOYAGES                                             │
│ ─────────────────────────────────────────────────────────────────   │
│ Rank  Voyage                  Completions  Cost     Avg Visits     │
│ 1.    Grand Tour              45           $450     8.2            │
│ 2.    Pizza Party             32           $160     5.1            │
│ 3.    Breakfast Club          28           $84      4.8            │
│                                                                     │
│ REWARD EFFICIENCY                                                   │
│ ─────────────────────────────────────────────────────────────────   │
│ Reward              Redemptions  Total Cost  Cost/Redemption       │
│ Free Appetizer      45           $360        $8.00                 │
│ 20% Off Entree      78           $624        $8.00                 │
│ Free Dessert        33           $165        $5.00  ← Best value   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Budget Settings

```
┌─────────────────────────────────────────────────────────────────────┐
│ ⚙️ Budget Settings                                                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ Monthly Rewards Budget                                             │
│ ┌─────────────────────────────────────────────────────────────┐   │
│ │ $[500.00        ]  per month                                │   │
│ └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│ Budget Alerts                                                      │
│ ┌─────────────────────────────────────────────────────────────┐   │
│ │ [✓] Alert at 75% of budget                                  │   │
│ │ [✓] Alert at 90% of budget                                  │   │
│ │ [ ] Pause redemptions at 100% (⚠️ not recommended)          │   │
│ └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│ Budget Period                                                      │
│ ○ Monthly (resets on 1st)                                         │
│ ○ Weekly (resets on Monday)                                       │
│ ○ Custom: [$500] per [30] days                                    │
│                                                                     │
│ [Save Settings]                                                    │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Database Schema

```sql
-- Budget configuration
CREATE TABLE business_budgets (
  id TEXT PRIMARY KEY,              -- 'budget_' prefix
  business_id TEXT NOT NULL UNIQUE,
  monthly_budget DECIMAL(10,2),
  budget_period TEXT DEFAULT 'monthly',  -- 'monthly', 'weekly', 'custom'
  custom_period_days INT,
  alert_threshold_1 INT DEFAULT 75,      -- Percentage
  alert_threshold_2 INT DEFAULT 90,
  pause_at_limit BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Budget period tracking
CREATE TABLE budget_periods (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  budget_amount DECIMAL(10,2),
  spent_amount DECIMAL(10,2) DEFAULT 0,
  redemption_count INT DEFAULT 0,
  is_current BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Alerts sent
CREATE TABLE budget_alerts (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL,
  budget_period_id TEXT NOT NULL,
  alert_type TEXT NOT NULL,       -- 'threshold_75', 'threshold_90', 'limit_reached'
  sent_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## API Endpoints

```typescript
// Get/Set budget configuration
GET /api/admin/budget
PUT /api/admin/budget
{
  monthlyBudget: 500.00,
  budgetPeriod: 'monthly',
  alertThreshold1: 75,
  alertThreshold2: 90,
  pauseAtLimit: false
}

// Get current budget status
GET /api/admin/budget/status
// Response
{
  currentPeriod: { start: "2025-01-01", end: "2025-01-31" },
  budgetAmount: 500.00,
  spentAmount: 335.50,
  remainingAmount: 164.50,
  percentUsed: 67.1,
  redemptionCount: 156,
  daysRemaining: 12,
  projectedSpend: 502.25,  // At current pace
  alerts: []
}

// Get spending breakdown
GET /api/admin/budget/breakdown
?startDate=2025-01-01
&endDate=2025-01-31

// Get rule/voyage performance
GET /api/admin/analytics/performance
?type=rules|voyages|rewards
&sortBy=triggers|cost|roi
&limit=10
```

---

## ROI Calculation

### Simple ROI Formula

```
ROI = (Revenue Generated - Reward Costs) / Reward Costs

Where:
- Revenue Generated = Sum of customer spending during reward period
- Reward Costs = Total cost of rewards redeemed
```

### Attribution Approach

For MVP, use simple attribution:
- Customer redeems reward → Track their spending for next 30 days
- Attribute that spending to the reward program
- Compare to pre-enrollment spending (if available)

### Displayed Metrics

| Metric | Formula | Notes |
|--------|---------|-------|
| Total Cost | Sum of all reward costs | Direct from transactions |
| Avg Cost/Redemption | Total Cost / Redemptions | Efficiency metric |
| Est. ROI | (Attributed Revenue - Cost) / Cost | Estimation |
| Cost per Active Customer | Monthly Cost / Active Customers | Program efficiency |

---

## Alerts & Notifications

### Alert Types

| Alert | Trigger | Channel |
|-------|---------|---------|
| 75% Budget | Spend reaches 75% | Email + In-app |
| 90% Budget | Spend reaches 90% | Email + In-app + Push |
| Budget Exceeded | Spend > 100% | Email + In-app + Push |
| Weekly Summary | Every Monday | Email |

### Alert Email Example

```
Subject: ⚠️ Rewards budget at 90% - Tony's Downtown

Hi Tony,

Your rewards budget is at 90% ($450 of $500) with 12 days left in January.

At your current pace, you'll exceed your budget by approximately $52.

Quick Stats:
- Redemptions this month: 142
- Most redeemed: Free Appetizer (45x, $360)
- Top performing rule: Taco Tuesday (234 triggers)

Options:
1. Increase your budget for this month
2. Pause high-cost rewards temporarily
3. Let it ride (program will continue)

[View Dashboard] [Adjust Budget]
```

---

## Implementation Plan

### Phase 1: Budget Infrastructure
- [ ] Budget configuration table and API
- [ ] Cost tracking on redemptions (from Reward Monetary Values)
- [ ] Budget status calculation
- [ ] Budget settings UI

### Phase 2: Spending Dashboard
- [ ] Budget overview widget
- [ ] Spending trend chart
- [ ] Cost breakdown by reward
- [ ] Period comparison

### Phase 3: Performance Analytics
- [ ] Rule performance ranking
- [ ] Voyage performance ranking
- [ ] Basic ROI estimation
- [ ] Export functionality

### Phase 4: Alerts
- [ ] Alert configuration
- [ ] Alert triggers
- [ ] Email notifications
- [ ] In-app notifications

---

## Entitlements

| Feature Key | Description | Availability |
|-------------|-------------|--------------|
| `budget:basic` | Set budget, view spending | All tiers |
| `budget:analytics` | Performance rankings, ROI | Pro tier |
| `budget:alerts` | Budget alerts | Pro tier |
| `budget:export` | Export budget reports | Pro tier |

---

## Open Questions

1. **Pause redemptions?** Should we allow pausing redemptions when budget hit? Risk of customer frustration.
2. **ROI accuracy?** How accurate can we be without POS integration?
3. **Multi-location budgets?** Separate budgets per location or business-wide?
4. **Rollover?** Should unused budget roll over to next period?

---

*Last updated: January 2025*
