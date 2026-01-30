# Pricing Strategy

> **Purpose:** Business rationale for pricing tiers, add-ons, and monetization strategy.
> **See also:** [ENTITLEMENTS.md](ENTITLEMENTS.md) for technical implementation.

---

## Pricing Philosophy

### Value-Based, Not Cost-Based

We don't price based on what it costs us to serve a customer. We price based on the **value we create** for the business.

```
WRONG THINKING
"It costs us $5/month to serve them, so charge $10"

RIGHT THINKING
"If we help them retain 10 more customers/month worth $50 each,
that's $500/month in value. $79 is a no-brainer."
```

### The 10x Rule

Customers should feel they're getting **at least 10x** the value of what they pay.

| Tier | Price | Target Value Created |
|------|-------|---------------------|
| Free | $0 | Prove the concept works |
| Starter | $29/mo | $300+/mo in retention value |
| Pro | $79/mo | $800+/mo in retention value |
| Enterprise | Custom | Measurable ROI guaranteed |

### Pricing Anchors

- **Below $50/mo:** Impulse buy, no committee approval needed
- **Below $100/mo:** Manager can approve, low friction
- **Above $100/mo:** Needs justification, ROI conversation
- **Above $500/mo:** Enterprise sales process

We intentionally keep Starter and Pro under these thresholds.

---

## Tier Strategy

### Free: The Gateway

**Purpose:** Acquisition, not revenue.

```
FREE TIER GOALS
├── Let them prove it works
├── Build habit of using the platform
├── Capture customer data (theirs and their customers')
├── Create switching costs
└── Trigger upgrade when they hit limits
```

**What Free includes:**
- 1 location
- 500 customers
- 3 active rewards
- Basic points/check-in
- Core gamification (streaks, basic achievements)

**What Free excludes:**
- Multiple locations
- Advanced rules/multipliers
- Marketing features
- Analytics beyond basics
- AI features

**Free tier philosophy:**
> Give them enough to succeed and feel the value. Not enough to never need to upgrade.

**Key insight:** Free users who engage are our best leads. They've already proven product-market fit for themselves.

### Starter ($29/mo): The Growing Business

**Target customer:**
- Single location OR just expanded to 2-3
- 500-2,000 active customers
- Starting to think about marketing
- Owner-operated, budget-conscious

**Why $29:**
- Below the "impulse buy" threshold
- Comparable to other SMB tools they already pay for
- Easy to justify: "Less than $1/day"
- Competitive with basic loyalty competitors

**What triggers Starter upgrade:**
- Hit 500 customer limit
- Want 2nd or 3rd location
- Need more than 3 rewards
- Want time-bound promos
- Want push notifications

**Starter includes:**
- 3 locations
- 2,000 customers
- 10 active rewards
- Advanced rules (time-bound, conditions)
- Push notifications
- Basic journey (1 active)

### Pro ($79/mo): The Serious Operator

**Target customer:**
- Multiple locations (3-10)
- 2,000-10,000 active customers
- Dedicated to loyalty as strategy
- Willing to invest in growth
- Wants automation and intelligence

**Why $79:**
- Still under $100 (manager approval threshold)
- 2.7x Starter price for ~5x the value
- Positions as "professional" tier
- Room for add-ons without feeling expensive

**What triggers Pro upgrade:**
- Hit location or customer limits
- Want milestone rewards
- Want AI assistance
- Need advanced analytics
- Running multiple campaigns

**Pro includes:**
- 10 locations
- 10,000 customers
- Unlimited rewards
- Milestone rewards & multipliers
- AI assistant & insights
- Advanced analytics
- Unlimited journeys
- Campaign management

### Enterprise (Custom): The Big Fish

**Target customer:**
- 10+ locations OR franchises
- 10,000+ customers
- Need integrations, API, white-label
- Require SLAs and dedicated support
- Have procurement/legal process

**Why custom pricing:**
- Value varies dramatically by size
- Negotiation expected at this level
- Opportunity for annual contracts
- Can bundle implementation/support

