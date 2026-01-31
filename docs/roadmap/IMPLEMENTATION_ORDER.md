# Implementation Order & Dependency Map

> **Purpose:** Prevent rework by building features in the right order  
> **Philosophy:** Foundations first. Features that depend on other features come later.  
> **Last Updated:** January 30, 2026

---

## Overview

This document organizes all 27+ roadmap specs into a logical implementation order. Building features out of order causes:

- **Database rework** - Adding columns/tables that should have been there from the start
- **API changes** - Breaking changes that affect dependent features  
- **Code duplication** - Building the same thing twice in different places
- **Technical debt** - Bolting things on instead of designing them in

---

## Dependency Graph (Visual)

```
                         ┌─────────────────────────────────────────┐
                         │         PHASE 5: POLISH                 │
                         │   AI Assistant, Physical Rewards,       │
                         │   Advanced Analytics, Vertical Templates│
                         └────────────────────┬────────────────────┘
                                              │ requires
                         ┌────────────────────┴────────────────────┐
                         │         PHASE 4: ADVANCED               │
                         │   Events/Raids, Predictions,            │
                         │   Tenant Rewards, Voyages               │
                         └────────────────────┬────────────────────┘
                                              │ requires
                         ┌────────────────────┴────────────────────┐
                         │         PHASE 3: SOCIAL                 │
                         │   Crews, Leaderboards, Tenant Collab    │
                         └────────────────────┬────────────────────┘
                                              │ requires
                         ┌────────────────────┴────────────────────┐
                         │         PHASE 2: GAMIFICATION           │
                         │   XP/Currency, Ranks, Collectibles,     │
                         │   Basic Bounties, Time-Bound Promos     │
                         └────────────────────┬────────────────────┘
                                              │ requires
                         ┌────────────────────┴────────────────────┐
                         │         PHASE 1: FOUNDATION             │
                         │   Check-ins, Rules Engine, Points,      │
                         │   Rewards, Basic Analytics              │
                         └────────────────────┬────────────────────┘
                                              │ requires
                         ┌────────────────────┴────────────────────┐
                         │         PHASE 0: CORE PLATFORM          │
                         │   Database, Auth, Tenants, Locations,   │
                         │   Staff, Customers, Entitlements        │
                         └─────────────────────────────────────────┘

    ═══════════════════════════════════════════════════════════════════
                         PARALLEL TRACKS (Independent)
    ═══════════════════════════════════════════════════════════════════
    
    ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
    │   MARKETING     │  │  INTEGRATIONS   │  │   YIELD/CRYPTO  │
    │                 │  │                 │  │   (Deferred)    │
    │ - Messages      │  │ - POS           │  │                 │
    │ - Social Posts  │  │ - Payments      │  │ - Yield Points  │
    │ - Email         │  │ - Webhooks      │  │ - Yield Engine  │
    └─────────────────┘  └─────────────────┘  │ - Tokenomics    │
                                              └─────────────────┘
```

---

## Phase 0: Core Platform (ALREADY SPECIFIED)

**These are foundational. Everything else depends on them.**

| Component | Spec Location | Status | Notes |
|-----------|---------------|--------|-------|
| Database Schema | `docs/DATABASE_SCHEMA.md` | ✅ Specified | Core tables exist |
| Architecture | `docs/ARCHITECTURE.md` | ✅ Specified | API structure |
| Entitlements | `docs/ENTITLEMENTS.md` | ✅ Specified | Feature gating |
| Feature Flags | `docs/FEATURE_FLAGS.md` | ✅ Specified | Rollout control |
| Admin App | `docs/ADMIN_APP.md` | ✅ Specified | Tenant dashboard |

**Key Tables Required:**
- `businesses` (tenants)
- `locations`
- `staff`
- `customers`
- `enrollments`
- `sessions`

---

## Phase 1: Foundation (BUILD FIRST)

**Duration:** 6-8 weeks  
**Goal:** Core loyalty mechanics that everything else builds on

### 1.1 Check-In System ⭐ CRITICAL

