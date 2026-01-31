# Push Notification Infrastructure

> **Status:** Planning
> **Priority:** High (Tier 2 - Core Infrastructure)
> **Category:** Platform

---

## Overview

Foundation for all push notification capabilities across the platform. This infrastructure enables tenant marketing messages, customer engagement notifications, and platform-wide announcements.

---

## Dependencies

- **Requires:**
  - Multi-tenant support (customer enrolled at multiple businesses)
  - Customer app deployed and running

- **Enables:**
  - Marketing Messages (tenant → customer notifications)
  - Customer Notification Digest (consolidated updates)
  - Friend activity notifications
  - Voyage progress alerts
  - Reward expiration reminders

---

## Roadmap Position

- **Tier:** 2 (Core Infrastructure)
- **Phase:** v1.1
- **Category:** Platform

---

## Cross-References

- Related specs:
  - [Marketing Messages](../tenant/marketing-messages.md)
  - [Customer Notification Digest](../customer/notifications-digest.md)
  - [Multi-Tenant Support](./multi-tenant-support.md)

---

## Technical Approach

### Service Provider Options

| Provider | Pros | Cons |
|----------|------|------|
| **Firebase Cloud Messaging** | Free tier, cross-platform | Google dependency |
| **OneSignal** | Easy setup, good free tier | Less control |
| **AWS SNS + Pinpoint** | Scalable, analytics | More complex |
| **Expo Push** | If using Expo for mobile | Limited to Expo apps |

**Recommended:** Firebase Cloud Messaging (FCM) for initial implementation due to:
- PWA support via Web Push
- Cross-platform (iOS/Android/Web)
- Generous free tier
- Well-documented

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Notification Service                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │   Triggers   │───▶│    Queue     │───▶│   Delivery   │  │
│  │              │    │  (Bull/Redis)│    │   (FCM/APNs) │  │
│  └──────────────┘    └──────────────┘    └──────────────┘  │
│        │                    │                    │          │
│        ▼                    ▼                    ▼          │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │ Event Types  │    │  Batching &  │    │   Delivery   │  │
│  │ - Marketing  │    │  Rate Limit  │    │   Tracking   │  │
│  │ - System     │    │              │    │              │  │
│  │ - Social     │    │              │    │              │  │
│  └──────────────┘    └──────────────┘    └──────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Database Schema

```sql
-- Customer device tokens
CREATE TABLE customer_push_tokens (
  id TEXT PRIMARY KEY,           -- 'cpt_' prefix
  customer_id TEXT NOT NULL,
  token TEXT NOT NULL,
  platform TEXT NOT NULL,        -- 'web', 'ios', 'android'
  device_info JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  UNIQUE(customer_id, token)
);

-- Notification log
CREATE TABLE notifications_sent (
  id TEXT PRIMARY KEY,           -- 'notif_' prefix
  customer_id TEXT NOT NULL,
  business_id TEXT,              -- NULL for platform notifications
  notification_type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  data JSONB,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  delivered_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending'  -- pending, sent, delivered, failed
);

-- Customer notification preferences
CREATE TABLE customer_notification_prefs (
  customer_id TEXT PRIMARY KEY,
  global_enabled BOOLEAN DEFAULT TRUE,
  digest_enabled BOOLEAN DEFAULT TRUE,
  digest_time TIME DEFAULT '09:00',
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  per_business_settings JSONB    -- { "biz_abc": { "enabled": true, "priority": "high" } }
);
```

### API Endpoints

```typescript
// Register device token
POST /api/customer/push/register
{
  token: string,
  platform: 'web' | 'ios' | 'android',
  deviceInfo?: { model, os, appVersion }
}

// Update preferences
PUT /api/customer/notifications/preferences
{
  globalEnabled?: boolean,
  digestEnabled?: boolean,
  digestTime?: string,
  quietHours?: { start: string, end: string },
  businessSettings?: Record<string, { enabled: boolean, priority: string }>
}

// Get notification history
GET /api/customer/notifications?limit=50&offset=0

// Mark as read
POST /api/customer/notifications/:id/read
```

### Notification Types

| Type | Trigger | Default Priority |
|------|---------|------------------|
| `points_earned` | Check-in completed | Low (digest) |
| `reward_unlocked` | Reached points threshold | Medium |
| `reward_expiring` | 7 days before expiration | High |
| `voyage_progress` | Voyage step completed | Low (digest) |
| `voyage_completed` | Voyage finished | High |
| `marketing` | Tenant sends campaign | Per-campaign |
| `friend_activity` | Friend earns reward | Low (digest) |
| `platform_announcement` | System announcement | High |

### Rate Limiting & Batching

```typescript
// Per-customer limits
const RATE_LIMITS = {
  marketing: { max: 3, period: '24h' },      // Max 3 marketing per day
  system: { max: 10, period: '1h' },         // Max 10 system per hour
  digest: { max: 1, period: '24h' }          // Max 1 digest per day
};

// Batch similar notifications
// Instead of: "You earned 50 points at Tony's" x5
// Send: "You earned 250 points today at Tony's!"
```

---

## Implementation Phases

### Phase 1: Foundation
- [ ] Set up FCM project and credentials
- [ ] Create database tables
- [ ] Implement token registration endpoint
- [ ] Basic send notification function
- [ ] Delivery tracking

### Phase 2: Preferences & Rate Limiting
- [ ] Customer preferences UI
- [ ] Rate limiting logic
- [ ] Quiet hours enforcement
- [ ] Per-business settings

### Phase 3: Batching & Digest
- [ ] Notification queue (Bull + Redis)
- [ ] Batch similar notifications
- [ ] Daily digest compilation
- [ ] Digest delivery scheduling

### Phase 4: Analytics
- [ ] Open rate tracking
- [ ] Click-through tracking
- [ ] Opt-out tracking
- [ ] Dashboard for tenants

---

## Security Considerations

- Tokens stored encrypted at rest
- Tokens rotated on logout
- Rate limiting prevents abuse
- Marketing requires customer opt-in
- GDPR: Easy opt-out, data export, deletion

---

## Open Questions

1. **Redis required?** For queuing - or use pg-boss for Postgres-only?
2. **Expo vs Native?** PWA + native later, or Expo from start?
3. **Digest timing?** User-selected vs smart (based on engagement)?

---

*Last updated: January 2025*
