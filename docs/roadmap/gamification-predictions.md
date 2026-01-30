# Gamification: Predictions (Oracle's Challenge)

> **Status:** 🔷 Specified  
> **Parent Spec:** [gamification-v2-overview.md](gamification-v2-overview.md)  
> **Last Updated:** January 30, 2026

---

## Overview

Oracle's Challenge is a **free-to-play prediction game** where players predict outcomes of real-world events. Players stake XP (not real money), build streaks, and compete on leaderboards. Tenants can sponsor prediction pools with real rewards.

**Key Principle:** This is NOT gambling. No real money is staked.

---

## Prediction Types

### Platform Predictions
- Sports outcomes
- Entertainment (awards, shows)
- Current events

### Tenant Predictions (Sponsored)
- Local sports
- Store events
- Community happenings

---

## Streak System

| Streak Length | Bonus Multiplier |
|---------------|------------------|
| 1-4 correct | 1x |
| 5-9 correct | 1.5x |
| 10-19 correct | 2x |
| 20-49 correct | 3x |
| 50+ correct | 5x |

---

## XP Rewards

| Difficulty | Base XP |
|------------|--------|
| Easy (70%+) | 10 XP |
| Medium (50-70%) | 25 XP |
| Hard (30-50%) | 40 XP |
| Upset (<30%) | 50 XP |

---

## Sponsored Pools

Tenants create prediction pools with real prizes:
1. Select event
2. Set prize pool (rewards from catalog)
3. Set entry period
4. Winners get tenant rewards

---

## Legal Compliance

**NOT Gambling Because:**
- No monetary stake
- XP has no cash value
- Prizes are promotional (tenant marketing)
- Skill-based elements
- Free to play

---

## Database Schema

```sql
CREATE TABLE prediction_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    category VARCHAR(100) NOT NULL,
    options JSONB NOT NULL,
    correct_option_id VARCHAR(50),
    entries_close_at TIMESTAMPTZ NOT NULL,
    status VARCHAR(50) DEFAULT 'upcoming',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    event_id UUID NOT NULL REFERENCES prediction_events(id),
    selected_option_id VARCHAR(50) NOT NULL,
    is_correct BOOLEAN,
    xp_earned INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, event_id)
);

CREATE TABLE user_prediction_streaks (
    user_id UUID PRIMARY KEY REFERENCES users(id),
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    total_correct INTEGER DEFAULT 0
);

CREATE TABLE prediction_pools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES prediction_events(id),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    prizes JSONB NOT NULL,
    require_checkin BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Related Documentation

- [gamification-v2-overview.md](gamification-v2-overview.md) - Master spec
- [gamification-events-raids.md](gamification-events-raids.md) - Watch party events
- [gamification-currency.md](gamification-currency.md) - XP system

---

*Last updated: January 30, 2026*
