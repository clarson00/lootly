# Leaderboards

> **Status:** Planning
> **Priority:** Medium (Tier 4 - Gamification)
> **Category:** Customer

---

## Overview

Competitive leaderboards at three levels: per-business, platform-wide, and friends-only. Leaderboards create friendly competition, social proof, and increased engagement through gamification.

---

## Dependencies

- **Requires:**
  - Friend system (for friends leaderboard)
  - Multi-tenant support (for platform leaderboard)
  - Analytics data model (for ranking calculations)

- **Enables:**
  - Competitive engagement features
  - Status/bragging rights
  - Business-specific competitions
  - Social proof for businesses

---

## Roadmap Position

- **Tier:** 4 (Gamification)
- **Phase:** v2.0
- **Category:** Customer

---

## Cross-References

- Related specs:
  - [Friend System](./friend-system.md)
  - [Multi-Tenant Support](../platform/multi-tenant-support.md)
  - [Analytics & Reporting](../tenant/analytics-reporting.md)

---

## Three Leaderboard Levels

### 1. Per-Business Leaderboard
- Top customers at each specific business
- "Top Pirates at Tony's Downtown"
- Visible to all customers enrolled at that business
- Business can offer rewards to top rankers

### 2. Platform-Wide Leaderboard
- Global ranking across all Rewards Pirate users
- "Top Pirates on the High Seas"
- Aggregate points/achievements across all businesses
- Platform-level recognition

### 3. Friends Leaderboard
- Private competition among connected friends
- "Your Crew Rankings"
- Most engaging for casual users
- Drives friend invitations

---

## Ranking Metrics

### Primary Metrics (Configurable per Leaderboard)

| Metric | Description | Best For |
|--------|-------------|----------|
| **Total Points** | Lifetime points earned | Long-term engagement |
| **Monthly Points** | Points this month | Current activity |
| **Voyages Completed** | Quest completions | Achievement hunters |
| **Visit Streak** | Consecutive visit days | Habit formation |
| **Rewards Redeemed** | Total redemptions | Active participants |
| **Businesses Visited** | Unique businesses | Platform explorers |

### Time Periods

- **All Time** - Lifetime rankings
- **This Month** - Monthly reset
- **This Week** - Weekly competitions
- **Today** - Daily sprints

---

## Privacy Integration

Leaderboards respect customer privacy settings:

| Privacy Level | Leaderboard Display |
|---------------|---------------------|
| Public | Full name, avatar, stats |
| Friends Only | Full name to friends, "Anonymous Pirate" to others |
| Private | "Anonymous Pirate #1234" |
| Hidden | Not shown on leaderboards |

---

## Database Schema

```sql
-- Leaderboard cache (recalculated periodically)
CREATE TABLE leaderboard_cache (
  id TEXT PRIMARY KEY,
  leaderboard_type TEXT NOT NULL,  -- 'business', 'platform', 'friends'
  scope_id TEXT,                   -- business_id or customer_id (for friends)
  time_period TEXT NOT NULL,       -- 'all_time', 'monthly', 'weekly', 'daily'
  metric TEXT NOT NULL,            -- 'total_points', 'monthly_points', etc.
  rankings JSONB NOT NULL,         -- Array of { customerId, rank, value, displayName }
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL
);

-- Index for fast lookups
CREATE INDEX idx_leaderboard_lookup
ON leaderboard_cache(leaderboard_type, scope_id, time_period, metric);

-- Customer leaderboard stats (denormalized for performance)
CREATE TABLE customer_leaderboard_stats (
  customer_id TEXT NOT NULL,
  business_id TEXT,                -- NULL for platform stats
  total_points INT DEFAULT 0,
  monthly_points INT DEFAULT 0,
  weekly_points INT DEFAULT 0,
  daily_points INT DEFAULT 0,
  voyages_completed INT DEFAULT 0,
  rewards_redeemed INT DEFAULT 0,
  current_streak INT DEFAULT 0,
  best_streak INT DEFAULT 0,
  businesses_visited INT DEFAULT 0,
  last_activity_at TIMESTAMPTZ,
  PRIMARY KEY (customer_id, COALESCE(business_id, 'platform'))
);
```

---

## API Endpoints

```typescript
// Get business leaderboard
GET /api/leaderboards/business/:businessId
?metric=monthly_points
&period=this_month
&limit=100

// Get platform leaderboard
GET /api/leaderboards/platform
?metric=total_points
&period=all_time
&limit=100

// Get friends leaderboard
GET /api/leaderboards/friends
?metric=monthly_points
&period=this_month

// Get my rank
GET /api/leaderboards/my-rank
?type=business|platform|friends
&scopeId=biz_abc  // for business type
&metric=monthly_points

// Response format
{
  leaderboard: [
    { rank: 1, customerId: "cust_123", displayName: "Captain Sarah", value: 1500, isMe: false },
    { rank: 2, customerId: "cust_456", displayName: "Anonymous Pirate", value: 1234, isMe: true },
    ...
  ],
  myRank: {
    rank: 2,
    value: 1234,
    percentile: 95,  // Top 5%
    nextRank: { rank: 1, gap: 266 }  // 266 points to #1
  },
  totalParticipants: 1543,
  lastUpdated: "2025-01-30T12:00:00Z"
}
```

