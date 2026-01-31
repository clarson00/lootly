# Customer Journey: First Visit to a Business

> **Status:** 📋 Planned
> **Priority:** High - Critical conversion moment
> **Category:** Customer UX/UI

---

## Dependencies

- **Requires:**
  - Check-in methods (phone lookup, QR, receipt OCR)
  - Customer app enrollment flow
  - Staff tablet app
  - Multi-tenant support

- **Enables:**
  - Customer acquisition metrics
  - Onboarding optimization
  - First-impression design

---

## Roadmap Position

- **Tier:** 1-2 (MVP / Core Infrastructure)
- **Phase:** v1.0-v1.1
- **Category:** Customer

---

## Cross-References

- Related specs:
  - [Check-in Methods](./check-in-methods.md)
  - [Check-in Model](./check-in-model.md)
  - [Customer Discovery](./customer-discovery.md)
  - [Morning App Open Journey](./customer-journeys-morning-open.md)
  - [Platform Streaks](./platform-streaks-rewards.md)

---

## The Question

> "I walk into a business I've never been to. How do I discover they have rewards? What's the enrollment experience? What makes me want to come back?"

---

## Discovery Triggers

How does the customer learn this business has a rewards program?

### Physical Triggers (In-Store)

| Trigger | Effectiveness | Notes |
|---------|---------------|-------|
| **Counter sign/tent card** | High | "Scan to earn rewards" with QR |
| **Staff mention** | Very High | "Do you have our rewards app?" |
| **Receipt prompt** | Medium | "Scan receipt to earn points" |
| **Window decal** | Low | Passive, easy to miss |
| **Table tent** | Medium | Good for sit-down restaurants |
| **Menu callout** | Medium | "Rewards members earn 2x points" |

### Digital Triggers (Pre-Visit)

| Trigger | Effectiveness | Notes |
|---------|---------------|-------|
| **App discovery** | High | Found business in Rewards Pirate app |
| **Social media** | Medium | Saw business's rewards post |
| **Friend referral** | Very High | "You should try Tony's, they have great rewards" |
| **Google/Yelp** | Low | "Offers rewards program" in listing |

---

## The Journey

### Scenario A: Discovers at Counter (Most Common)

```
┌─────────────────────────────────────────────────────────────┐
│ TIMELINE                                                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. CUSTOMER ORDERS                                         │
│     ├─► Places order at counter                            │
│     └─► Staff: "Do you have our rewards app?"              │
│                                                             │
│  2. ENROLLMENT (< 30 seconds)                               │
│     ├─► Staff: "What's your phone number?"                 │
│     ├─► Customer: "555-123-4567"                           │
│     ├─► Staff enters number in tablet                      │
│     └─► System: Creates enrollment OR finds existing       │
│                                                             │
│  3. INSTANT GRATIFICATION                                   │
│     ├─► Staff: "You just earned 25 points! Download the    │
│     │   app to track your rewards."                        │
│     └─► Hands receipt with QR code to app                  │
│                                                             │
│  4. POST-VISIT (Customer's choice)                          │
│     ├─► Downloads app                                      │
│     ├─► Logs in with phone number                          │
│     └─► Sees points already there!                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Scenario B: Already Has App (Discovery User)

```
┌─────────────────────────────────────────────────────────────┐
│ TIMELINE                                                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. PRE-VISIT                                               │
│     ├─► Discovered Tony's in Rewards Pirate app            │
│     ├─► Saw "Earn 1 pt/$1, Free appetizer at 100 pts"     │
│     └─► Decided to try them out                            │
│                                                             │
│  2. AT COUNTER                                              │
│     ├─► Orders food                                        │
│     ├─► Staff: "Phone number for rewards?"                 │
│     └─► Customer: "555-123-4567" (already in system!)      │
│                                                             │
│  3. SEAMLESS CHECK-IN                                       │
│     ├─► Staff sees: "Welcome back!" (even if first visit   │
│     │   to THIS location)                                  │
│     └─► Points awarded automatically                       │
│                                                             │
│  4. APP NOTIFICATION                                        │
│     └─► Push: "🎉 You earned 25 pts at Tony's Downtown!"   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Scenario C: QR Code Self-Service

