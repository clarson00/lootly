# Tenant Rewards Program (PrintHabit Integration)

> **Status:** 🔷 Specified  
> **Priority:** High  
> **Target:** v2.1 (post-gamification foundation)  
> **Last Updated:** January 30, 2026

---

## Executive Summary

A gamification layer for **tenants** (not just customers) where businesses earn XP for platform engagement and redeem rewards through PrintHabit—RewardsPirate's sister company that produces custom merchandise. This creates a powerful flywheel: tenants earn merchandise, give it to customers as prizes, customers engage more, tenants earn more XP.

### The Flywheel Effect

```
Tenant creates engagement → Earns Tenant XP → Redeems for PrintHabit merch
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

| Tier | Tenant XP Cost | Example Rewards |
|------|----------------|------------------|
| Bronze | 500-1,000 XP | 50 stickers, 25 coasters |
| Silver | 1,000-2,500 XP | 100 stickers, 10 keychains, 50 coasters |
| Gold | 2,500-5,000 XP | 10-pack t-shirts, 25 metal cards, 100 coasters |
| Platinum | 5,000-10,000 XP | 25-pack t-shirts, custom signage, premium bundle |
| Diamond | 10,000+ XP | Full merch kit, exclusive items, bulk orders |

---

## Tenant XP System

### Design Principles

1. **Reward action, not just size** - Small businesses can compete
2. **Reward quality, not just quantity** - Engagement rates matter
3. **Reward improvement** - "Personal best" bonuses
4. **Reward platform adoption** - Using new features

### XP Earning Activities

#### Content Creation (Action-Based)

| Activity | XP Earned | Notes |
|----------|-----------|-------|
| Create first bounty | 100 XP | One-time bonus |
| Create bounty | 25 XP | Per bounty |
| Create event | 50 XP | Per event |
| Create voyage waypoint | 25 XP | Contributing to network |
| Organize collaboration | 100 XP | Multi-tenant campaigns |
| Set up capture bonuses | 25 XP | Engaging with gamification |
| Complete profile | 50 XP | Hours, photos, description |
| Connect POS integration | 200 XP | One-time |
| Enable new feature | 25 XP | Per feature adoption |

#### Engagement Quality (Rate-Based)

To keep it **fair across business sizes**, these are based on rates/percentages:

| Metric | Calculation | XP Earned |
|--------|-------------|----------|
| Bounty completion rate | >50% of eligible customers complete | 50 XP/bounty/month |
| Event attendance rate | >30% of RSVPs attend | 25 XP/event |
| Customer return rate | >40% of customers return within 30 days | 100 XP/month |
| Capture engagement | >60% of check-ins result in captures | 25 XP/month |
| Referral program active | Any customer referrals | 10 XP per referral |

#### Personal Best Bonuses

Reward improvement over their own baseline:

| Achievement | XP Bonus |
|-------------|----------|
| Best month for check-ins (vs own average) | 200 XP |
| Best bounty completion rate ever | 100 XP |
| Best customer return rate ever | 150 XP |
| Most events hosted in a month | 100 XP |
| Longest streak of daily check-ins | 50 XP/week |

#### Milestone Bonuses

| Milestone | XP Bonus |
|-----------|----------|
| First 100 customer check-ins | 250 XP |
| First 1,000 customer check-ins | 500 XP |
| First 10,000 customer check-ins | 1,000 XP |
| 1 year on platform | 500 XP |
| 2 years on platform | 1,000 XP |
| First collaboration completed | 200 XP |
| 10 bounties created | 200 XP |
| 50 bounties created | 500 XP |

---

## Fairness Mechanisms

### The Problem

A Starbucks with 1,000 daily customers would crush a local coffee shop with 50. Raw volume metrics are unfair.

### The Solution: Tiered Cohorts

Tenants compete within their size tier:

| Tier | Monthly Check-ins | Compete Against |
|------|-------------------|------------------|
| Seedling | 0-500 | Other seedlings |
| Sprout | 501-2,000 | Other sprouts |
| Growth | 2,001-10,000 | Other growth |
| Established | 10,001-50,000 | Other established |
| Enterprise | 50,001+ | Other enterprise |

### Rate-Based Leaderboards

Leaderboards show **percentages**, not absolutes:

- "Highest customer return rate" (not "most returning customers")
- "Best bounty completion rate" (not "most bounties completed")
- "Highest engagement per check-in" (not "most check-ins")

### Improvement Bonuses

Bonus XP for beating your own records encourages continuous improvement regardless of size.

---

## Redemption Flow

### Step 1: Browse Catalog

```
┌─────────────────────────────────────────────────────────────────┐
│  🏆 TENANT REWARDS                         Your XP: 3,250 ⚡    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  FEATURED REWARDS                                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │  👕         │  │  🏷️         │  │  🎫         │              │
│  │  T-SHIRTS   │  │  STICKERS   │  │  METAL      │              │
│  │  10-pack    │  │  100-pack   │  │  CARDS      │              │
│  │             │  │             │  │  25-pack    │              │
│  │  2,500 XP   │  │  500 XP     │  │  3,000 XP   │              │
│  │  [REDEEM]   │  │  [REDEEM]   │  │  [REDEEM]   │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
│                                                                 │
│  🎨 All items fully customizable with your branding!           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Step 2: Customize

