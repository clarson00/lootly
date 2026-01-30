# Lootly

Multi-tenant SaaS loyalty platform MVP.

## Overview

Lootly helps businesses reward customer loyalty through points, milestones, and rewards. This MVP includes:

- **Backend API** - Node.js + Express + SQLite
- **Customer App** - React PWA for earning/redeeming rewards
- **Staff App** - React PWA for recording visits and redemptions

## Quick Start

### Backend

```bash
cd backend
npm install
npm run seed    # Initialize database with pilot data
npm run dev     # Start server on http://localhost:3001
```

### Customer App

```bash
cd customer-app
npm install
npm run dev     # Start on http://localhost:5173
```

### Staff App

```bash
cd staff-app
npm install
npm run dev     # Start on http://localhost:5174
```

## Pilot Data

The seed script creates a test business "Tony's Restaurant Group" with 4 locations:
- Tony's Pizza
- Casa Verde
- Bella Italia
- Dragon Wok

### Test Credentials

- **Customer login**: Any phone number, verification code `1234`
- **Staff login**: Select any location, PIN `1234`

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Node.js + Express |
| Database | SQLite (better-sqlite3) |
| Frontend | React + Vite |
| Styling | Tailwind CSS |
| QR Codes | qrcode + html5-qrcode |

## Project Structure

```
lootly/
├── backend/           # Express API server
├── customer-app/      # Customer PWA
├── staff-app/         # Staff PWA
├── docs/              # Project documentation
│   ├── TECHNICAL_SPEC.md
│   ├── ARCHITECTURE.md
│   └── SCOPE.md
├── CLAUDE.md          # Claude Code instructions
├── PROGRESS.md        # Progress tracker
├── ROADMAP.md         # Product roadmap
└── README.md
```

## API Endpoints

### Auth
- `POST /api/auth/request-code` - Request SMS code
- `POST /api/auth/verify-code` - Verify code and get JWT
- `GET /api/auth/me` - Get current user

### Customers
- `PATCH /api/customers/profile` - Update profile
- `GET /api/customers/qr-code` - Get QR code

### Enrollments
- `POST /api/enrollments` - Enroll in loyalty program
- `GET /api/enrollments` - List enrollments
- `GET /api/enrollments/:business_id` - Get enrollment details

### Transactions
- `POST /api/transactions/check-in` - Record visit (customer)
- `GET /api/transactions/history` - Transaction history

### Rewards
- `GET /api/rewards` - List available rewards
- `POST /api/rewards/:id/unlock` - Unlock a reward
- `GET /api/rewards/redemption/:code` - Verify redemption code

### Staff
- `POST /api/staff/login` - Staff authentication
- `GET /api/staff/customer/:qr_code` - Look up customer
- `POST /api/staff/record-visit` - Record customer visit
- `POST /api/staff/redeem` - Process reward redemption

## License

Private - All rights reserved
