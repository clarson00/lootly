# Friend System

> **Status:** Planning
> **Priority:** Medium (Tier 4 - Gamification)
> **Category:** Customer

---

## Overview

Enable customers to connect with friends within the Rewards Pirate platform. Friends can see each other's progress, compete on leaderboards, and receive notifications about each other's achievements.

---

## Dependencies

- **Requires:**
  - Multi-tenant support (platform-wide identity)
  - Notification infrastructure (for activity alerts)

- **Enables:**
  - Friends leaderboard
  - Friend activity notifications
  - Group voyages (future)
  - Referral program
  - Social proof mechanics

---

## Roadmap Position

- **Tier:** 4 (Gamification)
- **Phase:** v2.0
- **Category:** Customer

---

## Cross-References

- Related specs:
  - [Leaderboards](./leaderboards.md)
  - [Notification Digest](./notifications-digest.md)
  - [Referrals](./referrals.md)
  - [Multi-Tenant Support](../platform/multi-tenant-support.md)

---

## Friend Connection Methods

### 1. Phone Contacts
- Import contacts from phone (with permission)
- Match against registered customers by phone number
- "X friends are already on Rewards Pirate!"
- One-tap add

### 2. Username Search
- Each customer can set a unique username
- Search by username to find friends
- Send friend request

### 3. QR Code Exchange
- In-person friend adding
- Show your QR code
- Friend scans → instant connection
- Great for customers meeting at businesses

### 4. Referral Link
- Share personal referral link
- New user signs up → automatically connected as friends
- Referrer earns bonus points

---

## Privacy Controls

### Visibility Levels

| Level | What Friends See |
|-------|------------------|
| **Public** | Name, avatar, all stats, all activity |
| **Friends Only** | Name, avatar, shared business stats, leaderboard position |
| **Private** | Name, avatar only (still on leaderboards as "Anonymous Pirate") |
| **Hidden** | Not visible on any leaderboards |

### Per-Data Privacy Settings

```typescript
interface PrivacySettings {
  profileVisibility: 'public' | 'friends' | 'private' | 'hidden';
  showPointsBalance: boolean;
  showRewardsEarned: boolean;
  showVoyageProgress: boolean;
  showBusinessesEnrolled: boolean;
  allowFriendRequests: boolean;
  showInLeaderboards: boolean;
}
```

### Default: Private by Default
- New users start with "Friends Only" visibility
- Onboarding asks user to choose (with skip option)
- "This is configurable in settings" reminder

---

## Database Schema

```sql
-- Friend connections (bidirectional)
CREATE TABLE customer_friendships (
  id TEXT PRIMARY KEY,           -- 'friend_' prefix
  customer_id_1 TEXT NOT NULL,   -- Always lower ID
  customer_id_2 TEXT NOT NULL,   -- Always higher ID
  status TEXT DEFAULT 'pending', -- pending, accepted, blocked
  requested_by TEXT NOT NULL,    -- Who initiated
  created_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  UNIQUE(customer_id_1, customer_id_2)
);

-- Customer usernames
ALTER TABLE customers ADD COLUMN username TEXT UNIQUE;
ALTER TABLE customers ADD COLUMN display_name TEXT;
ALTER TABLE customers ADD COLUMN avatar_url TEXT;

-- Privacy settings
CREATE TABLE customer_privacy_settings (
  customer_id TEXT PRIMARY KEY,
  profile_visibility TEXT DEFAULT 'friends',
  show_points_balance BOOLEAN DEFAULT TRUE,
  show_rewards_earned BOOLEAN DEFAULT TRUE,
  show_voyage_progress BOOLEAN DEFAULT TRUE,
  show_businesses_enrolled BOOLEAN DEFAULT FALSE,
  allow_friend_requests BOOLEAN DEFAULT TRUE,
  show_in_leaderboards BOOLEAN DEFAULT TRUE
);

-- Friend activity feed (denormalized for performance)
CREATE TABLE friend_activity_feed (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL,      -- The friend who did something
  activity_type TEXT NOT NULL,    -- 'reward_earned', 'voyage_completed', etc.
  business_id TEXT,
  business_name TEXT,
  activity_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## API Endpoints

```typescript
// Search for users
GET /api/customer/users/search?q=username_or_name

// Send friend request
POST /api/customer/friends/request
{ targetCustomerId: string }

// Accept/reject friend request
POST /api/customer/friends/:requestId/accept
POST /api/customer/friends/:requestId/reject

// Remove friend
DELETE /api/customer/friends/:friendshipId

