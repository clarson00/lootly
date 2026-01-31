# Tenant Rewards Program (PrintHabit Integration)

> **Status:** 🔷 Specified  
> **Priority:** High  
> **Target:** v2.1 (post-gamification foundation)  
> **Last Updated:** January 30, 2026

---

## Executive Summary

A gamification layer for **tenants** (not just customers) where businesses earn **Creator Points (CP)** for platform engagement and redeem rewards through PrintHabit—RewardsPirate's sister company that produces custom merchandise. This creates a powerful flywheel: tenants earn merchandise, give it to customers as prizes, customers engage more, tenants earn more CP.

### The Flywheel Effect

```
Tenant creates engagement → Earns Creator Points → Redeems for PrintHabit merch
         ↑                                              ↓
         │                                              │
         │                                              ▼
    More customer                              Tenant gives merch
    activity generated ◄─────────────────────  to customers as prizes
```

**This is a triple-win:**
1. **Tenants** get free/discounted marketing materials
2. **Customers** get tangible, desirable physical rewards
3. **Platform** gets increased engagement and tenant stickiness

---

## Currency: Creator Points (CP)

### Why "Creator Points"?

Tenants are **creators** on the platform:
- They CREATE bounties, events, games
- They CREATE customer experiences
- They CREATE engagement that drives the ecosystem

**Creator Points (CP)** distinguishes tenant currency from customer XP and emphasizes their role as content creators.

| Audience | Currency | Purpose |
|----------|----------|---------|
| Customers | XP | Platform progression, ranks |
| Tenants | Creator Points (CP) | Platform engagement, merch rewards |

---

## Tenant Ranks (Business Theme)

Just like customers have pirate ranks, tenants have **business-themed ranks**:

| Rank | CP Required | Total CP | Unlocks |
|------|-------------|----------|---------|
| **Shopkeep** | 0 | 0 | Basic features, catalog access |
| **Merchant** | 500 | 500 | Leaderboard visibility |
| **Proprietor** | 1,000 | 1,500 | Custom merch options |
| **Director** | 2,500 | 4,000 | Priority fulfillment |
| **Mogul** | 3,000 | 7,000 | Exclusive catalog items |
| **Tycoon** | 8,000 | 15,000 | Bulk order discounts |
| **Baron** | 15,000 | 30,000 | White-label options |
| **Titan** | 30,000 | 60,000 | Advisory board invitation, legacy status |

### Rank Badges

```
┌─────────────────────────────────────────────────────────────────┐
│  TENANT RANK BADGES                                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   🏪 Shopkeep    🛒 Merchant    🏬 Proprietor   📊 Director    │
│                                                                 │
│   💰 Mogul       🏭 Tycoon      👑 Baron        🌟 Titan       │
│                                                                 │
│  Badges displayed on:                                           │
│  • Tenant dashboard                                             │
│  • Collaboration invites                                        │
│  • Platform directory (if public)                               │
│  • PrintHabit order history                                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Attribution Tracking

### Why Track Attribution?

Every point of customer XP should trace back to **which tenant activity generated it**. This provides:

1. **Tenant ROI visibility** - "Your Summer Bounty generated 5,000 customer XP"
2. **Platform analytics** - "Bounties generate 40% of platform XP"
3. **CP reward calculation** - Tenants earn CP based on customer XP they generate

### Attribution Chain

```
┌─────────────────────────────────────────────────────────────────┐
│                    ATTRIBUTION TRACKING                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Customer Action          Attribution                           │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  Check-in at Joe's    →   tenant: Joe's Coffee                  │
│       +10 XP              location: Main St                     │
│                           source: check_in                      │
│                                                                 │
│  Complete bounty      →   tenant: Joe's Coffee                  │
│       +50 XP              bounty: "Summer Special"              │
│                           source: bounty                        │
│                                                                 │
│  Capture at Joe's     →   tenant: Joe's Coffee                  │
│       +25 XP              location: Main St                     │
│                           source: capture                       │
│                           collectible: Rare Shark               │
│                                                                 │
│  Voyage waypoint      →   tenant: Joe's Coffee (waypoint)       │
│       +15 XP              voyage: "Downtown Coffee Trail"       │
│                           organizer: Coffee Alliance            │
│                           source: voyage                        │
│                                                                 │
│  Raid participation   →   tenant: Joe's Coffee (host)           │
│       +100 XP             event: "Super Bowl Kraken"            │
│                           source: raid                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Attribution Data Model

