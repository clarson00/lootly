# Lootly Architecture

> **Purpose:** High-level architecture decisions and patterns.  
> **Audience:** Claude Code, developers  
> **Status:** Living document — update as architecture evolves

---

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              LOOTLY PLATFORM                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐   │
│   │  Customer   │   │   Staff     │   │   Admin     │   │   Owner     │   │
│   │  PWA        │   │   Tablet    │   │   Dashboard │   │   Mobile    │   │
│   │  (React)    │   │   (React)   │   │   (React)   │   │   (React)   │   │
│   └──────┬──────┘   └──────┬──────┘   └──────┬──────┘   └──────┬──────┘   │
│          │                 │                 │                 │           │
│          └────────────────┬┴─────────────────┴─────────────────┘           │
│                           │                                                 │
│                           ▼                                                 │
│                    ┌──────────────┐                                        │
│                    │ Express API  │                                        │
│                    │  (Node.js)   │                                        │
│                    └──────┬───────┘                                        │
│                           │                                                 │
│          ┌────────────────┼────────────────┐                               │
│          │                │                │                               │
│          ▼                ▼                ▼                               │
│   ┌────────────┐   ┌────────────┐   ┌────────────┐                        │
│   │ PostgreSQL │   │   Redis    │   │  External  │                        │
│   │   (Neon)   │   │  (Upstash) │   │  Services  │                        │
│   └────────────┘   └────────────┘   └────────────┘                        │
│                                      • Twilio (SMS)                        │
│                                      • Stripe (Billing)                    │
│                                      • Claude (AI)                         │
│                                      • Meta (FB/IG)                        │
│                                      • FCM (Push)                          │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Core Principles

### 1. Feature Gating First

**Every feature must be gated.** This is non-negotiable.

```typescript
// ❌ WRONG - No feature gate
app.post('/api/journeys', createJourneyHandler);

// ✅ RIGHT - Feature gated
app.post('/api/journeys', 
  requireFeature(FEATURES.PRO_JOURNEYS),
  createJourneyHandler
);
```

See [ENTITLEMENTS.md](ENTITLEMENTS.md) for full details.

### 2. Multi-Tenant by Default

Every query must be scoped to a business:

```typescript
// ❌ WRONG - No tenant scope
const customers = await db.query.customers.findMany();

// ✅ RIGHT - Tenant scoped
const customers = await db.query.customers.findMany({
  where: eq(customers.business_id, businessId)
});
```

### 3. Prefixed IDs

All IDs are prefixed strings for debugging and safety:

```typescript
// ID prefixes
biz_     // Business
loc_     // Location
grp_     // Location group
lgm_     // Location group member
cust_    // Customer
enroll_  // Enrollment (customer in business)
txn_     // Transaction
visit_   // Visit record
rwd_     // Reward
cr_      // Customer reward (earned/redeemed)
rule_    // Rule
rs_      // Ruleset (Voyage)
rt_      // Rule trigger (when rule fired)
qr_      // QR code
msg_     // Message
staff_   // Staff member
```

### 4. Immutable Audit Trail

Transactions and point changes are append-only:

```typescript
// ❌ WRONG - Mutating balance directly
await db.update(customers).set({ points: newBalance });

// ✅ RIGHT - Create transaction, compute balance
await db.insert(transactions).values({
  type: 'earn',
  points: 50,
  customer_id: customerId,
});
// Balance computed from SUM of transactions
```

### 5. Rules Engine is Central

All point calculations go through the rules engine:

```typescript
// ❌ WRONG - Hard-coded points
const points = amount * 1;

// ✅ RIGHT - Rules engine decides
const points = await rulesEngine.evaluate({
  trigger: 'purchase',
  context: { amount, location, dayOfWeek, customer }
});
```

---

## Tech Stack

| Layer | Technology | Why |
|-------|------------|-----|
| **API** | Express | Industry standard, massive ecosystem, proven reliability |
| **Runtime** | Node.js | Battle-tested, every developer knows it |
| **Database** | PostgreSQL (Neon) | Serverless, scales to zero, branching |
| **ORM** | Drizzle | Type-safe, lightweight, good DX |
| **Cache** | Redis (Upstash) | Session storage, rate limiting |
| **Frontend** | React + Vite | PWA support, fast builds |
| **Styling** | TailwindCSS | Utility-first, consistent |
| **Backend Host** | Railway / Render / Fly.io | Simple deployment, auto-scaling, proven |
| **Frontend Host** | Vercel | Easy PWA deployment |
| **SMS** | Twilio | Reliable, good API |
| **Payments** | Stripe | Industry standard |
| **AI** | Claude API | Best reasoning for marketing assistant |
| **Social** | Meta Graph API | Facebook/Instagram posting |
| **Push** | Firebase Cloud Messaging | Cross-platform |

---

## API Design

### URL Structure

```
/api/v1/{resource}[/{id}][/{sub-resource}]
```

Examples:
- `GET /api/v1/customers` — List customers
- `GET /api/v1/customers/cust_123` — Get customer
- `GET /api/v1/customers/cust_123/transactions` — Customer's transactions
- `POST /api/v1/transactions` — Create transaction