| Spec | File | Dependencies | Why First |
|------|------|--------------|-----------|
| Check-In Model | `check-in-model.md` | Phase 0 | Core value prop - visits |
| Check-In Methods | `check-in-methods.md` | Check-in model | How customers check in |

**Database additions:**
```sql
-- visits table (if not in core schema)
-- transaction types for check-ins
```

### 1.2 Rules Engine ⭐ CRITICAL

| Spec | File | Dependencies | Why First |
|------|------|--------------|-----------|
| Rules Engine | `docs/RULES_ENGINE.md` | Phase 0 | Powers ALL gamification |

**This enables:**
- Points earning rules
- Multipliers
- Time-based bonuses
- Bounties (later)
- Voyages (later)

### 1.3 Basic Rewards

| Spec | File | Dependencies | Why First |
|------|------|--------------|-----------|
| Core Rewards | `docs/CORE_FEATURES.md` | Rules engine | Basic redemption |

**Database:** Already in core schema (`rewards`, `customer_rewards`)

### 1.4 Analytics Infrastructure

| Spec | File | Dependencies | Why First |
|------|------|--------------|-----------|
| Analytics Basics | `analytics-reporting.md` (Phase 1 only) | Transactions | Everything needs metrics |

**Build now:**
- `daily_metrics` aggregation table
- Basic dashboard queries
- Visit/revenue tracking

**Build later:** Advanced analytics, AI insights

---

## Phase 2: Gamification Core (BUILD SECOND)

**Duration:** 4-6 weeks  
**Goal:** The dual-currency system and basic game mechanics  
**Requires:** Phase 1 complete

### 2.1 Currency System ⭐ CRITICAL

| Spec | File | Dependencies | Why Order |
|------|------|--------------|-----------|
| Gamification Currency | `gamification-currency.md` | Check-ins, Rules | Everything earns/spends currency |
| Gamification Data Model | `gamification-data-model.md` | Currency spec | Schema for all game features |

**Database additions:**
```sql
CREATE TABLE user_xp (...)
CREATE TABLE user_tenant_points (...)
CREATE TABLE xp_transactions (...)
CREATE TABLE point_transactions (...)
CREATE TABLE tenant_currency_settings (...)
```

### 2.2 Ranks & Progression

| Spec | File | Dependencies | Why Order |
|------|------|--------------|-----------|
| Rank System | Part of `gamification-currency.md` | XP system | Unlocks features by rank |

**8 pirate ranks:** Deckhand → Legend

### 2.3 Collectibles (Captures)

| Spec | File | Dependencies | Why Order |
|------|------|--------------|-----------|
| Collectibles | `gamification-collectibles.md` | XP system, Check-ins | Captures award XP |

**Database additions:**
```sql
CREATE TABLE creatures (...)
CREATE TABLE creature_spawns (...)
CREATE TABLE user_captures (...)
CREATE TABLE user_collections (...)
```

### 2.4 Basic Bounties

| Spec | File | Dependencies | Why Order |
|------|------|--------------|-----------|
| Bounties | `gamification-bounties.md` | Rules engine, XP | Tenant-created challenges |

**Start simple:** 3 bounty types, 5 templates

### 2.5 Time-Bound Promos

| Spec | File | Dependencies | Why Order |
|------|------|--------------|-----------|
| Time-Bound Promos | `time-bound-promos.md` | Rules engine | Limited-time offers |

**Note:** Rules engine already supports `starts_at`/`ends_at` - this is mostly UI

---

## Phase 3: Social Features (BUILD THIRD)

**Duration:** 4-5 weeks  
**Goal:** Competition and community  
**Requires:** Phase 2 complete (XP, Ranks exist)

### 3.1 Crews (Teams)

| Spec | File | Dependencies | Why Order |
|------|------|--------------|-----------|
| Crews | `gamification-crews.md` | XP, Ranks (Sailor+) | Need ranks for gating |

**Database additions:**
```sql
CREATE TABLE crews (...)
CREATE TABLE crew_members (...)
CREATE TABLE crew_challenges (...)
```

**Rank requirement:** Must be Sailor (500 XP) to join crews

### 3.2 Leaderboards