```sql
-- Enhanced XP transaction with full attribution
CREATE TABLE xp_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    amount INTEGER NOT NULL,
    
    -- Attribution fields
    source_type VARCHAR(50) NOT NULL,     -- check_in, bounty, capture, voyage, raid, prediction
    source_id UUID,                        -- ID of the specific bounty/event/etc
    
    tenant_id UUID REFERENCES tenants(id), -- Primary tenant credited
    location_id UUID REFERENCES locations(id),
    
    -- For multi-tenant activities (voyages, collaborations)
    attribution_split JSONB,               -- {"tenant_a": 0.5, "tenant_b": 0.5}
    
    -- Context
    description TEXT,
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Aggregated attribution stats (materialized for performance)
CREATE TABLE tenant_attribution_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    period_type VARCHAR(20) NOT NULL,      -- daily, weekly, monthly
    period_start DATE NOT NULL,
    
    -- XP generated by source
    xp_from_checkins INTEGER DEFAULT 0,
    xp_from_bounties INTEGER DEFAULT 0,
    xp_from_captures INTEGER DEFAULT 0,
    xp_from_events INTEGER DEFAULT 0,
    xp_from_voyages INTEGER DEFAULT 0,
    xp_from_predictions INTEGER DEFAULT 0,
    xp_total INTEGER DEFAULT 0,
    
    -- Activity counts
    checkin_count INTEGER DEFAULT 0,
    bounty_completions INTEGER DEFAULT 0,
    capture_count INTEGER DEFAULT 0,
    event_participations INTEGER DEFAULT 0,
    
    -- Unique customers
    unique_customers INTEGER DEFAULT 0,
    new_customers INTEGER DEFAULT 0,
    returning_customers INTEGER DEFAULT 0,
    
    calculated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(tenant_id, period_type, period_start)
);

-- Index for fast lookups
CREATE INDEX idx_xp_transactions_tenant ON xp_transactions(tenant_id, created_at DESC);
CREATE INDEX idx_xp_transactions_source ON xp_transactions(source_type, source_id);
CREATE INDEX idx_attribution_stats_tenant ON tenant_attribution_stats(tenant_id, period_type, period_start DESC);
```

### Tenant Analytics Dashboard