### Authentication

```
Authorization: Bearer {jwt_token}
```

JWT contains:
```typescript
{
  sub: "cust_123" | "staff_456",  // User ID
  type: "customer" | "staff" | "owner",
  business_id: "biz_789",  // For staff/owner
  location_id?: "loc_012",  // For staff
}
```

### Response Format

```typescript
// Success
{
  data: { ... },
  meta?: { page, limit, total }
}

// Error
{
  error: {
    code: "VALIDATION_ERROR",
    message: "Invalid phone number",
    details?: { field: "phone" }
  }
}
```

### Error Codes

| Code | HTTP | Meaning |
|------|------|--------|
| `VALIDATION_ERROR` | 400 | Invalid input |
| `UNAUTHORIZED` | 401 | Not logged in |
| `FORBIDDEN` | 403 | No permission |
| `NOT_FOUND` | 404 | Resource doesn't exist |
| `FEATURE_NOT_AVAILABLE` | 403 | Upgrade required |
| `LIMIT_EXCEEDED` | 429 | Usage limit hit |
| `INTERNAL_ERROR` | 500 | Server error |

---

## Database Patterns

### Soft Deletes

Use `deleted_at` instead of hard deletes:

```sql
SELECT * FROM customers 
WHERE business_id = $1 
  AND deleted_at IS NULL;
```

### Timestamps

All tables have:
```sql
created_at TIMESTAMPTZ DEFAULT NOW(),
updated_at TIMESTAMPTZ  -- Set on update
```

### JSON Columns

Use for flexible data, but sparingly:

```sql
-- Good: Rule conditions (complex, varies by type)
conditions JSONB NOT NULL

-- Bad: Customer address (should be columns)
address JSONB  -- ❌ Use address_line1, city, etc.
```

---

## Frontend Patterns

### State Management

- **Server state:** TanStack Query (React Query)
- **UI state:** React useState/useReducer
- **Form state:** React Hook Form

### Feature Gating in UI

```tsx
// Always wrap gated features
<FeatureGate feature={FEATURES.AI_ASSISTANT}>
  <AIAssistant />
</FeatureGate>

// Or check in hooks
const { hasFeature } = useEntitlements();
if (!hasFeature(FEATURES.ANALYTICS)) {
  return <UpgradePrompt feature="analytics" />;
}
```

### PWA Requirements

- Service worker for offline
- Manifest for install prompt
- Icons at all sizes
- HTTPS only

---

## Security

### Authentication Flow

```
1. Customer enters phone number
2. Server sends SMS code (6 digits, 5 min expiry)
3. Customer enters code
4. Server verifies, issues JWT
5. JWT stored in httpOnly cookie
```

### Authorization

| Role | Can Access |
|------|------------|
| Customer | Own data, own rewards, own transactions |
| Staff | Business customers, check-ins, redemptions |
| Owner | Everything in their business |
| Admin | System-wide (internal only) |

### Data Isolation

- All queries filtered by `business_id`
- Middleware validates JWT business matches route
- No cross-tenant data access possible

---

## Scalability Considerations

### Stateless API

- No server-side sessions
- JWT contains all auth info
- Horizontal scaling works automatically

### Database

- Connection pooling via Neon
- Read replicas when needed
- Indexes on all foreign keys

### Caching Strategy

```
L1: In-memory (request scope)
L2: Redis (cross-request)
L3: Database
```

Cache invalidation:
- Feature flags: 5 min TTL
- Business config: 1 min TTL
- Customer data: No cache (real-time)

---

## Folder Structure

```
lootly/
├── CLAUDE.md              # Claude Code instructions
├── ROADMAP.md             # Feature roadmap
├── docs/
│   ├── ARCHITECTURE.md    # This file
│   ├── ENTITLEMENTS.md    # Feature gating
│   ├── FEATURE_FLAGS.md   # Implementation guide
│   ├── TECHNICAL_SPEC.md  # API & DB spec
│   ├── DATABASE_SCHEMA.md # Schema reference
│   ├── SEED_DATA.md       # Pilot data
│   ├── RULES_ENGINE.md    # Rules engine docs
│   ├── GAMIFICATION.md    # Voyages & gamification
│   └── roadmap/           # Feature specs
│
├── backend/
│   ├── server.js          # Express app entry
│   ├── routes/
│   │   ├── admin/         # Admin API routes
│   │   │   ├── rules.js   # Rule CRUD & simulation
│   │   │   └── rulesets.js # Voyage CRUD
│   │   ├── auth.js        # Authentication
│   │   ├── customers.js   # Customer management
│   │   ├── transactions.js # Points & transactions
│   │   └── voyages.js     # Customer voyage progress
│   ├── lib/
│   │   ├── features/      # Feature gating
│   │   │   └── registry.js
│   │   └── rules/         # Rules engine
│   │       ├── conditions/ # Condition evaluators
│   │       ├── awards/     # Award handlers
│   │       ├── evaluator.js
│   │       ├── simulator.js
│   │       └── plain-language.js
│   ├── db/
│   │   ├── index.js       # Drizzle setup
│   │   ├── schema.js      # Database schema
│   │   └── seed.js        # Pilot data seeding
│   └── package.json
│
├── admin-app/             # Business admin dashboard
│   ├── src/
│   │   ├── pages/         # Route components
│   │   │   ├── RulesPage.jsx
│   │   │   ├── RuleBuilderPage.jsx
│   │   │   ├── VoyagesPage.jsx
│   │   │   ├── VoyageBuilderPage.jsx
│   │   │   └── SimulatorPage.jsx
│   │   ├── components/
│   │   │   └── rules/
│   │   │       ├── ConditionBuilder.jsx
│   │   │       ├── AwardBuilder.jsx
│   │   │       └── WalkthroughDrawer.jsx  # Live preview panel
│   │   ├── lib/
│   │   │   └── plainLanguage.js  # Shared description utilities
│   │   ├── api/           # API client
│   │   └── App.jsx
│   └── package.json
│
├── customer-app/          # Customer-facing PWA
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── TreasureMap.jsx  # Voyage progress
│   │   │   └── VoyageDetail.jsx
│   │   ├── components/
│   │   └── App.jsx
│   └── package.json
│
└── staff-app/             # Staff tablet (future)
    └── ...
```

