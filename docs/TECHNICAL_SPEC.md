# Lootly MVP - Technical Specification

## Overview

Lootly is a multi-tenant SaaS loyalty platform. This spec covers the MVP for a pilot customer with 4 restaurant locations.

**What we're building:**
1. **Backend API** — Node.js + Express + SQLite
2. **Customer PWA** — React app for customers to earn/redeem rewards
3. **Staff PWA** — React app for staff to scan customers and enter spend

---

## Tech Stack

| Layer | Technology | Notes |
|-------|------------|-------|
| Backend | Node.js + Express | REST API |
| Database | SQLite with better-sqlite3 | Portable, no setup |
| Customer App | React + Vite | PWA, mobile-first |
| Staff App | React + Vite | PWA, tablet-optimized |
| QR Generation | qrcode library | Dynamic QR codes |
| QR Scanning | html5-qrcode | Camera-based scanning |
| Styling | Tailwind CSS | Fast, utility-first |
| Auth | SMS code (mock for MVP) | Phone number based |

---

## Project Structure

```
lootly/
├── backend/
│   ├── package.json
│   ├── server.js              # Express app entry
│   ├── db/
│   │   ├── database.js        # SQLite connection
│   │   ├── schema.sql         # Database schema
│   │   └── seed.js            # Seed data for pilot
│   ├── routes/
│   │   ├── auth.js            # Phone verification
│   │   ├── customers.js       # Customer endpoints
│   │   ├── businesses.js      # Business/location endpoints
│   │   ├── transactions.js    # Points/check-ins
│   │   ├── rewards.js         # Rewards and redemptions
│   │   └── staff.js           # Staff operations
│   └── middleware/
│       └── auth.js            # JWT verification
│
├── customer-app/
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   ├── public/
│   │   ├── manifest.json      # PWA manifest
│   │   └── icons/             # App icons
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── index.css          # Tailwind
│       ├── api/
│       │   └── client.js      # API client
│       ├── context/
│       │   └── AuthContext.jsx
│       ├── pages/
│       │   ├── Welcome.jsx
│       │   ├── Login.jsx
│       │   ├── Home.jsx
│       │   ├── MyCode.jsx
│       │   ├── Rewards.jsx
│       │   ├── RewardDetail.jsx
│       │   └── Profile.jsx
│       └── components/
│           ├── BottomNav.jsx
│           ├── ProgressBar.jsx
│           ├── RewardCard.jsx
│           ├── LocationBadge.jsx
│           └── LootDrop.jsx   # Celebration animation
│
├── staff-app/
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   ├── public/
│   │   └── manifest.json
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── index.css
│       ├── api/
│       │   └── client.js
│       ├── context/
│       │   └── StaffAuthContext.jsx
│       ├── pages/
│       │   ├── Login.jsx
│       │   ├── Scan.jsx
│       │   ├── EnterSpend.jsx
│       │   ├── Confirm.jsx
│       │   └── RedeemReward.jsx
│       └── components/
│           ├── Scanner.jsx
│           ├── NumPad.jsx
│           └── CustomerInfo.jsx
│
└── README.md
```

---

## Database Schema

