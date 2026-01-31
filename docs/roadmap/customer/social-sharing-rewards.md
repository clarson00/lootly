# Social Sharing Rewards

> **Status:** 📋 Planned
> **Priority:** Medium - Drives viral growth
> **Entitlement:** Pro tier or Social Add-on

---

## Dependencies

- **Requires:**
  - Rules engine (existing - can add as trigger type)
  - Customer app social share capability
  - Share verification method

- **Enables:**
  - Viral growth
  - User-generated marketing
  - Brand awareness
  - Social proof

---

## Roadmap Position

- **Tier:** 3-4 (Engagement/Gamification)
- **Phase:** v1.2-v2.0
- **Category:** Customer + Tenant

---

## Cross-References

- Related specs:
  - [Rules Engine](../../RULES_ENGINE.md)
  - [Marketing Social Posting](../tenant/marketing-social-posting.md)
  - [Referrals](./referrals.md)
  - [Friend System](./friend-system.md)

---

## Overview

Reward customers with bonus points when they share their achievements, rewards, or experiences to social media. Turns customers into brand ambassadors.

---

## What Customers Can Share

### Shareable Content

| Content Type | Example | Trigger |
|--------------|---------|---------|
| **Achievement Unlocked** | "I just earned Free Appetizer at Tony's!" | Reward unlock |
| **Voyage Completed** | "I conquered the Weekend Warrior voyage!" | Voyage completion |
| **Level Up** | "I reached Gold status at Tony's!" | Tier promotion |
| **Check-in** | "Just dropped anchor at Tony's Downtown!" | Check-in |
| **Milestone** | "100th visit to Tony's!" | Visit milestone |

### Share Content Template

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   🏴‍☠️ TREASURE UNLOCKED!                                    │
│                                                             │
│   I just earned a FREE APPETIZER                           │
│   at Tony's Restaurant!                                     │
│                                                             │
│   🪙 1,234 doubloons earned                                │
│   🏆 Gold Crew Member                                       │
│                                                             │
│   Join the crew: rewardspirate.com/tonys                   │
│                                                             │
│   #RewardsPirate #TonysRestaurant                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Share Flow

### Customer Experience

```
┌─────────────────────────────────────────────────────────────┐
│ 🎉 You unlocked Free Appetizer!                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│      🎁                                                     │
│    [Treasure Chest Animation]                              │
│                                                             │
│    FREE APPETIZER                                          │
│    Ready to claim on your next visit!                      │
│                                                             │
│ ─────────────────────────────────────────────────────────   │
│                                                             │
│ Share your achievement and earn 25 bonus doubloons!        │
│                                                             │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐          │
│ │   📘    │ │   📸    │ │   🐦    │ │   💬    │          │
│ │Facebook │ │Instagram│ │ Twitter │ │ Message │          │
│ └─────────┘ └─────────┘ └─────────┘ └─────────┘          │
│                                                             │
│                    [Maybe Later]                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### After Sharing

```
┌─────────────────────────────────────────────────────────────┐
│ ✓ Shared!                                                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ 🎉 +25 bonus doubloons earned!                             │
│                                                             │
│ Thanks for spreading the word, Captain Sarah!              │
│                                                             │
│ New Balance: 1,259 doubloons                               │
│                                                             │
│                    [Continue]                              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Verification Challenge

### The Problem

How do we know the customer actually shared?

### Verification Options

| Method | Reliability | User Friction | Implementation |
|--------|-------------|---------------|----------------|
| **Honor system** | Low | None | Easy |
| **Share intent** | Medium | Low | Medium |
| **Screenshot upload** | High | High | Medium |
| **API verification** | Very High | None | Hard (API limits) |
| **Link click tracking** | Medium | None | Medium |

### Recommended Approach: Share Intent + Link Tracking

1. **Share Intent:** Award points when user taps share button (opens share dialog)
2. **Link Tracking:** Include tracked link - if clicked by others, bonus points
3. **Rate Limiting:** Max 1 share reward per achievement, 5 per day total

```typescript
// Share rule configuration
{
  trigger: 'share_intent',
  conditions: {
    shareType: ['achievement', 'voyage', 'level_up'],
    platforms: ['facebook', 'instagram', 'twitter', 'sms'],
    maxPerDay: 5,
    maxPerAchievement: 1
  },
  award: {
    type: 'points',
    value: 25
  },
  bonusAward: {
    // Extra points if share link gets clicked
    trigger: 'share_link_clicked',
    value: 10,
    maxClicks: 5  // Cap to prevent gaming
  }
}
```

---

## Tenant Configuration

### Share Rules Setup

```
┌─────────────────────────────────────────────────────────────┐
│ Social Sharing Rewards                          [Enabled ✓] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Reward customers when they share:                          │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ [✓] Achievement unlocked (reward earned)    +25 pts    │ │
│ │ [✓] Voyage completed                        +50 pts    │ │
│ │ [✓] Level/tier promotion                    +100 pts   │ │
│ │ [ ] Check-ins                               +10 pts    │ │
│ │ [ ] Any activity                            +5 pts     │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ Limits:                                                    │
│ Max shares rewarded per day: [5  ]                         │
│ Max per achievement: [1  ]                                 │
│                                                             │
│ Bonus for engagement:                                      │
│ [✓] +10 pts when share link is clicked (max 5 clicks)     │
│                                                             │
│ Allowed platforms:                                         │
│ [✓] Facebook  [✓] Instagram  [✓] Twitter                  │
│ [✓] SMS/Message  [ ] Email  [ ] Copy Link                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Share Content Customization

```
┌─────────────────────────────────────────────────────────────┐
│ Share Content Templates                                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Achievement Share:                                         │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ I just earned {reward_name} at {business_name}! 🎉      │ │
│ │                                                         │ │
│ │ {points_total} doubloons and counting...               │ │
│ │                                                         │ │
│ │ Join the crew: {referral_link}                         │ │
│ │ #RewardsPirate #{business_hashtag}                     │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ Variables: {reward_name}, {business_name}, {points_total}, │
│           {tier_name}, {referral_link}, {business_hashtag} │
│                                                             │
│ [Preview]  [Save Template]                                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Database Schema