---

## Key Components

### Rules Engine

The rules engine is the core of Lootly's gamification. It evaluates conditions and awards points/rewards.

```
┌─────────────────────────────────────────────────────────────┐
│                      RULES ENGINE                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   Conditions (AND/OR composable)     Awards (composable)    │
│   ├── location_visit                 ├── bonus_points       │
│   ├── spend_amount                   ├── multiplier         │
│   ├── day_of_week                    ├── unlock_reward      │
│   ├── time_of_day                    └── apply_tag          │
│   ├── customer_tag                                          │
│   ├── customer_attribute             Award Groups (OR/AND)  │
│   └── rule_triggered                 └── Location-targeted  │
│                                                             │
│   Evaluator ──► Simulator ──► Plain Language Generator      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

See [RULES_ENGINE.md](RULES_ENGINE.md) for full documentation.

### Voyages (Rulesets)

Voyages are multi-step customer journeys built from rules:

```typescript
// Voyage = Ruleset containing ordered/unordered rules
{
  id: "rs_grand_tour",
  name: "Grand Tour",
  chainType: "sequential",  // or "parallel"
  rules: [
    { sequenceOrder: 1, conditions: {...}, awards: [...] },
    { sequenceOrder: 2, conditions: {...}, awards: [...] },
    { sequenceOrder: 3, conditions: {...}, awards: [...] },  // Final reward
  ]
}
```

### PlainLanguage Utilities

Shared utilities for converting rules/voyages to human-readable text:

```typescript
import {
  describeConditions,    // "Customer visits 🍕 Tony's Pizza"
  describeAwards,        // "50 bonus points + Apply tag"
  describeRule,          // Full rule summary
  describeVoyage,        // Full voyage with steps
  generateMarketingSummary  // For AI content generation
} from 'lib/plainLanguage';
```

Used by:
- **SimulatorPage** — Walkthrough display
- **WalkthroughDrawer** — Live preview while building
- **Marketing component** — AI prompt generation

---

## Decision Log

| Date | Decision | Rationale |
|------|----------|----------|
| Jan 2025 | Feature gating from day 1 | Avoid painful retrofit for monetization |
| Jan 2025 | Express over Hono | Industry standard, proven reliability, larger ecosystem, AI coders won't struggle |
| Jan 2025 | Railway/Render/Fly over Cloudflare Workers | Full Node.js compatibility, no edge constraints |
| Jan 2025 | Drizzle over Prisma | Lighter, faster, better SQL control |
| Jan 2025 | PostgreSQL over MySQL | Better JSON support, Neon serverless |
| Jan 2025 | PWA over native apps | Faster to build, easier updates |
| Jan 2025 | Phone auth over email | Better for restaurant customers |
| Jan 2025 | Composable conditions (AND/OR) | Flexible rule building without code |
| Jan 2025 | Composable awards with location targeting | Let customers choose where to claim rewards |
| Jan 2025 | Voyages as rulesets | Rules abstracted as "steps" for non-technical users |
| Jan 2025 | PlainLanguage shared utilities | Reuse descriptions in preview, simulator, and marketing |
| Jan 2025 | WalkthroughDrawer as live preview | Better UX - see what you're building in real-time |

---

## Related Documents

- [ENTITLEMENTS.md](ENTITLEMENTS.md) — Feature gating (MUST READ)
- [FEATURE_FLAGS.md](FEATURE_FLAGS.md) — Implementation guide
- [TECHNICAL_SPEC.md](TECHNICAL_SPEC.md) — API routes & database
- [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md) — Schema reference
- [RULES_ENGINE.md](RULES_ENGINE.md) — Rules engine documentation
- [GAMIFICATION.md](GAMIFICATION.md) — Voyages & gamification
- [ADMIN_APP.md](ADMIN_APP.md) — Admin dashboard documentation

---

*Last updated: January 2025*
