# Analytics & Reporting

> **Status:** 💡 Idea  
> **Target Release:** v1.1 (basic) → v2.0 (advanced)  
> **Roadmap:** [ROADMAP.md](../../ROADMAP.md) — Section: NEXT  
> **Location:** `docs/roadmap/analytics-reporting.md`  

## Overview

Provide business owners with insights into their loyalty program performance. Track what's working, what's not, and enable data-driven decisions. This data also feeds the [AI Marketing Assistant](ai-marketing-assistant.md).

## Why This Matters

Business owners need to answer:
- Is my loyalty program worth it?
- Which rewards drive the most visits?
- Which promotions actually work?
- Are customers completing journeys?
- What's my ROI on points given away?

## Core Metrics

### Program Health
| Metric | Description |
|--------|-------------|
| Active members | Visited in last 30 days |
| Total enrolled | All-time signups |
| Churn rate | Members gone inactive |
| Avg visits/member | Engagement depth |
| Avg points balance | Liability indicator |
| Points redemption rate | Are rewards compelling? |

### Financial Impact
| Metric | Description |
|--------|-------------|
| Revenue from members | Tracked spend |
| Avg transaction value | Members vs non-members |
| Points liability | Outstanding points value |
| Reward cost | Value of redeemed rewards |
| Program ROI | Revenue lift vs costs |

### Campaign Performance
| Metric | Description |
|--------|-------------|
| Promo participation | Who engaged with time-bound promos |
| Promo lift | Visits/spend during vs before |
| Message open rate | Push notification engagement |
| Message conversion | Visits after receiving message |

### Journey Analytics
| Metric | Description |
|--------|-------------|
| Journey starts | How many began |
| Completion rate | Started → Finished |
| Drop-off points | Where people quit |
| Time to complete | Speed through journey |
| Revenue per journey | Value of completing customers |

### Reward Effectiveness
| Metric | Description |
|--------|-------------|
| Redemption rate | % of earned rewards used |
| Time to redeem | Days from earn to use |
| Expiration rate | Rewards that expire unused |
| Repeat after redeem | Do they come back? |
| Most popular rewards | What people want |

## Dashboard Views

### Overview Dashboard
```
┌─────────────────────────────────────────────────────────────────┐
│ 📊 Program Overview                          Last 30 days ▼    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │   847    │  │  2,341   │  │  $45.20  │  │   78%    │       │
│  │ Active   │  │  Total   │  │ Avg Txn  │  │ Redeem   │       │
│  │ Members  │  │ Enrolled │  │  Value   │  │  Rate    │       │
│  │  ↑ 12%   │  │  ↑ 8%    │  │  ↑ 5%    │  │  ↑ 3%    │       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
│                                                                 │
│  Visits Over Time                                              │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │     ╭─╮                                    ╭──╮         │   │
│  │  ╭──╯ ╰──╮    ╭──╮         ╭──╮      ╭───╯  ╰──╮      │   │
│  │──╯       ╰────╯  ╰─────────╯  ╰──────╯         ╰──    │   │
│  └─────────────────────────────────────────────────────────┘   │
│  Jan 1                                              Jan 30     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Campaign Performance
```
┌─────────────────────────────────────────────────────────────────┐
│ 📣 Campaign Performance                                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Recent Campaigns                                               │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Campaign              │ Sent  │ Opened │ Visits │ ROI   │   │
│  ├───────────────────────┼───────┼────────┼────────┼───────┤   │
│  │ 🔥 Double Points Wknd │ 834   │ 72%    │ 156    │ +$2.3k│   │
│  │ 🌮 Taco Tuesday       │ 834   │ 68%    │ 142    │ +$1.8k│   │
│  │ 🎂 Birthday Club      │ 45    │ 89%    │ 38     │ +$890 │   │
│  │ 🗺️ Grand Tour Reminder│ 312   │ 54%    │ 67     │ +$1.2k│   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  💡 AI Insight: "Double Points promotions drive 2.3x more      │
│     visits than product-specific offers. Consider running      │
│     them bi-weekly instead of monthly."                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Journey Analytics
```
┌─────────────────────────────────────────────────────────────────┐
│ 🗺️ Journey: Grand Tour                                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Funnel                                                         │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Started      ████████████████████████████████████  234  │   │
│  │ Step 1 ✓    ████████████████████████████          198  │   │
│  │ Step 2 ✓    ██████████████████                    145  │   │
│  │ Step 3 ✓    ████████████                          102  │   │
│  │ Completed   ████████                               78  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Completion Rate: 33%    Avg Time: 18 days    Revenue: $4,200  │
│                                                                 │
│  💡 AI Insight: "Step 2→3 has highest drop-off (30%). This is  │
│     the El Rancho visit. Consider adding a bonus incentive     │
│     for this step or featuring El Rancho in your next push."   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Data Model

### Aggregated Stats (for fast dashboard loads)

```sql
CREATE TABLE daily_stats (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  location_id TEXT REFERENCES locations(id),  -- NULL = all locations
  date DATE NOT NULL,
  
  -- Counts
  visits INTEGER DEFAULT 0,
  new_enrollments INTEGER DEFAULT 0,
  unique_visitors INTEGER DEFAULT 0,
  
  -- Financial
  total_spend_cents INTEGER DEFAULT 0,
  avg_transaction_cents INTEGER DEFAULT 0,
  
  -- Points
  points_earned INTEGER DEFAULT 0,
  points_redeemed INTEGER DEFAULT 0,
  rewards_claimed INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(business_id, location_id, date)
);