```
┌─────────────────────────────────────────────────────────────────┐
│  ANALYTICS: XP GENERATION                     This Month        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  TOTAL CUSTOMER XP GENERATED: 12,450 XP                         │
│  ═══════════════════════════════════════                        │
│                                                                 │
│  BY SOURCE                          BY TOP ACTIVITIES           │
│  ┌─────────────────────────┐        ┌─────────────────────────┐ │
│  │ Bounties      ████████░ 45%  │   │ "Summer Special"  3,200 │ │
│  │ Check-ins     █████░░░░ 28%  │   │ "Happy Hour"      2,100 │ │
│  │ Captures      ███░░░░░░ 15%  │   │ Basic check-ins   1,800 │ │
│  │ Events        ██░░░░░░░ 10%  │   │ "Trivia Night"    1,500 │ │
│  │ Voyages       █░░░░░░░░  2%  │   │ Shark captures      850 │ │
│  └─────────────────────────┘        └─────────────────────────┘ │
│                                                                 │
│  ENGAGEMENT FUNNEL                                              │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  Unique Visitors    │████████████████████████│  1,250       ││
│  │  Check-ins          │██████████████████░░░░░░│    890 (71%) ││
│  │  Bounty Attempts    │████████████░░░░░░░░░░░░│    520 (58%) ││
│  │  Bounty Completions │██████████░░░░░░░░░░░░░░│    445 (86%) ││
│  │  Return Visits      │████████░░░░░░░░░░░░░░░░│    356 (40%) ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│  YOUR CREATOR POINTS EARNED FROM THIS: +623 CP                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## CP Earning Activities

### Content Creation (Action-Based)

| Activity | CP Earned | Notes |
|----------|-----------|-------|
| Create first bounty | 100 CP | One-time bonus |
| Create bounty | 25 CP | Per bounty |
| Create event | 50 CP | Per event |
| Create voyage waypoint | 25 CP | Contributing to network |
| Organize collaboration | 100 CP | Multi-tenant campaigns |
| Set up capture bonuses | 25 CP | Engaging with gamification |
| Complete profile | 50 CP | Hours, photos, description |
| Connect POS integration | 200 CP | One-time |
| Enable new feature | 25 CP | Per feature adoption |

### Customer XP Generation (Attribution-Based)

Tenants earn CP based on customer XP they generate:

| Customer XP Generated | CP Earned | Notes |
|----------------------|-----------|-------|
| Every 100 customer XP | 1 CP | Base rate |
| Bounty with >50% completion | +50 CP bonus | Quality bonus |
| Event with >30% attendance | +25 CP bonus | Quality bonus |

**Example:**
- Summer Bounty generates 3,200 customer XP → 32 CP base
- Bounty had 65% completion rate → +50 CP bonus
- **Total: 82 CP from one bounty**

### Engagement Quality (Rate-Based)

| Metric | Threshold | CP Earned |
|--------|-----------|----------|
| Bounty completion rate | >50% | 50 CP/bounty/month |
| Event attendance rate | >30% | 25 CP/event |
| Customer return rate | >40% within 30 days | 100 CP/month |
| Capture engagement | >60% of check-ins | 25 CP/month |
| Referral program active | Any referrals | 10 CP per referral |

### Personal Best Bonuses

| Achievement | CP Bonus |
|-------------|----------|
| Best month for check-ins (vs own average) | 200 CP |
| Best bounty completion rate ever | 100 CP |
| Best customer return rate ever | 150 CP |
| Most events hosted in a month | 100 CP |
| Most customer XP generated in a month | 250 CP |

### Milestone Bonuses

| Milestone | CP Bonus |
|-----------|----------|
| First 100 customer check-ins | 250 CP |
| First 1,000 customer check-ins | 500 CP |
| First 10,000 customer check-ins | 1,000 CP |
| Generate 10,000 total customer XP | 500 CP |
| Generate 100,000 total customer XP | 2,000 CP |
| 1 year on platform | 500 CP |
| 2 years on platform | 1,000 CP |
| First collaboration completed | 200 CP |
| 10 bounties created | 200 CP |
| 50 bounties created | 500 CP |

---

## PrintHabit Product Catalog

### Available Reward Items

| Category | Products | Customization |
|----------|----------|---------------|
| **Apparel** | T-shirts, hoodies, hats | Logo, colors, sizing |
| **Metal Cards** | Stainless steel, black aluminum | Laser etching, NFC optional |
| **Stickers** | Die-cut, vinyl, holographic | Any shape, weatherproof |
| **Coasters** | Cork, leather, metal | Logo, patterns |
| **Keychains** | Metal, acrylic, leather | Engraving, colors |
| **Drinkware** | Mugs, tumblers, bottles | Wrap printing |
| **Signage** | Metal signs, acrylic displays | Custom artwork |

### Reward Tiers

| Tier | CP Cost | Example Rewards |
|------|---------|-----------------|
| Bronze | 500-1,000 CP | 50 stickers, 25 coasters |
| Silver | 1,000-2,500 CP | 100 stickers, 10 keychains, 50 coasters |
| Gold | 2,500-5,000 CP | 10-pack t-shirts, 25 metal cards, 100 coasters |
| Platinum | 5,000-10,000 CP | 25-pack t-shirts, custom signage, premium bundle |
| Diamond | 10,000+ CP | Full merch kit, exclusive items, bulk orders |

---

## Fairness Mechanisms

### The Problem

A Starbucks with 1,000 daily customers would crush a local coffee shop with 50. Raw volume metrics are unfair.

### The Solution: Tiered Cohorts

Tenants compete within their size tier:

| Tier | Monthly Check-ins | Compete Against |
|------|-------------------|-----------------|
| Seedling | 0-500 | Other seedlings |
| Sprout | 501-2,000 | Other sprouts |
| Growth | 2,001-10,000 | Other growth |
| Established | 10,001-50,000 | Other established |
| Enterprise | 50,001+ | Other enterprise |

### Rate-Based Leaderboards

Leaderboards show **percentages**, not absolutes:

- "Highest customer return rate" (not "most returning customers")
- "Best bounty completion rate" (not "most bounties completed")  
- "Highest XP per check-in" (not "most XP generated")

### Improvement Bonuses

Bonus CP for beating your own records encourages continuous improvement regardless of size.

---

## Database Schema

```sql
-- Tenant Creator Points tracking
CREATE TABLE tenant_creator_points (
    tenant_id UUID PRIMARY KEY REFERENCES tenants(id),
    total_cp INTEGER NOT NULL DEFAULT 0,
    lifetime_cp INTEGER NOT NULL DEFAULT 0,
    current_rank VARCHAR(50) DEFAULT 'shopkeep',
    rank_updated_at TIMESTAMPTZ,
    size_tier VARCHAR(50) DEFAULT 'seedling',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tenant CP transaction log
CREATE TABLE tenant_cp_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    amount INTEGER NOT NULL,
    source_type VARCHAR(100) NOT NULL,
    source_id UUID,
    description TEXT,
    
    -- For XP-generation rewards, link to attribution
    customer_xp_generated INTEGER,
    attribution_period_start DATE,
    attribution_period_end DATE,
    
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tenant personal bests (for improvement bonuses)
CREATE TABLE tenant_personal_bests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    metric_type VARCHAR(100) NOT NULL,
    best_value DECIMAL(10,4) NOT NULL,
    achieved_at TIMESTAMPTZ NOT NULL,
    period_start DATE,
    period_end DATE,
    cp_awarded INTEGER,
    UNIQUE(tenant_id, metric_type)
);

