# Lootly - Progress Tracker

> **This file is maintained by Claude Code.** It tracks what's been done, what's next, and any decisions made.

## Project Status

| Component | Status | Notes |
|-----------|--------|-------|
| Project Setup | ✅ Complete | Folder structure, docs organized |
| Backend API | 🟡 In Progress | Starting now |
| Customer App | 🔲 Not Started | |
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
- [ ] package.json and dependencies
- [ ] Database schema (schema.sql)
- [ ] Database connection (database.js)
- [ ] Seed data (seed.js)
- [ ] Auth routes (request-code, verify-code, me)
- [ ] Customer routes (profile, qr-code)
- [ ] Business routes (list, get, locations)
- [ ] Enrollment routes (create, list, get)
- [ ] Transaction routes (check-in, history)
- [ ] Rewards routes (list, unlock, redemption)
- [ ] Staff routes (login, customer lookup, record-visit, redeem)
- [ ] Rules engine (evaluation logic)
- [ ] JWT middleware

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
2. **Set up backend** (In Progress)
   - Initialize package.json
   - Install dependencies
   - Create database schema
   - Create seed data
   - Build API endpoints

3. **Build Customer App**
4. **Build Staff App**
5. **Integration Testing**

---

## Decisions Log

| Date | Decision | Reason |
|------|----------|--------|
| | | |

*Record any decisions that deviate from or clarify the specs here.*

---

## Blockers & Questions

*List anything that's blocking progress or needs human input.*

- None currently

---

## Session Log

### Session 1 - 2026-01-29
**Started:** Project setup
**Completed:**
- Created folder structure (backend, customer-app, staff-app, docs)
- Organized spec files into docs folder
- Created .gitignore
- Updated README.md

**Notes:** Starting backend build next.

---

*Last updated: 2026-01-29*
