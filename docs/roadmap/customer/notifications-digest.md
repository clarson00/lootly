# Customer Notification Digest

> **Status:** Planning
> **Priority:** High (Tier 3 - Engagement Layer)
> **Category:** Customer

---

## Overview

A smart notification system that batches and consolidates updates from multiple businesses into digestible summaries, preventing notification overload while maintaining engagement.

---

## Dependencies

- **Requires:**
  - Notification infrastructure (push notification system)
  - Multi-tenant support (multiple businesses per customer)

- **Enables:**
  - Sustainable multi-business engagement
  - Marketing message delivery
  - Friend activity notifications
  - Platform-wide announcements

---

## Roadmap Position

- **Tier:** 3 (Engagement Layer)
- **Phase:** v1.1-v1.2
- **Category:** Customer

---

## Cross-References

- Related specs:
  - [Notification Infrastructure](../platform/notification-infrastructure.md)
  - [Multi-Tenant Support](../platform/multi-tenant-support.md)
  - [Marketing Messages](../tenant/marketing-messages.md)
  - [Friend System](./friend-system.md)

---

## The Problem

With multiple businesses, each could trigger notifications:
- "You earned 50 points at Tony's!"
- "New reward available at Coffee Co!"
- "Voyage step completed!"

Multiplied by N businesses = **notification overload** = users disable notifications = lost engagement.

---

## Solution: The Digest Approach

### Core Principle

Instead of individual notifications for every event:

```
❌ BAD: 10 separate notifications
- You earned 50 points at Tony's
- You earned 30 points at Coffee Co
- New reward at Tony's
- Voyage progress at Coffee Co
- (repeat for every business...)
```

Consolidate into meaningful digests:

```
✅ GOOD: 1-2 notifications per day
- "🏴‍☠️ You have 5 updates in Rewards Pirate"
- Opens app → sees consolidated update feed
```

---

## Notification Tiers

### Tier 1: Immediate (Real-Time)
High-priority events that warrant immediate attention:

| Event | Example |
|-------|---------|
| Reward unlocked | "You unlocked Free Appetizer!" |
| Voyage completed | "You conquered the Weekend Warrior voyage!" |
| Reward expiring (24h) | "Your Free Coffee expires tomorrow!" |
| Friend request | "Captain Sarah wants to join your crew!" |

### Tier 2: Same-Day Digest
Medium-priority events batched into daily digest:

| Event | Example |
|-------|---------|
| Points earned | "You earned 250 points today across 3 businesses" |
| Voyage progress | "You completed 2 voyage steps today" |
| Friend activity | "3 friends earned rewards today" |
| New promotions | "2 businesses have new promotions" |

### Tier 3: Weekly Summary
Low-priority events in weekly recap:

| Event | Example |
|-------|---------|
| Leaderboard changes | "You moved up 5 spots at Tony's" |
| New businesses nearby | "3 new businesses joined near you" |
| Achievement progress | "You're 2 visits away from your next badge" |

---

## Digest Consolidation Logic

### Smart Batching Rules

```typescript
// Group similar events
const digestRules = {
  // Combine points from same business
  points_earned: {
    groupBy: ['businessId', 'date'],
    consolidate: (events) => ({
      message: `You earned ${sum(events, 'points')} points at ${events[0].businessName}`,
      totalPoints: sum(events, 'points')
    })
  },

  // Combine voyage progress
  voyage_progress: {
    groupBy: ['voyageId'],
    consolidate: (events) => ({
      message: `${events.length} steps completed on "${events[0].voyageName}"`,
      stepsCompleted: events.length
    })
  },

  // Combine friend activity
  friend_activity: {
    groupBy: ['date'],
    consolidate: (events) => ({
      message: `${events.length} friends were active today`,
      friends: unique(events, 'friendId')
    })
  }
};
```

### Example Digest Compilation

**Raw events (1 day):**
- 10am: 50 points at Tony's
- 12pm: 30 points at Tony's
- 2pm: Voyage step at Coffee Co
- 3pm: 100 points at Coffee Co
- 5pm: Voyage step at Coffee Co
- 6pm: Friend earned reward

**Compiled digest:**
```
🏴‍☠️ Today's Treasure Report

Tony's Downtown
  💰 80 doubloons earned

Coffee Co
  💰 100 doubloons earned
  🗺️ 2 voyage steps completed

Your Crew
  🎉 1 friend earned a reward

[Open App for Details]
```