-- Tenant rank history
CREATE TABLE tenant_rank_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    old_rank VARCHAR(50),
    new_rank VARCHAR(50) NOT NULL,
    cp_at_change INTEGER NOT NULL,
    changed_at TIMESTAMPTZ DEFAULT NOW()
);

-- PrintHabit reward catalog
CREATE TABLE printhabit_rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    cp_cost INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    customization_options JSONB DEFAULT '{}',
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    rank_required VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tenant reward redemptions
CREATE TABLE tenant_reward_redemptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    reward_id UUID NOT NULL REFERENCES printhabit_rewards(id),
    cp_spent INTEGER NOT NULL,
    customization_data JSONB NOT NULL,
    shipping_address JSONB NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    printhabit_order_id VARCHAR(100),
    tracking_number VARCHAR(100),
    shipped_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tenant milestones achieved
CREATE TABLE tenant_milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    milestone_type VARCHAR(100) NOT NULL,
    achieved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    cp_awarded INTEGER NOT NULL,
    metadata JSONB DEFAULT '{}',
    UNIQUE(tenant_id, milestone_type)
);

-- Indexes
CREATE INDEX idx_tenant_cp_total ON tenant_creator_points(total_cp DESC);
CREATE INDEX idx_tenant_cp_rank ON tenant_creator_points(current_rank);
CREATE INDEX idx_tenant_cp_transactions_tenant ON tenant_cp_transactions(tenant_id, created_at DESC);
CREATE INDEX idx_redemptions_tenant ON tenant_reward_redemptions(tenant_id, created_at DESC);
CREATE INDEX idx_redemptions_status ON tenant_reward_redemptions(status);
```

---

## Integration with Rules Engine

The attribution tracking feeds directly into the existing rules engine analytics:

```
┌─────────────────────────────────────────────────────────────────┐
│                    RULES ENGINE INTEGRATION                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  RULE EXECUTION                 ATTRIBUTION                     │
│  ┌─────────────────────┐       ┌─────────────────────┐         │
│  │ Bounty: "Summer"    │───────│ Track customer XP   │         │
│  │ Condition: $10 spent│       │ Credit to tenant    │         │
│  │ Reward: 50 XP       │       │ Award tenant CP     │         │
│  └─────────────────────┘       └─────────────────────┘         │
│            │                             │                      │
│            ▼                             ▼                      │
│  ┌─────────────────────┐       ┌─────────────────────┐         │
│  │ ANALYTICS ROLLUP    │       │ TENANT ANALYTICS    │         │
│  │ • Revenue by rule   │       │ • XP generated      │         │
│  │ • Participation     │       │ • CP earned         │         │
│  │ • Completion rate   │       │ • ROI per activity  │         │
│  └─────────────────────┘       └─────────────────────┘         │
│                                                                 │
│  This data already exists in rules engine—we're adding         │
│  the attribution layer to credit tenants and award CP.          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Tenant Dashboard: Rewards Tab