```
┌─────────────────────────────────────────────────────────────┐
│ TIMELINE                                                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. CUSTOMER NOTICES SIGN                                   │
│     └─► Table tent: "Scan to earn rewards!"                │
│                                                             │
│  2. SCANS QR CODE                                           │
│     ├─► Opens Rewards Pirate app (or app store)            │
│     └─► Deep links to Tony's enrollment page               │
│                                                             │
│  3. QUICK ENROLLMENT                                        │
│     ├─► Enter phone number                                 │
│     ├─► Verify via SMS code                                │
│     └─► Enrolled!                                          │
│                                                             │
│  4. CHECK-IN OPTIONS                                        │
│     ├─► Show QR code to staff, OR                          │
│     ├─► Give phone number, OR                              │
│     └─► Scan receipt after payment                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Staff Tablet Experience

### New Customer Lookup

```
┌─────────────────────────────────────────────────────────────┐
│ 🔍 Customer Lookup                          Tony's Downtown │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Phone Number:                                              │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ (555) 123-4567                                         │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ [Look Up]                                                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘

        ▼ Not found - New customer

┌─────────────────────────────────────────────────────────────┐
│ 🆕 New Crew Member!                                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Phone: (555) 123-4567                                      │
│                                                             │
│ First name (optional):                                     │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Sarah                                                   │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ [Enroll & Check In]                                        │
│                                                             │
│ 💡 They'll get a text to download the app                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘

        ▼ After enrollment

┌─────────────────────────────────────────────────────────────┐
│ ✅ Welcome Aboard, Sarah!                                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ 🆕 New crew member enrolled!                               │
│                                                             │
│ Enter spend amount:                                        │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ $ 24.50                                                │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ Points to award: 25 (1 pt per $1)                         │
│                                                             │
│ [Award Points]                                             │
│                                                             │
│ 📱 SMS sent with app download link                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Customer App Experience

### SMS Welcome Message

```
🏴‍☠️ Ahoy! You just joined Tony's Rewards!

You earned 25 doubloons today.

Download the app to track your treasure:
rewardspirate.com/download

- Tony's Restaurant
```

### First App Open (After Enrollment)

```
┌─────────────────────────────────────────────────────────────┐
│ 🏴‍☠️ Welcome to the Crew!                                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│              [Treasure Chest Animation]                    │
│                                                             │
│         You already have treasure waiting!                 │
│                                                             │
│                    🪙 25                                    │
│                  doubloons                                 │
│                                                             │
│         at Tony's Restaurant                               │
│                                                             │
│ ─────────────────────────────────────────────────────────   │
│                                                             │
│ 🎯 YOUR FIRST QUEST                                         │
│                                                             │
│ Earn 75 more doubloons to unlock:                         │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 🍟 FREE APPETIZER                                       │ │
│ │    Only 75 pts away!                                   │ │
│ │    ████░░░░░░░░░░░░░░░░░░░░░░ 25%                      │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ [Explore Tony's Rewards →]                                 │
│                                                             │
│ ─────────────────────────────────────────────────────────   │
│                                                             │
│ 🔥 Start your daily streak!                                │
│ Open the app daily to earn bonus doubloons.               │
│                                                             │
│ [Claim Today's Check-in: +5 pts]                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Post-First-Visit Home Screen

```
┌─────────────────────────────────────────────────────────────┐
│ Ahoy, Captain Sarah! 🏴‍☠️                          [Profile] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ 🔥 Day 1 Streak                              [Tap to Claim] │
│                                                             │
│ ─────────────────────────────────────────────────────────   │
│                                                             │
│ 📊 YOUR FLEET                                               │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 🍕 Tony's Restaurant                                    │ │
│ │    🪙 25 doubloons         New Recruit 🌟              │ │
│ │    ████░░░░░░░░░░░░░░░░░░ 25% to Free Appetizer       │ │
│ │    [View Rewards →]                                    │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ + Discover More Treasure                               │ │
│ │   Find rewards near you                                │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ─────────────────────────────────────────────────────────   │
│                                                             │
│ 🗺️ SUGGESTED VOYAGE                                         │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ "First Mate" Voyage                                    │ │
│ │ Complete 3 visits in your first month                  │ │
│ │ Reward: 100 bonus doubloons!                           │ │
│ │ [Start Voyage →]                                        │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ [🏠 Home] [🔍 Discover] [🏆 Ranks] [👤 Profile]             │
└─────────────────────────────────────────────────────────────┘
```

---

## Instant Gratification Principles

### What Makes First Visit Sticky

| Element | Implementation |
|---------|----------------|
| **Immediate reward** | Points awarded same moment as enrollment |
| **Visible progress** | Progress bar to first reward shown immediately |
| **Clear next step** | "75 more points to Free Appetizer" |
| **Low first threshold** | First reward achievable in 2-3 visits |
| **Welcome voyage** | "First Mate" quest for new members |
| **Streak hook** | Daily check-in starts on day 1 |

### First Reward Strategy

Tenants should configure an achievable first reward:

```
┌─────────────────────────────────────────────────────────────┐
│ 💡 RECOMMENDED FIRST REWARD SETUP                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ For a restaurant with $25 average ticket:                  │
│                                                             │
│ • Points per $1: 1 point                                   │
│ • First reward: 100 points (4 visits)                      │
│ • First reward value: Free appetizer (~$8-12)              │
│                                                             │
│ Psychology:                                                │
│ • Visit 1: 25 pts (25% progress - "I'm already close!")   │
│ • Visit 2: 50 pts (halfway!)                               │
│ • Visit 3: 75 pts (almost there!)                          │
│ • Visit 4: 100 pts (🎉 REWARD!)                            │
│                                                             │
│ ⚠️ DON'T: Set first reward at 500+ points                  │
│    (feels unattainable, customer loses interest)           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Enrollment Friction Points