---

## UI Components

### Leaderboard View

```
┌─────────────────────────────────────────────────────┐
│  🏆 Tony's Downtown Leaderboard                     │
│  [This Month ▼]  [Monthly Points ▼]                │
├─────────────────────────────────────────────────────┤
│                                                     │
│  🥇 Captain Sarah          1,500 doubloons         │
│  🥈 YOU                    1,234 doubloons         │
│     266 points to #1!                              │
│  🥉 Pizza Pete              987 doubloons          │
│  4. Mike the Mighty         876 doubloons          │
│  5. Anonymous Pirate        654 doubloons          │
│  ...                                               │
│  23. Sushi Sam              123 doubloons          │
│                                                     │
│  ─────────────────────────────────────────────     │
│  📊 Your Stats                                     │
│  Rank: #2 of 1,543 (Top 1%)                       │
│  Monthly Points: 1,234                             │
│  Visit Streak: 12 days 🔥                          │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Leaderboard Tabs

```
┌─────────────────────────────────────────────────────┐
│  [🏪 Business] [🌍 Platform] [👥 Friends]          │
└─────────────────────────────────────────────────────┘
```

### Mini Leaderboard Widget (Dashboard)

```
┌─────────────────────────────────────────────────────┐
│  Your Rank at Tony's: #2 of 1,543                  │
│  [████████████████████░░] 266 pts to #1            │
│  [View Full Leaderboard →]                         │
└─────────────────────────────────────────────────────┘
```

---

## Business Features (Tenant)

Businesses can leverage leaderboards for promotions:

### "Top Customer" Rewards
```typescript
// Business can set up automatic rewards for top rankers
{
  name: "Monthly Champion Reward",
  trigger: "leaderboard_rank",
  conditions: {
    metric: "monthly_points",
    period: "monthly",
    rankRange: { min: 1, max: 3 }  // Top 3
  },
  reward: {
    type: "points_bonus",
    value: 500
  }
}
```

### Leaderboard Display in Store
- QR code to see leaderboard
- Digital signage showing top 10
- "This week's champion: Captain Sarah!"

---

## Calculation & Caching

### Update Frequency

| Leaderboard | Update Frequency |
|-------------|------------------|
| Daily | Every 15 minutes |
| Weekly | Every hour |
| Monthly | Every 4 hours |
| All Time | Every 24 hours |

### Calculation Job

```typescript
// Scheduled job to recalculate leaderboards
async function recalculateLeaderboard(type, scopeId, metric, period) {
  const stats = await getCustomerStats(type, scopeId, metric, period);
  const ranked = stats
    .sort((a, b) => b.value - a.value)
    .map((s, i) => ({ ...s, rank: i + 1 }));

  await cacheLeaderboard(type, scopeId, metric, period, ranked);
}
```

---

## Notifications

| Event | Notification | Default |
|-------|--------------|---------|
| Rank improved | "You moved up to #5 at Tony's!" | On |
| Friend passed you | "Sarah passed you on the leaderboard!" | On |
| Reached top 10 | "You're in the top 10 at Tony's!" | On |
| Monthly reset | "New month! Leaderboards reset." | Off |

---

## Implementation Plan

### Phase 1: Per-Business Leaderboard
- [ ] Database schema for stats
- [ ] Stats aggregation on check-in
- [ ] Basic leaderboard API
- [ ] Leaderboard UI in customer app
- [ ] "My rank" widget on dashboard

### Phase 2: Platform Leaderboard
- [ ] Cross-business stats aggregation
- [ ] Platform leaderboard calculations
- [ ] Privacy filtering
- [ ] Platform leaderboard UI

### Phase 3: Friends Leaderboard
- [ ] Friends-scoped queries
- [ ] Friends leaderboard API
- [ ] Friends leaderboard UI
- [ ] Friend comparison features

### Phase 4: Business Features
- [ ] Leaderboard in admin dashboard
- [ ] Top customer reward automation
- [ ] Leaderboard display assets (QR, signage)

---

## Performance Considerations

- Cache leaderboards aggressively (don't calculate on every request)
- Limit visible rankings (show top 100, then user's position)
- Use materialized views or pre-calculated tables
- Partition by time period for historical queries
- Index on (business_id, metric, period)

---

## Open Questions

1. **Tie-breaking?** Same points = same rank, or secondary metric?
2. **Historical rankings?** Show "You were #3 last month"?
3. **Badges?** Special badges for leaderboard achievements?
4. **Seasons?** Quarterly competitions with prizes?

---

*Last updated: January 2025*
