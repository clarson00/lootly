# Loyalty App Platform — Scope Document

## Overview

A multi-tenant loyalty platform that enables business owners to create and manage customizable rewards programs across multiple locations. Customers use a single app to participate in loyalty programs from various businesses.

---

## Platform Structure

### Hierarchy

```
Platform (your brand)
└── Loyalty Programs (one per business owner)
    └── Locations (individual stores/restaurants)
        └── Location Groups (logical groupings for rules)
```

### Multi-Tenancy

- Generic app under your brand name
- Users can join multiple loyalty programs
- Each business owner's program is isolated
- Owners configure their own branding (logo, colors, name)

---

## User Types

### 1. Customers

- Download the app
- Join one or more loyalty programs
- Earn points by scanning QR codes, purchases, etc.
- Track progress and redeem rewards
- Receive push notifications

### 2. Business Owners / Admins

- Access web-based admin dashboard
- Configure loyalty program settings
- Manage locations and location groups
- Create earning rules and rewards
- View customer activity and analytics
- Generate QR codes for locations

### 3. Staff (Future consideration)

- Confirm customer claims
- Validate reward redemptions
- Possibly via a staff mode in the app or separate interface

---

## Customer App Features

### Authentication

- Phone number as primary identity
- SMS verification code
- Solves device switching/loss automatically
- No passwords required

### Progressive Registration

- Enter phone number to start (minimal friction)
- Begin earning rewards immediately
- Prompted to complete profile (name, email) when claiming first reward
- Motivation to provide info comes after they have something to lose

### Core Features

- Browse/search for loyalty programs to join
- Scan QR codes at locations to check in
- View points balance and earning history
- See progress toward rewards
- View available and earned rewards
- Redeem rewards (generates redemption code or QR)
- Push notifications (rewards earned, expiring, promotions)

---

## Admin Dashboard Features

### Business Management

- Business profile and branding
- Contact information
- Subscription/billing (future)

### Location Management

- Add/edit/remove locations
- Location details (name, address, type)
- Generate unique QR codes per location
- Activate/deactivate locations

### Location Groups

- Create reusable groupings of locations
- Examples: "All Locations", "Downtown Spots", "Pizza Places"
- Used when configuring earning rules and rewards
- Simplifies rule creation

### Earning Rules Configuration

#### Composable Rules Engine

Rules are built from **building blocks** combined with **AND/OR logic**:

**Building Blocks:**
| Block Type | Options |
|------------|---------|
| Subject | Any location, specific location, location group, product, category |
| Action | Visit, spend, buy item, check-in |
| Quantity | Count (visits), amount ($), points |
| Comparison | =, >=, <=, >, < |
| Time Window | Within X days, this week, this month, all time |

**Operators:**
- **AND** — All conditions must be true
- **OR** — Any condition can be true
- **Nested groups** — (A AND B) OR (C AND D)

**Example Rules Built from Blocks:**

| Rule Name | Logic | Award |
|-----------|-------|-------|
| Weekend Warrior | (Visit >= 2 locations) AND (within 7 days) | 50 bonus points |
| Grand Tour | (Visit Loc A) AND (Visit Loc B) AND (Visit Loc C) AND (Visit Loc D) | $50 reward + 2x multiplier |
| Big Spender | (Spend >= $100) AND (Location = Any) | 25 bonus points |
| Taco Tuesday | (Buy "Taco Platter") AND (Location = Casa Verde) AND (Day = Tuesday) | 10 bonus points |
| Combo Deal | ((Visit >= 2 locations) AND (within 7 days)) OR (Spend >= $75 single visit) | Free appetizer |

**Admin UI — Visual Rule Builder:**
```
┌─────────────────────────────────────────────┐
│ Rule: Weekend Warrior                       │
├─────────────────────────────────────────────┤
│ IF:                                         │
│ ┌─────────────────────────────────────────┐ │
│ │ [Visit] [Any Location] [>= 2] times     │ │
│ └─────────────────────────────────────────┘ │
│                   AND                       │
│ ┌─────────────────────────────────────────┐ │
│ │ [Within] [7] [days]                     │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ [+ Add Condition]  [+ Add Group (OR/AND)]   │
├─────────────────────────────────────────────┤
│ THEN AWARD:                                 │
│ [50] [bonus points]                         │
│       — or —                                │
│ [Unlock reward ▼]                           │
└─────────────────────────────────────────────┘
```

