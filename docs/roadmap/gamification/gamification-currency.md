# Gamification: Currency Model

> **Status:** 🔷 Specified
> **Parent Spec:** [gamification-v2-overview.md](gamification-v2-overview.md)
> **Last Updated:** January 2025

## Dependencies

- **Requires:** Tier 0 (Check-ins, Rules Engine), Tier 1 (Multi-Tenant)
- **Enables:** Ranks, Collectibles, Bounties, Leaderboards, all gamification features

## Roadmap Position

- **Tier:** 4 | **Phase:** v2.0 | **Category:** Platform

---

## Overview

RewardsPirate uses a **dual-currency system**:

1. **XP (Experience Points)** - Platform-wide progression currency
2. **Tenant Points** - Per-tenant reward currency with real value

This separation allows platform engagement (XP) to be independent from tenant economics (Points).

---

## XP (Experience Points)

### Purpose
- Drive platform-wide engagement
- Power the rank/progression system
- Enable cross-tenant competition (leaderboards)
- No cash value (not redeemable)

### XP Earn Rates

| Activity | XP Earned | Notes |
|----------|-----------|-------|
| Check-in | 10 XP | Base rate per visit |
| First visit to location | 25 XP | Bonus for discovery |
| Purchase (any amount) | 5 XP | Encourages transactions |
| Capture: Common | 5 XP | |
| Capture: Uncommon | 10 XP | |
| Capture: Rare | 25 XP | |
| Capture: Epic | 40 XP | |
| Capture: Legendary | 50 XP | |
| Complete bounty | 10-100 XP | Varies by difficulty |
| Complete voyage waypoint | 15 XP | Per location |
| Complete voyage | 50-200 XP | Bonus for completion |
| Event attendance | 25 XP | Check-in at event |
| Raid participation | 50-250 XP | Based on contribution |
| Prediction correct | 10-50 XP | Based on difficulty |
| Streak bonus (5+) | 1.5x | Multiplier on predictions |
| Streak bonus (10+) | 2x | |
| Referral | 100 XP | When friend joins |

### Rank Progression

| Rank | XP Required | Total XP | Unlocks |
|------|-------------|----------|----------|
| Deckhand | 0 | 0 | Basic features |
| Sailor | 500 | 500 | Join crews, basic bounties |
| Boatswain | 1,000 | 1,500 | Create crews, more bounties |
| First Mate | 2,500 | 4,000 | Crew officer roles |
| Captain | 2,000 | 6,000 | Full crew management |
| Commodore | 9,000 | 15,000 | Regional leaderboards |
| Admiral | 25,000 | 40,000 | Hall of Fame eligibility |
| Legend | 60,000 | 100,000 | Exclusive rewards, legacy status |

---

## Tenant Points

### Purpose
- Reward customer loyalty at specific tenants
- Redeemable for real rewards
- Funded by tenants
- Creates direct business value

### Point Value

**Standard: 1 point = $0.01**

Rationale:
- Easy mental math (100 points = $1)
- Industry standard (Starbucks, airlines)
- Allows whole number displays
- Flexible earn/burn ratios

### Recommended Earn Rates by Industry

| Industry | Recommended Rate | Example |
|----------|-----------------|----------|
| Coffee/Cafe | 10 pts/$1 | $5 coffee = 50 pts |
| Fast Casual | 10 pts/$1 | $12 meal = 120 pts |
| Fine Dining | 5 pts/$1 | $100 dinner = 500 pts |
| Retail | 5-10 pts/$1 | Varies by margin |
| Services | 10-15 pts/$1 | Higher margin |

### Recommended Reward Pricing

| Reward Type | Point Cost | Cash Value |
|-------------|------------|------------|
| Small item (cookie, drink) | 200-500 pts | $2-5 |
| Medium item (entree, shirt) | 1,000-2,000 pts | $10-20 |
| Large reward (gift card) | 2,500-5,000 pts | $25-50 |
| Premium reward | 10,000+ pts | $100+ |

---

## Database Schema

```sql
-- User XP tracking
CREATE TABLE user_xp (
    user_id UUID PRIMARY KEY REFERENCES users(id),
    total_xp INTEGER NOT NULL DEFAULT 0,
    current_rank VARCHAR(50) NOT NULL DEFAULT 'deckhand',
    rank_updated_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tenant point balances
CREATE TABLE user_tenant_points (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    balance INTEGER NOT NULL DEFAULT 0,
    lifetime_earned INTEGER NOT NULL DEFAULT 0,
    lifetime_spent INTEGER NOT NULL DEFAULT 0,
    last_earned_at TIMESTAMPTZ,
    last_spent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, tenant_id)
);

-- XP transaction log
CREATE TABLE xp_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    amount INTEGER NOT NULL,
    source_type VARCHAR(50) NOT NULL,
    source_id UUID,
    description TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Point transaction log
CREATE TABLE point_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    amount INTEGER NOT NULL,
    type VARCHAR(50) NOT NULL,
    source_type VARCHAR(50),
    source_id UUID,
    description TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tenant currency settings
CREATE TABLE tenant_currency_settings (
    tenant_id UUID PRIMARY KEY REFERENCES tenants(id),
    currency_name VARCHAR(100) NOT NULL DEFAULT 'Points',
    currency_emoji VARCHAR(10) DEFAULT '🪙',
    base_earn_rate INTEGER NOT NULL DEFAULT 10,
    expiration_days INTEGER,
    expiration_warning_days INTEGER DEFAULT 30,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## API Endpoints

### Get User Currencies

```
GET /api/v1/users/me/currencies
```

Response:
```json
{
  "xp": {
    "total": 4250,
    "rank": "first_mate",
    "next_rank": "captain",
    "xp_to_next_rank": 1750,
    "progress_percent": 12.5
  },
  "tenant_points": [
    {
      "tenant_id": "uuid",
      "tenant_name": "Joe's Coffee",
      "balance": 750,
      "currency_name": "Doubloons",
      "currency_emoji": "🪙",
      "cash_value": 7.50
    }
  ]
}
```

### Earn XP

```
POST /api/v1/users/me/xp
```

Body:
```json
{
  "amount": 25,
  "source_type": "capture",
  "source_id": "uuid",
  "description": "Captured Rare Shark"
}
```

### Earn Points

```
POST /api/v1/users/me/points
```

Body:
```json
{
  "tenant_id": "uuid",
  "amount": 50,
  "source_type": "purchase",
  "source_id": "uuid"
}
```

---

## Migration Notes

### From "Doubloons" Concept

The original GAMIFICATION.md spec used "doubloons" as a single currency. This is being split:

- **XP** replaces doubloons for progression
- **Tenant Points** handle rewards (can still be themed as "doubloons" in UI)

### Display Theming

While the backend uses "xp" and "points", the UI can theme these:

| Backend | Pirate Theme Display |
|---------|---------------------|
| XP | "Experience" or "XP" |
| Points | "Doubloons" (per tenant choice) |

---

## Related Documentation

- [gamification-v2-overview.md](gamification-v2-overview.md) - Master spec
- [gamification-collectibles.md](gamification-collectibles.md) - XP from captures
- [gamification-bounties.md](gamification-bounties.md) - Point rewards
- [gamification-data-model.md](gamification-data-model.md) - Full schema

---

*Last updated: January 30, 2026*
