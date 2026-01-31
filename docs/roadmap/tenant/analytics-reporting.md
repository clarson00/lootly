# Analytics & Reporting

> **Status:** 💡 Idea  
> **Target Release:** v1.1 (basic) → v2.0 (full)  
> **Roadmap:** [ROADMAP.md](../../ROADMAP.md) — Section: NEXT / LATER  
> **Location:** `docs/roadmap/analytics-reporting.md`  

### Entitlements

| Feature Key | Description | Availability |
|-------------|-------------|--------------|
| `analytics:basic` | Dashboard, key metrics, basic charts | All tiers (Free+) |
| `analytics:advanced` | Deep reports, exports, segmentation | Pro tier, or Analytics Add-on |
| `analytics:realtime` | Live updating dashboards | Enterprise, or Analytics Add-on |

See [ENTITLEMENTS.md](../ENTITLEMENTS.md) for implementation details.

---

## Overview

Comprehensive analytics and reporting to help business owners understand what's working in their loyalty program. Essential for making data-driven decisions and for feeding the AI Marketing Assistant.

## Why This Matters

> "What gets measured gets managed."

Without analytics, owners are flying blind:
- Which promotions actually drove visits?
- Are rewards too easy or too hard to earn?
- Which locations are underperforming?
- Is the loyalty program profitable?

## Dashboard Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│ 📊 Freddie's Restaurant Group - Analytics                     🔄    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐  │
│  │   1,247     │ │    342      │ │   $12,450   │ │    68%      │  │
│  │  Customers  │ │ Active (30d)│ │ Monthly Rev │ │  Retention  │  │
│  │   +12% ↑    │ │   +8% ↑     │ │   +15% ↑    │ │   +5% ↑     │  │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘  │
│                                                                     │
│  📈 Visits Over Time                     🏆 Top Performing          │
│  ┌────────────────────────────┐         ┌────────────────────────┐ │
│  │    ╭─╮                     │         │ 1. Taco Tuesday 2x     │ │
│  │   ╭╯ ╰╮  ╭─╮              │         │    +34% visits         │ │
│  │  ╭╯   ╰──╯ ╰╮   ╭──╮     │         │ 2. Grand Tour Journey  │ │
│  │ ─╯          ╰───╯  ╰──   │         │    72% completion      │ │
│  │ Jan  Feb  Mar  Apr  May   │         │ 3. Free Appetizer      │ │
│  └────────────────────────────┘         │    Most redeemed       │ │
│                                         └────────────────────────┘ │
│  📍 By Location                          ⚠️ Needs Attention        │
│  ┌────────────────────────────┐         ┌────────────────────────┐ │
│  │ Honey Brook   ████████ 35%│         │ • 45 at-risk customers │ │
│  │ La Cocina     ██████   28%│         │ • El Rancho low visits │ │
│  │ El Rancho     ████     18%│         │ • 12 expiring rewards  │ │
│  │ Antonio's     █████    19%│         └────────────────────────┘ │
│  └────────────────────────────┘                                    │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Report Categories

### 1. Program Overview

**Key Metrics:**
| Metric | Description | Why It Matters |
|--------|-------------|----------------|
| Total enrolled | All-time signups | Program reach |
| Active customers | Visited in last 30 days | Engagement health |
| Visit frequency | Avg visits per customer per month | Loyalty strength |
| Average spend | Per visit and per customer | Revenue impact |
| Points liability | Outstanding unredeemed points | Financial planning |

### 2. Campaign Performance

Track effectiveness of every promotion:

```
┌─────────────────────────────────────────────────────────────────┐
│ Campaign: "Taco Tuesday Double Points"                          │
│ Running: Every Tuesday since Jan 15                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Performance vs. Non-Promo Days:                                 │
│                                                                 │
│ Visits:        +34% ████████████████░░░░                       │
│ Revenue:       +28% ██████████████░░░░░░                       │
│ New customers: +45% ██████████████████░░                       │
│ Avg spend:     -5%  ██████████░░░░░░░░░░  (expected w/ promo)  │
│                                                                 │
│ Cost Analysis:                                                  │
│ • Extra points issued: 4,500 pts ($45 value)                   │
│ • Extra revenue generated: $620                                 │
│ • ROI: 13.8x                                                    │
│                                                                 │
│ Verdict: ✅ HIGHLY EFFECTIVE - Keep running                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 3. Journey Analytics

Track user journey performance:

```
┌─────────────────────────────────────────────────────────────────┐
│ Journey: "Grand Tour" (Visit all 4 locations)                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Funnel:                                                         │
│ Started     ██████████████████████████████  247 customers       │
│ Step 2      █████████████████████           168 (68%)           │
│ Step 3      ████████████████                134 (54%)           │
│ Step 4      ████████████                    112 (45%)           │
│ Completed   ██████████                       89 (36%)           │
│                                                                 │
│ Drop-off Analysis:                                              │
│ • Biggest drop: Step 1→2 (32% drop)                            │
│ • Hardest step: El Rancho (lowest conversion)                  │
│ • Avg completion time: 23 days                                  │
│                                                                 │
│ Revenue Impact:                                                 │
│ • Completers spend 2.3x more than non-participants             │
│ • Cross-location visits up 156% for participants               │
│                                                                 │
│ 💡 Suggestion: Add bonus incentive for El Rancho step          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 4. Reward Economics

Understand the cost/benefit of rewards:

```
┌─────────────────────────────────────────────────────────────────┐
│ Reward Analysis - Last 90 Days                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Reward           │ Redeemed │ Cost    │ Redemption Rate │ ROI  │
│ ─────────────────┼──────────┼─────────┼─────────────────┼───── │
│ Free Drink       │ 234      │ $702    │ 78%             │ 4.2x │
│ Free Appetizer   │ 89       │ $890    │ 45%             │ 3.1x │
│ $10 Off          │ 45       │ $450    │ 23%             │ 5.8x │
│ Grand Tour Prize │ 12       │ $300    │ 36%             │ 8.2x │
│                                                                 │
│ Total Points Outstanding: 45,670 pts                            │
│ Estimated Liability: $2,280 (at current redemption rates)       │
│                                                                 │
│ 💡 Insight: $10 Off has best ROI but lowest redemption.        │
│    Consider lowering points required to increase usage.         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 5. Customer Segments

Understand different customer groups:

| Segment | Definition | Count | Avg Spend | Action |
|---------|------------|-------|-----------|--------|
| Champions | 4+ visits/month, high spend | 45 | $85/mo | Recognize & reward |
| Loyal | 2-3 visits/month | 156 | $52/mo | Maintain engagement |
| Promising | Recent signup, 2+ visits | 89 | $35/mo | Nurture to loyal |
| At Risk | No visit in 45-60 days | 67 | $28/mo | Win-back campaign |
| Lost | No visit in 60+ days | 134 | $0/mo | Re-engagement needed |

### 6. Location Comparison

Compare performance across locations:

```
                    │ Honey Brook │ La Cocina │ El Rancho │ Antonio's
────────────────────┼─────────────┼───────────┼───────────┼──────────
Visits/month        │    423      │    312    │    198    │   267
Unique customers    │    287      │    198    │    145    │   189
Repeat rate         │    34%      │    28%    │    18%    │   24%
Avg spend           │   $24.50    │  $31.20   │  $28.40   │  $35.80
Redemption rate     │    12%      │    15%    │     8%    │   11%
Points per visit    │    28       │    35     │    32     │    40

