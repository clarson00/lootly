# CLAUDE.md - Instructions for Claude Code

> **READ THIS FILE FIRST.** This file tells you how to work on this project.

## Your Role

You are building **Lootly**, a multi-tenant SaaS loyalty platform. You are responsible for:

1. Building the MVP according to the specifications
2. Maintaining all documentation
3. Tracking progress in `PROGRESS.md`
4. Following the architecture guidelines strictly

## Required Reading (Do This First!)

Before writing ANY code, read these files in order:

1. **`docs/SCOPE.md`** — Business requirements, product decisions, the "why"
2. **`docs/TECHNICAL_SPEC.md`** — Complete technical specification, the "what"
3. **`docs/ARCHITECTURE.md`** — Architecture and coding guidelines, the "how"
4. **`PROGRESS.md`** — Current progress and next steps
5. **`ROADMAP.md`** — Future features and ideas

## Project Structure

```
lootly/
├── CLAUDE.md              # This file - your instructions
├── PROGRESS.md            # Progress tracker (you maintain this)
├── ROADMAP.md             # Product roadmap (you maintain this)
├── README.md              # Project readme for humans
├── docs/
│   ├── SCOPE.md           # Business requirements
│   ├── TECHNICAL_SPEC.md  # Technical specification
│   ├── ARCHITECTURE.md    # Architecture guidelines
│   └── roadmap/           # Detailed specs for future features
│       └── [feature].md   # One file per planned feature
├── backend/               # Node.js + Express API
├── customer-app/          # React PWA for customers
└── staff-app/             # React PWA for staff
```

## Your Responsibilities

### 1. Read Before You Build

Every session, re-read the relevant docs to refresh context. Don't assume — verify against the specs.

### 2. Update PROGRESS.md

After completing any task:
- Mark it complete with ✅
- Add any notes or decisions made
- Update "Next Steps" section
- Log any blockers or questions

### 3. Maintain ROADMAP.md

When new ideas or future features are discussed:
- Add them to the appropriate section (NEXT, LATER, or Ideas Backlog)
- Create detailed spec files in `docs/roadmap/` when features are specified
- Link specs to the roadmap
- Update status as features progress
- Move completed features to the "Completed" section

### 4. Keep Docs in Sync

If you make a decision that changes the spec:
- Update the relevant doc
- Note the change in PROGRESS.md
- Explain why the change was made

### 5. Follow the Guidelines

The `ARCHITECTURE.md` file has strict DO's and DON'T's. Follow them. Key rules:
- Keep it simple — MVP only
- No TypeScript, Redux, GraphQL, or over-engineering
- Test each feature before moving to the next
- Commit after each working feature

### 6. Commit Often

```bash
git add .
git commit -m "Clear description of what was done"
```

Commit after:
- Each API endpoint is working
- Each page/screen is working
- Each major feature is complete

## How to Start a Session

```
1. Read PROGRESS.md to see where we left off
2. Check "Next Steps" for what to do
3. Read relevant sections of specs if needed
4. Build the next feature
5. Test it
6. Update PROGRESS.md
7. Commit
```

## How to Handle Uncertainty

If something is unclear:
1. Check the docs first — the answer is probably there
2. If not in docs, pick the simpler option
3. Document your decision in PROGRESS.md
4. Move on — don't get stuck

## Commands Reference

### Development
```bash
# Backend
cd backend && npm run dev

# Customer App
cd customer-app && npm run dev

# Staff App  
cd staff-app && npm run dev

# Seed database
cd backend && npm run seed
```

### Git
```bash
git add .
git commit -m "message"
git push origin main
```

### Testing
```bash
# Test API endpoint
curl http://localhost:3001/api/health

# Test with auth
curl -H "Authorization: Bearer TOKEN" http://localhost:3001/api/customers/me
```

## File Ownership

| File | Who Updates |
|------|-------------|
| `CLAUDE.md` | Human only (your instructions) |
| `PROGRESS.md` | You (Claude Code) |
| `ROADMAP.md` | You (Claude Code) |
| `docs/roadmap/*.md` | You, for future feature specs |
| `docs/SCOPE.md` | Human primarily, you can suggest edits |
| `docs/TECHNICAL_SPEC.md` | You, when implementation requires changes |
| `docs/ARCHITECTURE.md` | You, when patterns need updating |
| `README.md` | You, keep it current |
| All code files | You |

## Quality Checklist

Before saying a feature is "done":

- [ ] It works (tested manually)
- [ ] It handles errors gracefully
- [ ] It follows the patterns in ARCHITECTURE.md
- [ ] It matches the spec in TECHNICAL_SPEC.md
- [ ] PROGRESS.md is updated
- [ ] Code is committed

## Remember

- **Working > Perfect** — Ship it, improve later
- **Simple > Clever** — Boring code is good code  
- **Docs > Memory** — Write it down
- **Test > Assume** — Verify it works

Now go read the docs and check PROGRESS.md for your next task!
