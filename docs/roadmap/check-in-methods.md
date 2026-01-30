# Check-in Methods &amp; Tablet Kiosk Setup

> **Purpose:** Define all the ways customers can earn/redeem rewards and how staff terminals work  
> **Status:** MVP Planning  
> **Priority:** Critical - this IS the product

---

## The Core Problem

How does a customer earn loyalty points when they pay?

**Traditional loyalty:** Requires POS integration (complex, expensive, different for every system)

**Our approach:** Multiple low-friction methods that work with ANY business, with POS integration as an optional upgrade.

---

## Real-World Workflow

### Earning Points (Most Common Flow)

```
1. Customer finishes meal
2. Server brings bill ($42.00)
3. Customer: "I'm in the rewards program"
4. Server: "What's your phone number?"
5. Customer: "555-123-4567"
6. Server types phone number into tablet at register
7. Tablet shows: "Sarah M. - 145 pts"
8. Server either:
   a) Types $42.00 manually, OR
   b) Taps "Scan Receipt" → points camera at receipt → OCR extracts $42.00
9. Tablet: "Award 42 points?" → Server taps Confirm
10. Done. Customer gets notification on their phone (if app installed)
```

### Redeeming Rewards

```
1. Customer: "I want to use my free appetizer reward"
2. Server: "Phone number?"
3. Server looks up customer on tablet
4. Tablet shows: "Sarah M. has 1 reward ready: Free Appetizer ($12 value)"
5. Server taps "Redeem" → Confirms
6. Server takes $12 off bill manually (or tells kitchen)
```

**Key insight:** Phone number lookup is the primary method. It's fast, everyone knows their number, no app required.

---

## Spend Entry Methods (MVP)

Staff needs to enter the bill total. Two options:

### Option A: Manual Entry (Always Available)

- Numpad on screen
- Staff types dollar amount
- Fast for simple amounts

### Option B: Receipt Scan (MVP)

- Staff taps "Scan Receipt" button
- Points tablet camera at printed receipt
- OCR extracts total automatically
- Staff confirms or adjusts amount

**Why include receipt scanning in MVP:**
- Reduces errors (no typos)
- Faster for complex totals ($47.83)
- Creates audit trail (receipt image stored)
- Differentiator vs competitors
- Staff love it once they try it

**Receipt Scan Implementation:**
- Use Claude API or Google Cloud Vision for OCR
- Look for keywords: "Total", "Amount Due", "Grand Total"
- Handle common receipt formats (thermal printer output)
- Fallback to manual if OCR fails
- Store receipt image for disputes (optional)

**OCR Accuracy Strategy:**
- Start with Claude API (most flexible, handles weird formats)
- Common patterns: `TOTAL: $XX.XX` or `Amount Due $XX.XX`
- If confidence < 80%, show extracted amount with "Confirm or Edit" prompt
- Always allow manual override

---

## Customer Identification Methods

### 1. Phone Number Lookup (PRIMARY - MVP)

**How it works:**
- Staff enters customer's phone number on tablet
- System finds customer, shows name and points
- Staff enters spend amount (manual or scan), confirms

**Pros:**
- Works for everyone (no app needed)
- Fast (10 digits)
- Familiar to customers
- No hardware beyond tablet

**Cons:**
- Requires staff interaction
- Phone number entry errors possible

**MVP Implementation:**
- Phone number input with auto-formatting
- Fuzzy matching (last 4 digits if ambiguous)
- Quick "Recent Customers" list for regulars
- "Not found? Enroll now" flow

---

### 2. QR Code Scan (MVP)

**How it works:**
- Customer shows QR code from Lootly app
- Staff scans with tablet camera
- Instant lookup, enter spend, confirm

**Pros:**
- Faster than typing phone number
- No errors
- Feels modern

**Cons:**
- Requires customer to have app installed
- Customer needs phone accessible
- Camera scanning can be finicky

**When to use:**
- Tech-savvy customers
- High-volume lines (coffee shops)
- Self-service kiosks

---

### 3. Physical Loyalty Cards (Post-MVP)

**How it works:**
- Business orders branded cards from us
- Each card has unique barcode/QR
- Card linked to customer's phone number
- Staff scans card OR customer taps NFC

