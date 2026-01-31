# Customer Journey: Morning App Open

> **Status:** 📋 Planned
> **Priority:** High - Core engagement pattern
> **Category:** Customer UX/UI

---

## Dependencies

- **Requires:**
  - Multi-tenant support (customer enrolled at multiple businesses)
  - Customer discovery (location-based business finding)
  - Push notification infrastructure (for "what's new" prompts)

- **Enables:**
  - Daily active user metrics
  - Engagement optimization
  - Notification strategy refinement

---

## Roadmap Position

- **Tier:** 2-3 (Core Infrastructure / Engagement)
- **Phase:** v1.1
- **Category:** Customer

---

## Cross-References

- Related specs:
  - [Customer Discovery](./customer-discovery.md)
  - [Notifications Digest](./notifications-digest.md)
  - [Leaderboards](./leaderboards.md)
  - [Friend System](./friend-system.md)
  - [Platform Streaks & Daily Rewards](./platform-streaks-rewards.md) - Daily engagement
  - [Tenant Acquisition Incentives](../platform/tenant-acquisition-incentives.md) - Solving sparse markets

---

## The Question

> "I wake up and open my phone. What compels me to check Rewards Pirate app? When I open the app what do I see? What causes me to engage?"

---

## Engagement Triggers (Why Open the App?)

### Push Notification Triggers

| Trigger | Example | Urgency |
|---------|---------|---------|
| **Reward unlocked** | "You earned a free appetizer at Tony's!" | High |
| **Voyage progress** | "1 step away from completing Weekend Warrior!" | High |
| **Expiring reward** | "Your free drink expires tomorrow!" | High |
| **Friend activity** | "Sarah just earned Gold status!" | Medium |
| **New business nearby** | "Burger Barn just joined in your area!" | Medium |
| **Streak at risk** | "Visit today to keep your 5-day streak!" | Medium |
| **Weekly digest** | "Your week in rewards: 3 visits, 150 pts" | Low |
| **Streak at risk** | "🔥 Your 12-day streak ends at midnight!" | High |
| **Streak milestone** | "🏆 You hit a 30-day streak!" | Medium |

### Organic Triggers (No Notification)

| Trigger | Context |
|---------|---------|
| **Planning a visit** | "I'm going to Tony's, let me check my points" |
| **Curiosity** | "Wonder how close I am to that reward" |
| **Discovery** | "Is there anything good nearby?" |
| **Competition** | "Let me see the leaderboard" |
| **Boredom** | "What's going on in my rewards?" |

---

## What They See (First Screen)

The home screen adapts based on user state:

### State 1: Enrolled + Active

User has businesses and recent activity.

```
┌─────────────────────────────────────────────────────────────┐
│ Good morning, Captain Sarah! ☀️                    [Profile]│
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ 🔥 DAILY CHECK-IN                          Day 12 Streak!  │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │  ●───●───●───●───●───○───○    +15 doubloons today!     │ │
│ │  [Tap to Claim]                                        │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ 🎯 TODAY'S HIGHLIGHT                                        │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 🎉 You're 1 visit away from FREE APPETIZER!            │ │
│ │    at Tony's Restaurant                                 │ │
│ │    [View Reward →]                                      │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ 📊 YOUR FLEET                                               │
│ ┌───────────┐ ┌───────────┐ ┌───────────┐                  │
│ │ Tony's    │ │ Bean There│ │ + Discover│                  │
│ │ 🪙 847    │ │ ☕ 120    │ │   More    │                  │
│ │ Gold ⭐   │ │ Silver    │ │           │                  │
│ └───────────┘ └───────────┘ └───────────┘                  │
│                                                             │
│ 🗺️ ACTIVE VOYAGES                                           │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Weekend Warrior          ████████░░ 80%                │ │
│ │ 4/5 steps • Ends Sunday                                │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ 🏆 FRIENDS ACTIVITY                                         │
│ • Mike visited Tony's Downtown yesterday                   │
│ • Lisa earned "Coffee Connoisseur" badge                   │
│                                                             │
│ [🏠 Home] [🔍 Discover] [🏆 Ranks] [👤 Profile]             │
└─────────────────────────────────────────────────────────────┘
```

### State 2: Enrolled + Dormant

User has businesses but no recent activity.

