# Marketing Messages

> **Status:** 📋 Planned  
> **Target Release:** v1.1  
> **Roadmap:** [ROADMAP.md](../../ROADMAP.md) — Section: NEXT  
> **Location:** `docs/roadmap/marketing-messages.md`  

## Overview

Allow business owners to send marketing communications to their loyalty program members via push notifications, in-app messages, and potentially SMS/email.

## Message Types

| Type | Channel | Use Case |
|------|---------|----------|
| Push notification | Mobile | Instant alerts, promos |
| In-app message | App | Announcements, news |
| SMS | Text | Important updates (opt-in) |
| Email | Email | Newsletters (future) |

## Use Cases

### Promotional
- "🔥 Double points this weekend!"
- "New menu item — try it and earn bonus points!"
- "Flash sale: 3x points for the next 4 hours!"

### Informational
- "We're opening a new location!"
- "Holiday hours update"
- "New reward available in your tier"

### Personalized
- "Hey Sarah, you're 10 points away from a free pizza!"
- "We miss you! Here's 50 bonus points to come back"
- "Happy birthday! Enjoy double points today"

### Triggered
- "Welcome to Lootly! Here's how to earn your first reward..."
- "Congrats on reaching Gold status!"
- "Your reward expires in 3 days"

## Admin Experience

### Message Composer
```
┌─────────────────────────────────────────────┐
│ Create Message                              │
├─────────────────────────────────────────────┤
│ Title: [Double Points Weekend!            ] │
│                                             │
│ Message:                                    │
│ ┌─────────────────────────────────────────┐ │
│ │ 🎉 This Saturday & Sunday only!         │ │
│ │ Earn DOUBLE points on every purchase.   │ │
│ │ Don't miss out!                         │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ Channel:                                    │
│ ☑ Push notification                         │
│ ☑ In-app message                           │
│ ☐ SMS (costs apply)                        │
│                                             │
│ Audience:                                   │
│ ○ All members                               │
│ ○ Segment: [Active last 30 days    ▼]      │
│ ○ Custom: [Select customers...]            │
│                                             │
│ Timing:                                     │
│ ○ Send now                                  │
│ ○ Schedule: [2024-03-15] [9:00 AM]         │
│                                             │
│ [Preview] [Send Test] [Schedule]            │
└─────────────────────────────────────────────┘
```

### Audience Segments (Future)

| Segment | Definition |
|---------|------------|
| All members | Everyone enrolled |
| Active | Visited in last 30 days |
| At risk | No visit in 60+ days |
| VIP | Top 10% by spend |
| New | Joined in last 7 days |
| Birthday | Birthday this week |
| Near reward | Within 20% of next reward |
| Custom | Build your own rules |

## Customer Experience

### Push Notification
```
┌─────────────────────────────────────────┐
│ 🍕 Tony's Restaurant Group              │
│ 🔥 Double Points Weekend!               │
│ This Saturday & Sunday only! Earn       │
│ DOUBLE points on every purchase...      │
│                              2m ago     │
└─────────────────────────────────────────┘
```

### In-App Message
```
┌─────────────────────────────────────────┐
│                    ╳                    │
│                                         │
│           🎉 DOUBLE POINTS 🎉           │
│                                         │
│     This Saturday & Sunday only!        │
│    Earn DOUBLE points on every          │
│           purchase.                     │
│                                         │
│         [Got It!]  [Remind Me]          │
│                                         │
└─────────────────────────────────────────┘
```

## Data Model

```sql
-- Marketing Messages
CREATE TABLE marketing_messages (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  image_url TEXT,
  action_url TEXT,  -- Deep link into app
  channels JSON,  -- ['push', 'in_app', 'sms']
  audience_type TEXT,  -- 'all', 'segment', 'custom'
  audience_segment TEXT,  -- Segment name or custom query
  audience_customer_ids JSON,  -- For custom audience
  status TEXT DEFAULT 'draft',  -- 'draft', 'scheduled', 'sent', 'cancelled'
  scheduled_at DATETIME,
  sent_at DATETIME,
  created_by TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Message Delivery Tracking
CREATE TABLE message_deliveries (
  id TEXT PRIMARY KEY,
  message_id TEXT NOT NULL REFERENCES marketing_messages(id),
  customer_id TEXT NOT NULL REFERENCES customers(id),
  channel TEXT NOT NULL,  -- 'push', 'in_app', 'sms'
  status TEXT,  -- 'sent', 'delivered', 'opened', 'clicked', 'failed'
  sent_at DATETIME,
  delivered_at DATETIME,
  opened_at DATETIME,
  clicked_at DATETIME,
  error TEXT
);
```

## Analytics

### Message Performance
- Sent count
- Delivery rate
- Open rate (push)
- Click rate
- Conversion rate (visits after message)

### Dashboard View
```
┌─────────────────────────────────────────────┐
│ Recent Campaigns                            │
├─────────────────────────────────────────────┤
│ Double Points Weekend          │ Sent 3/15  │
│ ████████████████░░░░ 78% opened            │
│ 156 visits attributed                       │
├─────────────────────────────────────────────┤
│ New Location Announcement      │ Sent 3/10  │
│ ██████████████░░░░░░ 65% opened            │
│ 89 visits attributed                        │
└─────────────────────────────────────────────┘
```

## Technical Requirements

### Push Notifications
- Firebase Cloud Messaging (FCM) for Android
- Apple Push Notification Service (APNs) for iOS
- Web Push for PWA (limited on iOS)

### Rate Limiting
- Max 1 push per customer per hour
- Max 3 pushes per customer per day
- Quiet hours setting (no notifications 10pm-8am)

### Opt-Out
- Customers can disable push notifications
- Customers can disable marketing messages specifically
- Unsubscribe link in SMS/email

## MVP vs Full Version

### MVP
- Push notifications only
- Send to all members
- Send immediately
- Basic delivery tracking

### Full Version
- Multiple channels (push, in-app, SMS, email)
- Audience segmentation
- Scheduled sending
- Full analytics
- A/B testing
- Automated triggered messages
- Template library

## Related Features

- [Push Notifications](push-notifications.md) — Delivery infrastructure
- [Time-Bound Promos](time-bound-promos.md) — Promo announcements
- [User Journeys](user-journeys.md) — Journey notifications
- [Analytics](analytics.md) — Campaign performance

---

← Back to [ROADMAP.md](../../ROADMAP.md)