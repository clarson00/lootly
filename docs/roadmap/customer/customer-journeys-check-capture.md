# Customer Journey: Check Capture / Getting Points

> **Status:** 📋 Planned
> **Priority:** Critical - Core transaction flow
> **Category:** Customer UX/UI

---

## Dependencies

- **Requires:**
  - Check-in methods infrastructure
  - Receipt OCR capability
  - Staff tablet app
  - Customer app

- **Enables:**
  - Points earning
  - Transaction tracking
  - Spend-based rules

---

## Roadmap Position

- **Tier:** 1 (MVP)
- **Phase:** v1.0
- **Category:** Customer

---

## Cross-References

- Related specs:
  - [Check-in Methods](./check-in-methods.md)
  - [Check-in Model](./check-in-model.md)
  - [First Visit Journey](./customer-journeys-first-visit.md)

---

## The Question

> "I'm at a restaurant. I get my check at the table. How do I get my points? What are all the ways this can happen?"

---

## Check-In Methods Overview

| Method | Who Initiates | Best For | Fraud Risk |
|--------|---------------|----------|------------|
| **Staff enters phone** | Staff | Full-service restaurants | Low |
| **Customer scans receipt** | Customer | Any | Medium |
| **Staff scans receipt + phone** | Staff | Table service | Low |
| **Kiosk self-service** | Customer | Fast casual, retail | Medium |
| **QR code at register** | Customer | Quick check-in | Low |

---

## Method 1: Staff Enters Phone Number (Recommended)

**Scenario:** Full-service restaurant, staff brings check to table.

### Flow

```
┌─────────────────────────────────────────────────────────────┐
│ CUSTOMER PERSPECTIVE                                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Finishes meal, receives check                          │
│                                                             │
│  2. Server: "Phone number for rewards?"                    │
│                                                             │
│  3. Customer: "555-123-4567"                               │
│                                                             │
│  4. Server enters in tablet (at table or register)         │
│                                                             │
│  5. Customer pays (card, cash, whatever)                   │
│                                                             │
│  6. Done! Points awarded automatically.                    │
│                                                             │
│  7. Customer gets push notification:                       │
│     "🎉 You earned 45 doubloons at Tony's!"               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Staff Tablet Flow

```
┌─────────────────────────────────────────────────────────────┐
│ 🔍 Check In Customer                        Tony's Downtown │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Phone Number:                                              │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ (555) 123-4567                                         │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ [Look Up]                                                  │
│                                                             │
│ ─────────────────────────────────────────────────────────   │
│                                                             │
│ ✓ Found: Sarah M.                          Gold Member ⭐  │
│   Current balance: 847 doubloons                           │
│   Last visit: 3 days ago                                   │
│                                                             │
│ ─────────────────────────────────────────────────────────   │
│                                                             │
│ Spend Amount:                                              │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ $ 45.00                                                │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ Points to award: 45 (1 pt per $1)                         │
│ Bonus: +10 (Gold member 20% bonus)                         │
│ Total: 55 doubloons                                        │
│                                                             │
│ [Award Points]                                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Why This Is Best

- **Lowest friction** - Customer just says phone number
- **Lowest fraud risk** - Staff verifies in-person
- **Works without app** - Customer doesn't need phone out
- **Staff can upsell** - "You're 20 points from a free appetizer!"

---

## Method 2: Customer Scans Receipt (Self-Service)

**Scenario:** Customer wants to capture points after staff leaves, or at a fast-casual spot.

### Flow

```
┌─────────────────────────────────────────────────────────────┐
│ CUSTOMER PERSPECTIVE                                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Pays for meal, receives receipt                        │
│                                                             │
│  2. Opens Rewards Pirate app                               │
│                                                             │
│  3. Taps "Scan Receipt" on Tony's card                     │
│                                                             │
│  4. Points camera at receipt                               │
│                                                             │
│  5. App reads: date, time, amount, receipt #               │
│                                                             │
│  6. Confirms: "Add 45 points from $45.00 purchase?"        │
│                                                             │
│  7. Done! Points added.                                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### App Receipt Scanner UI

```
┌─────────────────────────────────────────────────────────────┐
│ 📷 Scan Receipt                                    [Cancel] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                                                     │   │
│  │                                                     │   │
│  │              [Camera Viewfinder]                   │   │
│  │                                                     │   │
│  │         Position receipt in frame                  │   │
│  │                                                     │   │
│  │   ┌─────────────────────────────────────────┐      │   │
│  │   │                                         │      │   │
│  │   │          [Receipt outline]              │      │   │
│  │   │                                         │      │   │
│  │   └─────────────────────────────────────────┘      │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  📍 Tony's Downtown                                        │
│                                                             │
│  💡 Make sure the total and date are visible              │
│                                                             │
└─────────────────────────────────────────────────────────────┘

        ▼ After scan