**Card Options:**
| Type | Cost | Tech |
|------|------|------|
| Basic barcode card | $0.10/card | Code128 barcode |
| QR code card | $0.15/card | Printed QR |
| NFC card | $1-2/card | NFC tap |
| Combo (QR + NFC) | $2-3/card | Both |

**Pros:**
- No phone needed
- Fast scan
- Tangible (customers like physical cards)
- Keychain-size options

**Cons:**
- Cards get lost
- Inventory to manage
- Additional cost

**Business Model:**
- FREE: 50 basic cards included with Starter plan
- Paid: Additional cards at cost + small markup
- Premium: NFC cards, custom designs

---

### 4. POS Integration (Future)

**How it works:**
- Lootly integrates directly with POS system
- Points awarded automatically at checkout
- Customer identified by phone/card on file

**Supported POS (prioritized by market share):**
| POS System | Difficulty | Market |
|------------|------------|--------|
| Square | Medium | Small restaurants |
| Toast | Hard | Restaurants |
| Clover | Medium | Multi-industry |
| Shopify POS | Easy | Retail + some food |
| Lightspeed | Medium | Restaurants |

**Pros:**
- Fully automatic
- No staff training
- No errors
- Better data (item-level)

**Cons:**
- Expensive to build/maintain
- Each POS is different
- Some charge for API access
- Updates break integrations

**Strategy:**
- Build when we have paying customers asking for specific POS
- Charge extra for integrated plans
- Partner with POS companies if possible

---

### 5. Self-Service Kiosk (Future)

**How it works:**
- Standalone tablet/kiosk in lobby
- Customer scans their own receipt
- Enters phone number
- Awards themselves points

**Use cases:**
- Fast casual (no table service)
- Coffee shops
- After-hours (customer can scan receipt later)

**Risks:**
- Fraud (fake receipts)
- Requires receipt validation

---

## Staff App UI (Updated for Receipt Scanning)

### Primary: Phone Lookup Screen
```
┌─────────────────────────────────┐
│  🔍 Find Customer               │
├─────────────────────────────────┤
│                                 │
│  ┌─────────────────────────┐   │
│  │ (555) 123-4567          │   │
│  └─────────────────────────┘   │
│                                 │
│  [1] [2] [3]                   │
│  [4] [5] [6]                   │
│  [7] [8] [9]                   │
│  [⌫] [0] [Find]               │
│                                 │
├─────────────────────────────────┤
│  Recent:                        │
│  • Sarah M. - 555-123-4567     │
│  • John D. - 555-987-6543      │
│  • Maria L. - 555-456-7890     │
├─────────────────────────────────┤
│  [📷 Scan QR Instead]          │
│  [➕ New Customer]              │
└─────────────────────────────────┘
```

### Customer Found Screen
```
┌─────────────────────────────────┐
│  ✓ Customer Found               │
├─────────────────────────────────┤
│                                 │
│  👤 Sarah M.                    │
│  555-123-4567                   │
│                                 │
│  ⭐ 145 points                  │
│  📍 Visited 3 of 4 locations   │
│                                 │
│  🎁 1 reward ready to redeem   │
│                                 │
├─────────────────────────────────┤
│                                 │
│  [💵 Record Purchase]          │
│                                 │
│  [🎁 Redeem Reward]            │
│                                 │
│  [← Different Customer]        │
│                                 │
└─────────────────────────────────┘
```

### Enter Spend Screen (NEW - Two Options)
```
┌─────────────────────────────────┐
│  💵 Enter Spend Amount          │
│  for Sarah M.                   │
├─────────────────────────────────┤
│                                 │
│         $ 0.00                  │
│                                 │
│  [1] [2] [3]                   │
│  [4] [5] [6]                   │
│  [7] [8] [9]                   │
│  [.] [0] [⌫]                   │
│                                 │
│  ─────── OR ───────            │
│                                 │
│  [📷 Scan Receipt]             │
│  Auto-read total from receipt   │
│                                 │
├─────────────────────────────────┤
│  Points to award: 0 pts         │
│  [Confirm Purchase]             │
│  [← Cancel]                     │
└─────────────────────────────────┘
```

