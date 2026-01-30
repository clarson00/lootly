# Gamification v2: Enhanced System Overview

> **Status:** 🔷 Specified  
> **Priority:** High  
> **Target:** v2.0  
> **Last Updated:** January 30, 2026

---

## Executive Summary

This specification defines an enhanced gamification system for RewardsPirate that transforms routine transactions into engaging adventures. The system creates a **dual-currency economy** (XP for platform progression, Tenant Points for rewards), **collection mechanics** (Pokemon Go-style captures), **social features** (crews, leaderboards), and **event systems** (raids, predictions, watch parties).

### Strategic Goals

1. **Increase visit frequency** through collection and streak mechanics
2. **Drive network effects** through crews and social competition
3. **Enable tenant differentiation** through customizable bounties and events
4. **Create platform stickiness** through XP progression and collections

---

## System Components

| Component | Spec File | Description |
|-----------|-----------|-------------|
| Currency Model | [gamification-currency.md](gamification-currency.md) | XP + Tenant Points dual economy |
| Collectibles | [gamification-collectibles.md](gamification-collectibles.md) | Pokemon Go-style captures |
| Crews | [gamification-crews.md](gamification-crews.md) | Teams, leaderboards, chat |
| Predictions | [gamification-predictions.md](gamification-predictions.md) | Oracle's Challenge game |
| Events & Raids | [gamification-events-raids.md](gamification-events-raids.md) | Watch parties, boss battles |
| Bounties | [gamification-bounties.md](gamification-bounties.md) | Tenant-created challenges |
| Tenant Dashboard | [gamification-tenant-collaboration.md](gamification-tenant-collaboration.md) | Management tools |
| Collaboration | [gamification-tenant-collaboration.md](gamification-tenant-collaboration.md) | Multi-tenant campaigns |
| Customer App | [gamification-customer-app.md](gamification-customer-app.md) | Player UX |
| Data Model | [gamification-data-model.md](gamification-data-model.md) | Complete schema |
| MVP Plan | [gamification-mvp.md](gamification-mvp.md) | Implementation phases |

---

## Architecture Overview

### Dual Currency System

```
┌─────────────────────────────────────────────────────────────────┐
│                    CURRENCY ARCHITECTURE                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  PLATFORM CURRENCY (XP)          TENANT CURRENCY (Points)      │
│  ┌─────────────────────┐         ┌─────────────────────┐       │
│  │ • Universal         │         │ • Per-tenant        │       │
│  │ • No cash value     │         │ • $0.01/point       │       │
│  │ • Drives ranks      │         │ • Redeemable        │       │
│  │ • Platform loyalty  │         │ • Tenant funded     │       │
│  └─────────────────────┘         └─────────────────────┘       │
│           │                               │                     │
│           ▼                               ▼                     │
│  ┌─────────────────────┐         ┌─────────────────────┐       │
│  │ EARNS:              │         │ EARNS:              │       │
│  │ • Check-ins (+10)   │         │ • Purchases ($1=10) │       │
│  │ • Captures (+5-50)  │         │ • Bounties          │       │
│  │ • Quests            │         │ • Promotions        │       │
│  │ • Events            │         │ • Referrals         │       │
│  │ • Predictions       │         │                     │       │
│  └─────────────────────┘         └─────────────────────┘       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Platform vs Tenant Responsibilities

| Aspect | Platform Manages | Tenant Manages |
|--------|-----------------|----------------|
| Currency | XP system, ranks | Point earn rates, rewards |
| Collectibles | Creature library, rarity | Spawn tiers, capture bonuses |
| Events | Raid mechanics, predictions | Watch parties, flash events |
| Social | Crew infrastructure | - |
| Challenges | Quest framework | Bounties, promotions |

---

## Progression System

### Pirate Ranks

| Rank | XP Required | Unlocks |
|------|-------------|----------|
| Deckhand | 0 | Basic features |
| Sailor | 500 | Join crews |
| Boatswain | 1,500 | Create crews |
| First Mate | 4,000 | Crew officer roles |
| Captain | 6,000 | Advanced crew features |
| Commodore | 15,000 | Regional leaderboards |
| Admiral | 40,000 | Hall of Fame eligibility |
| Legend | 100,000 | Exclusive rewards |

---

## Theme Engine

The system is built with a **theme-agnostic engine** that currently uses pirate theming:

| Generic Term | Pirate Theme | Future: Space Theme |
|--------------|--------------|--------------------|
| Points | Doubloons | Credits |
| Location | Port | Station |
| Quest | Voyage | Mission |
| Team | Crew | Squadron |
| Rank | Pirate Rank | Space Rank |
| Collection | Treasure | Specimens |

---

## Decision: No Crypto

After analysis (see [crypto-rewards.md](crypto-rewards.md)), we decided **NOT** to implement cryptocurrency features due to:

1. **Regulatory complexity** - GENIUS Act, SEC classification, money transmitter licensing
2. **User friction** - Wallet setup, gas fees, key management
3. **Volatility concerns** - Reward value unpredictability
4. **Implementation cost** - Blockchain infrastructure

Instead, we achieve similar engagement through:
- Collectible rarity and trading (future)
- Leaderboard competition
- Crew rivalry
- Achievement permanence

---

## Entitlements by Tier

| Feature | Starter | Growth | Pro | Enterprise |
|---------|---------|--------|-----|------------|
| Bounties | 3 | 10 | Unlimited | Unlimited |
| Events/month | 2 | 10 | Unlimited | Unlimited |
| Spawn tier | Standard | Enhanced | Exclusive | Exclusive |
| Collaborations | - | Join | Create | White-label |
| Predictions | - | Join | Create | Create |
| Analytics | Basic | Full | Full | Custom |

---

## MVP Phases

| Phase | Duration | Key Deliverables |
|-------|----------|------------------|
| 1: Foundation | 4-6 weeks | XP, Ranks, Captures, Simple Bounties |
| 2: Social | 3-4 weeks | Crews, Leaderboards, Chat |
| 3: Network | 4-5 weeks | Multi-location Voyages, Collaboration |
| 4: Events | 3-4 weeks | Watch Parties, Raids, Predictions |
| 5: Scale | Ongoing | Territories, Seasons, Championships |

See [gamification-mvp.md](gamification-mvp.md) for detailed implementation plan.

---

## Related Documentation

- [../GAMIFICATION.md](../GAMIFICATION.md) - Original pirate theme UX spec
- [../RULES_ENGINE.md](../RULES_ENGINE.md) - Underlying rules system
- [../ENTITLEMENTS.md](../ENTITLEMENTS.md) - Feature gating
- [crypto-rewards.md](crypto-rewards.md) - Crypto analysis (not pursuing)

---

*Last updated: January 30, 2026*
