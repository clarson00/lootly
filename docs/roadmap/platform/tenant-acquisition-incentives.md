# Tenant Acquisition Incentives

> **Status:** 📋 Planned
> **Priority:** High - Critical for platform growth
> **Category:** Platform / Business Development

---

## Dependencies

- **Requires:**
  - Entitlements system (existing)
  - Free tier defined (existing)
  - Multi-tenant support

- **Enables:**
  - Rapid tenant acquisition
  - Market density (solves sparse market problem)
  - Network effects

---

## Roadmap Position

- **Tier:** 1-2 (MVP Completion / Core Infrastructure)
- **Phase:** v1.0-v1.1
- **Category:** Platform

---

## Cross-References

- Related specs:
  - [Entitlements](../../ENTITLEMENTS.md)
  - [Multi-Tenant Support](./multi-tenant-support.md)
  - [Vertical Templates](../tenant/vertical-templates.md)
  - [Growth Branding](./growth-branding.md)
  - [Customer Journeys - Morning Open](../customer/customer-journeys-morning-open.md) (sparse market problem)

---

## The Problem

**Sparse Market Challenge:** In early platform days, most geographic areas have zero businesses. This creates a chicken-and-egg problem:
- Users won't engage without businesses nearby
- Businesses won't join without users nearby

**Solution:** Aggressive tenant acquisition with compelling incentives.

---

## Free Tier Strategy

### What Free Tier Includes

The free tier should be genuinely useful, not crippled:

| Feature | Free Tier | Paid Tiers |
|---------|-----------|------------|
| Basic points earning | ✅ | ✅ |
| Basic rewards | ✅ (limited) | ✅ (unlimited) |
| Customer management | ✅ | ✅ |
| Staff check-in app | ✅ | ✅ |
| Basic analytics | ✅ | ✅ Advanced |
| Voyages/Quests | ❌ | ✅ |
| AI Marketing | ❌ | ✅ |
| Social Posting | ❌ | ✅ |
| Advanced Rules | ❌ | ✅ |
| White-label | ❌ | ✅ Pro+ |

### Why Free Tier Matters

1. **Removes friction** - No risk to try
2. **Builds density** - More businesses = better user experience
3. **Proves value** - Tenants see results before paying
4. **Word of mouth** - Happy free users tell other businesses

---

## Early Adopter Incentive: "First Mates Program"

### The Offer

```
┌─────────────────────────────────────────────────────────────┐
│ 🏴‍☠️ FIRST MATES PROGRAM                                     │
│    Early Adopter Special                                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Join now and get:                                          │
│                                                             │
│ ✨ 3 MONTHS FREE PRO ACCESS                                │
│    (Worth $XXX)                                            │
│                                                             │
│ Including:                                                 │
│ • Unlimited rewards & voyages                              │
│ • AI-powered marketing content                             │
│ • Social media posting                                     │
│ • Advanced analytics                                       │
│ • Priority support                                         │
│                                                             │
│ After 3 months:                                            │
│ • Continue on Pro at $XX/month, OR                         │
│ • Downgrade to Free (keep your data!)                      │
│                                                             │
│ No credit card required to start.                          │
│                                                             │
│ [Start Free Trial →]                                       │
│                                                             │
│ ⏰ Limited time: First 100 businesses in your city         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Program Rules

| Aspect | Details |
|--------|---------|
| **Duration** | 3 months full Pro access |
| **Credit Card** | Not required to start |
| **After Trial** | Auto-downgrade to Free (not auto-charge) |
| **Data Retention** | Keep all customers/data on downgrade |
| **Limit** | First 100 per city (creates urgency) |
| **Eligibility** | New tenants only |

### Why This Works

1. **No risk** - No credit card, auto-downgrade (not cancel)
2. **Full experience** - They see the real value
3. **Urgency** - "First 100 in your city"
4. **Retention** - Data stays, so switching cost exists
5. **Habit formation** - 3 months builds operational dependency

---

## Hardware Incentive Program

### The Offer: Free Kiosk/Tablet

Remove the "I don't have a tablet" objection entirely:

```
┌─────────────────────────────────────────────────────────────┐
│ 🖥️ FREE HARDWARE SETUP                                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ We'll set you up with everything you need:                 │
│                                                             │
│ ✅ Tablet or small kiosk (pre-configured)                  │
│ ✅ Stand/mount for counter                                 │
│ ✅ QR code signage for customers                           │
│ ✅ Staff training (remote or in-person)                    │
│                                                             │
│ ─────────────────────────────────────────────────────────   │
│                                                             │
│ Two options:                                               │
│                                                             │
│ OPTION A: Try It Free                                      │
│ • Hardware loaned at no cost                               │
│ • Return anytime if not satisfied                          │
│ • No commitment required                                   │
│                                                             │
│ OPTION B: Keep It Forever                                  │
│ • 2-year subscription commitment                           │
│ • Hardware is YOURS to keep                                │
│ • Includes free replacement if damaged                     │
│                                                             │
│ [Get Started →]                                            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Hardware Options

