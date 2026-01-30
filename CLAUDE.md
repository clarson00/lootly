# Lootly - Claude Code Instructions

> **This file is automatically read by Claude Code at the start of every session.**

## Project Overview

Lootly is a white-label loyalty rewards platform for small businesses (restaurants, cafes, etc.). Customers earn points and rewards; staff check them in via tablet.

## ⚠️ Required Reading

**Before writing ANY code, read these documents:**

| Priority | Document | Why |
|----------|----------|-----|
| 🔴 **MUST** | [docs/ENTITLEMENTS.md](docs/ENTITLEMENTS.md) | Feature gating architecture. Every feature must be entitlement-aware. |
| 🔴 **MUST** | [docs/FEATURE_FLAGS.md](docs/FEATURE_FLAGS.md) | How to implement feature checks in code. |
| 🟡 HIGH | [docs/TECHNICAL_SPEC.md](docs/TECHNICAL_SPEC.md) | API routes, database schema, architecture. |
| 🟡 HIGH | [docs/DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md) | Current database tables. |
| 🟢 REF | [ROADMAP.md](ROADMAP.md) | Feature roadmap and specs index. |
| 🟢 REF | [docs/SEED_DATA.md](docs/SEED_DATA.md) | Pilot customer (Freddie's) configuration. |

## Key Architecture Rules

### 1. Feature Gating (CRITICAL)

Every feature must be gated. No exceptions.

```typescript
// Backend: Protect routes
import { requireFeature } from '@/lib/features';
import { FEATURES } from '@/lib/features/registry';

app.post('/api/journeys', 
  requireFeature(FEATURES.PRO_JOURNEYS),  // <-- Always add this
  handler
);

// Frontend: Conditional UI
import { FeatureGate } from '@/components/FeatureGate';

<FeatureGate feature={FEATURES.PRO_JOURNEYS}>
  <JourneyBuilder />
</FeatureGate>
```

### 2. When Adding a New Feature

1. **Add feature key** to `FEATURES` in `lib/features/registry.ts`
2. **Assign to tier** in `TIER_FEATURES`
3. **Add middleware** `requireFeature()` to API routes
4. **Add UI gate** `<FeatureGate>` to components
5. **Update spec** with Entitlements section

### 3. Tech Stack

- **Backend:** Hono (TypeScript), Drizzle ORM, PostgreSQL (Neon)
- **Frontend:** React, TailwindCSS, PWA
- **Auth:** Phone number + SMS code
- **Hosting:** Cloudflare Workers (backend), Vercel (frontend)

### 4. Database

- Schema in `docs/DATABASE_SCHEMA.md`
- Use Drizzle migrations
- All IDs are prefixed strings (e.g., `biz_`, `cust_`, `txn_`)

## Project Structure

```
lootly/
├── CLAUDE.md           # This file (read first!)
├── ROADMAP.md          # Feature roadmap
├── docs/
│   ├── ENTITLEMENTS.md # ⚠️ Feature gating (MUST READ)
│   ├── FEATURE_FLAGS.md # ⚠️ Implementation guide
│   ├── TECHNICAL_SPEC.md
│   ├── DATABASE_SCHEMA.md
│   ├── SEED_DATA.md
│   └── roadmap/        # Feature specs
│       ├── user-journeys.md
│       ├── time-bound-promos.md
│       ├── marketing-messages.md
│       ├── analytics-reporting.md
│       └── ai-marketing-assistant.md
├── backend/            # Hono API (when created)
└── frontend/           # React PWA (when created)
```

## Ownership Model

| What | Owner | Notes |
|------|-------|-------|
| Feature specs (`docs/`) | Human + Claude Chat | Strategy and design |
| Code implementation | Claude Code | Based on specs |
| ROADMAP.md | Claude Code | Keep updated |
| CLAUDE.md | Human + Claude | Session instructions |

## Current Status

- **Phase:** Pre-MVP (specs only)
- **Pilot Customer:** Freddie's Restaurant Group (4 locations)
- **Next:** Build MVP backend and frontend

## Commands Reference

```bash
# When backend exists:
cd backend && npm run dev      # Start dev server
cd backend && npm run db:push  # Push schema changes
cd backend && npm run db:seed  # Seed pilot data

# When frontend exists:
cd frontend && npm run dev     # Start dev server
```

## Questions?

If unclear on architecture decisions, check:
1. `docs/ENTITLEMENTS.md` for feature gating
2. `docs/TECHNICAL_SPEC.md` for API/DB questions
3. `ROADMAP.md` for feature priorities

---

*Last updated: January 2025*