```sql
-- Businesses (tenants)
CREATE TABLE businesses (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#f59e0b',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Locations within a business
CREATE TABLE locations (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  name TEXT NOT NULL,
  address TEXT,
  icon TEXT,  -- emoji or icon identifier
  qr_code TEXT UNIQUE,  -- unique QR identifier for this location
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Location groups (for scoping rules)
CREATE TABLE location_groups (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  name TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Junction table for location groups
CREATE TABLE location_group_members (
  group_id TEXT NOT NULL REFERENCES location_groups(id),
  location_id TEXT NOT NULL REFERENCES locations(id),
  PRIMARY KEY (group_id, location_id)
);

-- Customers
CREATE TABLE customers (
  id TEXT PRIMARY KEY,
  phone TEXT UNIQUE NOT NULL,
  name TEXT,
  email TEXT,
  qr_code TEXT UNIQUE NOT NULL,  -- unique QR code for this customer
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Customer enrollment in business loyalty programs
CREATE TABLE enrollments (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL REFERENCES customers(id),
  business_id TEXT NOT NULL REFERENCES businesses(id),
  points_balance INTEGER DEFAULT 0,
  total_points_earned INTEGER DEFAULT 0,
  total_spend REAL DEFAULT 0,
  points_multiplier REAL DEFAULT 1.0,  -- for bonus multipliers
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(customer_id, business_id)
);

-- Track visits to specific locations
CREATE TABLE visits (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL REFERENCES customers(id),
  location_id TEXT NOT NULL REFERENCES locations(id),
  spend_amount REAL,
  points_earned INTEGER,
  staff_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Earning rules
CREATE TABLE earning_rules (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  name TEXT NOT NULL,
  type TEXT NOT NULL,  -- 'visit', 'spend', 'product'
  points_per_visit INTEGER,       -- for visit type
  points_per_dollar REAL,         -- for spend type
  product_name TEXT,              -- for product type
  bonus_points INTEGER,           -- for product type
  location_group_id TEXT REFERENCES location_groups(id),  -- NULL = all locations
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Rewards
CREATE TABLE rewards (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,  -- emoji
  points_cost INTEGER NOT NULL,
  dollar_value REAL,
  reward_type TEXT NOT NULL,  -- 'discount', 'free_item', 'milestone'
  earning_location_group_id TEXT REFERENCES location_groups(id),  -- where points come from
  redemption_location_group_id TEXT REFERENCES location_groups(id),  -- where can redeem
  is_milestone BOOLEAN DEFAULT 0,  -- requires visiting all locations
  milestone_bonus_multiplier REAL,  -- e.g., 2.0 for double points
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Customer rewards (unlocked/redeemed)
CREATE TABLE customer_rewards (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL REFERENCES customers(id),
  reward_id TEXT NOT NULL REFERENCES rewards(id),
  status TEXT NOT NULL DEFAULT 'unlocked',  -- 'unlocked', 'redeemed', 'expired'
  unlocked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  redeemed_at DATETIME,
  redeemed_location_id TEXT REFERENCES locations(id),
  redemption_code TEXT UNIQUE
);

-- Staff users
CREATE TABLE staff (
  id TEXT PRIMARY KEY,
  location_id TEXT NOT NULL REFERENCES locations(id),
  name TEXT NOT NULL,
  pin TEXT NOT NULL,  -- simple PIN for MVP
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## Seed Data (Pilot Customer)

```javascript
// Business
const business = {
  id: 'biz_pilot',
  name: "Tony's Restaurant Group",
  logo_url: null,
  primary_color: '#f59e0b'
};

// 4 Locations
const locations = [
  { id: 'loc_1', business_id: 'biz_pilot', name: "Tony's Pizza", icon: '🍕', address: '123 Main St' },
  { id: 'loc_2', business_id: 'biz_pilot', name: "Casa Verde", icon: '🌮', address: '456 Oak Ave' },
  { id: 'loc_3', business_id: 'biz_pilot', name: "Bella Italia", icon: '🍝', address: '789 Elm St' },
  { id: 'loc_4', business_id: 'biz_pilot', name: "Dragon Wok", icon: '🥡', address: '321 Pine Rd' }
];

// Location group: All locations
const allLocationsGroup = {
  id: 'grp_all',
  business_id: 'biz_pilot',
  name: 'All Locations'
};

// Earning rule: 1 point per dollar spent
const earningRule = {
  id: 'rule_1',
  business_id: 'biz_pilot',
  name: 'Standard Earning',
  type: 'spend',
  points_per_dollar: 1,
  location_group_id: 'grp_all'
};

// Rewards
const rewards = [
  {
    id: 'reward_1',
    business_id: 'biz_pilot',
    name: 'Free Pizza',
    description: 'One free personal pizza at Tony\'s Pizza',
    icon: '🍕',
    points_cost: 100,
    dollar_value: 15,
    reward_type: 'free_item',
    redemption_location_group_id: null  // specific location
  },
  {
    id: 'reward_2',
    business_id: 'biz_pilot',
    name: 'Free Nachos',
    description: 'Free loaded nachos at Casa Verde',
    icon: '🌮',
    points_cost: 100,
    dollar_value: 12,
    reward_type: 'free_item'
  },
  {
    id: 'reward_3',
    business_id: 'biz_pilot',
    name: '$50 Off Grand Tour',
    description: 'Visit all 4 locations to unlock! $50 off your next order anywhere.',
    icon: '🏆',
    points_cost: 0,  // milestone based, not points
    dollar_value: 50,
    reward_type: 'milestone',
    is_milestone: true,
    milestone_bonus_multiplier: 2.0
  }
];
```

---

## API Endpoints

### Auth Routes (`/api/auth`)

```
POST /api/auth/request-code
  Body: { phone: "+15551234567" }
  Response: { success: true, message: "Code sent" }
  Note: For MVP, any code works or use "1234"