### What Can Go Wrong

| Friction Point | Solution |
|----------------|----------|
| **"I don't want another app"** | Points work without app; SMS updates available |
| **Staff forgets to ask** | Training + incentives for staff |
| **Long line, no time** | Phone number only = 5 seconds |
| **Privacy concerns** | Minimal data required (phone only) |
| **Already has app, different phone** | Lookup by name as backup |
| **Typo in phone number** | Verification SMS catches this |

### Frictionless Enrollment Principles

1. **Phone number only** - No email, no name required
2. **< 10 seconds** - Staff enters number, done
3. **No app required** - Points work via SMS
4. **Instant value** - Points appear immediately
5. **Opt-in marketing** - Don't auto-subscribe to promos

---

## Post-First-Visit Engagement

### Day 1-7: Critical Window

| Day | Action | Goal |
|-----|--------|------|
| **Day 0** | SMS with app download link | Get app installed |
| **Day 1** | Push: "Your 25 pts are waiting!" | Open app |
| **Day 3** | Push: "75 pts to Free Appetizer" | Remind of progress |
| **Day 5** | Push: "Miss us? 2x points this weekend" | Drive return visit |
| **Day 7** | Push: "Your streak is growing! +15 pts" | Daily engagement |

### Welcome Voyage: "First Mate"

Auto-enrolled voyage for new customers:

```
┌─────────────────────────────────────────────────────────────┐
│ 🗺️ VOYAGE: First Mate                                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Welcome to the crew! Complete these steps in your          │
│ first 30 days to earn bonus treasure.                      │
│                                                             │
│ [✓] Step 1: Make your first purchase        ✓ Complete    │
│     Reward: 10 bonus doubloons                             │
│                                                             │
│ [ ] Step 2: Download the app                               │
│     Reward: 25 bonus doubloons                             │
│                                                             │
│ [ ] Step 3: Visit a second time                            │
│     Reward: 25 bonus doubloons                             │
│                                                             │
│ [ ] Step 4: Complete your daily streak (3 days)            │
│     Reward: 25 bonus doubloons                             │
│                                                             │
│ [ ] Step 5: Visit a third time                             │
│     Reward: 50 bonus doubloons + "First Mate" badge!       │
│                                                             │
│ ─────────────────────────────────────────────────────────   │
│                                                             │
│ Total bonus: 135 doubloons                                 │
│ Time remaining: 28 days                                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Metrics to Track

### Conversion Funnel

```
Staff asks about rewards
        │
        ▼ (% who say yes)
Customer gives phone number
        │
        ▼ (% who download app)
App installed
        │
        ▼ (% who return within 30 days)
Second visit
        │
        ▼ (% who become regular)
5+ visits
```

### Key Metrics

| Metric | Target | Why It Matters |
|--------|--------|----------------|
| Enrollment rate | > 60% of new customers | Staff effectiveness |
| App download rate | > 40% of enrollees | Digital engagement |
| 7-day return rate | > 25% | First impression success |
| 30-day return rate | > 50% | Program stickiness |
| First reward redemption | > 60% | Achievable rewards |

---

## Implementation Plan

### Phase 1: Core Enrollment
- [ ] Phone number lookup/enrollment
- [ ] Instant points award
- [ ] SMS welcome message
- [ ] App download deep link

### Phase 2: First-Visit Experience
- [ ] Welcome screen for new enrollees
- [ ] Progress bar to first reward
- [ ] "First Mate" welcome voyage
- [ ] Daily streak introduction

### Phase 3: Follow-Up Automation
- [ ] Day 1-7 notification sequence
- [ ] Re-engagement for no-app users
- [ ] Second visit prompts

### Phase 4: Optimization
- [ ] A/B test welcome messages
- [ ] Staff training materials
- [ ] Conversion funnel analytics
- [ ] Drop-off analysis

---

## Open Questions

1. **Name collection?** Required or optional at enrollment?
2. **SMS frequency?** How many texts before app download?
3. **Staff incentives?** Should staff earn points for enrollments?
4. **Multi-location?** First visit to chain vs first visit to location?

---

*Last updated: January 2025*