| Device | Cost to Us | Use Case |
|--------|------------|----------|
| **Budget Tablet** | ~$150 | Small cafes, food trucks |
| **Standard Tablet + Stand** | ~$250 | Restaurants, retail |
| **Kiosk Setup** | ~$400 | High-volume, self-service |

### Program Terms

| Aspect | Try It Free | 2-Year Commitment |
|--------|-------------|-------------------|
| **Hardware cost** | Loaned (free) | Free to keep |
| **Return policy** | Anytime, no questions | N/A - it's yours |
| **Minimum term** | None | 24 months |
| **Early termination** | Return hardware | Return hardware OR pay remaining |
| **Damage/loss** | Tenant responsible | Free replacement (1x) |
| **Upgrade path** | Swap for better device | Included |

### Why This Works

1. **Removes friction** - "I don't have a tablet" is no longer an excuse
2. **Professional setup** - Pre-configured, ready to use
3. **Commitment incentive** - 2-year lock-in for free hardware
4. **Recovery path** - Get hardware back from churned free-tier tenants
5. **Brand presence** - Our hardware = our branding in their store

### Hardware Tracking

```sql
CREATE TABLE tenant_hardware (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL,
  device_type TEXT NOT NULL,        -- 'tablet', 'kiosk', 'stand'
  device_model TEXT,
  serial_number TEXT,
  status TEXT DEFAULT 'active',     -- 'active', 'returned', 'damaged', 'owned'
  ownership TEXT DEFAULT 'loaned',  -- 'loaned', 'owned'
  commitment_months INT,            -- NULL for loaned, 24 for commitment
  commitment_start DATE,
  shipped_at TIMESTAMPTZ,
  returned_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Logistics

| Step | Owner | Timeline |
|------|-------|----------|
| Tenant requests hardware | Tenant | Day 0 |
| Ship pre-configured device | Platform | 2-3 days |
| Remote setup call | Platform | Day of receipt |
| First customer check-in | Tenant | Within 7 days |
| 30-day check-in call | Platform | Day 30 |
| Commitment conversion offer | Platform | Day 60 |

---

## User-Driven Tenant Acquisition

### "Refer a Business" Feature

Turn users into merchant recruiters (referenced in sparse market solution):

```
┌─────────────────────────────────────────────────────────────┐
│ 🏪 Know a business that should join?                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Refer a merchant and earn:                                 │
│                                                             │
│ 🪙 500 doubloons when they sign up                         │
│ 🪙 500 more when they get their first customer             │
│                                                             │
│ [Refer a Business →]                                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Referral Tracking

```sql
CREATE TABLE merchant_referrals (
  id TEXT PRIMARY KEY,
  referrer_customer_id TEXT NOT NULL,
  referred_business_id TEXT,           -- Null until they sign up
  referrer_email TEXT,                 -- Who they referred
  business_name TEXT,                  -- Name provided
  status TEXT DEFAULT 'pending',       -- 'pending', 'signed_up', 'activated', 'rewarded'
  signup_reward_paid BOOLEAN DEFAULT FALSE,
  activation_reward_paid BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  signed_up_at TIMESTAMPTZ,
  activated_at TIMESTAMPTZ             -- First customer check-in
);
```