```
┌─────────────────────────────────────────────────────────────┐
│ Welcome back, Captain Sarah! 👋                    [Profile]│
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ 💎 YOU HAVE UNCLAIMED TREASURE                              │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 🎁 Free Coffee at Bean There                           │ │
│ │    Ready to claim! • Expires in 12 days                │ │
│ │    [Claim Now →]                                        │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ 🗺️ NEW VOYAGE AVAILABLE                                     │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 🏴‍☠️ "The Coffee Trail"                                   │ │
│ │    Visit 3 times this week → Earn FREE PASTRY          │ │
│ │    [Start Voyage →]                                     │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ 📊 YOUR FLEET                                               │
│ ┌───────────┐ ┌───────────┐ ┌───────────┐                  │
│ │ Tony's    │ │ Bean There│ │ + Discover│                  │
│ │ 🪙 847    │ │ ☕ 120    │ │   More    │                  │
│ └───────────┘ └───────────┘ └───────────┘                  │
│                                                             │
│ [🏠 Home] [🔍 Discover] [🏆 Ranks] [👤 Profile]             │
└─────────────────────────────────────────────────────────────┘
```

### State 3: New User (Not Enrolled Anywhere)

Fresh user, needs to discover businesses.

```
┌─────────────────────────────────────────────────────────────┐
│ 🏴‍☠️ Ahoy, Captain Sarah!                           [Profile]│
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ 🗺️ DISCOVER TREASURE NEAR YOU                               │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 🍕 Tony's Restaurant              0.8 mi               │ │
│ │    Earn 1 pt per $1 spent                              │ │
│ │    🎁 Free appetizer available at 100 pts              │ │
│ │    [Join Crew →]                                        │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ☕ Bean There Coffee              1.2 mi               │ │
│ │    Visit 5x → Free drink                               │ │
│ │    🗺️ Active voyage: "Morning Ritual"                  │ │
│ │    [Join Crew →]                                        │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 🍔 Burger Barn                    2.5 mi               │ │
│ │    Double points on weekends!                          │ │
│ │    [Join Crew →]                                        │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ [See All Nearby →]                                         │
│                                                             │
│ [🏠 Home] [🔍 Discover] [🏆 Ranks] [👤 Profile]             │
└─────────────────────────────────────────────────────────────┘
```

### State 4: Sparse Market (Few/No Businesses Nearby)

Early platform days or rural areas. **Daily check-in gives users a reason to open app even with no nearby businesses.**

```
┌─────────────────────────────────────────────────────────────┐
│ 🏴‍☠️ Ahoy, Captain Sarah!                           [Profile]│
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ 🔥 DAILY CHECK-IN                          Day 5 Streak!   │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │  ●───●───●───●───●───○───○    +15 doubloons today!     │ │
│ │  [Tap to Claim]                                        │ │
│ │                                                         │ │
│ │  💡 Earn doubloons daily even without visiting!        │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ 🗺️ CHARTING NEW WATERS                                      │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │                                                         │ │
│ │  No treasure maps nearby... yet!                       │ │
│ │                                                         │ │
│ │  We're expanding to your area.                         │ │
│ │  📍 Des Moines, IA                                     │ │
│ │                                                         │ │
│ │  [🔔 Notify Me When Available]                         │ │
│ │                                                         │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ─────────────────────────────────────────────────────────   │
│                                                             │
│ 🏪 KNOW A BUSINESS THAT SHOULD JOIN?                        │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Refer a merchant and earn 500 doubloons when they      │ │
│ │ launch their rewards program!                          │ │
│ │                                                         │ │
│ │ [Refer a Business →]                                    │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ─────────────────────────────────────────────────────────   │
│                                                             │
│ 🗺️ PLANNING A TRIP?                                         │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Find rewards at your destination:                      │ │
│ │                                                         │ │
│ │ [Search city or zip code...]                           │ │
│ │                                                         │ │
│ │ Popular cities:                                        │ │
│ │ • Chicago (12 businesses)                              │ │
│ │ • Nashville (8 businesses)                             │ │
│ │ • Austin (15 businesses)                               │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ─────────────────────────────────────────────────────────   │
│                                                             │
│ [Browse All Businesses →]                                  │
│                                                             │
│ [🏠 Home] [🔍 Discover] [🏆 Ranks] [👤 Profile]             │
└─────────────────────────────────────────────────────────────┘
```

---

## Location Settings

### Default Behavior

| Setting | Default | User Configurable |
|---------|---------|-------------------|
| **Search radius** | 20 miles | Yes (5-100 miles) |
| **Location tracking** | On-demand | Yes (always/on-demand/never) |
| **Home location** | GPS-detected | Yes (manual override) |

### Location Tracking Modes

