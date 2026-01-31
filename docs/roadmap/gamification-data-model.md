# Gamification: Data Model

> **Status:** 🔷 Specified  
> **Parent Spec:** [gamification-v2-overview.md](gamification-v2-overview.md)  
> **Last Updated:** January 30, 2026

---

## Overview

Complete database schema for the gamification system, organized by feature area.

---

## Schema Overview

| Area | Tables |
|------|--------|
| Currency | user_xp, user_tenant_points, xp_transactions, point_transactions |
| Collectibles | collectibles, user_collections, capture_history, location_spawn_settings |
| Crews | crews, crew_members, crew_challenges, crew_messages |
| Events | events, event_checkins, raids, raid_participants, festivals |
| Predictions | prediction_events, user_predictions, prediction_pools |
| Bounties | bounties, bounty_completions, bounty_progress |
| Collaboration | tenant_collaborations, collaboration_members, collaboration_voyages |

---

## Core Tables

### Currency

```sql
CREATE TABLE user_xp (
    user_id UUID PRIMARY KEY REFERENCES users(id),
    total_xp INTEGER NOT NULL DEFAULT 0,
    current_rank VARCHAR(50) DEFAULT 'deckhand',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_tenant_points (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    balance INTEGER DEFAULT 0,
    lifetime_earned INTEGER DEFAULT 0,
    UNIQUE(user_id, tenant_id)
);
```

### Collectibles

```sql
CREATE TABLE collectibles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    rarity VARCHAR(50) NOT NULL,
    xp_on_capture INTEGER DEFAULT 5,
    is_active BOOLEAN DEFAULT true
);

CREATE TABLE user_collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    collectible_id UUID NOT NULL REFERENCES collectibles(id),
    count INTEGER DEFAULT 1,
    first_captured_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, collectible_id)
);
```

### Crews

```sql
CREATE TABLE crews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    tag VARCHAR(10) NOT NULL UNIQUE,
    captain_id UUID NOT NULL REFERENCES users(id),
    member_count INTEGER DEFAULT 1,
    total_xp BIGINT DEFAULT 0
);

CREATE TABLE crew_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    crew_id UUID NOT NULL REFERENCES crews(id),
    user_id UUID NOT NULL REFERENCES users(id),
    role VARCHAR(50) DEFAULT 'member',
    UNIQUE(user_id)
);
```

---

## Migration Phases

| Phase | Tables |
|-------|--------|
| 1: Foundation | user_xp, user_tenant_points, collectibles, user_collections, bounties |
| 2: Social | crews, crew_members, crew_messages, crew_challenges |
| 3: Network | tenant_collaborations, collaboration_voyages, user_voyage_progress |
| 4: Events | events, raids, raid_participants, prediction_events, user_predictions |

---

## Key Indexes

```sql
CREATE INDEX idx_user_xp_total ON user_xp(total_xp DESC);
CREATE INDEX idx_crews_total_xp ON crews(total_xp DESC);
CREATE INDEX idx_user_collections_user ON user_collections(user_id);
CREATE INDEX idx_bounty_completions_user ON bounty_completions(user_id);
CREATE INDEX idx_events_status ON events(status, starts_at);
```

---

## Related Documentation

- [gamification-v2-overview.md](gamification-v2-overview.md) - Master spec
- [gamification-mvp.md](gamification-mvp.md) - Implementation phases
- [../DATABASE_SCHEMA.md](../DATABASE_SCHEMA.md) - Core schema

---

*Last updated: January 30, 2026*
