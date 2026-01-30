# Rewards Pirate 🏴‍☠️ - Claude Code Implementation Prompt

## Your Mission
Build the admin app and rules engine for Rewards Pirate, a gamified multi-location loyalty platform with pirate theming.

## Required Reading (in order)
Before writing any code, read these docs in the repo:
1. `CLAUDE.md` - Project conventions, ID prefixes, dev commands
2. `docs/RULES_ENGINE.md` - Complete rules engine specification
3. `docs/ADMIN_APP.md` - Admin app UI and API specification  
4. `docs/GAMIFICATION.md` - Pirate theme and customer-facing UI
5. `docs/ENTITLEMENTS.md` - Feature gating by tier
6. `docs/DATABASE_SCHEMA.md` - Existing schema patterns

## Implementation Order

### Phase 1: Database Schema
Create migrations for rules engine tables:
```sql
-- rulesets (Voyages)
CREATE TABLE rulesets (
  id TEXT PRIMARY KEY DEFAULT 'rset_' || nanoid(),
  business_id TEXT NOT NULL REFERENCES businesses(id),
  name TEXT NOT NULL,
  description TEXT,
  rules JSONB NOT NULL DEFAULT '[]', -- ordered array of rule IDs
  chain_mode TEXT NOT NULL DEFAULT 'sequential', -- sequential | any_order
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- rules (updated with awards array)
-- Add to existing rules table or create if not exists
ALTER TABLE rules ADD COLUMN IF NOT EXISTS awards JSONB NOT NULL DEFAULT '[]';
ALTER TABLE rules ADD COLUMN IF NOT EXISTS ruleset_id TEXT REFERENCES rulesets(id);

-- rule_triggers (audit log)
CREATE TABLE rule_triggers (
  id TEXT PRIMARY KEY DEFAULT 'rtrig_' || nanoid(),
  rule_id TEXT NOT NULL REFERENCES rules(id),
  customer_id TEXT NOT NULL REFERENCES customers(id),
  triggered_at TIMESTAMPTZ DEFAULT NOW(),
  context JSONB -- what caused the trigger
);

-- ruleset_progress
CREATE TABLE ruleset_progress (
  id TEXT PRIMARY KEY DEFAULT 'rsprog_' || nanoid(),
  ruleset_id TEXT NOT NULL REFERENCES rulesets(id),
  customer_id TEXT NOT NULL REFERENCES customers(id),
  completed_rules JSONB NOT NULL DEFAULT '[]',
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  UNIQUE(ruleset_id, customer_id)
);

-- customer_tags
CREATE TABLE customer_tags (
  id TEXT PRIMARY KEY DEFAULT 'ctag_' || nanoid(),
  customer_id TEXT NOT NULL REFERENCES customers(id),
  tag TEXT NOT NULL,
  applied_at TIMESTAMPTZ DEFAULT NOW(),
  applied_by_rule_id TEXT REFERENCES rules(id),
  UNIQUE(customer_id, tag)
);
```

### Phase 2: Rules Evaluation Engine
Location: `backend/lib/rules/`

```
backend/lib/rules/
├── index.ts              # Main exports
├── evaluator.ts          # Core evaluation logic
├── conditions/
│   ├── index.ts
│   ├── location-visit.ts
│   ├── spend-amount.ts
│   ├── product-purchase.ts
│   ├── time-window.ts
│   ├── day-of-week.ts
│   ├── date-range.ts
│   ├── time-of-day.ts
│   ├── customer-attribute.ts
│   ├── customer-tag.ts
│   └── rule-triggered.ts
├── awards/
│   ├── index.ts
│   ├── bonus-points.ts
│   ├── multiplier.ts
│   ├── unlock-reward.ts
│   └── apply-tag.ts
├── plain-language.ts     # Generate human-readable descriptions
└── simulator.ts          # Test simulation logic
```

Key evaluation flow:
1. Check if rule is active and within date range
2. Evaluate all conditions (AND by default, OR if specified)
3. For historical conditions, query visit_logs/transactions
4. If all conditions pass, apply all awards
5. Log to rule_triggers
6. Update ruleset_progress if part of a voyage

### Phase 3: Admin API Routes
Location: `backend/routes/admin/`

