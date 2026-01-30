# Composable Rules Engine Specification

> **Rewards Pirate** - Where loyalty meets adventure!

This document specifies the full composable rules engine for Lootly, enabling business owners to create custom loyalty rules, chain them into multi-step quests, and deliver gamified customer experiences.

---

## Overview

### Three Layers of Composition

```
┌─────────────────────────────────────────────────────────────────┐
│  LAYER 3: RULESETS (Voyages)                                    │
│  Chain multiple rules together with dependencies                │
│  "Complete A, B, C → unlock D"                                  │
├─────────────────────────────────────────────────────────────────┤
│  LAYER 2: RULES                                                 │
│  Combine conditions with AND/OR logic → Award                   │
│  "When X AND Y happen → give Z"                                 │
├─────────────────────────────────────────────────────────────────┤
│  LAYER 1: CONDITION PRIMITIVES                                  │
│  Atomic building blocks                                         │
│  Location, Spend, Product, Time, Day, Customer attribute...     │
└─────────────────────────────────────────────────────────────────┘
```

### Core Concept

```
WHEN [conditions met] → AWARD [points/reward/multiplier]
```

---

## Layer 1: Condition Primitives

Atomic building blocks that are fully configurable:

| Category | Primitive | Configurable Options |
|----------|-----------|---------------------|
| **Location** | Visit | which: any / specific / group / all | 
| | | count: at least X / exactly X / at most X |
| **Spending** | Spend amount | scope: single transaction / cumulative |
| | | comparison: at least / exactly / between |
| | | where: any location / specific / group |
| **Product** | Purchase item | product name or category |
| | | quantity: at least X |
| **Time** | Window | within X days/weeks/months |
| | Day of week | specific days (Tues, weekends, etc) |
| | Date range | between start and end date |
| | Time of day | between X and Y (happy hour) |
| **Customer** | Attribute | membership age, tier, lifetime spend |
| | Tag | has/doesn't have tag |
| | Previous rule | has/hasn't triggered rule X |

---

## Layer 2: Rules

A rule = **Conditions** (combined with AND/OR) → **Award**

### Condition JSON Structure

**Simple condition:**
```json
{
  "type": "location_visit",
  "params": {
    "scope": "any",
    "locationId": null,
    "locationGroupId": null,
    "comparison": ">=",
    "value": 2
  }
}
```

**Time window (modifier):**
```json
{
  "type": "time_window",
  "params": {
    "value": 7,
    "unit": "days"
  }
}
```

**Compound with AND/OR:**
```json
{
  "operator": "AND",
  "items": [
    {
      "type": "location_visit",
      "params": { "scope": "any", "comparison": ">=", "value": 2 }
    },
    {
      "type": "time_window",
      "params": { "value": 7, "unit": "days" }
    },
    {
      "type": "day_of_week",
      "params": { "days": ["saturday", "sunday"] }
    }
  ]
}
```

**Previous rule check (for chaining):**
```json
{
  "type": "rule_triggered",
  "params": {
    "ruleIds": ["rule_1", "rule_2", "rule_3"],
    "match": "all",
    "atLeastCount": null,
    "withinDays": null
  }
}
```

### Awards Array

```json
[
  {
    "type": "bonus_points",
    "value": 50
  },
  {
    "type": "multiplier",
    "value": 2,
    "duration": "permanent",
    "scope": "all"
  },
  {
    "type": "unlock_reward",
    "rewardId": "reward_50_off"
  },
  {
    "type": "apply_tag",
    "tag": "grand_tour_complete"
  }
]
```

---

## Layer 3: Rulesets (Voyages)

A **Ruleset** is a collection of rules with dependencies, presented as a gamified journey.

### Chaining Types

| Chain Type | Example |
|------------|--------|
| **Sequential** | Complete Rule A → unlocks Rule B → unlocks Rule C |
| **Parallel** | Complete Rules A, B, C (any order) → triggers Rule D |
| **Branching** | Rule A → unlocks either B or C based on conditions |
| **Progressive** | Each rule builds on previous (earning tiers) |