1. **Always (Background)**
   - Radius follows user as they move
   - Can trigger "new area" notifications
   - Requires permission

2. **On-Demand (Default)**
   - Location checked when app opens
   - User prompted for permission
   - Good balance of privacy/utility

3. **Manual Home Location**
   - User sets a home address/zip
   - No GPS required
   - Good for privacy-conscious users

### Settings UI

```
┌─────────────────────────────────────────────────────────────┐
│ ⚙️ Location Settings                                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Discovery Radius                                           │
│ [────────●────────] 20 miles                               │
│                                                             │
│ Location Mode                                              │
│ ○ Always track (best for travel)                          │
│ ● On-demand (when I open the app)                         │
│ ○ Manual home location only                               │
│                                                             │
│ Home Location                                              │
│ 📍 Des Moines, IA 50309                     [Change]       │
│ (Used when GPS unavailable or in manual mode)              │
│                                                             │
│ Notifications                                              │
│ [✓] Notify me when new businesses join nearby             │
│ [✓] Notify me when I'm in a new city with rewards         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Sparse Market Strategy

When user is in an area with few/no businesses:

### Discovery Content Fallback Logic

```typescript
function getDiscoveryContent(userLocation: Location, businesses: Business[]) {
  const nearby = businesses.filter(b => distance(userLocation, b) <= 20);
  const regional = businesses.filter(b => distance(userLocation, b) <= 100);
  const all = businesses;

  if (nearby.length >= 3) {
    // Best case: show nearby businesses
    return { mode: 'nearby', businesses: nearby };
  }

  if (regional.length >= 3) {
    // Show regional with "expand your search" option
    return {
      mode: 'regional',
      businesses: regional,
      prompt: 'Showing businesses within 100 miles'
    };
  }

  if (all.length > 0) {
    // Sparse market: show browse + notify + referral
    return {
      mode: 'sparse',
      businesses: all,
      showNotifyMe: true,
      showReferBusiness: true,
      showTravelSearch: true
    };
  }

  // Platform just launched: focus on building
  return {
    mode: 'empty',
    showNotifyMe: true,
    showReferBusiness: true,
    showComingSoon: true
  };
}
```

### Sparse Market Features

| Feature | Purpose |
|---------|---------|
| **Notify Me** | Register interest, track demand by geography |
| **Refer a Business** | Turn users into merchant recruiters |
| **Travel Search** | Find rewards at destination cities |
| **Browse All** | See everything regardless of distance |
| **Popular Cities** | Show where platform is active |

### Data Collection Benefit

The "Notify Me" feature provides valuable market research:
- Geographic demand tracking
- Prioritize merchant outreach by user concentration
- Show merchants: "47 people in your area want rewards!"

---

## Engagement Metrics

### What to Track

| Metric | Goal |
|--------|------|
| **Daily Active Users (DAU)** | Measure habit formation |
| **Session Duration** | Time spent in app |
| **Screens per Session** | Depth of engagement |
| **Discovery → Enrollment Rate** | New business adoption |
| **Notification → Open Rate** | Push effectiveness |
| **Return Visit Rate** | Week-over-week retention |

### Success Indicators

- User opens app 3+ times per week (habit formed)
- User enrolled at 2+ businesses (platform sticky)
- User completes at least 1 voyage (engaged with gamification)
- User has at least 1 friend (social hook)

---

## Implementation Plan

### Phase 1: Core Home Screen
- [ ] Adaptive home screen based on user state
- [ ] "Today's Highlight" logic (most relevant CTA)
- [ ] Fleet view (enrolled businesses)
- [ ] Active voyages display

### Phase 2: Discovery Integration
- [ ] Nearby businesses section
- [ ] Location settings
- [ ] Manual home location option
- [ ] Search radius configuration

### Phase 3: Sparse Market Handling
- [ ] "Notify Me" registration
- [ ] Refer a Business flow
- [ ] Travel/destination search
- [ ] Browse all businesses view
- [ ] Geographic demand tracking

### Phase 4: Social & Competition
- [ ] Friends activity feed
- [ ] Leaderboard preview
- [ ] Social CTAs ("Challenge friend")

---

## Open Questions

1. **Notification frequency?** How often to show digest vs individual notifications?
2. **Home screen personalization?** Should AI determine "Today's Highlight"?
3. **Sparse market threshold?** At what point do we switch to sparse mode (< 3 nearby)?
4. **Referral reward value?** 500 doubloons for merchant referral - is this right?

---

*Last updated: January 2025*