**Additional Rule Options:**
- Repeatable vs one-time
- Cooldown period (can't trigger again for X days)
- Date range (only active during promotion period)
- Stackable with other rules

**Competitive Advantage:** This flexibility is Lootly's moat — most loyalty apps have rigid rules. Lootly adapts to any business model or promotion idea.

#### Basic Earning Types (built on rules engine):
- **Visit-based:** X points per check-in
- **Spend-based:** X points per dollar (requires POS integration)
- **Product-based:** Bonus points for specific items

- **Product Bonuses:**
  - Flat bonus (buy item, get X points)
  - Multiplier (item earns Nx points)
  - Time-limited (valid during date range)
  - Location-scoped (promo at specific locations)

- **Earning Scope:**
  - Single location
  - Set of locations (location group)
  - All locations

### Rewards Configuration

- **Reward Definition:**
  - Name and description
  - Point cost to unlock
  - Reward value/type (discount, free item, etc.)

- **Earning Scope:**
  - Which locations' points count toward this reward
  - Single location, location group, or all

- **Redemption Scope:**
  - Where the reward can be redeemed
  - Single location, location group, or all

- **Advanced Options:**
  - Stackable rewards
  - Milestone rewards (visit all locations → special reward)
  - Bonus multipliers after milestones (e.g., 2x points after milestone)
  - Expiration settings

### Verification Methods (Configurable per rule or per business)

| Method | Description | Use Case |
|--------|-------------|----------|
| Honor system | Customer claims, auto-approved | Low-value bonuses, high trust |
| Staff confirmation | Customer claims, staff approves | Simple setup, no integration |
| Receipt scan | App reads receipt barcode/QR | Compatible POS receipts |
| POS integration | Automatic from transaction | Seamless, enterprise |
| Promo code | Customer enters code | Trackable, easy to implement |

- Business owner selects available methods
- Each earning rule specifies which method applies
- Optional fallback methods

### Analytics & Reporting

- Customer sign-ups and activity
- Points earned and redeemed
- Popular locations
- Reward redemption rates
- Program performance over time

---

## Reward Rules Engine

### Flexible Combination Examples

| Scenario | Earning Scope | Redemption Scope |
|----------|---------------|------------------|
| Local loyalty | Location A only | Location A only |
| Earn anywhere, redeem anywhere | All locations | All locations |
| Earn anywhere, exclusive redemption | All locations | Location A only |
| Cross-promotion | Locations A & B | Location C only |
| Milestone bonus | All locations | All locations + 2x points |

### Milestone Rewards

- Trigger based on visiting X locations
- Example: Visit all 4 locations → $50 off coupon
- Unlocks stackable bonuses (double points going forward)
- Configurable per program

---

## Technical Architecture

### Customer App

- **Framework:** React Native (iOS & Android from single codebase)
- **Key Libraries:**
  - Camera/QR scanning
  - Push notifications
  - Secure storage for auth tokens

### Admin Dashboard

- **Framework:** Web-based (React or similar)
- **Responsive design for tablet/desktop use**

### Backend

- **Architecture:** Multi-tenant, API-first
- **Core Services:**
  - Authentication (SMS/phone verification)
  - Business/location management
  - Rules engine for earning and rewards
  - Points ledger and transaction history
  - Push notification service
  - Analytics and reporting

- **Database:** Relational (PostgreSQL) for transactional integrity
- **Cloud Infrastructure:** Scalable (AWS, GCP, or similar)

### Integrations (Future)

- POS systems for spend and item tracking
- Receipt parsing services
- Payment processors for subscriptions
- Analytics platforms

---

## Data Model (Conceptual)

### Core Entities

- **Business** — Owner account, branding, settings
- **Location** — Individual store, belongs to a business
- **Location Group** — Named set of locations for rule configuration
- **User** — Customer, identified by phone number
- **Program Membership** — User's enrollment in a business's program
- **Earning Rule** — How points are earned, with scope and verification method
- **Reward** — What can be earned, with point cost and scopes
- **Transaction** — Points earned or redeemed, with timestamp and location
- **Redemption** — Record of reward claimed

---

## Pilot Customer Details

- **Business:** 4 restaurants
- **Locations:** Different food types, different names, same owner
- **Initial Goal:** Track visits across locations, reward loyalty
- **Milestone Reward Example:** Visit all 4 → $50 off, then 2x points going forward

---

## MVP Scope (Pilot)

### In Scope for MVP

**Customer App:**
- Phone number signup with SMS verification
- Join pilot customer's loyalty program
- QR code scanning for check-ins
- View points balance
- View progress toward rewards
- See and redeem available rewards
- Push notifications (reward earned, reward expiring)
- Lazy profile completion (name/email when claiming reward)

**Admin Dashboard:**
- Single business management (pilot customer)
- Location management (add/edit 4 locations)
- Basic location groups (all locations as a group)
- Rules engine MVP:
  - Visit-based conditions
  - Spend-based conditions
  - Time window conditions
  - AND/OR logic
  - Preset rule templates (Grand Tour, Weekend Warrior, etc.)
- Rewards configuration with earning/redemption scope
- Verification method: staff confirmation or honor system
- Generate QR codes for each location
- Basic analytics (sign-ups, check-ins, redemptions)

**Backend:**
- Multi-tenant architecture (ready for scale)
- Phone auth with SMS
- Points ledger
- Composable rules engine (core evaluation logic)
- Push notification service

### Deferred to Post-MVP

- Full visual rule builder UI
- Product-based rule conditions
- Day of week conditions
- Complex nested rule groups
- Rule analytics (which rules fire most)
- POS integrations
- Multiple loyalty programs per user (app supports it, just not promoted)
- Advanced analytics and reporting
- White-label/custom branding per business
- Staff-specific app or interface
- Subscription billing for business owners
- Multiple verification method fallbacks

---

## Open Questions

1. **App Name** — ✅ **Lootly**
2. **POS System** — ✅ Unknown for pilot customer, but not blocking for MVP. 
   - Visit-based rewards need no POS integration (QR scan at location is sufficient)
   - For future spend/item tracking, multiple paths exist:
     - POS API integration (Toast, Square, Clover, Shopify, Lightspeed all have APIs)
     - Spreadsheet upload (manual but works for small businesses)
     - Receipt scanning (customer does the work)
     - Direct database access (if POS stores data locally)
   - **Action item:** Research common POS systems among target customers and prioritize integrations post-MVP
   - **Action item:** Ask pilot customer what POS they use
3. **Receipt Format** — ✅ To be determined, but not blocking for MVP. Receipt scanning is a future option for spend tracking if POS integration isn't available.
4. **Reward Details** — ✅ To be finalized with pilot customer, but framework defined:
   - **Points value:** Configurable conversion rate (e.g., 1 point = $0.10)
     - Can vary by product, location, or reward type
     - Allows promotions without changing core structure
   - **Milestone rewards for pilot (visit/spend at all 4 locations):**
     - Location-specific free items (free pizza at pizza place, free nachos at Mexican place, etc.)
     - Or choice of rewards — customer picks from unlocked options
     - Creates a "loot drop" moment with multiple rewards unlocked at once
   - **Competitive advantage:** High configurability is the moat — most loyalty apps are rigid, Lootly adapts to any business model
   - **Action item:** Confirm specific reward values and items with pilot customer
5. **Notification Timing** — ✅ Configurable, with immediate notifications for MVP
   - **Full options (configurable per business):**
     - Immediate when reward is earned
     - When rewards are about to expire
     - Promotional (new bonuses, special events)
     - Progress reminders ("1 visit away from unlocking!")
     - Streak reminders
   - **MVP:** Immediate notification when milestone is hit (visited all 4 locations)
   - Other notification types added post-MVP
6. **Staff Workflow / Check-in + Spend Verification** — ⚠️ Requires more brainstorming
   
   **Key insight:** Scan without spend is gameable and low value. Need to tie check-in to actual purchase.
   
   **Options to explore:**
   
   | Method | How it works | Cost | Fraud risk |
   |--------|--------------|------|------------|
   | QR at register + honor | Customer scans, claims purchase | Free | High |
   | Serialized token | Staff gives token with QR, customer scans + enters spend | Low (print tokens) | Medium |
   | Staff tablet/terminal | Staff enters customer phone + spend | Low-medium | Low |
   | Receipt code | Receipt prints unique code, customer enters in app | Free (if POS supports) | Low |
   | POS integration | Automatic spend tracking | High (dev time) | None |
   | Staff app | Staff scans customer QR + enters spend on their phone | Free | Low |
   
   **Promising options for MVP:**
   
   - **Serialized tokens:** Pre-printed, unique QR codes. Staff hands out with receipt. One-time use. Cheap, no tech at location.
   - **Staff app:** Waiter/cashier uses Lootly on phone. Scans customer code, enters spend. Zero hardware cost.
   - **Tablet at register:** Cheap Android tablet. Staff enters phone + spend. Customer sees points on screen.
   
   **Potential selling point:** "Lootly works with your existing setup, no expensive hardware."
   
   **Action items:**
   - Research cost of serialized token printing
   - Prototype staff app flow
   - Discuss options with pilot customer to see what fits their operations
   - Consider offering multiple methods — let business owner choose
7. **Redemption Process** — ✅ Integrated with check-in flow via tablet
   
   **Unified tablet-based flow:**
   
   **Check-in + Spend:**
   1. Customer opens Lootly app → shows unique QR code
   2. Staff scans with tablet camera → identifies customer
   3. Staff enters spend amount on tablet
   4. Points awarded → customer sees update in app
   
   **Redemption:**
   1. Customer selects reward in app → shows redemption QR
   2. Staff scans with tablet
   3. Tablet shows reward details ("Free Pizza - $15 value")
   4. Staff confirms → reward marked as used
   
   **Benefits:**
   - One device per location (cheap Android tablet)
   - Customer only needs their phone
   - Staff controls spend entry (fraud prevention)
   - Same flow for earning and redeeming
   - No tokens to print or manage
   
   **Staff tablet app needs:**
   - Camera for scanning customer QR codes
   - Simple UI: scan → enter amount → confirm
   - View/confirm pending redemptions
   - Backup: phone number lookup if scan fails
   
   **This is the recommended MVP verification method.**

---

## Next Steps

1. Review and finalize this scope document
2. Answer open questions with pilot customer
3. Create wireframes/mockups for customer app
4. Design admin dashboard screens
5. Define API contracts
6. Set up development environment
7. Begin MVP development

---

*Document created: [Date]*
*Last updated: [Date]*