| Spec | File | Dependencies | Why Order |
|------|------|--------------|-----------|
| Leaderboards | Part of crews spec | XP system | Requires XP to rank |

**Types:** Individual, Crew, Location, Regional

### 3.3 Tenant Collaboration

| Spec | File | Dependencies | Why Order |
|------|------|--------------|-----------|
| Collaboration | `gamification-tenant-collaboration.md` | Multiple tenants, Bounties | Cross-tenant campaigns |

---

## Phase 4: Advanced Features (BUILD FOURTH)

**Duration:** 5-6 weeks  
**Goal:** Complex engagement mechanics  
**Requires:** Phase 3 complete

### 4.1 Events & Raids

| Spec | File | Dependencies | Why Order |
|------|------|--------------|-----------|
| Events/Raids | `gamification-events-raids.md` | Crews, Bounties | Team-based activities |

**Features:** Watch parties, Boss battles, Flash events

### 4.2 Predictions

| Spec | File | Dependencies | Why Order |
|------|------|--------------|-----------|
| Predictions | `gamification-predictions.md` | Events, XP | Wagering on outcomes |

**Oracle's Challenge:** Predict event outcomes

### 4.3 Multi-Location Voyages

| Spec | File | Dependencies | Why Order |
|------|------|--------------|-----------|
| Voyages | Part of rules engine | Rules, Tenant collab | Cross-location journeys |

### 4.4 Tenant Rewards (PrintHabit)

| Spec | File | Dependencies | Why Order |
|------|------|--------------|-----------|
| Tenant Rewards | `tenant-rewards-program.md` | Tenant analytics, Attribution | Tenants earn Creator Points |

**Requires:** Attribution tracking from analytics

---

## Phase 5: Polish & Expansion (BUILD LAST)

**Duration:** Ongoing  
**Goal:** Advanced features and optimization  
**Requires:** Core platform stable

### 5.1 AI Marketing Assistant

| Spec | File | Dependencies | Why Order |
|------|------|--------------|-----------|
| AI Assistant | `ai-marketing-assistant.md` | Full analytics, Rules | Needs data to learn |

### 5.2 Physical Rewards (PrintHabit)

| Spec | File | Dependencies | Why Order |
|------|------|--------------|-----------|
| Physical Rewards | `physical-rewards.md` | Tenant rewards | Merch fulfillment |

### 5.3 Advanced Analytics

| Spec | File | Dependencies | Why Order |
|------|------|--------------|-----------|
| Advanced Analytics | `analytics-reporting.md` (Phase 2-3) | Full data, Journeys | Cohorts, predictions |

### 5.4 Vertical Templates

| Spec | File | Dependencies | Why Order |
|------|------|--------------|-----------|
| Vertical Templates | `vertical-templates.md` | All features | Pre-built configs |

### 5.5 Customer App

| Spec | File | Dependencies | Why Order |
|------|------|--------------|-----------|
| Customer App | `gamification-customer-app.md` | All gamification | Native mobile app |

---

## Parallel Tracks (Can Build Anytime)

These features are largely independent and can be developed in parallel:

### Marketing Track

| Spec | File | Can Start | Notes |
|------|------|-----------|-------|
| Marketing Messages | `marketing-messages.md` | Phase 1+ | SMS/Push notifications |
| Social Posting | `marketing-social-posting.md` | Phase 1+ | Social media integration |

### Integration Track

| Spec | File | Can Start | Notes |
|------|------|-----------|-------|
| POS Integrations | `pos-integrations.md` | Phase 1+ | Square, Toast, etc. |
| Referrals | `referrals.md` | Phase 2+ | Needs customer accounts |

### Deferred Track (Future)

| Spec | File | Status | Notes |
|------|------|--------|-------|
| Yield Points | `yield-points.md` | 🔮 Future | Complex staking |
| Yield Engine | `yield-engine.md` | 🔮 Future | DeFi-like mechanics |
| Tokenomics | `tokenomics.md` | 🔮 Future | Economic modeling |
| Crypto Rewards | `crypto-rewards.md` | ❌ Not Pursuing | Regulatory concerns |