**Enterprise includes:**
- Everything in Pro
- Unlimited locations/customers
- API access
- White-label options
- SSO integration
- Dedicated support
- Custom integrations
- SLA guarantees

**Enterprise pricing guidance:**
- Base: $199-499/mo depending on size
- Per-location add-on: $29-49/location
- Annual discount: 20%
- Implementation fee: $500-2,000 one-time

---

## Add-On Strategy

### Philosophy: Expand, Don't Overwhelm

Add-ons should feel like **natural expansions**, not **nickel-and-diming**.

```
GOOD ADD-ON                          BAD ADD-ON
"I need this specific thing"         "Why isn't this included?"
"This will help me grow"             "They're trying to squeeze me"
```

### Current Add-Ons

| Add-On | Price | Target | Rationale |
|--------|-------|--------|-----------|
| AI Pack | $29/mo | Starter users who want AI | High perceived value, low marginal cost |
| SMS Marketing | $19/mo | Anyone doing campaigns | Usage-based cost pass-through |
| Advanced Analytics | $19/mo | Data-driven operators | Clear value for specific need |
| API Access | $49/mo | Developers, integrators | High value for specific use case |

### Add-On Stacking Rules

1. **Add-ons should feel optional** - Core product works great without them
2. **Add-ons should have clear ROI** - Easy to justify the spend
3. **Add-ons shouldn't duplicate tier features** - No confusion about what's included
4. **Add-ons can make lower tiers viable longer** - Starter + AI Pack vs upgrading to Pro

### Add-On vs. Tier Upgrade

When should we offer an add-on vs. push for tier upgrade?

| Situation | Recommendation |
|-----------|----------------|
| User wants ONE specific feature | Offer add-on |
| User hitting multiple limits | Push tier upgrade |
| User would save money upgrading | Push tier upgrade |
| User resistant to higher tier | Offer add-on as compromise |

**Example:**
> Starter user wants AI features but doesn't need more locations.
> - AI Pack ($29) + Starter ($29) = $58/mo
> - Pro ($79/mo) includes AI
> 
> **Offer both options.** Let them choose based on their needs.

### Future Add-Ons (Roadmap)

| Add-On | Est. Price | When |
|--------|-----------|------|
| Physical Rewards (metal cards, merch) | Cost + margin | Phase 2 |
| Advanced Gamification Pack | $19/mo | Phase 2 |
| Multi-Network Access | $39/mo | Phase 3 |
| White-Label Lite | $99/mo | Phase 3 |
| Crypto/Yield Features | TBD | Phase 4 |

---

## Free Tier Strategy

### Why Free Exists

Free is not charity. Free is **customer acquisition**.

```
FREE TIER FUNNEL

Awareness → Sign up (free) → Activate → Engage → Hit limits → Upgrade
                                              ↓
                              Value proven, switching cost created
```

### Free Tier Economics

| Metric | Target |
|--------|--------|
| Free → Starter conversion | 5-10% within 90 days |
| Free → Any paid conversion | 15-20% lifetime |
| Cost to serve free user | < $2/month |
| Activation rate (1+ check-in) | 60%+ |

### Free Limits Are Features

Limits aren't punishments. They're **graduation markers**.

```
WHEN THEY HIT A LIMIT

❌ "You've been restricted. Pay us."
✅ "Congrats! You've outgrown Free. Here's what's next."
```

### What Makes Free Sticky

Even without paying, free users should:
- Build customer database (switching cost)
- Establish reward expectations (customers expect it)
- Learn the platform (time investment)
- See real results (proof it works)

**The trap:** If they leave, they lose all their customer data and have to start over.

---

## Upgrade Triggers

### Automatic Triggers (System-Detected)

| Trigger | Action |
|---------|--------|
| 80% of customer limit | Soft notification |
| 100% of customer limit | Upgrade prompt, can't add new |
| 80% of location limit | Soft notification |
| 100% of location limit | Upgrade required to add |
| Attempts to use gated feature | Upgrade prompt with feature highlight |

### Behavioral Triggers (Signals to Sales/Marketing)