```sql
-- Track share events
CREATE TABLE social_shares (
  id TEXT PRIMARY KEY,              -- 'share_' prefix
  customer_id TEXT NOT NULL,
  business_id TEXT NOT NULL,
  share_type TEXT NOT NULL,         -- 'achievement', 'voyage', 'level_up', 'checkin'
  reference_id TEXT,                -- reward_id, voyage_id, etc.
  platform TEXT NOT NULL,           -- 'facebook', 'instagram', 'twitter', 'sms'
  share_link TEXT,                  -- Tracked link
  points_awarded INT NOT NULL,
  bonus_points_awarded INT DEFAULT 0,
  link_clicks INT DEFAULT 0,
  shared_at TIMESTAMPTZ DEFAULT NOW()
);

-- Track link clicks (for bonus points)
CREATE TABLE share_link_clicks (
  id TEXT PRIMARY KEY,
  share_id TEXT NOT NULL,
  clicked_at TIMESTAMPTZ DEFAULT NOW(),
  ip_hash TEXT,                     -- Hashed IP for dedup
  user_agent TEXT,
  converted BOOLEAN DEFAULT FALSE   -- Did clicker sign up?
);

-- Daily share limits
CREATE INDEX idx_shares_daily ON social_shares(customer_id, DATE(shared_at));
```

---

## API Endpoints

```typescript
// Get shareable content (customer)
GET /api/customer/share/content?type=achievement&id=reward_123

// Response
{
  content: {
    text: "I just earned Free Appetizer at Tony's!",
    hashtags: ["RewardsPirate", "TonysRestaurant"],
    link: "https://rp.link/t/abc123",  // Tracked link
    image: "https://cdn.../share-card.png"
  },
  reward: {
    points: 25,
    eligible: true,
    reason: null  // or "Already shared" / "Daily limit reached"
  }
}

// Record share (customer)
POST /api/customer/share
{
  type: "achievement",
  referenceId: "reward_123",
  platform: "facebook"
}

// Response
{
  success: true,
  pointsAwarded: 25,
  newBalance: 1259,
  shareId: "share_xyz789"
}

// Track link click (public - no auth)
GET /rp.link/t/:trackingCode
// Redirects to destination, records click

// Get share analytics (admin)
GET /api/admin/analytics/shares
?startDate=2025-01-01
&endDate=2025-01-31
```

---

## Share Card Generation

Auto-generate attractive share images:

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                    [Business Logo]                          │
│                                                             │
│              🏴‍☠️ TREASURE UNLOCKED! 🏴‍☠️                      │
│                                                             │
│                  FREE APPETIZER                             │
│                                                             │
│              [Customer Avatar]                             │
│              Captain Sarah                                  │
│              Gold Crew Member                               │
│                                                             │
│              rewardspirate.com/tonys                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

- Generated server-side or via Cloudinary/similar
- Cached for performance
- Branded with business logo
- Includes customer achievement

---

## Anti-Gaming Measures

### Prevent Abuse

| Abuse Vector | Mitigation |
|--------------|------------|
| Spam sharing | Daily limit (5 shares) |
| Fake shares | Share intent verification |
| Click farming | IP dedup, max bonus clicks |
| Multiple accounts | Phone verification |
| Bot clicking | Rate limiting, captcha on sign up |

### Suspicious Activity Detection

```typescript
// Flag suspicious patterns
const suspiciousPatterns = {
  rapidShares: count > 3 && timeSpan < 60, // 3+ shares in 1 min
  sameIPClicks: uniqueIPs < totalClicks * 0.5, // Too many from same IP
  instantClicks: avgTimeToClick < 5, // Clicks too fast after share
};
```

---

## Implementation Plan

### Phase 1: Basic Sharing
- [ ] Share button on achievements/voyages
- [ ] Native share dialog integration
- [ ] Share intent tracking
- [ ] Points award on share

### Phase 2: Link Tracking
- [ ] Tracked link generation
- [ ] Click recording endpoint
- [ ] Bonus points for clicks
- [ ] Basic analytics

### Phase 3: Content Generation
- [ ] Share card image generation
- [ ] Template customization (admin)
- [ ] Platform-specific formatting

### Phase 4: Analytics & Optimization
- [ ] Share analytics dashboard
- [ ] Conversion tracking
- [ ] A/B testing share content
- [ ] Referral attribution

---

## Metrics to Track

- Shares per day/week/month
- Share rate (shares / achievements)
- Click-through rate on share links
- Conversion rate (clicks → signups)
- Top shared content types
- Platform breakdown

---

## Open Questions

1. **Verification strictness?** Honor system vs requiring proof?
2. **Share card hosting?** Generate on-demand or pre-generate?
3. **Platform priorities?** Which platforms first?
4. **Referral integration?** Should share link sign-ups count as referrals?

---

*Last updated: January 2025*