---

## Marketing Channels

### Where to Promote Free Tier

| Channel | Message |
|---------|---------|
| **Platform Branding** | "Own a business? Join free → rewardspirate.com/merchants" |
| **User Referrals** | "Know a business? Refer them, earn 1000 doubloons" |
| **Local SEO** | "Free loyalty program for [City] restaurants" |
| **Social Media** | Case studies, success stories from pilot |
| **Partnerships** | Chamber of Commerce, restaurant associations |
| **Cold Outreach** | Target businesses in areas with user demand |

### Demand-Driven Outreach

Use "Notify Me" data from users to prioritize outreach:

```
┌─────────────────────────────────────────────────────────────┐
│ 📊 Outreach Priority Dashboard (Internal)                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Areas with highest user demand:                            │
│                                                             │
│ 1. Des Moines, IA     47 users waiting    0 businesses     │
│    [View interested users] [Find businesses to contact]    │
│                                                             │
│ 2. Omaha, NE          32 users waiting    1 business       │
│    [View interested users] [Find businesses to contact]    │
│                                                             │
│ 3. Kansas City, MO    28 users waiting    2 businesses     │
│    [View interested users] [Find businesses to contact]    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Onboarding Flow

### Tenant Signup Journey

```
1. Landing Page
   "Free loyalty program for your business"
   [Start Free] [See Pricing]

2. Basic Info
   Business name, type, location
   Your email, phone

3. Choose Path
   ○ Start with Free (basic features)
   ● Try Pro Free for 3 months (recommended)

4. Quick Setup (< 5 minutes)
   - Upload logo
   - Set points per dollar (default: 1)
   - Create first reward (template provided)

5. Download Staff App
   - QR code to install
   - Set staff PIN

6. Ready!
   "You're live! Share with your first customer"
   [Get Shareable Link] [Print QR Poster]
```

### Time to Value

Goal: **Under 10 minutes from signup to live**

| Step | Target Time |
|------|-------------|
| Signup form | 2 min |
| Choose tier | 30 sec |
| Basic setup | 3 min |
| Staff app install | 2 min |
| First customer | Same day |

---

## Success Metrics

### Acquisition Metrics

| Metric | Target |
|--------|--------|
| Signup → Active rate | > 60% |
| Time to first customer | < 7 days |
| Trial → Paid conversion | > 20% |
| Free → Paid upgrade | > 10% |
| Referral program participation | > 5% of users |

### Geographic Density

| Metric | Target |
|--------|--------|
| Businesses per 10k population | > 2 |
| % of users with nearby business | > 50% |
| Average distance to nearest | < 10 miles |

---

## Implementation Plan

### Phase 1: Free Tier Marketing
- [ ] Landing page emphasizing free tier
- [ ] Clear free vs paid comparison
- [ ] Simple signup flow
- [ ] "No credit card required" messaging

### Phase 2: First Mates Program
- [ ] 3-month trial logic in entitlements
- [ ] Auto-downgrade (not auto-charge)
- [ ] Trial expiration notifications
- [ ] Conversion prompts at trial end

### Phase 3: User Referrals
- [ ] "Refer a Business" UI in customer app
- [ ] Referral tracking database
- [ ] Reward fulfillment on signup/activation
- [ ] Referral status tracking for users

### Phase 4: Demand-Driven Outreach
- [ ] "Notify Me" data aggregation
- [ ] Internal dashboard for outreach prioritization
- [ ] Outreach email templates
- [ ] Success tracking

---

## Open Questions

1. **Trial length?** 3 months vs 1 month vs 6 months?
2. **Auto-downgrade vs auto-cancel?** Downgrade preserves data, builds switching cost
3. **Referral reward amount?** 500 + 500 doubloons enough incentive?
4. **City limits?** "First 100 in your city" - how to define city boundaries?
5. **Vertical focus?** Start with restaurants only, or all business types?

---

*Last updated: January 2025*