💡 El Rancho has lowest repeat rate. Consider location-specific promo.
```

## Data Model Additions

```sql
-- Pre-aggregated metrics for fast dashboards
CREATE TABLE daily_metrics (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL,
  location_id TEXT,  -- NULL for business-wide
  date DATE NOT NULL,
  
  -- Counts
  visits INTEGER DEFAULT 0,
  unique_customers INTEGER DEFAULT 0,
  new_enrollments INTEGER DEFAULT 0,
  
  -- Revenue
  total_revenue_cents INTEGER DEFAULT 0,
  avg_transaction_cents INTEGER DEFAULT 0,
  
  -- Points
  points_earned INTEGER DEFAULT 0,
  points_redeemed INTEGER DEFAULT 0,
  
  -- Rewards
  rewards_earned INTEGER DEFAULT 0,
  rewards_redeemed INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Campaign/rule performance tracking
CREATE TABLE rule_performance (
  id TEXT PRIMARY KEY,
  rule_id TEXT NOT NULL REFERENCES rules(id),
  date DATE NOT NULL,
  
  times_triggered INTEGER DEFAULT 0,
  unique_customers INTEGER DEFAULT 0,
  points_awarded INTEGER DEFAULT 0,
  associated_revenue_cents INTEGER DEFAULT 0,
  
  -- Comparison to baseline
  baseline_visits INTEGER,
  actual_visits INTEGER,
  lift_percentage DOUBLE PRECISION,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Journey funnel tracking
CREATE TABLE journey_analytics (
  id TEXT PRIMARY KEY,
  journey_id TEXT NOT NULL REFERENCES journeys(id),
  date DATE NOT NULL,
  
  started INTEGER DEFAULT 0,
  step_1_completed INTEGER DEFAULT 0,
  step_2_completed INTEGER DEFAULT 0,
  step_3_completed INTEGER DEFAULT 0,
  step_4_completed INTEGER DEFAULT 0,
  -- ... more steps as needed
  fully_completed INTEGER DEFAULT 0,
  expired INTEGER DEFAULT 0,
  
  avg_completion_days DOUBLE PRECISION,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Export & Sharing

### Export Formats
- PDF reports (scheduled or on-demand)
- CSV data export
- Email digests (daily/weekly/monthly)

### Scheduled Reports
```
┌─────────────────────────────────────────────┐
│ Scheduled Reports                           │
├─────────────────────────────────────────────┤
│ ✅ Weekly Summary      Every Monday 8am    │
│ ✅ Monthly Deep Dive   1st of month        │
│ ○  Daily Snapshot      (enable)            │
│                                             │
│ Recipients: freddie@email.com              │
│ [+ Add recipient]                           │
└─────────────────────────────────────────────┘
```

## Implementation Phases

### Phase 1: Basic (v1.1) — `analytics:basic`
- Dashboard with key metrics
- Simple charts (visits over time)
- Basic campaign performance
- CSV export

### Phase 2: Intermediate (v1.2) — `analytics:advanced`
- Journey funnel analytics
- Customer segmentation
- Location comparison
- Scheduled email reports

### Phase 3: Advanced (v2.0) — `analytics:realtime`
- Predictive analytics
- AI-powered insights
- Cohort analysis
- Revenue attribution
- A/B test analysis
- Custom report builder

## Integration with AI Assistant

Analytics data feeds the [AI Marketing Assistant](ai-marketing-assistant.md):

```typescript
// AI uses analytics to make recommendations
const insights = await analytics.getInsights(businessId);
const recommendations = await ai.generateRecommendations(insights);

// Example insight → recommendation flow:
// Insight: "El Rancho has 18% repeat rate vs 28% average"
// AI Recommendation: "Try 'El Rancho Explorer' bonus - 
//                     50 extra points for El Rancho visits"
```

## Success Metrics

| Metric | Target |
|--------|--------|
| Dashboard daily active usage | 40% of owners |
| Report email open rate | 60% |
| Data-driven decisions | Owners cite data in 50% of changes |
| Time to insight | < 30 seconds for key questions |

## Related Features

- [AI Marketing Assistant](ai-marketing-assistant.md) — Uses analytics for recommendations
- [Marketing Messages](marketing-messages.md) — Campaign performance tracking
- [User Journeys](user-journeys.md) — Journey funnel analytics
- [Admin Dashboard](admin-dashboard.md) — Where analytics live
- [Entitlements](../ENTITLEMENTS.md) — Feature gating

---

← Back to [ROADMAP.md](../../ROADMAP.md)
