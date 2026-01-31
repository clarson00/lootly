# Customer Web Dashboard

> **Status:** Planning
> **Priority:** Low (Tier 5)
> **Category:** Customer

---

## Overview

A dedicated web application for customers that provides richer views and advanced features that benefit from larger screens. Complements the mobile PWA rather than replacing it.

---

## Dependencies

- **Requires:**
  - Multi-tenant support
  - Friend system (for friend features)
  - Leaderboards (for detailed rankings)
  - Analytics data model (for history/charts)

- **Enables:**
  - Power-user features
  - Desktop accessibility
  - Advanced analytics views
  - Complex settings management

---

## Roadmap Position

- **Tier:** 5 (Customer Web Experience)
- **Phase:** v2.0
- **Category:** Customer

---

## Cross-References

- Related specs:
  - [Leaderboards](./leaderboards.md)
  - [Friend System](./friend-system.md)
  - [Customer Discovery](./customer-discovery.md)
  - [Multi-Tenant Support](../platform/multi-tenant-support.md)

---

## Phone App vs Web Dashboard

| Feature | Phone | Web | Notes |
|---------|-------|-----|-------|
| Check-in QR code | ✅ Primary | ❌ | Phone always with you |
| Quick points check | ✅ | ✅ | |
| Claim rewards | ✅ | ✅ | |
| Leaderboards | Limited | ✅ Better | Full tables, filters |
| Rewards Map | Basic | ✅ Better | Interactive map |
| Analytics/History | Basic | ✅ Better | Charts, exports |
| Voyage Progress | ✅ | ✅ Better | Timeline view |
| Manage Favorites | ✅ | ✅ | |
| Notification Settings | Basic | ✅ Full | Complex preferences |
| Transaction History | Recent | ✅ Full | Searchable, exportable |
| Friend Management | Basic | ✅ Full | Bulk actions |

---

## Key Differences from Mobile

### 1. Expanded Views

What's truncated on mobile gets full treatment:

```
Mobile: "View more..." (shows 5 items)
Web: Full scrollable tables with sorting, filtering
```

### 2. Side-by-Side Comparisons

```
┌──────────────────────┬──────────────────────┐
│  Tony's Downtown     │  Coffee Co           │
├──────────────────────┼──────────────────────┤
│  Points: 1,234       │  Points: 567         │
│  Rank: #12           │  Rank: #5            │
│  Next Reward: 266    │  Next Reward: 33     │
└──────────────────────┴──────────────────────┘
```

### 3. Data Visualization

```
Points Earned Over Time
      ▲
1000  │         ╭─────╮
      │    ╭────╯     ╰────╮
 500  │ ───╯               ╰───
      │
   0  └────────────────────────▶
      Jan  Feb  Mar  Apr  May
```

### 4. Advanced Settings

Settings that are complex or rarely changed:
- Per-business notification preferences
- Privacy settings with granular controls
- Data export options
- Account security (2FA, sessions)

---

## Page Structure

### Dashboard (Home)

```
┌─────────────────────────────────────────────────────────────────┐
│  🏴‍☠️ Welcome back, Captain Sarah!                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │ Total Doubloons │  │ Active Voyages  │  │ Rewards Ready   │ │
│  │     3,847       │  │       4         │  │       2         │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
│                                                                 │
│  ┌─────────────────────────────┐  ┌───────────────────────────┐│
│  │  Your Businesses            │  │  Recent Activity          ││
│  │  ──────────────────────     │  │  ─────────────────────    ││
│  │  🍕 Tony's: 1,234 pts      │  │  +50 pts at Tony's        ││
│  │  ☕ Coffee Co: 567 pts     │  │  Voyage step completed    ││
│  │  🍔 Burger Barn: 2,046 pts │  │  Reward redeemed          ││
│  │  [+ Find More Businesses]   │  │  [View All →]             ││
│  └─────────────────────────────┘  └───────────────────────────┘│
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  Points This Month                                          ││
│  │  [Chart showing daily/weekly points across all businesses]  ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Business Detail Page

```
┌─────────────────────────────────────────────────────────────────┐
│  🍕 Tony's Downtown                                             │
│  [Dashboard] [Rewards] [Voyages] [History] [Leaderboard]       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────┐  ┌───────────────────────────┐│
│  │ Your Status                 │  │ Next Rewards              ││
│  │ ───────────────────         │  │ ────────────────          ││
│  │ Points: 1,234               │  │ Free Appetizer: 266 away  ││
│  │ Rank: #12 of 847            │  │ 20% Off: 516 away         ││
│  │ Member since: Jan 2024      │  │ [View All Rewards →]      ││
│  │ Total visits: 47            │  │                           ││
│  └─────────────────────────────┘  └───────────────────────────┘│
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Active Voyages                                              ││
│  │ ───────────────────────────────────────────────────────     ││
│  │ 🗺️ Weekend Warrior    [████████░░] 4/5 steps               ││
│  │    Next: Visit on Saturday                                  ││
│  │                                                              ││
│  │ 🗺️ Pizza Party        [██░░░░░░░░] 1/5 steps               ││
│  │    Next: Try the Margherita                                 ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Transaction History