POST /api/auth/verify-code
  Body: { phone: "+15551234567", code: "1234" }
  Response: { token: "jwt...", customer: { id, phone, name, qr_code }, isNew: true/false }

GET /api/auth/me
  Headers: Authorization: Bearer <token>
  Response: { customer: { id, phone, name, email, qr_code } }
```

### Customer Routes (`/api/customers`)

```
PATCH /api/customers/profile
  Headers: Authorization: Bearer <token>
  Body: { name: "John", email: "john@email.com" }
  Response: { customer: { ... } }

GET /api/customers/qr-code
  Headers: Authorization: Bearer <token>
  Response: { qr_code: "cust_abc123", qr_data_url: "data:image/png;base64,..." }
```

### Business Routes (`/api/businesses`)

```
GET /api/businesses
  Response: { businesses: [{ id, name, logo_url, primary_color }] }

GET /api/businesses/:id
  Response: { business: { ... }, locations: [{ ... }] }

GET /api/businesses/:id/locations
  Response: { locations: [{ id, name, icon, address }] }
```

### Enrollment Routes (`/api/enrollments`)

```
POST /api/enrollments
  Headers: Authorization: Bearer <token>
  Body: { business_id: "biz_pilot" }
  Response: { enrollment: { id, points_balance, ... } }

GET /api/enrollments
  Headers: Authorization: Bearer <token>
  Response: { enrollments: [{ business, points_balance, locations_visited, ... }] }

GET /api/enrollments/:business_id
  Headers: Authorization: Bearer <token>
  Response: { enrollment: { ... }, visits: [{ ... }], rewards: [{ ... }] }
```

### Transaction Routes (`/api/transactions`)

```
POST /api/transactions/check-in
  Headers: Authorization: Bearer <token>
  Body: { location_id: "loc_1", spend_amount: 45.50 }
  Response: { 
    transaction: { id, points_earned, ... },
    new_balance: 145,
    milestones_unlocked: [{ reward_id, name, ... }],
    new_multiplier: 2.0  // if milestone unlocked
  }

GET /api/transactions/history
  Headers: Authorization: Bearer <token>
  Query: ?business_id=biz_pilot
  Response: { transactions: [{ ... }] }
```

### Rewards Routes (`/api/rewards`)

```
GET /api/rewards
  Headers: Authorization: Bearer <token>
  Query: ?business_id=biz_pilot
  Response: { 
    available_rewards: [{ ... }],  // can afford
    locked_rewards: [{ ... }],     // can't afford yet
    unlocked_rewards: [{ ... }]    // earned but not redeemed
  }

POST /api/rewards/:id/unlock
  Headers: Authorization: Bearer <token>
  Response: { 
    customer_reward: { id, redemption_code, ... },
    new_balance: 45
  }

GET /api/rewards/redemption/:code
  Response: { reward: { ... }, customer: { name } }
  Note: Used by staff to verify redemption
```

### Staff Routes (`/api/staff`)

```
POST /api/staff/login
  Body: { location_id: "loc_1", pin: "1234" }
  Response: { token: "jwt...", staff: { id, name }, location: { ... } }

GET /api/staff/customer/:qr_code
  Headers: Authorization: Bearer <staff_token>
  Response: { 
    customer: { id, name, phone },
    enrollment: { points_balance, ... },
    pending_rewards: [{ ... }]  // ready to redeem
  }

POST /api/staff/record-visit
  Headers: Authorization: Bearer <staff_token>
  Body: { customer_qr: "cust_abc123", spend_amount: 45.50 }
  Response: { 
    transaction: { ... },
    customer_new_balance: 145,
    milestones_unlocked: [{ ... }]
  }

POST /api/staff/redeem
  Headers: Authorization: Bearer <staff_token>
  Body: { redemption_code: "RED_xyz789" }
  Response: { 
    success: true,
    reward: { name, dollar_value },
    customer: { name }
  }
