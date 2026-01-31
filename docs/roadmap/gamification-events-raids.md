# Gamification: Events & Raids

> **Status:** 🔷 Specified  
> **Parent Spec:** [gamification-v2-overview.md](gamification-v2-overview.md)  
> **Last Updated:** January 30, 2026

---

## Overview

Events and Raids are time-limited, location-based activities that drive foot traffic and create memorable experiences.

---

## Event Types

| Type | Description | Duration |
|------|-------------|----------|
| Watch Party | Sports, shows watched together | 2-4 hours |
| Raid | Boss battle, collective challenge | 30 min - 2 hours |
| Festival | Multi-day, multi-location | 1-7 days |
| Flash Event | Surprise short events | 1-4 hours |
| Grand Opening | New location launch | 1 day - 1 week |

---

## Raid Mechanics

A "boss" appears at a location. Participants deal "damage" through activities:

| Activity | Damage |
|----------|--------|
| Check-in | 100 |
| $10 spent | 50 |
| Capture creature | 25 |
| Invite friend | 200 |
| Complete bounty | 150 |

### Boss Tiers

| Boss | HP | Duration | Base XP |
|------|-----|----------|----------|
| Mini-Boss | 5,000 | 1 hour | 50 |
| Boss | 25,000 | 2 hours | 100 |
| Mega-Boss | 100,000 | 4 hours | 250 |
| World Boss | 1,000,000 | 24 hours | 500 |

---

## Watch Parties

Features:
- RSVP tracking
- Check-in bonus (extra XP/points)
- Integrated predictions
- Crew competition

---

## Festivals

Multi-location events spanning single tenant or collaboration:
- Visit participating locations
- Earn festival points
- Unlock tiered rewards

---

## Database Schema

```sql
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    location_id UUID REFERENCES locations(id),
    event_type VARCHAR(50) NOT NULL,
    name VARCHAR(200) NOT NULL,
    starts_at TIMESTAMPTZ NOT NULL,
    ends_at TIMESTAMPTZ NOT NULL,
    capacity INTEGER,
    points_multiplier DECIMAL(3,1) DEFAULT 1.0,
    bonus_xp INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'scheduled',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE raids (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id),
    boss_name VARCHAR(100) NOT NULL,
    boss_hp INTEGER NOT NULL,
    current_damage INTEGER DEFAULT 0,
    base_xp_reward INTEGER NOT NULL,
    is_defeated BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE raid_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    raid_id UUID NOT NULL REFERENCES raids(id),
    user_id UUID NOT NULL REFERENCES users(id),
    damage_dealt INTEGER DEFAULT 0,
    rank INTEGER,
    UNIQUE(raid_id, user_id)
);
```

---

## Related Documentation

- [gamification-v2-overview.md](gamification-v2-overview.md) - Master spec
- [gamification-predictions.md](gamification-predictions.md) - Watch party predictions
- [gamification-tenant-collaboration.md](gamification-tenant-collaboration.md) - Multi-tenant festivals

---

*Last updated: January 30, 2026*
