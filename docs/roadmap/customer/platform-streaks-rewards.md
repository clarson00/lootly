# Platform Streaks & Daily Rewards

> **Status:** 📋 Planned
> **Priority:** High - Drives daily engagement
> **Category:** Customer Gamification

---

## Dependencies

- **Requires:**
  - Customer app (existing)
  - Multi-tenant support (platform-level features)
  - Push notification infrastructure (streak reminders)

- **Enables:**
  - Daily active user growth
  - Habit formation
  - Engagement in sparse markets
  - Platform stickiness independent of tenant activity

---

## Roadmap Position

- **Tier:** 2-3 (Core Infrastructure / Engagement)
- **Phase:** v1.1
- **Category:** Customer / Platform

---

## Cross-References

- Related specs:
  - [Customer Journeys - Morning Open](./customer-journeys-morning-open.md)
  - [Notifications Digest](./notifications-digest.md)
  - [Leaderboards](./leaderboards.md)
  - [Gamification Theme](../../GAMIFICATION.md)

---

## The Problem

**Sparse Market Engagement:** In areas with few businesses, users have no reason to open the app. Even enrolled users may go dormant between visits.

**Solution:** Platform-level rewards for daily engagement, independent of business visits.

---

## Overview

Users earn **platform points** (doubloons) just for opening the app daily. Consecutive days build a **streak** with increasing rewards. This:

1. Creates habit of opening the app
2. Gives users something to do in sparse markets
3. Increases chances they'll discover new businesses
4. Builds platform loyalty separate from any single tenant

---

## Daily Check-in Rewards

### Basic Structure

| Day | Reward | Cumulative |
|-----|--------|------------|
| Day 1 | 5 doubloons | 5 |
| Day 2 | 5 doubloons | 10 |
| Day 3 | 10 doubloons | 20 |
| Day 4 | 10 doubloons | 30 |
| Day 5 | 15 doubloons | 45 |
| Day 6 | 15 doubloons | 60 |
| Day 7 | **25 doubloons + bonus** | 85 |

### Weekly Cycle

After Day 7, streak continues but rewards reset to Day 1 pattern. However, **streak multiplier** increases:

| Week | Multiplier | Day 7 Bonus |
|------|------------|-------------|
| Week 1 | 1x | 25 pts |
| Week 2 | 1.25x | 30 pts |
| Week 3 | 1.5x | 35 pts |
| Week 4+ | 2x | 50 pts |

### Streak Protection

| Feature | Details |
|---------|---------|
| **Grace Period** | 1 "freeze" per week (miss a day without breaking streak) |
| **Streak Shield** | Purchase with points to protect streak (50 pts) |
| **Vacation Mode** | Pause streak for up to 7 days (once per month) |

---

## User Experience

### Daily Check-in Flow

```
┌─────────────────────────────────────────────────────────────┐
│ 🏴‍☠️ Daily Check-in                                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                    🔥 Day 5 Streak!                         │
│                                                             │
│     ●───●───●───●───●───○───○                              │
│     1   2   3   4   5   6   7                              │
│                                                             │
│              +15 doubloons today!                          │
│                                                             │
│     ┌─────────────────────────────────────────┐            │
│     │         🪙 +15                          │            │
│     │    [Animated coin drop]                 │            │
│     └─────────────────────────────────────────┘            │
│                                                             │
│     Total Balance: 1,247 doubloons                         │
│                                                             │
│     🎯 2 more days for weekly bonus!                       │
│                                                             │
│     [Continue to Home →]                                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Streak at Risk Notification

```
┌─────────────────────────────────────────────────────────────┐
│ 🔥 Your 12-day streak is at risk!                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Open Rewards Pirate before midnight to keep your streak!   │
│                                                             │
│ [Open App]                                                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Streak Lost Recovery

