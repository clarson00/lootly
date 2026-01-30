# Time-Bound Promotions

> **Status:** 📋 Planned  
> **Target Release:** v1.1  
> **Roadmap:** [ROADMAP.md](../../ROADMAP.md) — Section: NEXT  
> **Location:** `docs/roadmap/time-bound-promos.md`  

## Overview

Time-bound promotions allow business owners to create limited-time offers that create urgency and drive customer action. "This week only!" type deals.

## Use Cases

| Promo Type | Example | Duration |
|------------|---------|----------|
| Flash sale | "Double points today only!" | 24 hours |
| Weekend special | "Visit this weekend, get bonus 50 pts" | Fri-Sun |
| Weekly challenge | "Visit 3 times this week, get free dessert" | 7 days |
| Holiday promo | "Valentine's Day special — bring a date, both earn 2x" | 1 day |
| Monthly event | "First Friday bonus — 3x points" | Recurring |
| Seasonal | "Summer kickoff — complete the beach tour" | 3 months |

## How It Works

### Rules Engine Support (Already Designed)

The rules engine already supports time-bounding via:

```json
{
  "id": "rule_flash_sale",
  "name": "Flash Friday Double Points",
  "conditions": {
    "operator": "AND",
    "items": [
      { "subject": "location", "scope": "any", "action": "visit", "comparison": ">=", "value": 1 }
    ]
  },
  "award_type": "multiplier",
  "award_value": "2.0",
  "start_date": "2024-03-15T00:00:00Z",
  "end_date": "2024-03-15T23:59:59Z",
  "is_active": true
}
```

### Customer Experience

**Discovery:**
- "Limited Time" section in app
- Countdown timers showing time remaining
- Push notification when new promo starts
- Badge/indicator for expiring soon

**In-App Display:**
```
┌─────────────────────────────────────────┐
│ 🔥 LIMITED TIME                         │
├─────────────────────────────────────────┤
│ ⚡ FLASH FRIDAY                         │
│ Double points on all purchases!         │
│                                         │
│ ⏰ Ends in: 6h 23m 45s                  │
│                                         │
│ [View Details]                          │
└─────────────────────────────────────────┘
```

### Admin Experience

**Creating a Time-Bound Promo:**
```
┌─────────────────────────────────────────┐
│ Create Promotion                        │
├─────────────────────────────────────────┤
│ Name: [Flash Friday Double Points     ] │
│                                         │
│ Type: [● Limited Time  ○ Always On    ] │
│                                         │
│ Start: [2024-03-15] [12:00 AM]         │
│ End:   [2024-03-15] [11:59 PM]         │
│                                         │
│ ☐ Recurring                             │
│   └ Every: [Friday]                     │
│                                         │
│ Notification:                           │
│ ☑ Notify customers when promo starts   │
│ ☑ Remind customers before it ends      │
│   └ [2] hours before                    │
└─────────────────────────────────────────┘
```

## Notification Integration

| Trigger | When | Message |
|---------|------|--------|
| Promo starts | At start_date | "🔥 Flash Friday is LIVE! Double points today only!" |
| Reminder | X hours before end | "⏰ Only 2 hours left for double points!" |
| Last chance | 1 hour before end | "🚨 LAST CHANCE! Flash Friday ends in 1 hour!" |
| Promo ended | At end_date | "Flash Friday has ended. See you next week!" |

## Admin Dashboard Features

### Promo Calendar View
- Visual calendar showing active and upcoming promos
- Drag to reschedule
- Click to edit
- Color-coded by type

### Promo Performance
- Participation rate during promo
- Comparison to non-promo periods
- Revenue/visits during window
- Most effective promo types

## Data Requirements

Already supported in rules table:
- `start_date` — When promo becomes active
- `end_date` — When promo expires
- `is_active` — Manual on/off toggle

**New fields needed:**
```sql
ALTER TABLE rules ADD COLUMN promo_type TEXT;  -- 'flash', 'weekly', 'recurring'
ALTER TABLE rules ADD COLUMN recurring_pattern TEXT;  -- 'daily', 'weekly:fri', 'monthly:1'
ALTER TABLE rules ADD COLUMN notify_on_start BOOLEAN DEFAULT 0;
ALTER TABLE rules ADD COLUMN notify_before_end_hours INTEGER;
```

## Implementation Notes

### MVP
- Basic start/end dates (already in spec)
- Manual promo creation
- Simple in-app display

### Post-MVP
- Recurring promos
- Push notifications for promos
- Calendar view in admin
- Promo analytics
- A/B testing different promo types

## Related Features

- [Push Notifications](push-notifications.md) — Promo alerts
- [Marketing Messages](marketing-messages.md) — Promo announcements
- [User Journeys](user-journeys.md) — Time-limited journeys
- [Rules Engine](../TECHNICAL_SPEC.md#composable-rules-engine) — Time conditions

---

← Back to [ROADMAP.md](../../ROADMAP.md)