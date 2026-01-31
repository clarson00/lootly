# Gamification: Collectibles & Captures

> **Status:** 🔷 Specified
> **Parent Spec:** [gamification-v2-overview.md](gamification-v2-overview.md)
> **Last Updated:** January 2025

## Dependencies

- **Requires:** Currency Model (XP), Check-in System, Multi-Tenant
- **Enables:** Collection completions, increased visit frequency, XP earning

## Roadmap Position

- **Tier:** 4 | **Phase:** v2.0 | **Category:** Customer

---

## Overview

Collectibles are Pokemon Go-style creatures and artifacts that spawn when customers check in at locations. Capturing collectibles earns XP and drives collection completion, creating a compelling reason to visit locations repeatedly.

---

## Collectible Types

### Creatures (Pirate Theme)

| Rarity | Examples | Spawn Rate | XP |
|--------|----------|------------|----|
| Common | Fish, Crab, Seagull, Starfish | 60% | 5 |
| Uncommon | Parrot, Dolphin, Sea Turtle, Pelican | 25% | 10 |
| Rare | Shark, Octopus, Whale, Manta Ray | 10% | 25 |
| Epic | Giant Squid, Ghost Ship, Sea Serpent | 4% | 40 |
| Legendary | Kraken, Leviathan, Poseidon's Steed | 1% | 50 |

### Artifacts

| Rarity | Examples | XP |
|--------|----------|----|
| Common | Old Coin, Broken Compass, Rusty Hook | 5 |
| Uncommon | Silver Goblet, Navigation Charts, Spyglass | 10 |
| Rare | Golden Doubloon, Captain's Log, Jeweled Ring | 25 |
| Epic | Treasure Map, Enchanted Compass, Crown | 40 |
| Legendary | Legendary Cutlass, Davy Jones' Key, Poseidon's Trident | 50 |

---

## Spawn Mechanics

### Base Spawn Rate

- **80% chance** of a spawn on check-in
- One collectible per check-in maximum
- Cooldown: 4 hours between spawns at same location

### Rarity Roll

When a spawn occurs:

```
Roll 1-100:
  1-60:  Common (60%)
  61-85: Uncommon (25%)
  86-95: Rare (10%)
  96-99: Epic (4%)
  100:   Legendary (1%)
```

### Spawn Tier Upgrades (Tenant Paid)

| Tier | Monthly Cost | Benefits |
|------|-------------|----------|
| Standard | Free | Base rates |
| Enhanced | $25/mo | +5% rare/epic/legendary odds |
| Exclusive | $50/mo | +10% rare odds, location-exclusive creature |

### Location Exclusives

Exclusive tier tenants can have a creature that ONLY spawns at their location(s):
- Custom name (within theme)
- Appears in collection as "Found at [Location]"
- Drives destination visits

---

## Capture Experience

### Encounter Screen

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                    🌊 CREATURE SPOTTED! 🌊                      │
│                                                                 │
│                         🦈                                      │
│                                                                 │
│                       SHARK                                     │
│                      ⭐⭐⭐ Rare                                │
│                                                                 │
│           "A fearsome predator of the deep..."                 │
│                                                                 │
│                    [ CAPTURE! ]                                 │
│                                                                 │
│               +25 XP on successful capture                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Capture Animation

1. Creature appears with splash effect
2. Player taps "Capture"
3. Net/bottle animation
4. Success celebration (confetti, XP flies up)
5. "Added to Collection" confirmation

### Collection Screen

```
┌─────────────────────────────────────────────────────────────────┐
│  ←                   YER COLLECTION                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  CREATURES   47/72 captured                                     │
│  ████████████████████░░░░░ 65%                                  │
│                                                                 │
│  COMMON (15/15) ✓                                               │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐                       │
│  │ 🐟  │ │ 🦀  │ │ 🐚  │ │ 🦐  │ │ 🐠  │                       │
│  │ x12 │ │ x8  │ │ x6  │ │ x5  │ │ x4  │                       │
│  └─────┘ └─────┘ └─────┘ └─────┘ └─────┘                       │
│                                                                 │
│  RARE (6/10)                                                    │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐                       │
│  │ 🦈  │ │ 🐢  │ │ 🐙  │ │ ??  │ │ ??  │                       │
│  │ x2  │ │ x2  │ │ x1  │ │     │ │     │                       │
│  └─────┘ └─────┘ └─────┘ └─────┘ └─────┘                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Tenant Capture Bonuses

Tenants can offer bonus rewards when customers capture creatures at their location:

| Configuration | Example |
|--------------|----------|
| Any capture | "Capture anything, get 10 bonus points" |
| Specific rarity | "Capture a rare+ creature, get 50 bonus points" |
| Specific creature | "Capture a shark, get free appetizer" |

---

## Database Schema

```sql
CREATE TABLE collectibles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL,
    rarity VARCHAR(50) NOT NULL,
    theme VARCHAR(50) NOT NULL DEFAULT 'pirate',
    xp_on_capture INTEGER NOT NULL DEFAULT 5,
    spawn_weight INTEGER NOT NULL DEFAULT 100,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    is_seasonal BOOLEAN DEFAULT false,
    season_start DATE,
    season_end DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    collectible_id UUID NOT NULL REFERENCES collectibles(id),
    count INTEGER NOT NULL DEFAULT 1,
    first_captured_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    first_captured_location_id UUID REFERENCES locations(id),
    last_captured_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, collectible_id)
);

CREATE TABLE capture_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    collectible_id UUID NOT NULL REFERENCES collectibles(id),
    location_id UUID NOT NULL REFERENCES locations(id),
    checkin_id UUID REFERENCES checkins(id),
    xp_earned INTEGER NOT NULL,
    was_new BOOLEAN NOT NULL DEFAULT false,
    captured_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE location_spawn_settings (
    location_id UUID PRIMARY KEY REFERENCES locations(id),
    spawn_tier VARCHAR(50) NOT NULL DEFAULT 'standard',
    spawn_enabled BOOLEAN DEFAULT true,
    exclusive_collectible_id UUID REFERENCES collectibles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## API Endpoints

### Get User Collection

```
GET /api/v1/users/me/collection
```

### Process Capture

```
POST /api/v1/captures
```

Body:
```json
{
  "checkin_id": "uuid",
  "location_id": "uuid"
}
```

Response:
```json
{
  "spawned": true,
  "collectible": {
    "id": "uuid",
    "name": "Shark",
    "rarity": "rare",
    "xp_earned": 25,
    "was_new": true
  }
}
```

---

## Future Enhancements

- **Trading** between players
- **Evolution** (combine 3 common → 1 uncommon)
- **Shiny variants** (rare alternate appearances)
- **Abilities** (collectibles grant bonuses)
- **AR camera** mode for captures

---

## Related Documentation

- [gamification-v2-overview.md](gamification-v2-overview.md) - Master spec
- [gamification-currency.md](gamification-currency.md) - XP rewards
- [gamification-customer-app.md](gamification-customer-app.md) - Full UX

---

*Last updated: January 30, 2026*
