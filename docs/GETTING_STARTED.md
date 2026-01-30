# Lootly - Getting Started with Claude Code

## What You Have

| File | What it is |
|------|------------|
| `lootly-getting-started.md` | Your setup instructions (keep for yourself) |
| `lootly-CLAUDE.md` | Master instructions for Claude Code (rename to `CLAUDE.md`) |
| `lootly-PROGRESS.md` | Progress tracker Claude Code maintains (rename to `PROGRESS.md`) |
| `lootly-ROADMAP.md` | Product roadmap Claude Code maintains (rename to `ROADMAP.md`) |
| `lootly-technical-spec.md` | Technical specification (goes in `docs/TECHNICAL_SPEC.md`) |
| `lootly-architecture-guidelines.md` | Architecture guidelines (goes in `docs/ARCHITECTURE.md`) |
| `loyalty-app-scope.md` | Business scope (goes in `docs/SCOPE.md`) |

## Prerequisites

Before starting, make sure you have:

- [ ] Node.js installed (v18 or later) — https://nodejs.org
- [ ] Git installed — https://git-scm.com
- [ ] Claude Code CLI installed — `npm install -g @anthropic-ai/claude-code`
- [ ] GitHub account
- [ ] A code editor (VS Code recommended)

## Setup Steps

### 1. Create GitHub Repository

1. Go to https://github.com/new
2. Name it `lootly`
3. Make it private (recommended for now)
4. Do NOT initialize with README (we'll create our own)
5. Click "Create repository"

### 2. Clone and Set Up Locally

```bash
# Clone the empty repo
git clone https://github.com/YOUR_USERNAME/lootly.git
cd lootly

# Create folder structure
mkdir -p docs
```

### 3. Add the Spec Files

Copy your downloaded files into the project:

```bash
# Rename and move files
cp ~/Downloads/lootly-CLAUDE.md ./CLAUDE.md
cp ~/Downloads/lootly-PROGRESS.md ./PROGRESS.md
cp ~/Downloads/lootly-ROADMAP.md ./ROADMAP.md
cp ~/Downloads/lootly-technical-spec.md ./docs/TECHNICAL_SPEC.md
cp ~/Downloads/lootly-architecture-guidelines.md ./docs/ARCHITECTURE.md
cp ~/Downloads/loyalty-app-scope.md ./docs/SCOPE.md

# Create roadmap specs folder
mkdir -p docs/roadmap
```

### 4. Initial Commit

```bash
git add .
git commit -m "Initial setup with project specs"
git push origin main
```

### 5. Start Claude Code

```bash
claude
```

### 6. Give Claude Code the Kickoff Prompt

```
Read CLAUDE.md for your instructions, then read all docs in the docs/ folder.

Start by:
1. Creating a proper .gitignore
2. Creating a README.md for the project  
3. Setting up the folder structure as specified
4. Then begin building the backend

Update PROGRESS.md as you complete each task. Commit after each major milestone.
```

### 7. Let It Build!

Claude Code will:
- Read all the specs and guidelines
- Create the project structure
- Build backend, then customer app, then staff app
- Track progress in PROGRESS.md
- Commit as it goes

## Resuming Work

If you stop and come back later:

```bash
cd lootly
claude
```

Then tell it:

```
Read CLAUDE.md and PROGRESS.md to see where we left off. Continue from the next step.
```

## Testing Locally

Once built:

```bash
# Terminal 1 - Backend
cd backend
npm run seed   # First time only
npm run dev

# Terminal 2 - Customer App
cd customer-app
npm run dev

# Terminal 3 - Staff App
cd staff-app
npm run dev
```

Open in browser:
- Customer App: http://localhost:5173
- Staff App: http://localhost:5174

## Testing on Your Phone

1. Find your computer's IP address
   - Mac: `ifconfig | grep inet`
   - Windows: `ipconfig`
2. Make sure phone is on same WiFi
3. Open `http://YOUR_IP:5173` on phone
4. Add to home screen for app-like experience

## Deploying

Once working locally, push to GitHub:

```bash
git add .
git commit -m "MVP complete"
git push origin main
```

Then connect your hosting platform (Replit, Vercel, Railway) to the GitHub repo for auto-deploys.

## Testing Flow

1. Open customer app on phone
2. Enter any phone number, verify with code "1234"
3. Open staff app on tablet/computer
4. Log in with PIN "1234"
5. On staff app: scan customer's QR code
6. Enter a spend amount (e.g., $25)
7. Confirm → customer sees points added
8. Repeat at all 4 "locations"
9. After 4th visit → customer sees LOOT DROP!
10. Customer can now see and redeem rewards

## Troubleshooting

**Claude Code seems lost?**
- Tell it to re-read CLAUDE.md and PROGRESS.md

**Camera not working for QR scan?**
- Needs HTTPS in production, but works on localhost
- Check browser permissions

**Can't connect from phone?**
- Same WiFi network?
- Check firewall settings

**Database errors?**
- Delete `backend/db/lootly.db`
- Run `npm run seed` again

## Getting Help

Come back to this Claude.ai chat with questions! You can:
- Ask for help debugging issues
- Request changes to the specs
- Get guidance on next steps

Good luck! 🚀