```

---

## Customer App Pages

### 1. Welcome Page (`/`)
- Lootly logo and branding
- "Get Started" button → Login
- Fun tagline: "Collect your loot!"

### 2. Login Page (`/login`)
- Phone number input with country code
- "Send Code" button
- Code verification input (4 digits)
- "Verify" button
- For MVP: accept any code or hardcode "1234"

### 3. Home Page (`/home`)
- Header: "Hey [Name]!" or "Hey there!" if no name
- Points balance prominently displayed
- Current program card showing:
  - Business name/logo
  - Points: 145 pts
  - Progress bar to next reward
  - Locations visited (4 circles, filled if visited)
  - "3 of 4 locations visited!"
- Quick action: "Show My Code" button

### 4. My Code Page (`/code`)
- Large QR code (scannable)
- Customer ID displayed below
- "Show this to the cashier"
- Current points balance
- Pull-to-refresh to update

### 5. Rewards Page (`/rewards`)
- Tabs: "Available" | "My Rewards"
- Available tab:
  - Cards for each reward showing: icon, name, points cost
  - Progress bar showing how close
  - "Unlock" button if can afford
- My Rewards tab:
  - Unlocked rewards ready to use
  - "Use Reward" button → shows redemption QR

### 6. Reward Detail Page (`/rewards/:id`)
- Large icon
- Reward name and description
- Where to redeem
- If unlocked: large redemption QR code
- If locked: points needed, progress

### 7. Profile Page (`/profile`)
- Phone number (read-only)
- Name (editable)
- Email (editable)
- "Save" button
- Transaction history link
- "Log out" button

### Loot Drop Animation
- Full-screen celebration when milestone unlocked
- Confetti animation
- "🎉 LOOT DROP! 🎉"
- Shows rewards unlocked
- "Claim Your Rewards" button

---

## Staff App Pages

### 1. Login Page (`/`)
- Location selector dropdown
- PIN input (4 digits)
- "Sign In" button
- Simple, fast

### 2. Scan Page (`/scan`)
- Large camera viewfinder
- "Scan Customer Code" instruction
- Location name at top
- Manual entry link: "Enter code manually"

### 3. Customer Found Page (`/customer`)
- Customer name (or "New Customer")
- Points balance
- "Record Purchase" button → Enter Spend
- If customer has rewards: "Has [X] rewards ready!"
- "Redeem Reward" button if applicable

### 4. Enter Spend Page (`/spend`)
- Large number display
- Numeric keypad
- Clear/backspace buttons
- "Confirm $XX.XX" button
- Shows points they'll earn: "+45 pts"

### 5. Confirmation Page (`/confirm`)
- ✅ Success checkmark
- "Points Added!"
- Amount: $45.50
- Points earned: +45 pts
- New balance: 145 pts
- If milestone: "🎉 They unlocked a reward!"
- "Done" button → back to Scan

### 6. Redeem Reward Page (`/redeem`)
- Scan redemption QR from customer's phone
- Shows reward details
- "Confirm Redemption" button
- Success confirmation

---

## PWA Configuration

### Customer App `manifest.json`
```json
{
  "name": "Lootly",
  "short_name": "Lootly",
  "description": "Collect your loot!",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0f0f1a",
  "theme_color": "#f59e0b",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

### Staff App `manifest.json`
```json
{
  "name": "Lootly Staff",
  "short_name": "Lootly Staff",
  "description": "Staff terminal for Lootly",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#1a1a2e",
  "theme_color": "#10b981",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

---

## QR Code Specs

### Customer QR Code
- Format: `lootly:customer:<customer_id>`
- Example: `lootly:customer:cust_abc123def`
- Generated on customer creation
- Displayed in app with high contrast for scanning

### Redemption QR Code
- Format: `lootly:redeem:<redemption_code>`
- Example: `lootly:redeem:RED_xyz789abc`
- Generated when reward is unlocked
- One-time use, invalidated after redemption

### Location QR Code (optional, for self-service)
- Format: `lootly:location:<location_id>`
- Example: `lootly:location:loc_1`
- Posted at register for customer scanning
- Not used in MVP (staff records visits)

---

## Environment Variables

### Backend `.env`
```
PORT=3001
JWT_SECRET=your-secret-key-change-in-production
DATABASE_PATH=./db/lootly.db
CORS_ORIGIN=http://localhost:5173,http://localhost:5174
```

### Customer App `.env`
```
VITE_API_URL=http://localhost:3001/api
```

### Staff App `.env`
```
VITE_API_URL=http://localhost:3001/api
```

---

## Composable Rules Engine

The rules engine uses building blocks combined with AND/OR logic to create flexible, powerful rules.

### Building Blocks

| Block Type | Options |
|------------|---------|
| **Subject** | Any location, specific location, location group, product, category |
| **Action** | Visit, spend, buy item, check-in |
| **Quantity** | Count (visits), amount ($), points |
| **Comparison** | =, >=, <=, >, < |
| **Time Window** | Within X days, this week, this month, all time |

### Operators

- **AND** — All conditions must be true
- **OR** — Any condition can be true
- **Nested groups** — (A AND B) OR (C AND D)

### Rule Examples

```
Rule: "Weekend Warrior"
(Visit >= 2 locations) AND (within 7 days)
→ Award: 50 bonus points

Rule: "Grand Tour"
(Visit Location A) AND (Visit Location B) AND (Visit Location C) AND (Visit Location D)
→ Award: $50 reward + 2x multiplier

Rule: "Big Spender"
(Spend >= $100) AND (Location = Any)
→ Award: 25 bonus points

Rule: "Taco Tuesday"
(Buy "Taco Platter") AND (Location = Casa Verde) AND (Day = Tuesday)
→ Award: 10 bonus points

Rule: "Combo Deal"
((Visit >= 2 locations) AND (within 7 days)) OR (Spend >= $75 at single location)
→ Award: Free appetizer
```

### Database Schema for Rules

```sql
-- Rules table
CREATE TABLE rules (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  name TEXT NOT NULL,
  description TEXT,
  conditions JSON NOT NULL,  -- Stored as JSON structure
  award_type TEXT NOT NULL,  -- 'points', 'reward', 'multiplier'
  award_value TEXT NOT NULL, -- Points amount, reward_id, or multiplier value
  is_active BOOLEAN DEFAULT 1,
  is_repeatable BOOLEAN DEFAULT 0,  -- Can trigger multiple times?
  cooldown_days INTEGER,  -- Days before can trigger again
  start_date DATETIME,
  end_date DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Track which rules customers have triggered
CREATE TABLE customer_rule_triggers (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL REFERENCES customers(id),
  rule_id TEXT NOT NULL REFERENCES rules(id),
  triggered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  award_given TEXT  -- What was awarded
);
```

### JSON Condition Structure

**Simple condition:**
```json
{
  "subject": "location",
  "scope": "any",           
  "action": "visit",
  "comparison": ">=",
  "value": 2
}
```

**Time window condition:**
```json
{
  "type": "time_window",
  "unit": "days",
  "value": 7
}
```

**Location-specific condition:**
```json
{
  "subject": "location",
  "scope": "specific",
  "location_id": "loc_1",
  "action": "visit",
  "comparison": ">=",
  "value": 1
}
```

**Spend condition:**
```json
{
  "subject": "location",
  "scope": "any",
  "action": "spend",
  "comparison": ">=",
  "value": 100
}
```

**Product condition:**
```json
{
  "subject": "product",
  "product_name": "Taco Platter",
  "action": "buy",
  "comparison": ">=",
  "value": 1
}
```

**Day of week condition:**
```json
{
  "type": "day_of_week",
  "days": ["tuesday"]
}
```

### Combined Rule Examples (JSON)

**Weekend Warrior:**
```json
{
  "id": "rule_weekend_warrior",
  "name": "Weekend Warrior",
  "description": "Visit 2 locations in a week",
  "conditions": {
    "operator": "AND",
    "items": [
      {
        "subject": "location",
        "scope": "any",
        "action": "visit",
        "comparison": ">=",
        "value": 2
      },
      {
        "type": "time_window",
        "unit": "days",
        "value": 7
      }
    ]
  },
  "award_type": "points",
  "award_value": "50",
  "is_repeatable": true,
  "cooldown_days": 7
}
```

**Grand Tour (Visit All 4):**
```json
{
  "id": "rule_grand_tour",
  "name": "Grand Tour",
  "description": "Visit all 4 locations to unlock epic rewards!",
  "conditions": {
    "operator": "AND",
    "items": [
      { "subject": "location", "scope": "specific", "location_id": "loc_1", "action": "visit", "comparison": ">=", "value": 1 },
      { "subject": "location", "scope": "specific", "location_id": "loc_2", "action": "visit", "comparison": ">=", "value": 1 },
      { "subject": "location", "scope": "specific", "location_id": "loc_3", "action": "visit", "comparison": ">=", "value": 1 },
      { "subject": "location", "scope": "specific", "location_id": "loc_4", "action": "visit", "comparison": ">=", "value": 1 }
    ]
  },
  "award_type": "reward",
  "award_value": "reward_grand_tour",
  "is_repeatable": false
}
```

**Combo Deal (OR logic):**
```json
{
  "id": "rule_combo_deal",
  "name": "Combo Deal",
  "description": "Visit 2 locations in a week OR spend $75 at one location",
  "conditions": {
    "operator": "OR",
    "items": [
      {
        "operator": "AND",
        "items": [
          { "subject": "location", "scope": "any", "action": "visit", "comparison": ">=", "value": 2 },
          { "type": "time_window", "unit": "days", "value": 7 }
        ]
      },
      {
        "subject": "location",
        "scope": "single_transaction",
        "action": "spend",
        "comparison": ">=",
        "value": 75
      }
    ]
  },
  "award_type": "reward",
  "award_value": "reward_free_appetizer",
  "is_repeatable": true,
  "cooldown_days": 30
}
```

### Rules Engine Evaluation Logic

```javascript
function evaluateRule(rule, customerId, currentTransaction) {
  // Check if already triggered (for non-repeatable rules)
  if (!rule.is_repeatable && hasTriggered(customerId, rule.id)) {
    return { triggered: false, reason: 'already_triggered' };
  }
  
  // Check cooldown
  if (rule.cooldown_days && isInCooldown(customerId, rule.id, rule.cooldown_days)) {
    return { triggered: false, reason: 'cooldown' };
  }
  
  // Check date range
  if (rule.start_date && new Date() < new Date(rule.start_date)) {
    return { triggered: false, reason: 'not_started' };
  }
  if (rule.end_date && new Date() > new Date(rule.end_date)) {
    return { triggered: false, reason: 'expired' };
  }
  
  // Evaluate conditions
  const result = evaluateConditions(rule.conditions, customerId, currentTransaction);
  
  if (result) {
    return { triggered: true, award_type: rule.award_type, award_value: rule.award_value };
  }
  
  return { triggered: false, reason: 'conditions_not_met' };
}

function evaluateConditions(conditions, customerId, currentTransaction) {
  // Single condition
  if (!conditions.operator) {
    return evaluateSingleCondition(conditions, customerId, currentTransaction);
  }
  
  // AND/OR group
  const results = conditions.items.map(item => 
    evaluateConditions(item, customerId, currentTransaction)
  );
  
  if (conditions.operator === 'AND') {
    return results.every(r => r === true);
  } else if (conditions.operator === 'OR') {
    return results.some(r => r === true);
  }
  
  return false;
}

function evaluateSingleCondition(condition, customerId, currentTransaction) {
  switch (condition.type) {
    case 'time_window':
      // Time window is a modifier, always returns true
      // The time constraint is applied when fetching data
      return true;
      
    case 'day_of_week':
      const today = new Date().toLocaleDateString('en-US', { weekday: 'lowercase' });
      return condition.days.includes(today);
      
    default:
      return evaluateSubjectCondition(condition, customerId, currentTransaction);
  }
}

function evaluateSubjectCondition(condition, customerId, currentTransaction) {
  const { subject, scope, action, comparison, value } = condition;
  
  // Get relevant data based on subject and scope
  let actualValue;
  
  if (subject === 'location') {
    if (action === 'visit') {
      actualValue = countVisits(customerId, scope, condition.location_id, getTimeWindow(condition));
    } else if (action === 'spend') {
      actualValue = sumSpend(customerId, scope, condition.location_id, getTimeWindow(condition));
    }
  } else if (subject === 'product') {
    actualValue = countProductPurchases(customerId, condition.product_name, getTimeWindow(condition));
  }
  
  // Compare
  return compare(actualValue, comparison, value);
}

function compare(actual, operator, expected) {
  switch (operator) {
    case '=': return actual === expected;
    case '>=': return actual >= expected;
    case '<=': return actual <= expected;
    case '>': return actual > expected;
    case '<': return actual < expected;
    default: return false;
  }
}
```

### MVP Implementation

For MVP, implement:
1. Core evaluation engine (AND/OR logic)
2. Visit-based conditions
3. Spend-based conditions
4. Time window conditions
5. Basic admin UI with preset templates

Post-MVP:
- Full visual rule builder
- Product-based conditions
- Day of week conditions
- Complex nested rules
- Rule analytics (which rules fire most, etc.)

---

## Key Business Logic

### Points Calculation
```javascript
function calculatePoints(spendAmount, earningRules, enrollment) {
  let points = 0;
  
  for (const rule of earningRules) {
    if (rule.type === 'spend') {
      points += Math.floor(spendAmount * rule.points_per_dollar);
    } else if (rule.type === 'visit') {
      points += rule.points_per_visit;
    }
  }
  
  // Apply multiplier (e.g., 2x after milestone)
  points = Math.floor(points * enrollment.points_multiplier);
  
  return points;
}
```

### After Each Transaction — Check All Rules
```javascript
function processTransaction(customerId, transaction) {
  // 1. Calculate and award base points
  const points = calculatePoints(transaction.spend_amount, getEarningRules(), getEnrollment(customerId));
  addPoints(customerId, points);
  
  // 2. Check all active rules
  const activeRules = getActiveRules(transaction.business_id);
  const triggeredAwards = [];
  
  for (const rule of activeRules) {
    const result = evaluateRule(rule, customerId, transaction);
    if (result.triggered) {
      // Record the trigger
      recordRuleTrigger(customerId, rule.id);
      
      // Award based on type
      if (result.award_type === 'points') {
        addPoints(customerId, parseInt(result.award_value));
        triggeredAwards.push({ type: 'points', value: result.award_value, rule_name: rule.name });
      } else if (result.award_type === 'reward') {
        unlockReward(customerId, result.award_value);
        triggeredAwards.push({ type: 'reward', reward_id: result.award_value, rule_name: rule.name });
      } else if (result.award_type === 'multiplier') {
        setMultiplier(customerId, parseFloat(result.award_value));
        triggeredAwards.push({ type: 'multiplier', value: result.award_value, rule_name: rule.name });
      }
    }
  }
  
  return { points_earned: points, triggered_awards: triggeredAwards };
}
```

---

## Build & Run Instructions

### Backend
```bash
cd backend
npm install
npm run seed    # Populate database with pilot data
npm run dev     # Start with nodemon
```

### Customer App
```bash
cd customer-app
npm install
npm run dev     # Starts on localhost:5173
```

### Staff App
```bash
cd staff-app
npm install
npm run dev     # Starts on localhost:5174
```

### Deploy to Replit
1. Create new Replit
2. Import from GitHub or upload files
3. Set environment variables in Secrets
4. Run `npm install && npm start`

---

## Testing Flow

### Happy Path Test
1. Open customer app, enter phone number
2. Verify with code "1234"
3. See home page with 0 points
4. Open staff app, log in with PIN "1234"
5. Scan customer QR
6. Enter spend amount $50
7. Confirm → customer gets 50 points
8. Repeat at all 4 locations
9. After 4th visit → milestone unlocked!
10. Customer sees loot drop animation
11. Customer goes to rewards, sees unlocked rewards
12. Customer selects reward, shows redemption QR
13. Staff scans redemption QR
14. Staff confirms → reward marked as used

---

## Future Enhancements (Post-MVP)
- Push notifications
- Admin dashboard
- Multiple businesses per customer
- POS integrations
- Receipt scanning
- Product-specific bonuses
- Expiring rewards
- Referral system
- Analytics dashboard

---

## Notes for Claude Code

1. Start with backend - get database and API working first
2. Test each endpoint with curl or Postman
3. Then build customer app, test against backend
4. Then build staff app
5. Use placeholder/mock data for testing
6. Keep it simple - MVP only, no over-engineering
7. Make sure QR scanning works on mobile browsers
8. Test PWA installation on actual phone

**Priority order:**
1. Database setup + seed data
2. Auth endpoints
3. Customer app: login → home → my code
4. Staff app: login → scan → enter spend → confirm
5. Customer app: rewards display
6. Staff app: redemption flow
7. Milestone detection + loot drop animation
8. Polish and PWA config

Let's build this! 🚀