### Receipt Scan Screen
```
┌─────────────────────────────────┐
│  📷 Scan Receipt                │
├─────────────────────────────────┤
│                                 │
│  ┌─────────────────────────┐   │
│  │                         │   │
│  │    [ Camera View ]      │   │
│  │                         │   │
│  │   Point at receipt      │   │
│  │   total amount          │   │
│  │                         │   │
│  └─────────────────────────┘   │
│                                 │
│  Tips:                          │
│  • Hold steady                  │
│  • Good lighting helps          │
│  • Focus on "Total" line        │
│                                 │
├─────────────────────────────────┤
│  [← Enter Manually Instead]    │
└─────────────────────────────────┘
```

### Receipt Scanned - Confirm
```
┌─────────────────────────────────┐
│  ✓ Receipt Scanned              │
├─────────────────────────────────┤
│                                 │
│  Detected amount:               │
│                                 │
│         $ 47.83                 │
│                                 │
│  [Edit Amount]                  │
│                                 │
├─────────────────────────────────┤
│  Points to award: 47 pts        │
│                                 │
│  [✓ Confirm $47.83]            │
│                                 │
│  [📷 Scan Again]               │
│  [← Cancel]                     │
└─────────────────────────────────┘
```

---

## Tablet Kiosk Setup

### Hardware Requirements

**Minimum Spec (Budget Option):**
- 8" Android tablet
- Android 10+
- 2GB RAM, 16GB storage
- Rear camera (for receipt scanning) + front camera (for QR)
- WiFi
- **Cost: $50-80** (Amazon Fire HD 8, Lenovo Tab M8)

**Recommended Spec:**
- 10" Android tablet
- Android 12+
- 3GB+ RAM, 32GB storage
- Good rear camera (8MP+ for receipt OCR)
- WiFi + optional LTE
- **Cost: $100-150** (Samsung Galaxy Tab A8, Lenovo Tab M10)

**Premium/iPad Option:**
- iPad 10.2" (9th gen)
- Better camera for OCR
- Easier kiosk mode (Guided Access)
- **Cost: $270-330**

### Tablet Stands

| Type | Cost | Notes |
|------|------|-------|
| Basic desktop stand | $15-25 | Works, not secure |
| Locking enclosure | $40-80 | Secure, counter mount |
| Wall mount | $30-50 | Out of the way |
| Swivel stand | $50-100 | Customer can see screen |

**Recommendation:** Start with basic stand, upgrade to locking enclosure for permanent install.

### Kiosk Mode Setup

#### Android (Recommended for Cost)

**Option A: Built-in Screen Pinning**
1. Settings → Security → Screen Pinning → Enable
2. Open Lootly Staff app
3. Tap Recent Apps → Tap pin icon on Lootly
4. Staff can exit with specific gesture (train them not to)

**Option B: Dedicated Kiosk App (More Secure)**
- **SureLock Kiosk** (free for 1 app)
- **Kiosk Browser Lockdown** (free, Chrome-based)
- **Fully Kiosk Browser** ($7 one-time, best features)

Setup with Fully Kiosk:
1. Install Fully Kiosk Browser from Play Store
2. Set start URL to: `https://staff.lootly.app`
3. Enable: Kiosk Mode, Hide Navigation, Prevent Sleep
4. Set admin password
5. Device is now locked to Lootly

**Option C: Android Enterprise (Managed Devices)**
- For businesses with 5+ tablets
- Central management via Google Workspace or MDM
- We could offer this as a service

#### iPad / iOS

**Guided Access (Built-in):**
1. Settings → Accessibility → Guided Access → Enable
2. Set passcode
3. Open Lootly Staff app (Safari or add to Home Screen)
4. Triple-click side button → Start Guided Access
5. Device locked to app until passcode entered

**MDM for Multiple iPads:**
- Apple Business Manager + Jamf/Mosyle
- More complex but better for chains

### Network Setup

**Requirements:**
- Stable WiFi (5GHz preferred)
- Tablet should have static IP or DHCP reservation
- Firewall must allow HTTPS to *.lootly.app

**Offline Considerations:**
- Staff PWA should cache recent customers
- Queue transactions if offline, sync when back online
- Show clear "OFFLINE" indicator

---

## Browser-Based Tablet Emulator (For Demos/Testing)

### The Problem

Business owners and sales team need to demo the staff experience without physical tablets.

### Solution: Tablet Preview Mode