---

## Critical Dependencies (Don't Skip!)

### If You Skip This... → You'll Have to Rework This

| Skip | Rework Required |
|------|-----------------|
| Rules Engine | Every bounty, promo, voyage, event |
| XP/Currency tables | All gamification features |
| Attribution tracking | Tenant rewards, analytics |
| Crew infrastructure | Events, raids, leaderboards |
| Analytics aggregation | AI assistant, reports |

### Database Schema Changes by Phase

**Phase 1 adds:**
- `visits` table enhancements
- `rule_triggers` tracking
- `daily_metrics` aggregation

**Phase 2 adds:**
- `user_xp`, `user_tenant_points`
- `xp_transactions`, `point_transactions`
- `creatures`, `user_captures`
- `bounties`, `bounty_progress`

**Phase 3 adds:**
- `crews`, `crew_members`
- `crew_challenges`, `crew_leaderboards`
- `tenant_collaborations`

**Phase 4 adds:**
- `events`, `event_participants`
- `predictions`, `prediction_entries`
- `tenant_creator_points` (for tenant rewards)

---

## Implementation Guidelines

### 1. Schema First
Before coding any feature, ensure the database schema supports all future needs:
- Include fields for features you'll add later
- Use JSONB for extensible metadata
- Plan indexes for analytics queries

### 2. Feature Flag Everything
Every new feature should be behind a flag:
```typescript
if (await featureEnabled('gamification.captures', tenant)) {
  // show capture UI
}
```

### 3. API Versioning
Start with `/api/v1/` and maintain backward compatibility:
- Don't change existing endpoints
- Deprecate, don't delete
- Add new endpoints for new features

### 4. Test Data Coverage
Keep seed data working through all phases:
- Update `SEED_DATA.md` as you add features
- Ensure demo accounts showcase new features

---

## Spec Status Legend

| Status | Meaning |
|--------|---------|
| ✅ Specified | Ready to implement |
| 🔷 Specified | Spec complete, not yet prioritized |
| 💡 Idea | Concept only, needs spec |
| 🔮 Future | Deferred to later version |
| ❌ Not Pursuing | Decided against |

---

## Quick Reference: What Depends on What

```
Check-ins ─────────────────────────────────────────────────┐
    │                                                      │
    └──► Rules Engine ─────────────────────────────────────┤
              │                                            │
              ├──► Basic Rewards                           │
              │                                            │
              ├──► Time-Bound Promos                       │
              │                                            │
              └──► Bounties ───────────────────────────────┤
                       │                                   │
                       └──► Events/Raids                   │
                                │                          │
                                └──► Predictions           │
                                                           │
XP System ─────────────────────────────────────────────────┤
    │                                                      │
    ├──► Ranks ────────────────────────────────────────────┤
    │       │                                              │
    │       └──► Crews ────────────────────────────────────┤
    │               │                                      │
    │               └──► Leaderboards                      │
    │                                                      │
    └──► Collectibles                                      │
                                                           │
Tenant Analytics ──────────────────────────────────────────┤
    │                                                      │
    └──► Tenant Rewards ───────────────────────────────────┤
              │                                            │
              └──► Physical Rewards (PrintHabit)           │
                                                           │
All Features ──────────────────────────────────────────────┘
    │
    └──► AI Assistant
    └──► Vertical Templates
    └──► Customer App
```

---

## Summary: Implementation Order

1. **Phase 0:** Core platform (done/in progress)
2. **Phase 1:** Check-ins, Rules Engine, Basic Analytics
3. **Phase 2:** XP/Currency, Ranks, Collectibles, Bounties
4. **Phase 3:** Crews, Leaderboards, Tenant Collaboration
5. **Phase 4:** Events, Predictions, Voyages, Tenant Rewards
6. **Phase 5:** AI, Physical Rewards, Advanced Features
7. **Parallel:** Marketing, Integrations (anytime)
8. **Deferred:** Yield/Crypto features

**Total estimated timeline:** 6-9 months for Phases 1-4

---

*Last updated: January 30, 2026*
