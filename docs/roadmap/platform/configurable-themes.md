# Configurable Themes

> **Status:** 📋 Planned
> **Priority:** Medium - Expands market appeal
> **Entitlement:** Pro tier (2-3 themes), Enterprise (custom themes)

---

## Dependencies

- **Requires:**
  - UI component abstraction (partial - needs refactor)
  - Theme token system
  - Asset management system

- **Enables:**
  - White-labeling
  - Brand customization
  - Broader market appeal (non-pirate businesses)
  - Industry-specific experiences

---

## Roadmap Position

- **Tier:** 4 (Gamification)
- **Phase:** v2.0
- **Category:** Platform

---

## Cross-References

- Related specs:
  - [Gamification](../../GAMIFICATION.md) - Current pirate theme
  - [Vertical Templates](../tenant/vertical-templates.md)
  - [Admin App](../../ADMIN_APP.md)

---

## Overview

Allow tenants to choose alternative themes beyond the default pirate theme. This enables businesses that don't fit the pirate aesthetic to still use the platform with appropriate branding.

---

## The Problem

The pirate theme is fun and distinctive, but not for everyone:
- Fine dining restaurants may want elegance
- Fitness studios may want energy/motivation
- Some businesses want minimal/professional
- International markets may not connect with pirate theme

---

## Proposed Themes

### 1. Pirate (Default)

The current theme - fun, playful, distinctive.

| Element | Pirate Term |
|---------|-------------|
| Points | Doubloons |
| Rewards | Treasure |
| Quests | Voyages |
| Locations | Ports |
| Members | Crew |
| Level Up | Rank Up |

**Visual:** Gold, navy, weathered textures, skull & crossbones, treasure maps

### 2. Space Explorer

Sci-fi adventure theme for tech-forward businesses.

| Element | Space Term |
|---------|------------|
| Points | Credits |
| Rewards | Artifacts |
| Quests | Missions |
| Locations | Stations |
| Members | Explorers |
| Level Up | Promotion |

**Visual:** Deep purple, electric blue, stars, planets, futuristic UI

### 3. Quest/Fantasy

RPG-inspired for gaming cafes, comic shops, etc.

| Element | Fantasy Term |
|---------|--------------|
| Points | Gold |
| Rewards | Loot |
| Quests | Quests |
| Locations | Realms |
| Members | Heroes |
| Level Up | Level Up |

**Visual:** Medieval textures, gold/green, shields, scrolls, achievement badges

### 4. Minimal/Professional

Clean, modern design for upscale businesses.

| Element | Minimal Term |
|---------|--------------|
| Points | Points |
| Rewards | Rewards |
| Quests | Challenges |
| Locations | Locations |
| Members | Members |
| Level Up | Advance |

**Visual:** Black/white, clean typography, minimal icons, elegant animations

### 5. Sports/Fitness

High-energy theme for gyms, sports bars, etc.

| Element | Sports Term |
|---------|-------------|
| Points | Score |
| Rewards | Trophies |
| Quests | Challenges |
| Locations | Arenas |
| Members | Athletes |
| Level Up | Train Up |

**Visual:** Bold colors, dynamic shapes, athletic imagery, progress bars

### 6. Custom (Enterprise)

Fully customizable for enterprise clients.

---

## Theme Architecture

### Theme Token System

```typescript
interface Theme {
  id: string;
  name: string;

  // Terminology
  terms: {
    points: string;
    pointsPlural: string;
    rewards: string;
    rewardsPlural: string;
    quests: string;
    locations: string;
    members: string;
    levelUp: string;
    checkIn: string;
    redeem: string;
  };

  // Colors
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textMuted: string;
    success: string;
    warning: string;
    error: string;
  };

  // Typography
  fonts: {
    heading: string;
    body: string;
    accent: string;  // For special elements
  };

  // Icons & Assets
  assets: {
    logo: string;
    pointsIcon: string;
    rewardIcon: string;
    questIcon: string;
    levelIcons: Record<string, string>;
    backgroundPattern?: string;
  };

  // Animations
  animations: {
    celebration: string;  // Lottie or CSS animation name
    progress: string;
    unlock: string;
  };
}
```

### Example: Pirate Theme Definition

```typescript
const pirateTheme: Theme = {
  id: 'pirate',
  name: 'Pirate Adventure',

  terms: {
    points: 'Doubloon',
    pointsPlural: 'Doubloons',
    rewards: 'Treasure',
    rewardsPlural: 'Treasures',
    quests: 'Voyages',
    locations: 'Ports',
    members: 'Crew',
    levelUp: 'Rank Up',
    checkIn: 'Drop Anchor',
    redeem: 'Claim Yer Loot'
  },

  colors: {
    primary: '#D4AF37',      // Gold
    secondary: '#1E3A5F',    // Navy
    accent: '#8B0000',       // Dark red
    background: '#0D1B2A',
    surface: '#1B2838',
    text: '#FFFFFF',
    textMuted: '#A0A0A0',
    success: '#2ECC71',
    warning: '#F39C12',
    error: '#E74C3C'
  },

  fonts: {
    heading: 'Pirata One, cursive',
    body: 'Inter, sans-serif',
    accent: 'IM Fell English, serif'
  },

  assets: {
    logo: '/themes/pirate/logo.svg',
    pointsIcon: '/themes/pirate/doubloon.svg',
    rewardIcon: '/themes/pirate/treasure-chest.svg',
    questIcon: '/themes/pirate/map.svg',
    levelIcons: {
      bronze: '/themes/pirate/rank-deckhand.svg',
      silver: '/themes/pirate/rank-mate.svg',
      gold: '/themes/pirate/rank-captain.svg'
    },
    backgroundPattern: '/themes/pirate/waves-pattern.svg'
  },

  animations: {
    celebration: 'pirate-celebration',
    progress: 'compass-spin',
    unlock: 'treasure-open'
  }
};
```