**In the web dashboard, add "Preview Staff App" button that opens:**
- Tablet-sized viewport (768x1024)
- Touch-friendly interface
- Simulated camera for QR scanning (use test QR codes)
- Simulated receipt scan (use test receipt images)
- Full staff workflow

**Implementation:**

```tsx
// StaffPreview.tsx - runs in iframe with tablet dimensions
<div className="tablet-emulator">
  <div className="tablet-frame">
    <div className="tablet-screen">
      <iframe 
        src="/staff-app?preview=true" 
        width="768" 
        height="1024"
      />
    </div>
  </div>
  <div className="tablet-controls">
    <button>Rotate</button>
    <button>Test QR Scan (Success)</button>
    <button>Test QR Scan (Not Found)</button>
    <button>Test Receipt Scan ($42.50)</button>
    <button>Test Receipt Scan (Failed)</button>
  </div>
</div>
```

**Visual frame options:**
- Generic tablet outline
- Realistic iPad/Android renders
- Minimal (just the screen)

### Demo Mode Features

When `?preview=true` or `?demo=true`:
- Use mock data (fake customers, transactions)
- QR scanner shows "Tap to simulate scan"
- Receipt scanner shows "Tap to simulate receipt"
- Pre-populated test customers
- Skip actual SMS verification
- Show success animations

### Alternative: Responsive Staff App

Make Staff PWA fully responsive:
- Works on phone, tablet, AND desktop
- Desktop shows side-by-side panels
- Tablet shows standard view
- Phone shows stacked/simplified

This way anyone can test on their laptop browser.

---

## Summary Tables

### Customer Identification Methods

| Method | Speed | Requires App? | Requires Card? | Fraud Risk | MVP? |
|--------|-------|---------------|----------------|------------|------|
| Phone number | Medium | No | No | Low | ✅ |
| QR code (app) | Fast | Yes | No | Very Low | ✅ |
| Physical card | Fast | No | Yes | Low | Post-MVP |
| POS integration | Instant | No | No | Very Low | Future |

### Spend Entry Methods

| Method | Speed | Accuracy | Audit Trail | MVP? |
|--------|-------|----------|-------------|------|
| Manual numpad | Fast | Human error possible | No | ✅ |
| Receipt scan (OCR) | Medium | High (with confirmation) | Yes (image stored) | ✅ |
| POS integration | Instant | Perfect | Yes | Future |

---

## Entitlements

| Feature | FREE | STARTER | PRO | ENTERPRISE |
|---------|------|---------|-----|------------|
| Phone lookup | ✅ | ✅ | ✅ | ✅ |
| QR scanning | ✅ | ✅ | ✅ | ✅ |
| Manual spend entry | ✅ | ✅ | ✅ | ✅ |
| Receipt scanning (OCR) | ❌ | ✅ | ✅ | ✅ |
| Physical cards | ❌ | 50 free | 200 free | Unlimited |
| POS integration | ❌ | ❌ | ❌ | ✅ (add-on) |
| Tablets supported | 1 | 3 | 10 | Unlimited |
| Kiosk setup guide | ✅ | ✅ | ✅ | ✅ |
| Remote tablet mgmt | ❌ | ❌ | ✅ | ✅ |
| Receipt image storage | ❌ | 30 days | 90 days | 1 year |

---

## Implementation Priority

### MVP (Now)
1. ✅ Phone number lookup (primary customer ID)
2. ✅ QR code scanning (secondary customer ID)
3. ✅ Manual spend entry (numpad)
4. ✅ Receipt scanning / OCR (optional spend entry)
5. ✅ Basic kiosk setup docs

### Post-MVP (v1.1)
6. Physical loyalty cards
7. Browser tablet emulator for demos
8. Improved kiosk setup wizard
9. Receipt image storage / audit trail

### Future (v2+)
10. POS integrations (by demand)
11. Self-service kiosks
12. NFC card support
13. Pre-configured tablet shipping

---

## Open Questions

1. **Receipt OCR provider?** - Claude API vs Google Vision vs AWS Textract
2. **Card printing partner?** - Need to find vendor for physical cards
3. **Offline sync strategy?** - How long to queue? Conflict resolution?
4. **Tablet warranty/support?** - Do we help if tablet breaks?
5. **Receipt storage compliance?** - Any PCI/privacy concerns with storing receipt images?

---

*Last updated: January 2025*
