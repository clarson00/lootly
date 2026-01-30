# Questions & Notes for Review

> Items that need human input when you return.

---

## Schema Decisions Made

1. **Used JSONB instead of TEXT[] for array columns** - Drizzle doesn't have great support for PostgreSQL arrays, so `dependsOnRuleIds` and `completedRuleIds` use JSONB arrays instead.

2. **Kept legacy `awardType` and `awardValue` columns** - Added new `awards` JSONB array but kept old columns for backward compatibility with existing seed data.

3. **Named columns with camelCase in JS, snake_case in DB** - Following existing project convention.

---

## Questions

*None yet - will add as they arise*

---

## Completed Tasks

- [ ] Phase 1: Database Schema (in progress)
- [ ] Phase 2: Rules Evaluation Engine
- [ ] Phase 3: Admin API Routes
- [ ] Phase 4: Admin App UI
- [ ] Phase 5: Customer App Updates

---

*Last updated: Session start*