```
┌─────────────────────────────────────────────────────────────────┐
│  CUSTOMIZE YOUR T-SHIRTS                                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────┐    DESIGN OPTIONS                      │
│  │                     │                                        │
│  │    [T-SHIRT         │    Logo: [Upload] ✓ joe-coffee.png     │
│  │     PREVIEW]        │                                        │
│  │                     │    Color: ● Black ○ Navy ○ White       │
│  │     ☕ JOE'S        │                                        │
│  │     COFFEE          │    Sizes:                              │
│  │                     │    S[2] M[3] L[3] XL[2]                │
│  │                     │                                        │
│  └─────────────────────┘    Back print: ○ None ● Logo small     │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│  Cost: 2,500 XP          Your Balance: 3,250 XP                 │
│                          Remaining: 750 XP                      │
│                                                                 │
│                    [ CONFIRM ORDER ]                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Step 3: Fulfillment

1. Order submitted to PrintHabit
2. Production (3-5 business days)
3. Shipping to tenant's address
4. Tenant receives and distributes to customers/staff

---

## Suggested Use Cases for Tenants

### Customer Prizes

| Item | Use Case |
|------|----------|
| T-shirts | "Capture a Legendary creature, win a shirt!" |
| Metal cards | "VIP status card for top 10 customers" |
| Stickers | "Free sticker with every 10th visit" |
| Keychains | "Refer a friend, get a keychain" |

### Staff Incentives

| Item | Use Case |
|------|----------|
| T-shirts | Uniforms / team wear |
| Hats | Staff identification |
| Tumblers | Employee appreciation |

### Marketing

| Item | Use Case |
|------|----------|
| Stickers | Hand out to every customer |
| Coasters | Branded table presence |
| Signage | "We're on RewardsPirate!" display |

---

## The Compounding Effect

### Why This Gets Better Over Time

```
Month 1:
- Tenant creates 3 bounties → Earns 75 XP
- 100 customers complete them → Earns 150 XP (rate bonus)
- Total: 225 XP

Month 3:
- Tenant has learned what works
- Creates better bounties → Higher completion rate → More XP
- Redeems for stickers → Gives to customers
- Customers show stickers to friends → More customers
- More customers → More check-ins → More tenant XP
- Total: 800 XP

Month 6:
- Tenant is a power user
- Running events, collaborations, voyages
- Customers competing for t-shirts
- Organic word-of-mouth from branded merch
- Total: 2,500 XP → Redeems for t-shirt pack

Month 12:
- Tenant is platform advocate
- Customers wearing branded shirts
- Featured in case studies
- Diamond tier → Premium merch
- Refers other businesses
```

### Platform Network Effects

When customers wear tenant merch:
- Other people see the brand
- "Where'd you get that shirt?" → "Joe's Coffee, they have this rewards app..."
- New customer signs up → More platform growth
- More tenants → More voyages → More customer engagement

---

## Database Schema

```sql
-- Tenant XP tracking
CREATE TABLE tenant_xp (
    tenant_id UUID PRIMARY KEY REFERENCES tenants(id),
    total_xp INTEGER NOT NULL DEFAULT 0,
    lifetime_xp INTEGER NOT NULL DEFAULT 0,
    current_tier VARCHAR(50) DEFAULT 'seedling',
    tier_updated_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tenant XP transaction log
CREATE TABLE tenant_xp_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    amount INTEGER NOT NULL,
    source_type VARCHAR(100) NOT NULL,
    source_id UUID,
    description TEXT,
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
    UNIQUE(tenant_id, metric_type)
);

-- PrintHabit reward catalog
CREATE TABLE printhabit_rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    xp_cost INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    customization_options JSONB DEFAULT '{}',
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    tier_required VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tenant reward redemptions
CREATE TABLE tenant_reward_redemptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    reward_id UUID NOT NULL REFERENCES printhabit_rewards(id),
    xp_spent INTEGER NOT NULL,
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
    xp_awarded INTEGER NOT NULL,
    metadata JSONB DEFAULT '{}',
    UNIQUE(tenant_id, milestone_type)
);