┌─────────────────────────────────────────────────────────────┐
│ ✓ Receipt Scanned                                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  We found:                                                 │
│                                                             │
│  📍 Location:  Tony's Downtown                             │
│  📅 Date:      January 30, 2025                            │
│  ⏰ Time:      7:23 PM                                     │
│  💰 Total:     $45.00                                      │
│  🧾 Receipt #: 4521                                        │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  Points to earn: 45 doubloons                              │
│  Gold bonus:     +10 doubloons                             │
│  ─────────────────────────────────────────────────────────  │
│  Total:          55 doubloons                              │
│                                                             │
│  [Confirm & Earn Points]                                   │
│                                                             │
│  Something wrong? [Enter Manually]                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Receipt OCR: What We Read

### Data Extracted

| Field | Required | Use |
|-------|----------|-----|
| **Total Amount** | Yes | Calculate points |
| **Date** | Yes | Fraud prevention |
| **Time** | Yes | Fraud prevention |
| **Receipt Number** | Yes | Duplicate prevention |
| **Location/Store ID** | Preferred | Multi-location matching |
| **Items** | Optional | Future: item-based rules |

### OCR Approach

```typescript
interface ReceiptOCRResult {
  rawText: string;
  extracted: {
    total: number;              // $45.00
    subtotal?: number;          // Pre-tax amount
    tax?: number;               // Tax amount
    date: string;               // "2025-01-30"
    time: string;               // "19:23"
    receiptNumber: string;      // "4521" or full receipt ID
    storeIdentifier?: string;   // Store #, location name, address
    items?: ReceiptItem[];      // Line items (if readable)
  };
  confidence: number;           // 0-1 confidence score
  hash: string;                 // Unique hash of receipt
}
```

---

## Fraud Prevention

### The Problem: Trash Receipts

> "What prevents people from picking receipts out of the trash?"

### Multi-Layer Prevention

| Layer | Protection | Implementation |
|-------|------------|----------------|
| **Time Window** | Receipt must be < 2 hours old | Compare receipt time to current time |
| **One-Time Use** | Receipt can only be scanned once | Hash receipt number + date + total |
| **Location Check** | Customer should be near business | GPS check (optional, can disable) |
| **Velocity Limit** | Max 3 receipt scans per day per customer | Rate limiting |
| **Amount Threshold** | Flag unusually high amounts for review | Business-configured threshold |
| **Manual Review** | Suspicious scans queued for staff review | Async verification |

### Time Window Logic

```typescript
const RECEIPT_VALIDITY_HOURS = 2;  // Configurable per business

function validateReceiptTime(receiptTime: Date): ValidationResult {
  const now = new Date();
  const hoursSinceReceipt = (now - receiptTime) / (1000 * 60 * 60);

  if (hoursSinceReceipt > RECEIPT_VALIDITY_HOURS) {
    return {
      valid: false,
      reason: 'receipt_expired',
      message: `Receipt is ${Math.round(hoursSinceReceipt)} hours old. Must be within ${RECEIPT_VALIDITY_HOURS} hours.`
    };
  }

  if (hoursSinceReceipt < 0) {
    return {
      valid: false,
      reason: 'future_receipt',
      message: 'Receipt date is in the future.'
    };
  }

  return { valid: true };
}
```

### One-Time Use (Receipt Hash)

```typescript
function generateReceiptHash(receipt: ReceiptOCRResult): string {
  // Create unique identifier from receipt data
  const hashInput = [
    receipt.extracted.receiptNumber,
    receipt.extracted.date,
    receipt.extracted.time,
    receipt.extracted.total.toFixed(2),
    receipt.extracted.storeIdentifier || ''
  ].join('|');

  return crypto.createHash('sha256').update(hashInput).digest('hex');
}

// Before awarding points, check if hash exists
async function checkReceiptUsed(hash: string): Promise<boolean> {
  const existing = await db.query.receiptScans.findFirst({
    where: eq(receiptScans.receiptHash, hash)
  });
  return !!existing;
}
```

### Database: Receipt Scan Tracking

```sql
CREATE TABLE receipt_scans (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL,
  business_id TEXT NOT NULL,
  location_id TEXT,
  receipt_hash TEXT UNIQUE NOT NULL,  -- Prevents duplicate scans
  receipt_number TEXT,
  receipt_date DATE NOT NULL,
  receipt_time TIME NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  points_awarded INT NOT NULL,
  scan_method TEXT NOT NULL,           -- 'customer_app', 'staff_tablet', 'kiosk'
  device_location JSONB,               -- GPS coordinates at scan time
  ocr_confidence DECIMAL(3,2),
  flagged_for_review BOOLEAN DEFAULT FALSE,
  review_status TEXT,                  -- 'pending', 'approved', 'rejected'
  reviewed_by TEXT,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_receipt_hash ON receipt_scans(receipt_hash);
CREATE INDEX idx_receipt_customer ON receipt_scans(customer_id, created_at);
CREATE INDEX idx_receipt_review ON receipt_scans(flagged_for_review, review_status);
```