```
┌─────────────────────────────────────────────────────────────────┐
│  TENANT DASHBOARD                                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  [Overview] [Bounties] [Events] [Analytics] [🏆 Rewards]        │
│                                                                 │
│  ═══════════════════════════════════════════════════════════    │
│                                                                 │
│  YOUR STATUS                                                    │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  💰 MOGUL                           4,250 CP Available   │    │
│  │  ████████████████████░░░░ 61% to Tycoon (7,000 CP)      │    │
│  │                                                          │    │
│  │  Lifetime: 12,750 CP earned | Size: Growth tier          │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  THIS MONTH'S EARNINGS                    +823 CP              │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  +320 CP  Customer XP generation (32,000 XP × 1%)       │    │
│  │  +150 CP  "Summer Special" completion bonus (65%)        │    │
│  │  +100 CP  Personal best: return rate (42%)               │    │
│  │  +75 CP   Created 3 bounties                             │    │
│  │  +50 CP   "Trivia Night" attendance bonus                │    │
│  │  +128 CP  Other activities                               │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  [Browse Rewards Catalog] [View CP History] [See Analytics]     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## API Endpoints

### Get Tenant CP Status

```
GET /api/v1/tenants/me/creator-points
```

Response:
```json
{
  "creator_points": {
    "current": 4250,
    "lifetime": 12750,
    "rank": "mogul",
    "next_rank": "tycoon",
    "cp_to_next_rank": 2750,
    "progress_percent": 61
  },
  "size_tier": "growth",
  "recent_earnings": [
    {
      "amount": 320,
      "source": "customer_xp_generation",
      "description": "Generated 32,000 customer XP this month",
      "earned_at": "2026-01-30T..."
    }
  ],
  "available_rewards": 12,
  "pending_orders": 1
}
```

### Get Attribution Analytics

```
GET /api/v1/tenants/me/analytics/attribution?period=month
```

Response:
```json
{
  "period": "2026-01",
  "customer_xp_generated": {
    "total": 32000,
    "by_source": {
      "bounties": 14400,
      "check_ins": 8960,
      "captures": 4800,
      "events": 3200,
      "voyages": 640
    }
  },
  "top_activities": [
    {
      "type": "bounty",
      "name": "Summer Special",
      "xp_generated": 5200,
      "completions": 104,
      "completion_rate": 0.65
    }
  ],
  "cp_earned_from_attribution": 320,
  "funnel": {
    "unique_visitors": 1250,
    "check_ins": 890,
    "bounty_attempts": 520,
    "bounty_completions": 445,
    "return_visits": 356
  }
}
```

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Tenant redemption rate | >30% of tenants redeem within 6 months |
| Merch-as-prize usage | >50% of redeemed items used as customer prizes |
| Tenant retention | +20% for tenants who've redeemed vs those who haven't |
| Feature adoption | +40% increase in bounty/event creation |
| Customer engagement | +15% check-ins at tenants using merch prizes |
| Attribution visibility | 100% of customer XP traced to source |

---

## Implementation Phases

### Phase 1: Foundation (3-4 weeks)
- Creator Points system (earning, tracking)
- Tenant ranks (8 levels)
- Basic catalog (3-5 items)
- Manual fulfillment via PrintHabit

### Phase 2: Attribution (2-3 weeks)
- Attribution tracking on all XP transactions
- Attribution analytics dashboard
- CP rewards from XP generation

### Phase 3: Automation (2-3 weeks)
- PrintHabit API integration
- Order tracking
- Customization flow

### Phase 4: Gamification (2-3 weeks)
- Leaderboards (within tiers)
- Personal best tracking
- Milestone achievements

### Phase 5: Expansion (Ongoing)
- Expanded catalog
- Seasonal/limited items
- Tenant referral bonuses

---

## Related Documentation

- [gamification-v2-overview.md](gamification-v2-overview.md) - Customer gamification
- [gamification-currency.md](gamification-currency.md) - Customer XP system
- [gamification-bounties.md](gamification-bounties.md) - Tenant bounty creation
- [gamification-events-raids.md](gamification-events-raids.md) - Tenant events
- [gamification-data-model.md](gamification-data-model.md) - Full schema
- [physical-rewards.md](physical-rewards.md) - Customer physical rewards
- [../RULES_ENGINE.md](../RULES_ENGINE.md) - Rules engine integration

---

*Last updated: January 30, 2026*