// Block user
POST /api/customer/friends/:customerId/block

// Get friend list
GET /api/customer/friends

// Get pending requests
GET /api/customer/friends/requests

// Get friend's profile (respects privacy)
GET /api/customer/friends/:customerId/profile

// Get friend activity feed
GET /api/customer/friends/activity?limit=50

// Update privacy settings
PUT /api/customer/privacy
{ ...PrivacySettings }

// Generate friend QR code
GET /api/customer/friends/qr-code

// Get referral link
GET /api/customer/referral-link
```

---

## UI Components

### Friends List

```
┌─────────────────────────────────────────────────────┐
│  👥 Friends (12)                                    │
├─────────────────────────────────────────────────────┤
│                                                     │
│  🏴‍☠️ Captain Sarah         1,234 doubloons          │
│     Active at Tony's today                         │
│                                                     │
│  🏴‍☠️ Mike the Mighty       987 doubloons           │
│     Completed "Weekend Warrior" voyage!            │
│                                                     │
│  🏴‍☠️ Pizza Pete            756 doubloons           │
│     Last active 2 days ago                         │
│                                                     │
│  [+ Add Friend]                                    │
└─────────────────────────────────────────────────────┘
```

### Add Friend Modal

```
┌─────────────────────────────────────────────────────┐
│  Add a Crew Member                                  │
├─────────────────────────────────────────────────────┤
│                                                     │
│  [🔍 Search by username...]                        │
│                                                     │
│  ─── OR ───                                        │
│                                                     │
│  📱 Import from Contacts                           │
│  3 friends already on Rewards Pirate!              │
│                                                     │
│  ─── OR ───                                        │
│                                                     │
│  📷 Scan QR Code                                   │
│  Add a friend in person                            │
│                                                     │
│  ─── OR ───                                        │
│                                                     │
│  🔗 Share Your Referral Link                       │
│  rewardspirate.com/join/capt_sarah                 │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Friend Activity Feed

```
┌─────────────────────────────────────────────────────┐
│  🏴‍☠️ Crew Activity                                  │
├─────────────────────────────────────────────────────┤
│                                                     │
│  🎉 Captain Sarah earned "Free Appetizer"          │
│     at Tony's Downtown • 2 hours ago               │
│                                                     │
│  🗺️ Mike completed "Weekend Warrior" voyage!       │
│     at Coffee Co • 5 hours ago                     │
│                                                     │
│  💎 Pizza Pete reached Gold status                 │
│     at Tony's Marina • yesterday                   │
│                                                     │
│  👋 New Crew Member: Sushi Sam joined!             │
│     via your referral • 2 days ago                 │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## Notifications

### Friend Activity Notifications (Configurable)

| Event | Notification | Default |
|-------|--------------|---------|
| Friend request received | "Sarah wants to join your crew!" | On |
| Friend request accepted | "Mike accepted your crew invite!" | On |
| Friend earns reward | "Sarah earned Free Appetizer!" | Off (digest) |
| Friend completes voyage | "Mike completed Weekend Warrior!" | On |
| Friend joins new business | "Pizza Pete joined Coffee Co!" | Off (digest) |
| Friend passes you on leaderboard | "Sarah passed you on the Tony's leaderboard!" | On |

---

## Implementation Plan

### Phase 1: Core Friend System
- [ ] Database schema for friendships
- [ ] Username/display name support
- [ ] Friend request flow (send/accept/reject)
- [ ] Basic friend list UI
- [ ] Username search

### Phase 2: Connection Methods
- [ ] QR code generation and scanning
- [ ] Referral link generation
- [ ] Phone contacts import (with permission)
- [ ] Match existing users

### Phase 3: Privacy & Profiles
- [ ] Privacy settings UI
- [ ] Friend profile view (respects privacy)
- [ ] Block/unblock functionality
- [ ] Privacy-aware leaderboards

### Phase 4: Activity & Engagement
- [ ] Friend activity feed
- [ ] Activity notifications (configurable)
- [ ] "Challenge a friend" feature
- [ ] Group voyages (stretch goal)

---

## Security Considerations

- Phone number matching done server-side (never expose numbers)
- Rate limit friend requests (prevent spam)
- Block feature prevents all contact
- Privacy settings enforced at API level
- No data leakage in search results

---

## Open Questions

1. **Max friends?** Unlimited or cap at 500?
2. **Mutual vs one-way?** Require mutual acceptance or allow following?
3. **Friend suggestions?** "People who visit the same places"?
4. **Group features?** Crews/teams beyond 1:1 friendships?

---

*Last updated: January 2025*
