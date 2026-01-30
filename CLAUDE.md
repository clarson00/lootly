# Lootly - Claude Code Instructions

> **This file is automatically read by Claude Code at the start of every session.**

## Project Overview

Lootly (branded as **Rewards Pirate** 🏴‍☠️) is a white-label loyalty rewards platform for small businesses (restaurants, cafes, etc.). Customers earn points (doubloons) and rewards (treasure); staff check them in via tablet. The platform features a composable rules engine and gamified multi-step quests (voyages).

## ⚠️ Required Reading

**Before writing ANY code, read these documents:**

| Priority | Document | Why |
|----------|----------|-----|
| 🔴 **MUST** | [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | System design, core principles, patterns |
| 🔴 **MUST** | [docs/ENTITLEMENTS.md](docs/ENTITLEMENTS.md) | Feature gating architecture. Every feature must be entitlement-aware |
| 🔴 **MUST** | [docs/FEATURE_FLAGS.md](docs/FEATURE_FLAGS.md) | How to implement feature checks in code |
| 🔴 **MUST** | [docs/RULES_ENGINE.md](docs/RULES_ENGINE.md) | Composable rules engine specification |
| 🟡 HIGH | [docs/ADMIN_APP.md](docs/ADMIN_APP.md) | Admin application specification |
| 🟡 HIGH | [docs/GAMIFICATION.md](docs/GAMIFICATION.md) | Customer-facing pirate theme experience |
| 🟡 HIGH | [docs/TECHNICAL_SPEC.md](docs/TECHNICAL_SPEC.md) | API routes, database schema, architecture |
| 🟡 HIGH | [docs/DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md) | Current database tables |
| 🟢 REF | [ROADMAP.md](ROADMAP.md) | Feature roadmap and specs index |
| 🟢 REF | [docs/SEED_DATA.md](docs/SEED_DATA.md) | Pilot customer (Tony's) configuration |

## Key Architecture Rules

### 1. Feature Gating (CRITICAL)

Every feature must be gated. No exceptions.

```typescript
// Backend: Protect routes
import { requireFeature } from '@/lib/features';
import { FEATURES } from '@/lib/features/registry';

app.post('/api/admin/rules', 
  requireFeature(FEATURES.RULES_BASIC),  // <-- Always add this
  handler
);

// Frontend: Conditional UI
import { FeatureGate } from '@/components/FeatureGate';

<FeatureGate feature={FEATURES.RULES_ADVANCED}>
  <AdvancedRuleBuilder />
</FeatureGate>
```

### 2. Multi-Tenant Queries (CRITICAL)

Every database query must be scoped to a business:

```typescript
// ❌ WRONG - No tenant scope
const customers = await db.query.customers.findMany();

// ✅ RIGHT - Tenant scoped
const customers = await db.query.customers.findMany({
  where: eq(customers.businessId, businessId)
});
```

### 3. ID Prefixes

All IDs are prefixed strings:

| Entity | Prefix | Example |
|--------|--------|--------|
| Business | `biz_` | `biz_pilot` |
| Location | `loc_` | `loc_1` |
| Customer | `cust_` | `cust_abc123` |
| Enrollment | `enroll_` | `enroll_xyz` |
| Rule | `rule_` | `rule_weekend_warrior` |
| Ruleset | `rset_` | `rset_grand_voyage` |
| Reward | `reward_` | `reward_free_pizza` |
| Transaction | `txn_` | `txn_123` |
| Rule Trigger | `rtrig_` | `rtrig_456` |
| Ruleset Progress | `rsprog_` | `rsprog_789` |
| Customer Tag | `ctag_` | `ctag_abc` |

### 4. When Adding a New Feature

1. **Read the spec** in `docs/` (if exists)
2. **Add feature key** to `FEATURES` in `lib/features/registry.ts`
3. **Assign to tier** in `TIER_FEATURES`
4. **Add middleware** `requireFeature()` to API routes
5. **Add UI gate** `<FeatureGate>` to components
6. **Update spec** with Entitlements section

### 5. Tech Stack

- **Backend:** Express (TypeScript), Drizzle ORM, PostgreSQL (Neon)
- **Frontend:** React, TailwindCSS, PWA
- **Auth:** Phone number + SMS code (customers), Email magic link (admin)
- **Hosting:** Railway/Render/Fly.io (backend), Vercel (frontend)

## Project Structure

```
lootly/
├── CLAUDE.md           # This file (read first!)
├── ROADMAP.md          # Feature roadmap
├── PROGRESS.md         # Development progress tracker
├── docs/
│   ├── ARCHITECTURE.md    # ⚠️ System design (MUST READ)
│   ├── ENTITLEMENTS.md    # ⚠️ Feature gating (MUST READ)
│   ├── FEATURE_FLAGS.md   # ⚠️ Implementation guide (MUST READ)
│   ├── RULES_ENGINE.md    # ⚠️ Rules engine spec (MUST READ)
│   ├── ADMIN_APP.md       # Admin app specification
│   ├── GAMIFICATION.md    # Pirate theme specification
│   ├── TECHNICAL_SPEC.md  # API/DB details
│   ├── DATABASE_SCHEMA.md # Database reference
│   ├── SEED_DATA.md       # Test data
│   └── roadmap/           # Feature specs
├── backend/               # Express API
│   ├── db/                # Drizzle schema, seed
│   ├── routes/            # API route handlers
│   │   ├── admin/         # Admin-only routes (rules, rulesets, etc.)
│   │   └── ...            # Customer/staff routes
│   ├── middleware/        # Auth, feature gating
│   ├── services/          # Business logic (entitlements, rules engine)
│   ├── lib/
│   │   ├── features/      # Feature registry, tier definitions
│   │   └── rules/         # Rules evaluation engine
│   └── tests/             # API integration tests
├── customer-app/          # React PWA for customers (Rewards Pirate themed)
├── staff-app/             # React PWA for tablet check-in
└── admin-app/             # React PWA for business owners (Captain's Quarters)
```

## Pirate Theme Reference

| Functional Term | Pirate Term |
|-----------------|-------------|
| Points | Doubloons 🪙 |
| Locations | Ports ⚓ |
| Customers | Crew Members 🏴‍☠️ |
| Rewards | Treasure 💎 |
| Rules | Ship's Orders 📜 |
| Rulesets/Quests | Voyages 🗺️ |
| Visit | Drop Anchor |
| Complete | Conquer |
| Unlock Reward | Plunder |
| Redeem | Claim Yer Loot |

See [docs/GAMIFICATION.md](docs/GAMIFICATION.md) for full theme guide.

## Current Status

- **Phase:** MVP Complete (local deployment)
- **Pilot Customer:** Tony's Restaurant Group (4 locations)
- **Backend:** Express + Drizzle + PostgreSQL with feature gating
- **Frontend:** Customer app + Staff tablet app (React PWAs)
- **Next:** Admin App + Rules Engine + Production deployment

## Commands Reference

```bash
# Backend
cd backend && npm run dev      # Start dev server (nodemon)
cd backend && npm start        # Start production server
cd backend && npm test         # Run API integration tests
cd backend && npm run seed     # Seed database with test data
cd backend && npm run db:push  # Push schema changes to DB

# Frontend Apps
cd customer-app && npm run dev # Customer PWA (port 5173)
cd staff-app && npm run dev    # Staff tablet PWA (port 5174)
cd admin-app && npm run dev    # Admin PWA (port 5175)

# Test Credentials
# Customer: +15551234567 (code: 1234)
# Staff PIN: 1234 (any location)
# Admin: owner@tonys.com (code: 123456)
```

## Questions?

If unclear on architecture decisions, check:
1. `docs/ARCHITECTURE.md` for system design and patterns
2. `docs/ENTITLEMENTS.md` for feature gating
3. `docs/RULES_ENGINE.md` for rules engine details
4. `docs/TECHNICAL_SPEC.md` for API/DB questions
5. `ROADMAP.md` for feature priorities

---

*Last updated: January 2025*