| Signal | Indicates | Action |
|--------|-----------|--------|
| High engagement, near limits | Ready to upgrade | Proactive outreach |
| Viewing Pro features repeatedly | Interested but hesitant | Offer trial/discount |
| Increased login frequency | Power user emerging | Highlight advanced features |
| Multiple team members added | Growing operation | Suggest Pro for team features |

### Upgrade Messaging Philosophy

**Don't punish. Celebrate.**

```
❌ "You've hit your limit. Upgrade to continue."

✅ "Amazing! You've got 500 loyal customers. 
    You're ready for Starter - unlock more rewards 
    and keep growing."
```

---

## Competitive Positioning

### vs. Square Loyalty

| Aspect | Square | RewardsPirate |
|--------|--------|---------------|
| Base price | Free (with Square POS) | Free tier available |
| Paid tier | $45/mo/location | $29-79/mo total |
| Requires their POS | Yes | No |
| Multi-location | Per-location pricing | Included in tier |
| Network features | None | Core differentiator |

**Our angle:** "Square locks you in. We work with everything."

### vs. Toast Loyalty

| Aspect | Toast | RewardsPirate |
|--------|-------|---------------|
| Base price | Bundled with POS | Standalone |
| Industry | Restaurants only | Any business |
| Flexibility | Toast ecosystem only | POS-agnostic |

**Our angle:** "Toast is for restaurants on Toast. We're for everyone."

### vs. Stamp/Punch Card Apps

| Aspect | Stamp Apps | RewardsPirate |
|--------|-----------|---------------|
| Price | $10-30/mo | $0-79/mo |
| Features | Basic stamps | Full gamification |
| Network | Single business | Multi-business |
| Growth | Limited | Unlimited potential |

**Our angle:** "Stamp cards are 1990s. This is a loyalty economy."

### Price Positioning

```
MARKET POSITIONING

$10-30/mo  →  Basic punch cards, simple loyalty
$30-50/mo  →  Square, Toast (per location)
$50-100/mo →  RewardsPirate Pro, full-featured
$100+/mo   →  Enterprise, custom solutions

We sit in the "premium but accessible" zone.
More than punch cards, less than enterprise.
```

---

## Future Pricing: Staking & Yield

### Staking Tier Discounts

When staking launches, tenants who stake get fee reductions:

| Tier | Stake | Fee Reduction | Effective Subscription |
|------|-------|---------------|------------------------|
| Deckhand | $0 | 0% | Full price |
| First Mate | $500 | 10% | $71/mo (Pro) |
| Captain | $2,000 | 20% | $63/mo (Pro) |
| Admiral | $10,000 | 35% | $51/mo (Pro) |
| Fleet Commander | $50,000 | 50% | $40/mo (Pro) |

**The psychology:** "Stake more, pay less, earn yield."

### Yield Credits Against Subscription

At higher stake levels, yield can offset or exceed subscription:

| Stake | Monthly Yield (~6% APY) | Pro Subscription | Net Cost |
|-------|-------------------------|------------------|----------|
| $500 | ~$2.50 | $79 | $76.50 |
| $2,000 | ~$10 | $79 | $69 |
| $10,000 | ~$50 | $79 | $29 |
| $25,000 | ~$125 | $79 | **-$46** (profit) |
| $50,000 | ~$250 | $79 | **-$171** (profit) |

**The pitch:** "Stake enough and your loyalty program pays YOU."

### Network Transaction Fees

When Doubloon economy launches:

| Transaction Type | Fee | Who Pays |
|------------------|-----|----------|
| Same-tenant redemption | 0% | N/A |
| Cross-network redemption | 1-2% | Redeeming business |
| External spend (crypto rails) | 2-3% | Customer |
| Cash-out to USD | 2% | Customer/tenant |

---

## Pricing Principles

### 1. Transparency

No hidden fees. No gotchas. Price is price.

```
❌ "$29/mo* (*plus $0.10 per transaction)"
✅ "$29/mo. That's it."
```

### 2. Predictability