---

## Database Schema

### Rulesets Table

```sql
CREATE TABLE rulesets (
  id TEXT PRIMARY KEY,                    -- 'rset_xxx'
  business_id TEXT NOT NULL REFERENCES businesses(id),
  
  -- Identity
  name TEXT NOT NULL,
  description TEXT,
  
  -- Gamification Theme (Pirate-themed by default)
  theme TEXT NOT NULL DEFAULT 'voyage',   -- 'voyage', 'treasure_hunt', 'quest', 'expedition'
  display_name TEXT,                      -- Customer-facing: 'The Grand Voyage'
  tagline TEXT,                           -- 'Chart yer course to riches!'
  narrative_intro TEXT,                   -- 'Ahoy! Yer adventure begins...'
  narrative_complete TEXT,                -- 'Shiver me timbers! Ye did it!'
  
  -- Visual
  icon TEXT,                              -- Emoji or icon name: '🗺️'
  color TEXT,                             -- Hex color: '#FF6B35'
  badge_image_url TEXT,                   -- URL to completion badge
  background_image_url TEXT,              -- Quest card background
  
  -- Chain Configuration
  chain_type TEXT NOT NULL DEFAULT 'parallel',
  time_limit_value INT,
  time_limit_unit TEXT,
  
  -- Customer Visibility
  is_visible_to_customer BOOLEAN DEFAULT TRUE,
  show_progress BOOLEAN DEFAULT TRUE,
  show_locked_steps BOOLEAN DEFAULT TRUE,
  
  -- Status
  is_active BOOLEAN DEFAULT FALSE,
  priority INT DEFAULT 0,
  
  -- Scheduling
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Rules Table

```sql
CREATE TABLE rules (
  id TEXT PRIMARY KEY,                    -- 'rule_xxx'
  business_id TEXT NOT NULL REFERENCES businesses(id),
  ruleset_id TEXT REFERENCES rulesets(id),
  
  -- Identity
  name TEXT NOT NULL,
  description TEXT,
  
  -- Customer-Facing (pirate-themed)
  display_name TEXT,                      -- 'Port o\' Call: Tony\'s Pizza'
  display_description TEXT,               -- 'Drop anchor at Tony\'s'
  hint TEXT,                              -- 'Hint: The pepperoni be legendary!'
  icon TEXT,                              -- '🍕'
  
  -- Conditions (JSONB tree)
  conditions JSONB NOT NULL,
  
  -- Awards (array)
  awards JSONB NOT NULL,
  
  -- Behavior
  is_repeatable BOOLEAN DEFAULT FALSE,
  cooldown_days INT,
  max_triggers_per_customer INT,
  
  -- Chaining (within ruleset)
  sequence_order INT,
  depends_on_rule_ids TEXT[],
  
  -- Status
  is_active BOOLEAN DEFAULT FALSE,
  priority INT DEFAULT 0,
  
  -- Scheduling
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  
  -- Feature gating
  required_feature TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Rule Triggers Table

```sql
CREATE TABLE rule_triggers (
  id TEXT PRIMARY KEY,                    -- 'rtrig_xxx'
  rule_id TEXT NOT NULL REFERENCES rules(id),
  ruleset_id TEXT REFERENCES rulesets(id),
  customer_id TEXT NOT NULL REFERENCES customers(id),
  enrollment_id TEXT REFERENCES enrollments(id),
  business_id TEXT NOT NULL REFERENCES businesses(id),
  
  -- What triggered it
  trigger_transaction_id TEXT REFERENCES transactions(id),
  trigger_type TEXT NOT NULL,             -- 'transaction', 'visit', 'manual', 'scheduled'
  
  -- Awards given
  awards_given JSONB NOT NULL,
  points_awarded INT DEFAULT 0,
  reward_id_unlocked TEXT REFERENCES rewards(id),
  
  -- Metadata
  triggered_at TIMESTAMPTZ DEFAULT NOW(),
  condition_snapshot JSONB,
  evaluation_context JSONB
);
```

### Ruleset Progress Table

```sql
CREATE TABLE ruleset_progress (
  id TEXT PRIMARY KEY,                    -- 'rsprog_xxx'
  ruleset_id TEXT NOT NULL REFERENCES rulesets(id),
  customer_id TEXT NOT NULL REFERENCES customers(id),
  business_id TEXT NOT NULL REFERENCES businesses(id),
  
  -- Progress State
  status TEXT NOT NULL DEFAULT 'not_started',
  
  -- Tracking
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  
  -- Progress Data
  completed_rule_ids TEXT[] DEFAULT '{}',
  current_step INT DEFAULT 0,
  
  -- Stats
  total_points_earned INT DEFAULT 0,
  total_rewards_unlocked INT DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(ruleset_id, customer_id)
);
```

### Customer Tags Table

```sql
CREATE TABLE customer_tags (
  id TEXT PRIMARY KEY,                    -- 'ctag_xxx'
  customer_id TEXT NOT NULL REFERENCES customers(id),
  business_id TEXT NOT NULL REFERENCES businesses(id),
  
  tag TEXT NOT NULL,
  
  -- Source
  source_type TEXT NOT NULL,              -- 'rule', 'manual', 'import'
  source_rule_id TEXT REFERENCES rules(id),
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  
  UNIQUE(customer_id, business_id, tag)
);
```

---

## Rules Evaluation Engine

### Evaluation Flow

1. Customer transaction occurs
2. Load active rules for business (sorted by priority)
3. For each rule:
   - Check if already triggered (if not repeatable)
   - Check cooldown period
   - Check date range
   - Evaluate condition tree
   - If pass → trigger rule, give award
4. Return triggered awards

### Main Evaluator

```javascript
async function evaluateRule(rule, context, timeWindow) {
  // Check prerequisites
  if (!rule.isRepeatable && await hasTriggered(context.customerId, rule.id)) {
    return { triggered: false, reason: 'already_triggered' };
  }
  
  if (rule.cooldownDays && await isInCooldown(context.customerId, rule.id, rule.cooldownDays)) {
    return { triggered: false, reason: 'cooldown' };
  }
  
  // Evaluate conditions
  const result = await evaluateCondition(rule.conditions, context, timeWindow);
  
  if (result) {
    return { triggered: true, awards: rule.awards };
  }
  
  return { triggered: false, reason: 'conditions_not_met' };
}

async function evaluateCondition(condition, context, timeWindow) {
  // Handle AND/OR groups
  if (condition.operator) {
    const results = await Promise.all(
      condition.items.map(item => evaluateCondition(item, context, timeWindow))
    );
    
    if (condition.operator === 'AND') {
      return results.every(r => r === true);
    } else {
      return results.some(r => r === true);
    }
  }
  
  // Handle specific condition types
  switch (condition.type) {
    case 'time_window':
      return true; // Modifier, applied to sibling conditions
    case 'day_of_week':
      const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      return condition.params.days.map(d => d.toLowerCase()).includes(today);
    case 'location_visit':
      return await evaluateLocationVisit(condition.params, context, timeWindow);
    case 'spend_amount':
      return await evaluateSpendAmount(condition.params, context, timeWindow);
    case 'product_purchase':
      return await evaluateProductPurchase(condition.params, context, timeWindow);
    case 'rule_triggered':
      return await evaluateRuleTriggered(condition.params, context);
    default:
      return false;
  }
}
```

### Historical Data Queries

```javascript
async function countVisits(customerId, businessId, scope, locationId, timeWindow) {
  const since = timeWindow ? subtractDays(new Date(), timeWindow.value) : null;
  
  let query = db.select({ count: countDistinct(visits.locationId) })
    .from(visits)
    .innerJoin(locations, eq(visits.locationId, locations.id))
    .where(and(
      eq(visits.customerId, customerId),
      eq(locations.businessId, businessId),
      since ? gte(visits.createdAt, since) : undefined
    ));
  
  if (scope === 'specific' && locationId) {
    query = query.where(eq(visits.locationId, locationId));
  }
  
  const result = await query;
  return result[0].count;
}

async function sumSpend(customerId, businessId, scope, timeWindow) {
  const since = timeWindow ? subtractDays(new Date(), timeWindow.value) : null;
  
  if (scope === 'single_transaction') {
    return context.amountCents / 100;
  }
  
  const result = await db
    .select({ total: sum(transactions.amountCents) })
    .from(transactions)
    .innerJoin(enrollments, eq(transactions.enrollmentId, enrollments.id))
    .where(and(
      eq(enrollments.customerId, customerId),
      eq(enrollments.businessId, businessId),
      eq(transactions.type, 'purchase'),
      since ? gte(transactions.createdAt, since) : undefined
    ));
  
  return (result[0].total || 0) / 100;
}
```

---

## Test Simulator

The test simulator helps business owners understand and validate rules before activation.

### Simulator Features

1. **Bulk Simulation**: "How many customers would trigger this today?"
2. **Individual Customer Test**: "Would Jane qualify? What's she missing?"
3. **What-If Scenario**: "If Jane visits Casa Verde now, what happens?"
4. **Ruleset Progress**: "How far is Jane in the Grand Voyage?"

### API Endpoints

```
POST /api/admin/rules/:ruleId/simulate/bulk
POST /api/admin/rules/:ruleId/simulate/customer
POST /api/admin/rules/:ruleId/simulate/what-if
POST /api/admin/rulesets/:rulesetId/simulate/customer
```

### Plain Language Generator

Every rule displays in plain English:

| Condition | Plain Language |
|-----------|----------------|
| Visit >= 2, any location, 7 days | "visits at least 2 different locations within 7 days" |
| Visit >= 1, specific location (all) | "visits all 4 of yer ports" |
| Spend >= 100, any, single transaction | "spends $100 or more doubloons in a single visit" |
| Day = Tuesday | "on a Tuesday" |

---

## Feature Gating

| Feature | Tier | Capabilities |
|---------|------|-------------|
| RULES_BASIC | Free | Points per dollar, visit bonuses |
| RULES_ADVANCED | Starter | AND/OR conditions, complex logic |
| RULES_TIME_BOUND | Starter | Limited-time promos, date ranges |
| RULES_PRODUCT | Pro | Product-based bonuses |
| RULESETS | Starter | Multi-step voyages/quests |

---

## Example Rules

### Weekend Warrior (Starter)
```json
{
  "name": "Weekend Warrior",
  "displayName": "Weekend Plunderer",
  "conditions": {
    "operator": "AND",
    "items": [
      { "type": "location_visit", "params": { "scope": "any", "comparison": ">=", "value": 2 } },
      { "type": "time_window", "params": { "value": 7, "unit": "days" } },
      { "type": "day_of_week", "params": { "days": ["saturday", "sunday"] } }
    ]
  },
  "awards": [{ "type": "bonus_points", "value": 50 }],
  "isRepeatable": true,
  "cooldownDays": 7
}
```

### Grand Voyage (Free)
```json
{
  "name": "Grand Voyage",
  "displayName": "The Grand Voyage",
  "conditions": {
    "operator": "AND",
    "items": [
      { "type": "rule_triggered", "params": { "ruleIds": ["rule_port1", "rule_port2", "rule_port3", "rule_port4"], "match": "all" } }
    ]
  },
  "awards": [
    { "type": "unlock_reward", "rewardId": "reward_50_off" },
    { "type": "multiplier", "value": 2, "duration": "permanent" },
    { "type": "apply_tag", "tag": "grand_voyage_complete" }
  ],
  "isRepeatable": false
}
```

---

## Related Documentation

- [ADMIN_APP.md](./ADMIN_APP.md) - Admin UI for building rules
- [GAMIFICATION.md](./GAMIFICATION.md) - Customer-facing pirate theme
- [ENTITLEMENTS.md](./ENTITLEMENTS.md) - Feature gating details
- [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) - Full database reference

---

*Last updated: January 2025*