CREATE TABLE campaign_stats (
  id TEXT PRIMARY KEY,
  campaign_id TEXT NOT NULL,  -- rule_id or message_id
  campaign_type TEXT NOT NULL,  -- 'promo', 'message', 'journey'
  business_id TEXT NOT NULL REFERENCES businesses(id),
  
  -- Reach
  audience_size INTEGER DEFAULT 0,
  sent_count INTEGER DEFAULT 0,
  delivered_count INTEGER DEFAULT 0,
  opened_count INTEGER DEFAULT 0,
  clicked_count INTEGER DEFAULT 0,
  
  -- Conversion
  visits_attributed INTEGER DEFAULT 0,
  revenue_attributed_cents INTEGER DEFAULT 0,
  
  -- Timing
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE journey_stats (
  id TEXT PRIMARY KEY,
  journey_id TEXT NOT NULL REFERENCES journeys(id),
  
  started_count INTEGER DEFAULT 0,
  completed_count INTEGER DEFAULT 0,
  expired_count INTEGER DEFAULT 0,
  abandoned_count INTEGER DEFAULT 0,
  
  avg_completion_hours DOUBLE PRECISION,
  revenue_attributed_cents INTEGER DEFAULT 0,
  
  -- Per-step drop-off
  step_completions JSONB,  -- { "step_1": 198, "step_2": 145, ... }
  
  last_updated TIMESTAMPTZ DEFAULT NOW()
);
```

## Implementation Phases

### MVP (v1.1)
- Basic dashboard with core metrics
- Simple date range filtering
- Per-location breakdown
- Export to CSV

### v1.5
- Campaign performance tracking
- Journey funnel visualization
- Comparative periods (this month vs last)
- Scheduled email reports

### v2.0
- AI-powered insights (see [AI Marketing Assistant](ai-marketing-assistant.md))
- Predictive analytics (churn risk, lifetime value)
- Custom report builder
- Real-time dashboard updates
- Cohort analysis

## Attribution Model

How we attribute visits/revenue to campaigns:

1. **Direct attribution:** Customer clicked push notification → visited within 24h
2. **Time-window attribution:** Customer received message → visited within 7 days
3. **Journey attribution:** Visit completes a journey step
4. **Promo attribution:** Visit during active promotion period

## Related Features

- [AI Marketing Assistant](ai-marketing-assistant.md) — Uses this data for recommendations
- [Marketing Messages](marketing-messages.md) — Campaign tracking
- [Time-Bound Promos](time-bound-promos.md) — Promo performance
- [User Journeys](user-journeys.md) — Journey analytics

---

← Back to [ROADMAP.md](../../ROADMAP.md)