-- Indexes
CREATE INDEX idx_tenant_xp_total ON tenant_xp(total_xp DESC);
CREATE INDEX idx_tenant_xp_tier ON tenant_xp(current_tier);
CREATE INDEX idx_tenant_xp_transactions_tenant ON tenant_xp_transactions(tenant_id, created_at DESC);
CREATE INDEX idx_redemptions_tenant ON tenant_reward_redemptions(tenant_id, created_at DESC);
CREATE INDEX idx_redemptions_status ON tenant_reward_redemptions(status);
```

---

## API Endpoints

### Get Tenant XP Status

```
GET /api/v1/tenants/me/rewards
```

Response:
```json
{
  "xp": {
    "current": 3250,
    "lifetime": 8750,
    "tier": "growth",
    "next_tier": "established",
    "xp_to_next_tier": 6750
  },
  "recent_earnings": [
    {
      "amount": 50,
      "source": "bounty_completion_rate",
      "description": "Summer Special bounty achieved 65% completion",
      "earned_at": "2026-01-30T..."
    }
  ],
  "available_rewards": 12,
  "pending_orders": 1
}
```

### Get Reward Catalog

```
GET /api/v1/tenants/me/rewards/catalog
```

### Redeem Reward

```
POST /api/v1/tenants/me/rewards/redeem
```

Body:
```json
{
  "reward_id": "uuid",
  "customization": {
    "logo_url": "https://...",
    "color": "black",
    "sizes": { "S": 2, "M": 3, "L": 3, "XL": 2 }
  },
  "shipping_address": {
    "name": "Joe's Coffee",
    "street": "123 Main St",
    "city": "Pittsburgh",
    "state": "PA",
    "zip": "15213"
  }
}
```

---

## PrintHabit Integration

### Order Flow

```
1. Tenant redeems in RewardsPirate dashboard
2. RewardsPirate creates order via PrintHabit API
3. PrintHabit produces item
4. PrintHabit ships with tracking
5. Tracking updated in RewardsPirate
6. Tenant receives merch
```

### Webhook Events

| Event | Action |
|-------|--------|
| `order.confirmed` | Update status to "in_production" |
| `order.shipped` | Update status, add tracking |
| `order.delivered` | Update status, trigger satisfaction survey |

### Cost Structure (Internal)

PrintHabit provides items at cost to RewardsPirate platform:
- Margin absorbed as customer acquisition cost
- Volume discounts apply
- Tracking as platform marketing expense

---

## Tenant Dashboard Additions

### New "Rewards" Tab

```
┌─────────────────────────────────────────────────────────────────┐
│  TENANT DASHBOARD                                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  [Overview] [Bounties] [Events] [Analytics] [🏆 Rewards]        │
│                                                                 │
│  ═══════════════════════════════════════════════════════════    │
│                                                                 │
│  YOUR REWARDS STATUS                                            │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  ⚡ 3,250 XP                    🏅 Growth Tier           │    │
│  │  ████████████████░░░░░░ 48% to Established              │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  THIS MONTH'S EARNINGS                                          │
│  +50 XP   Bounty completion rate bonus                          │
│  +100 XP  Personal best: customer return rate                   │
│  +25 XP   Created new bounty                                    │
│  +200 XP  First collaboration completed                         │
│  ──────                                                         │
│  +375 XP  Total this month                                      │
│                                                                 │
│  [Browse Rewards Catalog] [View XP History]                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
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

---

## Implementation Phases

### Phase 1: Foundation (3-4 weeks)
- Tenant XP system (earning, tracking)
- Basic catalog (3-5 items)
- Manual fulfillment via PrintHabit

### Phase 2: Automation (2-3 weeks)
- PrintHabit API integration
- Order tracking
- Customization flow

### Phase 3: Gamification (2-3 weeks)
- Leaderboards (within tiers)
- Personal best tracking
- Milestone achievements

### Phase 4: Expansion (Ongoing)
- Expanded catalog
- Seasonal/limited items
- Tenant referral bonuses

---

## Related Documentation

- [gamification-v2-overview.md](gamification-v2-overview.md) - Customer gamification
- [gamification-bounties.md](gamification-bounties.md) - Tenant bounty creation
- [gamification-events-raids.md](gamification-events-raids.md) - Tenant events
- [physical-rewards.md](physical-rewards.md) - Customer physical rewards

---

*Last updated: January 30, 2026*