Customers should know what they'll pay each month.

```
❌ Usage-based pricing that varies wildly
✅ Flat tiers with clear limits
```

### 3. Fairness

Pricing should feel fair relative to value received.

```
❌ Charge more because we can
✅ Charge based on value delivered
```

### 4. Simplicity

Easy to understand, easy to explain.

```
❌ "Pro includes X, Y, Z add-ons at 20% discount 
    but only if you pay annually and have >3 locations..."
    
✅ "Pro is $79/mo. Here's what you get."
```

### 5. Room to Grow

Leave space for upgrades, add-ons, and new revenue streams.

```
❌ Everything included at one price (no expansion revenue)
✅ Core product + add-ons + future features
```

---

## Discounts & Promotions

### Annual Discount

Pay annually, save 20%:

| Tier | Monthly | Annual (per month) | Annual Total |
|------|---------|-------------------|--------------|
| Starter | $29 | $23 | $276/year |
| Pro | $79 | $63 | $756/year |

**Why 20%:** Industry standard, meaningful enough to matter, not so much we undercut ourselves.

### Promotional Discounts

| Promotion | Discount | When to Use |
|-----------|----------|-------------|
| First month free | 100% off month 1 | Acquisition campaigns |
| 50% off 3 months | 50% x 3 | Win-back churned users |
| Network launch bonus | 25% off year 1 | New network formation |
| Referral credit | $20 credit | Tenant refers tenant |

### What We Don't Discount

- Enterprise pricing (negotiated case-by-case)
- Add-ons (keep them simple)
- Usage overages (pay for what you use)

---

## Revenue Model Summary

### Current Revenue Streams

| Stream | Source | % of Revenue (Target) |
|--------|--------|----------------------|
| Subscriptions | Tier fees | 70% |
| Add-ons | Feature packs | 15% |
| Overages | Limit exceeded | 5% |
| Annual prepay | Cash flow boost | 10% |

### Future Revenue Streams

| Stream | Source | Phase |
|--------|--------|-------|
| Network transaction fees | Cross-redemption | Phase 2 |
| Physical rewards margin | Merch, cards | Phase 2 |
| Staking fee reduction offset | Yield capture | Phase 3 |
| External payment fees | Crypto rails | Phase 4 |
| Enterprise services | Custom integration | Ongoing |

---

## Metrics to Track

### Pricing Health Metrics

| Metric | Target | Warning Sign |
|--------|--------|--------------|
| Free → Paid conversion | 15%+ | < 10% |
| Starter → Pro upgrade | 20%+ | < 10% |
| Annual vs Monthly ratio | 40%+ annual | < 25% |
| Add-on attachment rate | 25%+ | < 15% |
| Revenue per customer | Growing MoM | Declining |
| Churn rate | < 5%/month | > 8%/month |

### Price Sensitivity Signals

Watch for these signals that pricing may need adjustment:

| Signal | Possible Issue |
|--------|----------------|
| High free-to-paid, but high churn | Price too high for value |
| Low free-to-paid, but low churn | Free too generous |
| Everyone on Pro, no Enterprise | Pro ceiling too high |
| Everyone on Starter, few Pro | Pro jump too big |
| Add-on attachment very low | Add-ons not valuable enough |
| Add-on attachment very high | Should be in base tier |

---

## Summary

```
PRICING STRATEGY

FREE ($0)
└── Acquisition funnel, prove value, create switching costs

STARTER ($29/mo)
└── Growing businesses, below impulse threshold, core features

PRO ($79/mo)  
└── Serious operators, full features, under manager approval

ENTERPRISE (Custom)
└── Big fish, negotiated, high-touch sales

ADD-ONS ($19-49/mo)
└── Expand specific capabilities without tier jump

FUTURE: STAKING
└── Stake to reduce fees, yield to offset subscription
└── At $25k+ stake, subscription becomes profit
```

**The North Star:**
> Make pricing so obviously fair that it's never the reason someone doesn't buy.

---

🏴‍☠️ **We're not selling software. We're selling growth. Price accordingly.**
