# User Journeys / Treasure Maps

> **Status:** 💡 Idea  
> **Target Release:** v2.0+  
> **Roadmap:** [ROADMAP.md](../../ROADMAP.md) — Section: LATER  
> **Location:** `docs/roadmap/user-journeys.md`  

## Overview

User Journeys (or "Treasure Maps") are multi-step reward quests that guide customers through a series of actions to earn a big reward. Think of it as gamified loyalty with a visual progress map.

## Concept

Instead of just "earn points, get rewards", customers embark on adventures:

```
🗺️ THE GRAND FEAST JOURNEY
━━━━━━━━━━━━━━━━━━━━━━━━━━

[✅]━━━━[✅]━━━━[🔲]━━━━[🔲]━━━━[🏆]
 │       │       │       │       │
Pizza   Tacos   Pasta   Stir    GRAND
Place   Place   Place   Fry     PRIZE!
                        Place   $100 off!

Progress: 2 of 4 stops completed
```

## Use Cases

### Journey Types

| Type | Example | Reward |
|------|---------|--------|
| Location tour | Visit all 4 restaurants | $50 off + 2x points |
| Spending quest | Spend $25 at 3 different locations | Free appetizer |
| Time challenge | Complete 5 visits in 2 weeks | Exclusive badge + bonus |
| Product discovery | Try the special at each location | Free dessert |
| Streak journey | Visit any location 7 days in a row | VIP status |

### Example: "Weekend Warrior" Journey

```
🏃 WEEKEND WARRIOR
Complete in one weekend to win!

Step 1: [✅] Visit any location Friday evening
Step 2: [✅] Spend $30+ on Saturday  
Step 3: [🔲] Visit a different location Sunday
        ↓
      [🏆] Unlock: Double points for a month!

⏰ Time remaining: 18 hours
```

## Customer Experience

### Journey Discovery
- Customer sees available journeys in app
- Some journeys are always available
- Some are limited-time ("This weekend only!")
- Some are personalized ("Based on your history...")

### Progress Tracking
- Visual map/path showing steps
- Clear indicators of completed vs remaining
- Time remaining for timed journeys
- Estimated rewards shown

### Completion
- Big celebration animation when journey complete
- "Loot drop" moment with rewards
- Share to social media option
- Unlock next journey or badge

## Admin Configuration

### Journey Builder

```
Create New Journey:
┌─────────────────────────────────────────────┐
│ Name: [The Grand Feast                    ] │
│ Description: [Visit all 4 locations       ] │
│                                             │
│ Steps:                                      │
│ ┌─────────────────────────────────────────┐ │
│ │ 1. [Visit] [Tony's Pizza   ▼]          │ │
│ │    └ [+ Add condition]                  │ │
│ ├─────────────────────────────────────────┤ │
│ │ 2. [Visit] [Casa Verde     ▼]          │ │
│ │    └ [+ Add condition]                  │ │
│ ├─────────────────────────────────────────┤ │
│ │ 3. [Visit] [Bella Italia   ▼]          │ │
│ ├─────────────────────────────────────────┤ │
│ │ 4. [Visit] [Dragon Wok     ▼]          │ │
│ └─────────────────────────────────────────┘ │
│ [+ Add Step]                                │
│                                             │
│ Time Limit: [None ▼] or [7 days]           │
│                                             │
│ Final Reward:                               │
│ [🏆 $50 off + 2x points multiplier       ] │
│                                             │
│ Availability:                               │
│ ○ Always available                          │
│ ○ Limited time: [Start] to [End]           │
│ ○ Repeatable every [30] days               │
└─────────────────────────────────────────────┘
```

### Step Conditions

Each step can have conditions using the rules engine:

- Visit specific location
- Visit any location in group
- Spend minimum amount
- Buy specific product
- Visit on specific day
- Combination with AND/OR

## Data Model

```sql
-- Journeys
CREATE TABLE journeys (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  map_style TEXT,  -- 'linear', 'branching', 'circular'
  time_limit_hours INTEGER,  -- NULL = no limit
  is_repeatable BOOLEAN DEFAULT 0,
  repeat_cooldown_days INTEGER,
  final_reward_type TEXT,
  final_reward_value TEXT,
  is_active BOOLEAN DEFAULT 1,
  start_date DATETIME,
  end_date DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Journey Steps
CREATE TABLE journey_steps (
  id TEXT PRIMARY KEY,
  journey_id TEXT NOT NULL REFERENCES journeys(id),
  step_order INTEGER NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  conditions JSON NOT NULL,  -- Uses rules engine format
  step_reward_type TEXT,  -- Optional reward for completing step
  step_reward_value TEXT,
  UNIQUE(journey_id, step_order)
);

-- Customer Journey Progress
CREATE TABLE customer_journeys (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL REFERENCES customers(id),
  journey_id TEXT NOT NULL REFERENCES journeys(id),
  status TEXT DEFAULT 'in_progress',  -- 'in_progress', 'completed', 'expired', 'abandoned'
  started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME,  -- Calculated from time_limit
  completed_at DATETIME
);

-- Customer Step Completions
CREATE TABLE customer_journey_steps (
  id TEXT PRIMARY KEY,
  customer_journey_id TEXT NOT NULL REFERENCES customer_journeys(id),
  step_id TEXT NOT NULL REFERENCES journey_steps(id),
  completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  transaction_id TEXT  -- The transaction that completed this step
);
```

## Integration with Rules Engine

Journeys are essentially a wrapper around the rules engine:

1. Each step's conditions use the same JSON format as rules
2. Step completion triggers same evaluation logic
3. Journey completion is a special rule that checks all steps done
4. Time limits use same date range logic

## Notifications

| Trigger | Message |
|---------|--------|
| Journey available | "🗺️ New adventure available: The Grand Feast!" |
| Step completed | "✅ Step 2 complete! 2 more to go..." |
| Time running low | "⏰ Only 6 hours left on your Weekend Warrior journey!" |
| Journey completed | "🏆 JOURNEY COMPLETE! You've unlocked $50 off!" |
| Journey expired | "😢 Your journey expired. Start again anytime!" |

## MVP vs Full Version

### MVP (if prioritized)
- Linear journeys only (no branching)
- Location-visit steps only
- Basic progress display
- Single final reward

### Full Version
- Branching paths (choose your adventure)
- All step types (visits, spend, products)
- Rich visual maps
- Step rewards + final rewards
- Social sharing
- Leaderboards

## Questions to Resolve

1. Can customers be on multiple journeys at once?
2. Do expired journeys reset progress or keep partial?
3. Should steps be order-dependent or any order?
4. How to handle "secret" journeys that unlock?
5. Integrate with gamification (badges, levels)?

## Related Features

- [Gamification](gamification.md) — Badges, levels, streaks
- [Push Notifications](push-notifications.md) — Journey alerts
- [Time-Bound Promos](time-bound-promos.md) — Limited time journeys
- [Rules Engine](../TECHNICAL_SPEC.md#composable-rules-engine) — Step conditions

---

← Back to [ROADMAP.md](../../ROADMAP.md)