```typescript
// All routes require requireFeature() middleware
// All queries scoped by businessId from auth

// Rules
POST   /api/admin/rules              // Create rule
GET    /api/admin/rules              // List rules
GET    /api/admin/rules/:id          // Get rule
PUT    /api/admin/rules/:id          // Update rule
DELETE /api/admin/rules/:id          // Delete rule

// Rulesets (Voyages)
POST   /api/admin/rulesets           // Create ruleset
GET    /api/admin/rulesets           // List rulesets
GET    /api/admin/rulesets/:id       // Get ruleset with rules
PUT    /api/admin/rulesets/:id       // Update ruleset
DELETE /api/admin/rulesets/:id       // Delete ruleset

// Test Simulator
POST   /api/admin/rules/simulate/bulk      // Test rule against all customers
POST   /api/admin/rules/simulate/customer  // Test specific customer
POST   /api/admin/rules/simulate/what-if   // Hypothetical scenario
GET    /api/admin/rulesets/:id/progress    // Ruleset progress visualization
```

### Phase 4: Admin App UI
Location: `admin-app/`

Tech stack: React + Vite + TypeScript + TailwindCSS + React Query

```
admin-app/
├── src/
│   ├── components/
│   │   ├── rules/
│   │   │   ├── RuleBuilder.tsx       # Main form-based builder
│   │   │   ├── ConditionPicker.tsx   # Category-based condition selector
│   │   │   ├── ConditionBlock.tsx    # Visual condition with plain language
│   │   │   ├── AwardPicker.tsx       # Award type selector
│   │   │   ├── PlainLanguagePreview.tsx
│   │   │   └── RuleTemplates.tsx     # Starter templates
│   │   ├── rulesets/
│   │   │   ├── VoyageBuilder.tsx     # Visual flow diagram
│   │   │   ├── RuleChainEditor.tsx
│   │   │   └── VoyageProgress.tsx
│   │   ├── simulator/
│   │   │   ├── BulkSimulator.tsx
│   │   │   ├── CustomerTester.tsx
│   │   │   ├── WhatIfScenario.tsx
│   │   │   └── ProgressVisualizer.tsx
│   │   └── common/
│   │       ├── FeatureGate.tsx       # Tier-based feature gating
│   │       └── UpgradePrompt.tsx
│   ├── pages/
│   │   ├── RulesPage.tsx
│   │   ├── RuleBuilderPage.tsx
│   │   ├── VoyagesPage.tsx
│   │   ├── VoyageBuilderPage.tsx
│   │   └── SimulatorPage.tsx
│   └── hooks/
│       ├── useRules.ts
│       ├── useRulesets.ts
│       └── useSimulator.ts
```

### Phase 5: Customer App Updates
Update customer-app with pirate theme:

```
customer-app/src/
├── components/
│   ├── CaptainsLog.tsx      # Home screen
│   ├── TreasureMap.tsx      # Voyages list
│   ├── VoyageDetail.tsx     # Journey progress
│   ├── LootDrop.tsx         # Achievement animation
│   └── TreasureChest.tsx    # Rewards screen
```

## Critical Patterns

### Feature Gating
```typescript
// Backend middleware
router.post('/rules', requireFeature('RULES_BASIC'), createRule);
router.post('/rulesets', requireFeature('RULESETS'), createRuleset);

// Frontend component
<FeatureGate feature="RULES_ADVANCED" fallback={<UpgradePrompt />}>
  <TimeConditionPicker />
</FeatureGate>
```

### Plain Language Generation
Every rule must display a human-readable description:
```typescript
// "When customer visits Downtown Location 3 times on any weekend"
generatePlainLanguage(rule.conditions, rule.condition_logic);
```

### ID Prefixes
- Rules: `rule_`
- Rulesets: `rset_`
- Rule Triggers: `rtrig_`
- Ruleset Progress: `rsprog_`
- Customer Tags: `ctag_`

### Pirate Theme (Customer-Facing Only)
- Points → Doubloons
- Locations → Ports
- Customers → Crew Members
- Rewards → Treasure/Loot
- Rulesets → Voyages
- Rules (within voyage) → Quests

## Dev Commands
```bash
cd backend && npm run dev      # Port 3000
cd customer-app && npm run dev # Port 5174
cd admin-app && npm run dev    # Port 5175
```

## Test Credentials
- Admin: test@lootly.com / any password (magic link bypassed in dev)
- Customer: Use QR code scan flow or direct URL with business slug

## Start Here
1. Run existing migrations to see current schema
2. Create new migrations for rules engine tables
3. Implement condition evaluators one at a time with tests
4. Build admin API routes
5. Create admin app with rule builder
6. Add pirate theme to customer app

Good luck, Captain! 🏴‍☠️
