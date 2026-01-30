# Lootly - Progress Tracker

> **This file is maintained by Claude Code.** It tracks what's been done, what's next, and any decisions made.

## Project Status

| Component | Status | Notes |
|-----------|--------|-------|
| Project Setup | ✅ Complete | Folder structure, docs organized |
| Backend API | ✅ Complete | All routes working, database seeded |
| Customer App | 🟡 In Progress | Starting now |
| Staff App | 🔲 Not Started | |
| Integration Testing | 🔲 Not Started | |

**Legend:** 🔲 Not Started | 🟡 In Progress | ✅ Complete | ⚠️ Blocked

---

## Completed Tasks

### Project Setup
- [x] Initialize git repo
- [x] Create folder structure
- [x] Create .gitignore
- [x] Create README.md
- [x] Set up docs folder with spec files

### Backend
- [x] package.json and dependencies
- [x] Database schema (schema.sql)
- [x] Database connection (database.js)
- [x] Seed data (seed.js)
- [x] Auth routes (request-code, verify-code, me)
- [x] Customer routes (profile, qr-code)
- [x] Business routes (list, get, locations)
- [x] Enrollment routes (create, list, get)
- [x] Transaction routes (check-in, history)
- [x] Rewards routes (list, unlock, redemption)
- [x] Staff routes (login, customer lookup, record-visit, redeem)
- [x] Rules engine (evaluation logic)
- [x] JWT middleware

### Customer App
- [ ] Vite + React setup
- [ ] Tailwind CSS setup
- [ ] PWA manifest and icons
- [ ] API client
- [ ] Auth context
- [ ] Welcome page
- [ ] Login page (phone + code)
- [ ] Home page (points, progress)
- [ ] My Code page (QR display)
- [ ] Rewards page (available, unlocked)
- [ ] Reward detail page
- [ ] Profile page
- [ ] Bottom navigation
- [ ] Loot drop animation

### Staff App
- [ ] Vite + React setup
- [ ] Tailwind CSS setup
- [ ] PWA manifest
- [ ] API client
- [ ] Staff auth context
- [ ] Login page (location + PIN)
- [ ] Scan page (camera)
- [ ] Customer found page
- [ ] Enter spend page (numpad)
- [ ] Confirmation page
- [ ] Redeem reward page

### Integration
- [ ] Full check-in flow tested
- [ ] Full redemption flow tested
- [ ] Milestone trigger tested
- [ ] Multi-location tracking tested

---

## Next Steps

1. ~~**Initialize project structure**~~ ✅ Done
2. ~~**Set up backend**~~ ✅ Done
3. **Build Customer App** (In Progress)
   - Set up Vite + React + Tailwind
   - Create PWA manifest
   - Build all pages
4. **Build Staff App**
5. **Integration Testing**

---

## Decisions Log

| Date | Decision | Reason |
|------|----------|--------|
| 2026-01-29 | Use sql.js instead of better-sqlite3 | better-sqlite3 requires native compilation with Visual Studio, sql.js is pure JS |

*Record any decisions that deviate from or clarify the specs here.*

---

## Blockers & Questions

*List anything that's blocking progress or needs human input.*

- None currently

---

## Session Log

### Session 1 - 2026-01-29
**Started:** Project setup and backend
**Completed:**
- Created folder structure (backend, customer-app, staff-app, docs)
- Organized spec files into docs folder
- Created .gitignore
- Updated README.md
- Built complete backend API:
  - Express server with all routes
  - SQLite database with sql.js (pure JS, no native deps)
  - All API endpoints working
  - Database seeded with pilot data
  - JWT authentication for customers and staff
  - Rules engine for milestones

**Notes:** Backend complete and tested. Starting customer app next.

---

*Last updated: 2026-01-29*