---

## Implementation Approach

### 1. Theme Context Provider

```tsx
// Wrap app in ThemeProvider
<ThemeProvider theme={selectedTheme}>
  <App />
</ThemeProvider>

// Use theme in components
function PointsDisplay() {
  const { terms, colors } = useTheme();

  return (
    <div style={{ color: colors.primary }}>
      <Icon name="points" />
      <span>1,234 {terms.pointsPlural}</span>
    </div>
  );
}
```

### 2. Component Abstraction

```tsx
// Instead of hardcoded:
<span>🪙 1,234 Doubloons</span>

// Use themed component:
<PointsDisplay value={1234} />
// Renders based on active theme
```

### 3. Asset Loading

```typescript
// Theme assets loaded dynamically
function useThemeAssets() {
  const { assets } = useTheme();

  useEffect(() => {
    // Preload theme assets
    preloadImage(assets.pointsIcon);
    preloadImage(assets.rewardIcon);
    // etc.
  }, [assets]);
}
```

---

## Admin Configuration

### Theme Selection UI

```
┌─────────────────────────────────────────────────────────────┐
│ ⚙️ Branding & Theme                                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Choose Your Theme                                          │
│ ─────────────────────────────────────────────────────────   │
│                                                             │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│ │   🏴‍☠️        │ │   🚀        │ │   ⚔️        │           │
│ │   PIRATE    │ │   SPACE     │ │   QUEST     │           │
│ │  ✓ Active   │ │             │ │             │           │
│ └─────────────┘ └─────────────┘ └─────────────┘           │
│                                                             │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│ │   ○         │ │   🏆        │ │   ✨        │           │
│ │  MINIMAL    │ │   SPORTS    │ │   CUSTOM    │           │
│ │             │ │             │ │  Enterprise │           │
│ └─────────────┘ └─────────────┘ └─────────────┘           │
│                                                             │
│ Preview: [View customer app with selected theme]           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Custom Theme Editor (Enterprise)

```
┌─────────────────────────────────────────────────────────────┐
│ Custom Theme Editor                                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Terminology                                                │
│ ─────────────────────────────────────────────────────────   │
│ Points:    [Stars          ]  Plural: [Stars         ]     │
│ Rewards:   [Prizes         ]  Plural: [Prizes        ]     │
│ Quests:    [Challenges     ]                               │
│ Check-in:  [Earn           ]                               │
│ Redeem:    [Claim          ]                               │
│                                                             │
│ Colors                                                     │
│ ─────────────────────────────────────────────────────────   │
│ Primary:   [#FF6B00] ████                                  │
│ Secondary: [#1A1A2E] ████                                  │
│ Accent:    [#FFD700] ████                                  │
│                                                             │
│ Logo                                                       │
│ ─────────────────────────────────────────────────────────   │
│ [Upload Logo]  Current: company-logo.svg                   │
│                                                             │
│ [Preview]  [Save Theme]                                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Database Schema

```sql
-- Theme selection per business
ALTER TABLE businesses ADD COLUMN theme_id TEXT DEFAULT 'pirate';

-- Custom theme overrides (Enterprise)
CREATE TABLE custom_themes (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL UNIQUE,
  base_theme_id TEXT DEFAULT 'minimal',  -- Start from existing theme
  terms_override JSONB,
  colors_override JSONB,
  fonts_override JSONB,
  custom_logo_url TEXT,
  custom_assets JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Implementation Plan

### Phase 1: Theme Infrastructure
- [ ] Create theme token system
- [ ] Build ThemeProvider context
- [ ] Refactor components to use theme tokens
- [ ] Create theme configuration API

### Phase 2: Built-in Themes
- [ ] Define Minimal theme
- [ ] Define Space theme
- [ ] Define Sports theme
- [ ] Theme selection UI in admin

### Phase 3: Theme Preview
- [ ] Live preview in admin
- [ ] Theme switching (no refresh needed)
- [ ] A/B testing support (future)

### Phase 4: Custom Themes (Enterprise)
- [ ] Custom theme editor UI
- [ ] Custom asset upload
- [ ] Theme export/import

---

## Migration Strategy

1. Current pirate theme becomes default
2. All existing businesses stay on pirate
3. Theme selection available for new signups
4. Existing businesses can switch in settings

No breaking changes - pirate remains fully supported.

---

## Entitlements

| Plan | Themes Available |
|------|------------------|
| Free | Pirate only |
| Starter | Pirate, Minimal |
| Pro | All built-in themes |
| Enterprise | All + Custom themes |

---

## Open Questions

1. **Staff app theme?** Should staff app match customer theme?
2. **Theme per location?** Different themes for different locations?
3. **Seasonal themes?** Holiday variants (Halloween, Christmas)?
4. **Community themes?** Allow community to create/share themes?

---

*Last updated: January 2025*