```
┌─────────────────────────────────────────────────────────────────┐
│  Transaction History                                            │
│  [All Businesses ▼] [All Types ▼] [Date Range ▼] [Export CSV]  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Date        Business        Type           Amount    Balance  │
│  ─────────────────────────────────────────────────────────     │
│  Jan 30      Tony's          Check-in       +50       1,234    │
│  Jan 29      Coffee Co       Bonus          +100      567      │
│  Jan 28      Tony's          Check-in       +50       1,184    │
│  Jan 27      Tony's          Redemption     -500      1,134    │
│  Jan 26      Burger Barn     Voyage         +200      2,046    │
│  ...                                                            │
│                                                                 │
│  [← Previous]  Page 1 of 23  [Next →]                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Leaderboards (Full View)

```
┌─────────────────────────────────────────────────────────────────┐
│  Leaderboards                                                   │
│  [🏪 Tony's ▼]  [Monthly ▼]  [Points ▼]                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Rank  Pirate              This Month   All Time   Streak      │
│  ─────────────────────────────────────────────────────────     │
│  🥇 1   Captain Sarah        1,500        12,340     14 days   │
│  🥈 2   YOU                  1,234         8,765     12 days   │
│  🥉 3   Pizza Pete             987         7,654      8 days   │
│     4   Mike the Mighty        876         6,543      5 days   │
│     5   Anonymous Pirate       654         5,432      3 days   │
│  ...                                                            │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Your Stats                                                  ││
│  │ Rank: #2 • Top 1% • 266 points behind #1 • 12-day streak   ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Settings

```
┌─────────────────────────────────────────────────────────────────┐
│  Settings                                                       │
│  [Profile] [Privacy] [Notifications] [Security] [Data]         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  NOTIFICATION PREFERENCES                                       │
│  ─────────────────────────────────────────────────────────     │
│                                                                 │
│  Global Settings                                                │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Daily Digest Time: [09:00 AM ▼]                         │   │
│  │ Quiet Hours: [10:00 PM] to [8:00 AM]                    │   │
│  │ Timezone: [America/Chicago ▼]                           │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Per-Business Settings                                          │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Tony's Downtown                                         │   │
│  │ [✓] Marketing messages  [✓] Reward alerts  [✓] Voyages │   │
│  │                                                         │   │
│  │ Coffee Co                                               │   │
│  │ [✓] Marketing messages  [ ] Reward alerts  [✓] Voyages │   │
│  │                                                         │   │
│  │ Burger Barn                                             │   │
│  │ [ ] Marketing messages  [✓] Reward alerts  [ ] Voyages │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  [Save Changes]                                                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Technical Approach

### Separate App vs Responsive

**Decision:** Separate web app

**Rationale:**
- Different navigation patterns (sidebar vs bottom tabs)
- Different feature sets (no QR on desktop)
- Easier to optimize each experience
- Shared API, different UI

### Tech Stack

- Same as admin app: React + TailwindCSS
- Shared component library where possible
- Shared API client
- Host at: `app.rewardspirate.com` or `my.rewardspirate.com`

### Authentication

- Same auth system as mobile
- Magic link login (email)
- Phone number login with SMS code
- Session persists across both apps

---

## Implementation Plan

### Phase 1: Core Web App
- [ ] Project setup (Vite + React + Tailwind)
- [ ] Authentication integration
- [ ] Dashboard with business overview
- [ ] Basic business detail page

### Phase 2: History & Data
- [ ] Full transaction history
- [ ] Filtering and search
- [ ] CSV export
- [ ] Points over time chart

### Phase 3: Leaderboards & Social
- [ ] Full leaderboard views
- [ ] Friend management
- [ ] Friend comparison features

### Phase 4: Advanced Features
- [ ] Complex settings UI
- [ ] Data export (GDPR)
- [ ] Account security features
- [ ] Discovery/map (if web-appropriate)

---

## Mobile ↔ Web Handoff

### Deep Linking

```typescript
// From mobile notification → web detail
"View full history" → app.rewardspirate.com/history

// From web → mobile for check-in
"Check in now" → opens mobile app with business context
```

### Shared State

- Both apps use same API
- Real-time sync not required (eventual consistency OK)
- Logged in on one = logged in on other (same session)

---

## Security Considerations

- Same security as mobile app
- HTTPS only
- Session management
- Rate limiting
- No additional data exposure

---

## Open Questions

1. **URL structure?** app.rewardspirate.com vs my.rewardspirate.com?
2. **Discovery on web?** Include map/discovery or mobile-only?
3. **PWA on web?** Make web app installable too?
4. **Dark mode?** Support theme toggle?

---

*Last updated: January 2025*
