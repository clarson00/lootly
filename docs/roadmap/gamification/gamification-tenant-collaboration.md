# Gamification: Tenant Dashboard & Collaboration

> **Status:** 🔷 Specified
> **Parent Spec:** [gamification-v2-overview.md](gamification-v2-overview.md)
> **Last Updated:** January 2025

## Dependencies

- **Requires:** Multi-Tenant Support, Bounties, Analytics
- **Enables:** Cross-tenant campaigns, joint voyages

## Roadmap Position

- **Tier:** 4 | **Phase:** v2.0 | **Category:** Tenant

---

## Overview

This document covers:
1. **Tenant Dashboard** - Tools for managing gamification features
2. **Collaboration** - Framework for multi-tenant joint campaigns

---

# Part 1: Tenant Dashboard

## Dashboard Sections

| Section | Features |
|---------|----------|
| Overview | Stats, active bounties, upcoming events |
| Bounties | Create, manage, analyze challenges |
| Events | Watch parties, raids, flash events |
| Captures | Spawn settings, capture bonuses |
| Collaborations | Joint campaigns with other tenants |

## Capture Settings

### Spawn Tiers

| Tier | Cost | Benefits |
|------|------|----------|
| Standard | Free | Base spawn rates |
| Enhanced | $25/mo | Better rare odds |
| Exclusive | $50/mo | Custom creature, best rates |

### Capture Bonuses

Link rewards to captures:
- "Any rare capture = 50 bonus points"
- "Shark capture = free appetizer"

---

# Part 2: Collaboration Framework

## Collaboration Types

| Type | Description |
|------|-------------|
| Voyage | Multi-location quest |
| Festival | Multi-day event |
| Alliance | Ongoing partnership |
| Campaign | Time-limited promotion |

## Creating Collaborations

1. Set name and type
2. Invite participating tenants
3. Define rewards and funding split
4. Set duration
5. Launch when all accept

## Reward Funding Options

| Option | Description |
|--------|-------------|
| Organizer pays | Single tenant funds all |
| Split equally | Divide cost among participants |
| Individual | Each contributes own reward |

---

## Database Schema

```sql
CREATE TABLE tenant_collaborations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    collaboration_type VARCHAR(50) NOT NULL,
    organizer_tenant_id UUID NOT NULL REFERENCES tenants(id),
    status VARCHAR(50) DEFAULT 'draft',
    starts_at TIMESTAMPTZ,
    ends_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE collaboration_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    collaboration_id UUID NOT NULL REFERENCES tenant_collaborations(id),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    role VARCHAR(50) DEFAULT 'participant',
    status VARCHAR(50) DEFAULT 'pending',
    contribution_settings JSONB,
    UNIQUE(collaboration_id, tenant_id)
);

CREATE TABLE collaboration_voyages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    collaboration_id UUID NOT NULL REFERENCES tenant_collaborations(id),
    name VARCHAR(200) NOT NULL,
    completion_reward JSONB NOT NULL,
    reward_funding VARCHAR(50) NOT NULL
);

CREATE TABLE user_voyage_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    voyage_id UUID NOT NULL REFERENCES collaboration_voyages(id),
    waypoints_completed JSONB DEFAULT '[]',
    completed_at TIMESTAMPTZ,
    UNIQUE(user_id, voyage_id)
);
```

---

## Related Documentation

- [gamification-v2-overview.md](gamification-v2-overview.md) - Master spec
- [gamification-bounties.md](gamification-bounties.md) - Bounty details
- [gamification-events-raids.md](gamification-events-raids.md) - Event details

---

*Last updated: January 30, 2026*