```
┌─────────────────────────────────────────────────────────────┐
│ 😢 Streak Lost                                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Your 12-day streak ended.                                  │
│                                                             │
│ But don't worry! Start fresh today:                        │
│                                                             │
│     ●───○───○───○───○───○───○                              │
│     1   2   3   4   5   6   7                              │
│                                                             │
│              +5 doubloons today!                           │
│                                                             │
│ 💡 Tip: Turn on notifications to never miss a day!        │
│                                                             │
│ [Start New Streak →]                                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Streak Milestones

### Achievement Badges

| Milestone | Badge | Bonus |
|-----------|-------|-------|
| 7-day streak | "Week Warrior" | 50 pts |
| 30-day streak | "Monthly Master" | 200 pts |
| 100-day streak | "Century Captain" | 500 pts |
| 365-day streak | "Year of the Pirate" | 2000 pts |

### Leaderboard Integration

Streaks appear on platform leaderboard:

```
┌─────────────────────────────────────────────────────────────┐
│ 🏆 Top Streaks                                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ 1. Captain Mike      🔥 147 days                           │
│ 2. Sarah S.          🔥 89 days                            │
│ 3. Pizza_Lover_42    🔥 72 days                            │
│ ...                                                        │
│ 47. You              🔥 12 days                            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Bonus Activities

Beyond daily check-in, users can earn extra platform points:

### Daily Bonus Tasks

| Task | Reward | Frequency |
|------|--------|-----------|
| Open app | 5-25 pts | Daily (streak) |
| View a business profile | 5 pts | Daily |
| Check rewards catalog | 5 pts | Daily |
| Share to social | 10 pts | Daily (max 1) |
| Invite a friend | 25 pts | Unlimited |
| Complete a voyage step | 10 pts | Per step |

### Weekly Challenges

```
┌─────────────────────────────────────────────────────────────┐
│ 📋 This Week's Challenges                                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ [✓] Open app 3 days                    +20 pts ✓          │
│ [▪▪▪○○] Visit 2 different businesses    +50 pts            │
│ [▪○○○○] Refer a friend                  +100 pts           │
│ [○] Try a new business                  +30 pts            │
│                                                             │
│ Complete all: +50 bonus pts                                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Platform Points Economy

### Where Platform Points Come From

| Source | Points |
|--------|--------|
| Daily check-in | 5-50/day |
| Streak milestones | 50-2000 |
| Weekly challenges | 50-200/week |
| Referrals | 25-100 |
| Social sharing | 10-25 |

### Where Platform Points Go

Platform points are **separate from business points** but can be:

1. **Converted to business points** (at business's discretion)
2. **Used for platform rewards** (merch, premium features)
3. **Used for streak protection** (shields, freezes)

### Conversion Options

```
┌─────────────────────────────────────────────────────────────┐
│ 💱 Convert Platform Points                                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Your platform balance: 1,247 doubloons                     │
│                                                             │
│ Convert to business points:                                │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 🍕 Tony's Restaurant                                    │ │
│ │    100 platform pts → 50 Tony's pts                     │ │
│ │    [Convert]                                            │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ☕ Bean There Coffee                                    │ │
│ │    100 platform pts → 75 Bean There pts                 │ │
│ │    [Convert]                                            │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ Note: Conversion rates set by each business               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Database Schema

```sql
-- Daily check-ins
CREATE TABLE platform_checkins (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL,
  checked_in_at DATE NOT NULL,          -- Date only, not timestamp
  points_earned INT NOT NULL,
  streak_day INT NOT NULL,              -- Which day of streak (1-7)
  streak_week INT NOT NULL,             -- Which week of streak
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(customer_id, checked_in_at)    -- One check-in per day
);

-- Streak tracking
CREATE TABLE customer_streaks (
  customer_id TEXT PRIMARY KEY,
  current_streak INT DEFAULT 0,
  longest_streak INT DEFAULT 0,
  last_checkin_date DATE,
  streak_freezes_remaining INT DEFAULT 1,  -- Resets weekly
  streak_shields INT DEFAULT 0,            -- Purchased protection
  vacation_mode_until DATE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Platform point balance (separate from business points)
CREATE TABLE platform_points (
  customer_id TEXT PRIMARY KEY,
  balance INT DEFAULT 0,
  lifetime_earned INT DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Platform point transactions
CREATE TABLE platform_point_transactions (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL,
  amount INT NOT NULL,                   -- Positive = earn, negative = spend
  source TEXT NOT NULL,                  -- 'checkin', 'milestone', 'referral', 'conversion'
  reference_id TEXT,                     -- Related entity ID
  balance_after INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_checkins_customer_date ON platform_checkins(customer_id, checked_in_at);
CREATE INDEX idx_streaks_current ON customer_streaks(current_streak DESC);
```