### Suspicious Activity Flags

```typescript
const FRAUD_FLAGS = {
  // Flag if receipt is close to expiring
  nearExpiration: (hoursSince: number) => hoursSince > 1.5,

  // Flag unusually high amounts
  highAmount: (amount: number, avgTicket: number) => amount > avgTicket * 3,

  // Flag multiple scans in short period
  velocityExceeded: (scansToday: number) => scansToday >= 3,

  // Flag if customer is far from location
  distanceSuspicious: (distanceMiles: number) => distanceMiles > 5,

  // Flag low OCR confidence
  lowConfidence: (confidence: number) => confidence < 0.7,
};

function shouldFlagForReview(scan: ReceiptScan): boolean {
  return Object.values(FRAUD_FLAGS).some(check => check(scan));
}
```

---

## Method 3: Staff Brings Tablet to Table

**Scenario:** Upscale restaurant, staff brings tablet for seamless experience.

### Flow

```
┌─────────────────────────────────────────────────────────────┐
│ CUSTOMER PERSPECTIVE                                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Server brings check with tablet                        │
│                                                             │
│  2. Server: "Can I get your phone number for rewards?"     │
│                                                             │
│  3. Customer can:                                          │
│     a) Say phone number (server enters)                    │
│     b) Type it themselves on tablet                        │
│     c) Scan their QR code from app                         │
│                                                             │
│  4. Server enters amount, submits                          │
│                                                             │
│  5. Customer sees confirmation on tablet:                  │
│     "✓ 55 doubloons earned! 45 pts to Free Appetizer"     │
│                                                             │
│  6. Server: "You're almost at a free appetizer!"          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Benefits

- **Personal touch** - Feels premium
- **Upsell opportunity** - Staff sees how close to reward
- **No phone needed** - Customer doesn't pull out device
- **Highest trust** - Staff-assisted = lowest fraud

---

## Method 4: Kiosk Self-Service

**Scenario:** Fast casual, customer approaches kiosk after ordering.

### Kiosk UI

```
┌─────────────────────────────────────────────────────────────┐
│ 🏴‍☠️ Earn Rewards                              Tony's Rewards │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│              How would you like to check in?               │
│                                                             │
│  ┌─────────────────────┐    ┌─────────────────────┐        │
│  │                     │    │                     │        │
│  │   📱 ENTER PHONE    │    │   🧾 SCAN RECEIPT   │        │
│  │      NUMBER         │    │                     │        │
│  │                     │    │                     │        │
│  └─────────────────────┘    └─────────────────────┘        │
│                                                             │
│  ┌─────────────────────┐    ┌─────────────────────┐        │
│  │                     │    │                     │        │
│  │   📲 SCAN YOUR      │    │   🆕 NEW MEMBER     │        │
│  │      QR CODE        │    │      SIGN UP        │        │
│  │                     │    │                     │        │
│  └─────────────────────┘    └─────────────────────┘        │
│                                                             │
└─────────────────────────────────────────────────────────────┘

        ▼ Phone number selected

┌─────────────────────────────────────────────────────────────┐
│ Enter Your Phone Number                                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│            ┌─────────────────────────────────┐              │
│            │  (555) 123-4567                 │              │
│            └─────────────────────────────────┘              │
│                                                             │
│            ┌───┬───┬───┐                                   │
│            │ 1 │ 2 │ 3 │                                   │
│            ├───┼───┼───┤                                   │
│            │ 4 │ 5 │ 6 │                                   │
│            ├───┼───┼───┤                                   │
│            │ 7 │ 8 │ 9 │                                   │
│            ├───┼───┼───┤                                   │
│            │ ⌫ │ 0 │ ✓ │                                   │
│            └───┴───┴───┘                                   │
│                                                             │
│                    [Next →]                                │
│                                                             │
└─────────────────────────────────────────────────────────────┘

        ▼ Receipt scan selected

┌─────────────────────────────────────────────────────────────┐
│ Scan Your Receipt                                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                                                     │   │
│  │              [Camera Viewfinder]                   │   │
│  │                                                     │   │
│  │         Hold receipt up to camera                  │   │
│  │                                                     │   │
│  │   ┌─────────────────────────────────────────┐      │   │
│  │   │                                         │      │   │
│  │   │          [Receipt outline]              │      │   │
│  │   │                                         │      │   │
│  │   └─────────────────────────────────────────┘      │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Then enter your phone number to link points.              │
│                                                             │
│                    [Cancel]                                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Lazy Data Gathering

### Philosophy

> "Primary means of customer ID is phone # but we will lazy gather other info."

### What We Gather & When