---

## Digest Timing

### User Preferences

```typescript
interface DigestPreferences {
  enabled: boolean;
  dailyDigestTime: string;      // "09:00" - when to send daily digest
  weeklyDigestDay: string;      // "sunday" - which day for weekly
  quietHoursStart: string;      // "22:00"
  quietHoursEnd: string;        // "08:00"
  timezone: string;             // "America/Chicago"
}
```

### Smart Timing (Future)

- Learn when user typically opens app
- Send digest 30 min before usual engagement time
- Adjust based on engagement patterns

---

## In-App Notification Center

When user opens app after digest notification:

```
┌─────────────────────────────────────────────────────┐
│  🔔 Updates (5 new)                    [Mark Read] │
├─────────────────────────────────────────────────────┤
│                                                     │
│  TODAY                                              │
│  ─────────────────────────────────────────────     │
│                                                     │
│  💰 Tony's Downtown                     2:34 PM    │
│     You earned 80 doubloons today                  │
│     [View Transactions →]                          │
│                                                     │
│  🗺️ Coffee Co                           5:12 PM    │
│     2 steps completed on "Caffeine Quest"          │
│     [Continue Voyage →]                            │
│                                                     │
│  🎉 Crew Activity                       6:45 PM    │
│     Captain Sarah earned "Free Latte"              │
│     [See Activity →]                               │
│                                                     │
│  YESTERDAY                                          │
│  ─────────────────────────────────────────────     │
│                                                     │
│  🎁 New Reward Unlocked!                           │
│     "Free Appetizer" is ready to claim             │
│     [Claim Now →]                                  │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## Database Schema

```sql
-- Pending notifications (pre-digest)
CREATE TABLE notification_queue (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL,
  business_id TEXT,
  notification_type TEXT NOT NULL,
  priority TEXT DEFAULT 'digest',  -- 'immediate', 'digest', 'weekly'
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  digest_id TEXT                   -- Which digest included this
);

-- Compiled digests
CREATE TABLE notification_digests (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL,
  digest_type TEXT NOT NULL,       -- 'daily', 'weekly'
  content JSONB NOT NULL,
  notification_count INT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ
);

-- In-app notification center items
CREATE TABLE notification_center (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL,
  notification_type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  data JSONB,
  business_id TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ
);

CREATE INDEX idx_notification_center_customer
ON notification_center(customer_id, is_read, created_at DESC);
```

---

## API Endpoints

```typescript
// Get notification center items
GET /api/customer/notifications
?unread_only=true
&limit=50

// Mark notifications as read
POST /api/customer/notifications/mark-read
{ notificationIds: string[] }

// Mark all as read
POST /api/customer/notifications/mark-all-read

// Get unread count (for badge)
GET /api/customer/notifications/unread-count

// Update digest preferences
PUT /api/customer/notifications/preferences
{
  enabled: boolean,
  dailyDigestTime: string,
  quietHoursStart: string,
  quietHoursEnd: string,
  timezone: string
}
```

---

## Implementation Plan

### Phase 1: Notification Queue
- [ ] Create notification queue table
- [ ] Queue events instead of immediate send
- [ ] Priority classification logic
- [ ] Immediate notification delivery (tier 1)

### Phase 2: Daily Digest
- [ ] Digest compilation job
- [ ] Smart batching logic
- [ ] Digest push notification
- [ ] Digest preferences UI

### Phase 3: In-App Center
- [ ] Notification center table
- [ ] Notification center UI
- [ ] Unread badge/indicator
- [ ] Mark as read functionality

### Phase 4: Optimization
- [ ] Smart timing based on user behavior
- [ ] A/B testing digest formats
- [ ] Engagement analytics
- [ ] Weekly summary digest

---

## Metrics to Track

- Digest open rate
- Time-to-open after digest sent
- Notification center engagement
- Opt-out rate
- Comparison: digest vs immediate engagement

---

## Open Questions

1. **Rich vs simple?** HTML email-style digest vs simple text?
2. **Multiple digests?** One digest or separate per business?
3. **Snooze?** Let users snooze digests temporarily?
4. **Channels?** Push only, or also email/SMS digest option?

---

*Last updated: January 2025*