---

## API Endpoints

```typescript
// Check in for the day
POST /api/customer/platform/checkin
// Response
{
  success: true,
  pointsEarned: 15,
  streakDay: 5,
  streakWeek: 2,
  currentStreak: 12,
  multiplier: 1.25,
  newBalance: 1247,
  milestoneUnlocked: null,  // or { name: "Week Warrior", bonus: 50 }
  nextMilestone: { name: "Monthly Master", daysAway: 18 }
}

// Get streak status
GET /api/customer/platform/streak
// Response
{
  currentStreak: 12,
  longestStreak: 23,
  lastCheckinDate: "2025-01-29",
  checkedInToday: false,
  freezesRemaining: 1,
  shieldsOwned: 2,
  daysUntilWeeklyBonus: 2,
  multiplier: 1.25
}

// Use streak freeze
POST /api/customer/platform/streak/freeze
// Uses one freeze to preserve streak

// Buy streak shield
POST /api/customer/platform/streak/shield
// Costs 50 platform points

// Get platform point balance
GET /api/customer/platform/points
// Response
{
  balance: 1247,
  lifetimeEarned: 3580,
  recentTransactions: [...]
}

// Convert to business points
POST /api/customer/platform/points/convert
{
  businessId: "biz_tonys",
  platformPoints: 100
}
```

---

## Notification Strategy

### Streak Reminders

| Time | Notification | Condition |
|------|--------------|-----------|
| 6 PM | "Don't forget to check in today!" | Not checked in, streak > 3 |
| 9 PM | "🔥 Your X-day streak is at risk!" | Not checked in, streak > 7 |
| Next day 8 AM | "Start a new streak today!" | Streak broken yesterday |

### Milestone Celebrations

| Event | Notification |
|-------|--------------|
| 7-day streak | "🏆 Week Warrior! You earned 50 bonus doubloons!" |
| 30-day streak | "🔥 30 days! You're on fire, Captain!" |
| New longest streak | "🎉 New personal best: X days!" |

---

## Implementation Plan

### Phase 1: Basic Streaks
- [ ] Daily check-in tracking
- [ ] Streak calculation logic
- [ ] Points earning (daily + streak bonus)
- [ ] Check-in UI in app

### Phase 2: Streak Protection
- [ ] Freeze system (1 per week)
- [ ] Streak shields (purchasable)
- [ ] Vacation mode

### Phase 3: Milestones & Badges
- [ ] Streak milestone badges
- [ ] Bonus points for milestones
- [ ] Badge display on profile

### Phase 4: Notifications
- [ ] Streak at risk reminders
- [ ] Milestone celebrations
- [ ] Notification preferences

### Phase 5: Advanced
- [ ] Weekly challenges
- [ ] Bonus activities beyond check-in
- [ ] Platform points conversion
- [ ] Streak leaderboard

---

## Anti-Gaming Measures

| Abuse | Mitigation |
|-------|------------|
| Multiple check-ins per day | Unique constraint on customer + date |
| Time zone manipulation | Server-side date based on user's registered timezone |
| Bot check-ins | Rate limiting, device fingerprinting |
| Account switching | Phone verification required |

---

## Open Questions

1. **Platform points vs business points?** Keep separate or unified?
2. **Timezone handling?** User's local midnight or UTC?
3. **Streak visibility?** Show on profile? Leaderboard?
4. **Conversion rates?** Let businesses set their own? Platform default?

---

*Last updated: January 2025*