| Data | When Gathered | How |
|------|---------------|-----|
| **Phone number** | Enrollment (required) | Staff entry or self-entry |
| **First name** | Enrollment (optional) | Staff asks, or skipped |
| **Full name** | Later (optional) | Profile completion in app |
| **Email** | Later (optional) | Profile completion, or marketing opt-in |
| **Birthday** | Later (optional) | Profile, or special promo prompt |
| **Preferences** | Over time | Inferred from purchases, or explicit |

### Progressive Profile Completion

```
┌─────────────────────────────────────────────────────────────┐
│ Complete Your Profile                          [Maybe Later]│
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ 🎁 Add your birthday and get a FREE reward!               │
│                                                             │
│ Birthday:                                                  │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ [Month ▼]  [Day ▼]                                     │ │
│ └─────────────────────────────────────────────────────────┘ │
│ (We'll never ask for the year!)                            │
│                                                             │
│ [Save & Get Birthday Reward]                               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### App Profile Screen

```
┌─────────────────────────────────────────────────────────────┐
│ 👤 Your Profile                                     [Edit]  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Phone:    (555) 123-4567 ✓                                 │
│ Name:     Sarah                                            │
│ Email:    [Add email for receipts →]                       │
│ Birthday: [Add for free reward! →]                         │
│                                                             │
│ ─────────────────────────────────────────────────────────   │
│                                                             │
│ Profile Completion: 50%                                    │
│ ████████░░░░░░░░░░░░░░░░░░░░░░░░                           │
│                                                             │
│ Complete your profile to earn 50 bonus doubloons!          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Edge Cases

### Receipt Scan Fails

```
┌─────────────────────────────────────────────────────────────┐
│ ⚠️ Couldn't Read Receipt                                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ We couldn't read all the details. Please enter manually:   │
│                                                             │
│ Date:    [January 30, 2025    ▼]                           │
│ Amount:  $ [________]                                      │
│                                                             │
│ [Submit for Review]                                        │
│                                                             │
│ 💡 Manual entries are reviewed by staff and may take       │
│    up to 24 hours to credit.                               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Receipt Already Used

```
┌─────────────────────────────────────────────────────────────┐
│ ⚠️ Receipt Already Scanned                                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ This receipt was already used to earn points.              │
│                                                             │
│ If you believe this is an error, please ask staff          │
│ for assistance.                                            │
│                                                             │
│ [OK]                                                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Receipt Too Old

```
┌─────────────────────────────────────────────────────────────┐
│ ⚠️ Receipt Expired                                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ This receipt is from 5 hours ago.                          │
│                                                             │
│ Receipts must be scanned within 2 hours of purchase.       │
│                                                             │
│ 💡 Tip: Next time, just give your phone number to          │
│    staff at checkout - no scanning needed!                 │
│                                                             │
│ [OK]                                                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Configuration Options (Tenant)

```
┌─────────────────────────────────────────────────────────────┐
│ ⚙️ Check-in Settings                                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ALLOWED CHECK-IN METHODS                                   │
│ [✓] Staff enters phone number                              │
│ [✓] Customer scans receipt                                 │
│ [✓] Kiosk self-service                                     │
│ [ ] Customer shows QR code (coming soon)                   │
│                                                             │
│ RECEIPT SCANNING                                           │
│ Receipt validity window: [2] hours                         │
│ Require location verification: [Off ▼]                     │
│ Max receipt scans per customer per day: [3]                │
│ Flag amounts over: $[200]                                  │
│                                                             │
│ MANUAL ENTRY                                               │
│ [✓] Allow manual entry when scan fails                    │
│ [✓] Require staff approval for manual entries             │
│                                                             │
│ [Save Settings]                                            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Implementation Plan

### Phase 1: Staff Phone Entry (MVP)
- [x] Phone number lookup
- [x] New customer enrollment
- [x] Spend entry → points award
- [x] Push notification on points earned

### Phase 2: Receipt Scanning
- [ ] Receipt OCR integration
- [ ] Receipt hash for duplicate prevention
- [ ] Time window validation
- [ ] Customer app scanner UI

### Phase 3: Fraud Prevention
- [ ] Velocity limiting
- [ ] Suspicious activity flagging
- [ ] Manual review queue
- [ ] Staff review interface

### Phase 4: Kiosk Mode
- [ ] Self-service UI for tablet/kiosk
- [ ] Receipt scanner + phone entry combo
- [ ] New member signup flow
- [ ] QR code scanning (customer shows app)

---

## Metrics to Track

| Metric | Purpose |
|--------|---------|
| Check-ins by method | Which methods are used most |
| Receipt scan success rate | OCR quality |
| Fraudulent scan attempts | Security |
| Time from receipt to scan | User behavior |
| Manual entry rate | OCR failure rate |

---

*Last updated: January 2025*
