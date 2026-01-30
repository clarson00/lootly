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

- [x] Phase 1: Database Schema (DONE - committed 80f7ec2)
- [x] Phase 2: Rules Evaluation Engine (DONE - committed 597333c)
- [x] Phase 3: Admin API Routes (DONE - committed 015df2a)
- [x] Phase 4: Admin App UI (DONE - committed 493851b)
- [x] Phase 5: Customer App Updates (DONE)

### Phase 5 Details
- Created `backend/routes/voyages.js` - Customer-facing voyage API endpoints
- Added voyage routes to server.js
- Updated `customer-app/src/api/client.js` with voyage methods
- Created `customer-app/src/pages/TreasureMap.jsx` - Voyages list page (pirate themed)
- Created `customer-app/src/pages/VoyageDetail.jsx` - Individual voyage progress page
- Updated `customer-app/src/App.jsx` with voyage routes
- Updated `customer-app/src/components/BottomNav.jsx` with Map tab (pirate labels)

---

*Last updated: Session start*
