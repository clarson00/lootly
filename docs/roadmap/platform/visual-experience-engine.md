# Visual Experience Engine

> **Status:** 📋 Planned
> **Priority:** High - Core differentiator, drives engagement and virality
> **Category:** Platform Infrastructure

---

## Core Architecture: Slot-Based Visual System

The Visual Experience Engine uses a **slot-based architecture** that separates behavior from visuals:

```
┌─────────────────────────────────────────────────────────────────────┐
│                        PLATFORM LAYER                               │
│  Defines WHAT happens, WHEN, and WHERE                              │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │ SLOT:        │  │ SLOT:        │  │ SLOT:        │              │
│  │ rule_complete│  │ points_earned│  │ reward_claim │   ... more   │
│  │              │  │              │  │              │              │
│  │ trigger: X   │  │ trigger: Y   │  │ trigger: Z   │              │
│  │ duration: 3s │  │ duration: 2s │  │ duration: 4s │              │
│  │ position: ctr│  │ position: top│  │ position: ctr│              │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘              │
│         │                 │                 │                       │
└─────────┼─────────────────┼─────────────────┼───────────────────────┘
          │                 │                 │
          ▼                 ▼                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     ASSET RESOLUTION LAYER                          │
│  Picks correct visual based on tenant context                       │
│                                                                     │
│  getAsset(slot, businessId) → asset URL                            │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
          │                 │                 │
          ▼                 ▼                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      TENANT ASSET PACKS                             │
│  AI-generated visuals per tenant                                    │
│                                                                     │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐     │
│  │ TONY'S PACK     │  │ COFFEE CO PACK  │  │ GYM PACK        │     │
│  │                 │  │                 │  │                 │     │
│  │ rule_complete:  │  │ rule_complete:  │  │ rule_complete:  │     │
│  │ Italian feast   │  │ Perfect latte   │  │ Weights slam    │     │
│  │                 │  │                 │  │                 │     │
│  │ points_earned:  │  │ points_earned:  │  │ points_earned:  │     │
│  │ Gold coins +    │  │ Coffee beans    │  │ Protein shaker  │     │
│  │ olive branches  │  │ into cup        │  │ explosion       │     │
│  │                 │  │                 │  │                 │     │
│  │ reward_claim:   │  │ reward_claim:   │  │ reward_claim:   │     │
│  │ Treasure chest  │  │ Gift box steam  │  │ Trophy case     │     │
│  │ w/ Italian gold │  │ rising          │  │ unlocking       │     │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘     │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Key Principles

1. **Same code everywhere** - `playAnimation('rule_complete')` works identically across all tenants
2. **Asset resolution at runtime** - System picks correct asset based on business context
3. **Graceful fallback** - If tenant asset missing, use platform default
4. **Regeneration on demand** - Tenant can request new assets anytime

---

## Dependencies

- **Requires:**
  - Customer app (display surface)
  - Tenant onboarding (to collect visual profile)
  - AI image generation API (DALL-E, Stable Diffusion, or similar)
  - CDN for asset storage

- **Enables:**
  - Rich celebratory moments
  - Viral-worthy screenshots
  - Tenant brand integration
  - Premium visual addon upsells

---

## Roadmap Position

- **Tier:** 2 (Core Infrastructure)
- **Phase:** v1.1
- **Category:** Platform

---

## Cross-References

- Related specs:
  - [Customer Journeys - Reward Redemption](../customer/customer-journeys-reward-redemption.md)
  - [Customer Journeys - Voyage Completion](../customer/customer-journeys-voyage-completion.md)
  - [Platform Streaks & Daily Rewards](../customer/platform-streaks-rewards.md)
  - [Marketing Social Posting](../tenant/marketing-social-posting.md)

---

## Visual Slots Registry

The platform defines a fixed set of **visual slots** - named locations where visuals appear. Each slot has defined behavior; only the assets change per tenant.

### Animation Slots

| Slot ID | Trigger | Duration | Position | Description |
|---------|---------|----------|----------|-------------|
| `rule_complete` | Rule evaluation passes | 3s | center | Celebration when any rule completes |
| `voyage_step_complete` | Voyage step done | 2s | center | Progress celebration |
| `voyage_complete` | All voyage steps done | 5s | fullscreen | Epic voyage completion |
| `reward_unlocked` | Reward becomes available | 3s | center | Treasure revealed |
| `reward_claimed` | Customer claims reward | 4s | center | Victory celebration |
| `reward_redeemed` | Staff confirms redemption | 2s | center | Satisfaction confirmation |
| `points_earned` | Points added to balance | 2s | top | Coins/items flying to chest |
| `check_in` | Customer checks in | 2s | center | Welcome animation |
| `streak_continue` | Daily streak maintained | 1.5s | top | Flame grows |
| `streak_milestone` | 7/30/100 day streak | 4s | center | Major streak celebration |
| `level_up` | Customer levels up | 4s | center | Rank promotion |
| `badge_earned` | Achievement unlocked | 3s | center | Badge reveal |
| `leaderboard_rank_up` | Moved up rankings | 2s | top | Climbing animation |
| `first_visit` | First time at business | 4s | center | Welcome aboard |
| `comeback` | Return after 30+ days | 3s | center | Welcome back hero |

### Static Asset Slots

| Slot ID | Where Used | Size | Description |
|---------|------------|------|-------------|
| `app_background` | Main app screen | 1080x1920 | Background gradient/texture |
| `rewards_background` | Rewards list | 1080x1920 | Treasure room scene |
| `voyages_background` | Voyages list | 1080x1920 | Map/adventure scene |
| `profile_background` | Profile screen | 1080x1920 | Personal quarters |
| `card_texture` | Reward/voyage cards | 400x300 | Card background texture |
| `header_banner` | Screen headers | 1080x200 | Decorative banner |
| `empty_state` | Empty lists | 600x400 | "No rewards yet" scene |
| `loading_scene` | App loading | 1080x1920 | Loading screen background |

### Icon Slots

| Slot ID | Where Used | Size | Description |
|---------|------------|------|-------------|
| `icon_points` | Points display | 64x64 | Currency icon (doubloons) |
| `icon_reward` | Reward items | 64x64 | Treasure/gift icon |
| `icon_voyage` | Voyage items | 64x64 | Map/quest icon |
| `icon_streak` | Streak counter | 64x64 | Flame/fire icon |
| `icon_badge` | Achievements | 64x64 | Medal/badge icon |
| `icon_level` | Level display | 64x64 | Rank insignia |
| `icon_checkin` | Check-in button | 64x64 | Anchor/arrival icon |
| `icon_location` | Business marker | 64x64 | Port/location icon |
| `icon_friend` | Friends list | 64x64 | Crew member icon |
| `icon_leaderboard` | Rankings | 64x64 | Trophy/podium icon |

### Creature/Character Slots (Rare Items, Beasts, Mascots)

| Slot ID | Where Used | Size | Description |
|---------|------------|------|-------------|
| `mascot_happy` | Celebrations | 256x256 | Tenant mascot celebrating |
| `mascot_sad` | Missed streak | 256x256 | Mascot disappointed |
| `mascot_excited` | Big wins | 256x256 | Mascot super excited |
| `mascot_neutral` | Default state | 256x256 | Mascot idle |
| `rare_item_1` | Rare rewards | 128x128 | Special collectible |
| `rare_item_2` | Rare rewards | 128x128 | Special collectible |
| `rare_item_3` | Rare rewards | 128x128 | Special collectible |
| `beast_guardian` | Voyage boss | 256x256 | Challenge creature |
| `beast_friendly` | Helper character | 256x256 | Guide/companion |

### Slot Definition Schema

```typescript
interface VisualSlot {
  id: string;                    // "rule_complete"
  category: SlotCategory;        // "animation" | "static" | "icon" | "character"

  // Behavior (platform-defined, never changes)
  trigger?: string;              // Event that activates this slot
  duration?: number;             // Animation duration in ms
  position?: SlotPosition;       // Where it appears
  layer?: number;                // Z-index layer

  // Asset requirements
  assetType: AssetType;          // "image" | "lottie" | "sprite_sheet" | "video"
  dimensions: { width: number; height: number };
  format: string[];              // ["png", "webp"] or ["json"] for lottie

  // Fallback
  platformDefault: string;       // URL to platform default asset

  // Generation hints for AI
  aiPromptHints: string;         // "Celebratory, victory moment, treasure theme"
}

type SlotCategory = "animation" | "static" | "icon" | "character";
type SlotPosition = "center" | "top" | "bottom" | "fullscreen" | "overlay";
type AssetType = "image" | "lottie" | "sprite_sheet" | "video";
```

### Asset Resolution

```typescript
// Core function - same everywhere in the app
async function getAsset(
  slotId: string,
  businessId: string
): Promise<ResolvedAsset> {

  // 1. Try tenant-specific asset
  const tenantAsset = await db.query.tenantAssets.findFirst({
    where: and(
      eq(tenantAssets.businessId, businessId),
      eq(tenantAssets.slotId, slotId),
      eq(tenantAssets.status, 'active')
    )
  });

  if (tenantAsset) {
    return {
      url: tenantAsset.assetUrl,
      source: 'tenant',
      cacheKey: `${businessId}_${slotId}_${tenantAsset.version}`
    };
  }

  // 2. Fall back to platform default
  const slot = VISUAL_SLOTS[slotId];
  return {
    url: slot.platformDefault,
    source: 'platform',
    cacheKey: `platform_${slotId}`
  };
}

// Usage in components - identical everywhere
function RuleCompleteAnimation({ businessId }) {
  const asset = useAsset('rule_complete', businessId);

  return (
    <AnimationPlayer
      src={asset.url}
      duration={SLOTS.rule_complete.duration}
      position={SLOTS.rule_complete.position}
    />
  );
}
```

---

## Overview

The Visual Experience Engine generates rich, branded graphics for key moments in the customer journey. Instead of generic "Congratulations!" screens, customers see AI-generated scenes tailored to the business they're visiting.

```
Customer earns reward at Tony's
         ↓
System pulls Tony's visual profile
         ↓
Retrieves cached scene (pre-generated with Tony's context)
         ↓
Overlays dynamic text: "You earned a FREE APPETIZER!"
         ↓
Customer sees beautiful, branded celebration
         ↓
Screenshots and shares → viral marketing
```

### Why This Matters

| Generic Experience | Visual Experience Engine |
|-------------------|--------------------------|
| "🎉 Congratulations!" | Animated treasure chest with Italian countryside backdrop |
| Plain text reward | Glowing reward card with restaurant branding |
| Basic progress bar | Ship sailing toward treasure island |
| "Level up!" badge | Epic rank promotion with custom effects |

**Result:** Customers screenshot and share. Word-of-mouth grows. Tenants see value.

---

## Event → Celebration Mapping

The platform generates endless events, but they all map to a small set of celebration tiers. This keeps visual asset requirements manageable while supporting unlimited event types.

### Celebration Intensity Tiers

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CELEBRATION TIERS                           │
├─────────────┬─────────────┬─────────────┬─────────────┬────────────┤
│   SUBTLE    │   NORMAL    │    BIG      │    EPIC     │  SPECIAL   │
│  (1.5 sec)  │  (3 sec)    │  (4 sec)    │  (6 sec)    │  (varies)  │
├─────────────┼─────────────┼─────────────┼─────────────┼────────────┤
│ Toast at    │ Center      │ Fullscreen  │ Fullscreen  │ Unique     │
│ top of      │ popup       │ takeover    │ + effects   │ narrative  │
│ screen      │             │             │ + share     │ moment     │
├─────────────┼─────────────┼─────────────┼─────────────┼────────────┤
│ Points <100 │ Rule done   │ Reward got  │ Voyage done │ First visit│
│ Check-in    │ Points 100+ │ Level up    │ 365 streak  │ Comeback   │
│ Streak cont │ Beast caught│ 30-day strk │ #1 leader   │ Beast catch│
│ Step done   │ Prediction  │ Rare item   │ Legendary   │ Sports win │
│             │ Badge earned│ Rank up     │             │            │
└─────────────┴─────────────┴─────────────┴─────────────┴────────────┘
```

### Event Intensity Configuration

```typescript
// Events map to celebration tiers
type CelebrationTier = 'subtle' | 'normal' | 'big' | 'epic';

interface CelebrationEvent {
  eventType: string;
  intensity: CelebrationTier;

  // Dynamic content for text overlay
  context: {
    headline: string;        // "BEAST CAPTURED!"
    subheadline?: string;    // "Golden Kraken"
    detail?: string;         // "+200 bonus points"
  };

  // Optional: use special slot instead of tier slot
  specialSlot?: string;      // "beast_captured" overrides tier

  // Optional: additional assets to overlay
  overlays?: {
    icon?: string;           // Beast icon, team logo, etc.
    badge?: string;          // Achievement badge
  };
}

// Default event → intensity mapping
const EVENT_INTENSITY_MAP: Record<string, CelebrationTier> = {
  // === SUBTLE: Frequent, don't interrupt ===
  'POINTS_EARNED_SMALL': 'subtle',       // < 100 points
  'CHECK_IN': 'subtle',
  'STREAK_CONTINUED': 'subtle',
  'VOYAGE_STEP_COMPLETE': 'subtle',

  // === NORMAL: Notable achievement ===
  'POINTS_EARNED_MEDIUM': 'normal',      // 100-500 points
  'RULE_COMPLETED': 'normal',
  'BEAST_CAPTURED_COMMON': 'normal',
  'PREDICTION_WON': 'normal',
  'BADGE_EARNED': 'normal',
  'FRIEND_JOINED': 'normal',

  // === BIG: Significant milestone ===
  'POINTS_EARNED_LARGE': 'big',          // 500+ points
  'REWARD_CLAIMED': 'big',
  'REWARD_REDEEMED': 'big',
  'LEVEL_UP': 'big',
  'STREAK_MILESTONE_7': 'big',
  'STREAK_MILESTONE_30': 'big',
  'BEAST_CAPTURED_RARE': 'big',
  'RARE_ITEM_FOUND': 'big',
  'LEADERBOARD_RANK_UP': 'big',

  // === EPIC: Rare, major achievement ===
  'VOYAGE_COMPLETE': 'epic',
  'STREAK_MILESTONE_100': 'epic',
  'STREAK_MILESTONE_365': 'epic',
  'LEADERBOARD_FIRST': 'epic',
  'BEAST_CAPTURED_LEGENDARY': 'epic',
  'CHALLENGE_CHAMPION': 'epic',
  'POINTS_EARNED_MASSIVE': 'epic',       // 1000+ points
};

// Special slots override tier-based slots
const SPECIAL_SLOT_EVENTS: Record<string, string> = {
  'FIRST_VISIT': 'first_visit',
  'COMEBACK_VISIT': 'comeback',
  'BEAST_CAPTURED_COMMON': 'beast_captured',
  'BEAST_CAPTURED_RARE': 'beast_captured',
  'BEAST_CAPTURED_LEGENDARY': 'beast_captured',
  'PREDICTION_WON': 'sports_victory',
};
```

### Dynamic Thresholds

Some events have dynamic intensity based on values:

```typescript
function getEventIntensity(event: GameEvent): CelebrationTier {
  switch (event.type) {
    case 'POINTS_EARNED':
      if (event.points >= 1000) return 'epic';
      if (event.points >= 500) return 'big';
      if (event.points >= 100) return 'normal';
      return 'subtle';

    case 'STREAK_MILESTONE':
      if (event.days >= 365) return 'epic';
      if (event.days >= 100) return 'epic';
      if (event.days >= 30) return 'big';
      if (event.days >= 7) return 'big';
      return 'normal';

    case 'LEADERBOARD_RANK':
      if (event.rank === 1) return 'epic';
      if (event.rank <= 3) return 'big';
      if (event.rank <= 10) return 'normal';
      return 'subtle';

    default:
      return EVENT_INTENSITY_MAP[event.type] || 'subtle';
  }
}
```

### Celebration Resolution Flow

```typescript
async function triggerCelebration(event: GameEvent, businessId: string) {
  // 1. Determine intensity
  const intensity = getEventIntensity(event);

  // 2. Check for special slot override
  const specialSlot = SPECIAL_SLOT_EVENTS[event.type];
  const slotId = specialSlot || `celebration_${intensity}`;

  // 3. Get asset for slot (tenant or platform default)
  const asset = await getAsset(slotId, businessId);

  // 4. Build dynamic content
  const content = buildCelebrationContent(event);

  // 5. Get slot behavior config
  const config = SLOT_CONFIGS[slotId];

  // 6. Display celebration
  return {
    asset,
    content,
    config,
    overlays: event.overlays || null,
  };
}

function buildCelebrationContent(event: GameEvent): CelebrationContent {
  // Event-specific text generation
  switch (event.type) {
    case 'POINTS_EARNED':
      return {
        headline: `+${event.points} DOUBLOONS!`,
        subheadline: event.source || null,
      };

    case 'BEAST_CAPTURED':
      return {
        headline: 'BEAST CAPTURED!',
        subheadline: event.beastName,
        detail: `+${event.bonusPoints} bonus points`,
      };

    case 'PREDICTION_WON':
      return {
        headline: `GO ${event.team.toUpperCase()}!`,
        subheadline: 'You called it!',
        detail: `+${event.points} bonus points`,
      };

    case 'VOYAGE_COMPLETE':
      return {
        headline: 'VOYAGE COMPLETE!',
        subheadline: `"${event.voyageName}" Conquered!`,
        detail: formatRewards(event.rewards),
      };

    // ... more event types
  }
}
```

### Slot → Asset Resolution

```
Event: Customer earned 75 points
         │
         ▼
    getEventIntensity()
    → 'subtle' (< 100 points)
         │
         ▼
    slotId = 'celebration_subtle'
         │
         ▼
    getAsset('celebration_subtle', 'biz_tonys')
         │
         ├─── Tenant asset exists? → Use Tony's subtle celebration
         │
         └─── No tenant asset? → Use platform default
         │
         ▼
    Display with text: "+75 DOUBLOONS!"
```

### Adding New Event Types

New events automatically work if they map to existing tiers:

```typescript
// Adding a new event type is just config
EVENT_INTENSITY_MAP['NEW_ACHIEVEMENT'] = 'normal';

// Or with special slot
SPECIAL_SLOT_EVENTS['TREASURE_MAP_FOUND'] = 'rare_item_found';

// No new assets needed unless you want a unique slot
```

### Celebration Queue (Prevent Overlap)

Multiple events can fire simultaneously. Queue them:

```typescript
class CelebrationQueue {
  private queue: CelebrationEvent[] = [];
  private isPlaying = false;

  async add(event: CelebrationEvent) {
    // Subtle celebrations can overlap/stack
    if (event.intensity === 'subtle') {
      this.playSubtle(event);
      return;
    }

    // Others queue up
    this.queue.push(event);

    if (!this.isPlaying) {
      this.playNext();
    }
  }

  private async playNext() {
    if (this.queue.length === 0) {
      this.isPlaying = false;
      return;
    }

    this.isPlaying = true;
    const event = this.queue.shift()!;

    await this.playCelebration(event);

    // Small delay between celebrations
    await delay(300);
    this.playNext();
  }
}
```

---

## AI Asset Pack Generation

When a tenant onboards (or requests regeneration), the AI generates assets for ALL slots in their pack.

### Generation Pipeline

```
┌─────────────────────────────────────────────────────────────────────┐
│ 1. COLLECT TENANT CONTEXT                                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Business: Tony's Restaurant                                        │
│  Type: italian_restaurant                                           │
│  Logo: [uploaded]                                                   │
│  Colors: warm brown, gold, forest green                            │
│  Vibe: rustic, family, warm, traditional                           │
│  Custom: "Italian countryside, vineyard, Tuscan"                   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 2. BUILD STYLE GUIDE PROMPT                                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  "Visual style guide for Tony's Restaurant:                        │
│   - Italian restaurant, rustic Tuscan aesthetic                    │
│   - Color palette: warm browns (#8B4513), gold (#D4AF37),          │
│     forest green (#2F4F4F), cream backgrounds                      │
│   - Mood: warm, welcoming, family-friendly, traditional            │
│   - Elements: vineyard, olive branches, Italian countryside        │
│   - Maintain pirate/treasure theme but with Italian influence      │
│   - Style: game-like, vibrant, celebratory"                        │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 3. GENERATE ASSETS BY CATEGORY                                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  BATCH 1: Animations (highest priority)         ~$0.15             │
│  ├── rule_complete                                                  │
│  ├── voyage_complete                                                │
│  ├── reward_unlocked                                                │
│  ├── reward_claimed                                                 │
│  └── points_earned                                                  │
│                                                                     │
│  BATCH 2: Backgrounds                           ~$0.12             │
│  ├── app_background                                                 │
│  ├── rewards_background                                             │
│  ├── voyages_background                                             │
│  └── profile_background                                             │
│                                                                     │
│  BATCH 3: Icons (can use single prompt for set) ~$0.06             │
│  ├── icon_points, icon_reward, icon_voyage...                      │
│  └── (10 icons in themed set)                                       │
│                                                                     │
│  BATCH 4: Characters                            ~$0.09             │
│  ├── mascot_happy, mascot_sad, mascot_excited                      │
│  └── beast_guardian, beast_friendly                                │
│                                                                     │
│  TOTAL: ~$0.42 per tenant                                          │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 4. STORE IN CDN                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  /assets/biz_tonys/                                                │
│  ├── animations/                                                    │
│  │   ├── rule_complete.png                                         │
│  │   ├── voyage_complete.png                                       │
│  │   └── ...                                                        │
│  ├── backgrounds/                                                   │
│  │   ├── app_background.png                                        │
│  │   └── ...                                                        │
│  ├── icons/                                                         │
│  │   ├── icon_points.png                                           │
│  │   └── ...                                                        │
│  └── characters/                                                    │
│      ├── mascot_happy.png                                          │
│      └── ...                                                        │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 5. REGISTER IN DATABASE                                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  tenant_assets:                                                     │
│  ┌────────────┬────────────────┬─────────────────────┬─────────┐   │
│  │ business_id│ slot_id        │ asset_url           │ version │   │
│  ├────────────┼────────────────┼─────────────────────┼─────────┤   │
│  │ biz_tonys  │ rule_complete  │ /assets/biz_tony... │ 1       │   │
│  │ biz_tonys  │ voyage_complete│ /assets/biz_tony... │ 1       │   │
│  │ biz_tonys  │ icon_points    │ /assets/biz_tony... │ 1       │   │
│  │ ...        │ ...            │ ...                 │ ...     │   │
│  └────────────┴────────────────┴─────────────────────┴─────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Prompt Templates by Category

```typescript
const ASSET_PROMPTS = {

  // Animation scenes - full illustrations
  animations: {
    rule_complete: `
      Celebratory victory scene for {businessName}.
      Setting: {businessType} with {vibeKeywords} atmosphere.
      A treasure chest bursting open with golden light.
      {customElements}
      Colors: {colorPalette}.
      Style: Game-like, vibrant, joyful. No text.
    `,
    voyage_complete: `
      Epic adventure completion scene for {businessName}.
      A pirate ship arriving at a treasure island,
      blended with {businessType} elements.
      {vibeKeywords} mood. {customElements}
      Colors: {colorPalette}.
      Cinematic, triumphant. No text.
    `,
    points_earned: `
      Coins and treasures flying upward into a chest.
      {businessType} themed coins/tokens.
      {vibeKeywords} style. {customElements}
      Colors: {colorPalette}.
      Dynamic, rewarding motion feel. No text.
    `
  },

  // Background scenes - ambient, less busy
  backgrounds: {
    app_background: `
      Ambient background scene for {businessName} app.
      Subtle {businessType} elements, {vibeKeywords} mood.
      {customElements}
      Muted colors based on: {colorPalette}.
      Should not distract from UI overlays. Gradient-friendly.
      No text, no focal point, purely atmospheric.
    `,
    rewards_background: `
      Treasure room background for {businessName}.
      Blend of pirate treasure aesthetic with {businessType}.
      {vibeKeywords} atmosphere. {customElements}
      Colors: {colorPalette}.
      Warm, inviting, hint of mystery. No text.
    `
  },

  // Icons - simple, clear, consistent set
  icons: {
    icon_set: `
      Icon set for {businessName} loyalty app.
      Style: {vibeKeywords}, game-like, clear silhouettes.
      {businessType} influenced.
      Colors: {colorPalette}.

      Generate 10 icons in consistent style:
      1. Points/currency (coin with business flair)
      2. Reward/gift (treasure chest or gift)
      3. Quest/voyage (map or compass)
      4. Streak/fire (flame or torch)
      5. Achievement/badge (medal or star)
      6. Level/rank (shield or banner)
      7. Check-in (anchor or pin)
      8. Location (port or building)
      9. Friend/crew (person or group)
      10. Leaderboard (trophy or podium)

      {customElements}
      64x64 each, transparent background, flat design.
    `
  },

  // Characters - expressive, memorable
  characters: {
    mascot_set: `
      Mascot character for {businessName}.
      A friendly {businessType}-themed pirate character.
      {vibeKeywords} personality.
      {customElements}

      Generate in 4 expressions:
      1. Happy/celebrating
      2. Sad/disappointed
      3. Excited/amazed
      4. Neutral/welcoming

      Colors: {colorPalette}.
      Style: Game character, appealing, memorable.
      256x256 each, transparent background.
    `
  }
};
```

### Generation Queue Logic

```typescript
async function generateAssetPack(businessId: string) {
  const profile = await getTenantVisualProfile(businessId);

  // Mark as generating
  await updateProfile(businessId, { status: 'generating' });

  // Priority order - most visible first
  const batches = [
    { category: 'animations', priority: 1, slots: ANIMATION_SLOTS },
    { category: 'backgrounds', priority: 2, slots: BACKGROUND_SLOTS },
    { category: 'icons', priority: 3, slots: ICON_SLOTS },
    { category: 'characters', priority: 4, slots: CHARACTER_SLOTS }
  ];

  for (const batch of batches) {
    await queueBatch({
      businessId,
      category: batch.category,
      slots: batch.slots,
      profile,
      priority: batch.priority
    });
  }

  // Background worker processes queue
  // When all complete, status → 'ready'
}

// Worker processes one asset at a time
async function processAssetGeneration(job: AssetJob) {
  const { businessId, slotId, profile } = job;

  try {
    // Build prompt from template + profile
    const prompt = buildPrompt(slotId, profile);

    // Generate with AI
    const imageUrl = await generateImage(prompt, SLOTS[slotId].dimensions);

    // Upload to CDN
    const cdnUrl = await uploadToCDN(imageUrl, `${businessId}/${slotId}`);

    // Register asset
    await registerAsset({
      businessId,
      slotId,
      assetUrl: cdnUrl,
      version: profile.generationVersion,
      promptUsed: prompt
    });

    return { success: true };

  } catch (error) {
    // Log and retry later
    await logGenerationError(job, error);
    return { success: false, retry: true };
  }
}
```

### Regeneration Controls

Tenants can regenerate individual slots or entire pack:

```typescript
// Regenerate single slot
POST /api/admin/assets/:slotId/regenerate
Response: { queued: true, estimatedTime: "30 seconds" }

// Regenerate category
POST /api/admin/assets/regenerate
Body: { category: "animations" }
Response: { queued: true, count: 5 }

// Regenerate everything
POST /api/admin/assets/regenerate-all
Response: { queued: true, count: 25, estimatedTime: "5 minutes" }
```

---

## Tenant Visual Profile

### Data Model

```typescript
interface TenantVisualProfile {
  id: string;                    // "tvp_abc123"
  businessId: string;            // "biz_tonys"

  // Core identity
  businessName: string;          // "Tony's Restaurant"
  businessType: string;          // "italian_restaurant" (from vertical)
  logoUrl: string;               // S3/CDN URL

  // Color palette (extracted from logo or manually set)
  colors: {
    primary: string;             // "#8B4513" (warm brown)
    secondary: string;           // "#D4AF37" (gold)
    accent: string;              // "#2F4F4F" (dark green)
    background: string;          // "#FFF8DC" (cream)
  };

  // Vibe keywords for AI prompts
  vibeKeywords: string[];        // ["rustic", "family", "warm", "traditional"]

  // Optional tenant additions
  customPromptAdditions: string; // "Italian countryside, vineyard elements"

  // Generated assets
  generatedScenes: GeneratedScene[];

  // Metadata
  lastGeneratedAt: Date;
  generationVersion: number;     // Increment to trigger regeneration

  createdAt: Date;
  updatedAt: Date;
}

interface GeneratedScene {
  id: string;                    // "scene_xyz789"
  trigger: SceneTrigger;         // "reward_unlocked"
  imageUrl: string;              // CDN URL
  thumbnailUrl: string;          // Smaller preview
  promptUsed: string;            // For debugging/regeneration
  generatedAt: Date;
  expiresAt: Date;               // For refresh scheduling
}

type SceneTrigger =
  | "reward_unlocked"
  | "reward_claimed"
  | "voyage_complete"
  | "voyage_step_complete"
  | "first_visit"
  | "welcome_back"
  | "level_up"
  | "check_in"
  | "streak_milestone"
  | "badge_earned"
  | "leaderboard_rank_up";
```

### Vibe Keywords Library

Tenants select from predefined keywords (AI-optimized):

```typescript
const VIBE_KEYWORDS = {
  atmosphere: [
    "rustic", "modern", "elegant", "cozy", "vibrant",
    "minimalist", "industrial", "bohemian", "classic"
  ],
  mood: [
    "warm", "energetic", "calm", "playful", "sophisticated",
    "fun", "relaxed", "exciting", "intimate"
  ],
  audience: [
    "family-friendly", "upscale", "casual", "trendy",
    "traditional", "hipster", "professional"
  ],
  style: [
    "colorful", "muted", "bold", "subtle", "artistic",
    "clean", "ornate", "natural"
  ]
};
```

### Color Extraction

On logo upload, auto-extract dominant colors:

```typescript
async function extractColorsFromLogo(logoUrl: string): Promise<ColorPalette> {
  // Use color-thief or similar library
  const dominantColors = await extractDominantColors(logoUrl, 4);

  return {
    primary: dominantColors[0],
    secondary: dominantColors[1],
    accent: dominantColors[2],
    background: lighten(dominantColors[0], 0.9) // Light version for backgrounds
  };
}
```

---

## Scene Triggers & Types

### Tenant-Specific Scenes

Generated with tenant's visual profile context:

| Trigger | Description | When Shown | Priority |
|---------|-------------|------------|----------|
| `reward_unlocked` | Treasure chest glowing, about to open | Customer qualifies for reward | 🔴 High |
| `reward_claimed` | Victory celebration, treasure revealed | Customer claims reward | 🔴 High |
| `voyage_complete` | Ship arriving at treasure island | Complete a voyage/quest | 🔴 High |
| `first_visit` | Welcome aboard scene | First check-in at business | 🟡 Medium |
| `welcome_back` | Returning hero scene | First visit in 30+ days | 🟡 Medium |

### Platform-Wide Scenes

Shared across all tenants (no customization needed):

| Trigger | Description | When Shown | Notes |
|---------|-------------|------------|-------|
| `check_in` | Coins flying into chest | Every check-in | Animated overlay on any background |
| `streak_milestone_7` | Week-long campfire | 7-day streak | Growing fire animation |
| `streak_milestone_30` | Month bonfire | 30-day streak | Larger celebration |
| `streak_milestone_100` | Epic inferno | 100-day streak | Maximum celebration |
| `level_up` | Rank insignia reveal | Level/tier increase | Badge-focused |
| `badge_earned` | Achievement unlocked | Any badge earned | Badge showcase |
| `leaderboard_rank_up` | Climbing the ranks | Move up leaderboard | Competitive feel |

### Scene Composition

Each scene has layers:

```
┌─────────────────────────────────────────┐
│                                         │
│   LAYER 4: Dynamic Text Overlay         │
│   "You earned FREE APPETIZER!"          │
│                                         │
│   LAYER 3: Animated Effects             │
│   (confetti, sparkles, coins)           │
│                                         │
│   LAYER 2: Character/Object             │
│   (treasure chest, ship, badge)         │
│                                         │
│   LAYER 1: AI-Generated Background      │
│   (tenant-branded scene)                │
│                                         │
└─────────────────────────────────────────┘
```

- **Layer 1:** AI-generated, cached per tenant
- **Layer 2:** Pre-made sprites, tinted to brand colors
- **Layer 3:** Lottie/CSS animations (confetti, sparkles)
- **Layer 4:** Dynamic text from reward/event data

---

## Generation Strategy

### On Tenant Onboarding

```
Tenant completes onboarding
         ↓
Visual profile created (logo, colors, vibe)
         ↓
Background job: Generate 8 tenant-specific scenes
         ↓
Store in CDN: /visuals/{businessId}/{trigger}.png
         ↓
Mark profile as "ready"
```

**Generation queue:**
1. `reward_unlocked` - Most important, generate first
2. `reward_claimed` - Second priority
3. `voyage_complete` - Third priority
4. `first_visit` - Can wait
5. `welcome_back` - Can wait

### Prompt Templates

```typescript
const SCENE_PROMPTS: Record<SceneTrigger, string> = {
  reward_unlocked: `
    Treasure chest beginning to glow with golden light,
    about to open. Setting: {businessType} atmosphere,
    {vibeKeywords}. Color palette: {colors}.
    Pirate treasure theme. Magical anticipation.
    {customPromptAdditions}
    No text in image. Vibrant, game-like quality.
  `,

  reward_claimed: `
    Celebratory scene with open treasure chest overflowing
    with gold and jewels. Setting: {businessType} atmosphere,
    {vibeKeywords}. Color palette: {colors}.
    Pirate victory theme. Joyful, triumphant mood.
    {customPromptAdditions}
    No text in image. Rich, rewarding visual.
  `,

  voyage_complete: `
    Pirate ship arriving at tropical treasure island,
    sunset lighting, flags waving. Setting influenced by
    {businessType}, {vibeKeywords}. Color palette: {colors}.
    Epic adventure completion. Triumphant arrival.
    {customPromptAdditions}
    No text in image. Cinematic, game-like quality.
  `,

  first_visit: `
    Welcoming scene at a pirate port, ship just docked,
    crew greeting newcomers. Setting: {businessType} atmosphere,
    {vibeKeywords}. Color palette: {colors}.
    Warm welcome, new adventure beginning.
    {customPromptAdditions}
    No text in image. Inviting, exciting atmosphere.
  `,

  welcome_back: `
    Returning hero scene, crew celebrating the return of
    a valued member. Pirate port setting with {businessType}
    influence, {vibeKeywords}. Color palette: {colors}.
    Reunion, celebration, belonging.
    {customPromptAdditions}
    No text in image. Warm, celebratory mood.
  `
};
```

### Prompt Assembly

```typescript
function buildPrompt(
  trigger: SceneTrigger,
  profile: TenantVisualProfile
): string {
  const template = SCENE_PROMPTS[trigger];

  return template
    .replace('{businessType}', profile.businessType)
    .replace('{vibeKeywords}', profile.vibeKeywords.join(', '))
    .replace('{colors}', formatColors(profile.colors))
    .replace('{customPromptAdditions}', profile.customPromptAdditions || '')
    .trim();
}

function formatColors(colors: ColorPalette): string {
  return `primary ${colorToName(colors.primary)}, ` +
         `secondary ${colorToName(colors.secondary)}, ` +
         `accent ${colorToName(colors.accent)}`;
}

// Convert hex to descriptive name for AI
function colorToName(hex: string): string {
  // Use nearest-color library or lookup table
  // "#8B4513" → "warm brown"
  // "#D4AF37" → "gold"
}
```

### Generation API Call

```typescript
async function generateScene(
  trigger: SceneTrigger,
  profile: TenantVisualProfile
): Promise<GeneratedScene> {
  const prompt = buildPrompt(trigger, profile);

  // Call AI image generation API
  const result = await openai.images.generate({
    model: "dall-e-3",
    prompt: prompt,
    n: 1,
    size: "1024x1024",
    quality: "standard",
    style: "vivid"
  });

  // Download and upload to our CDN
  const imageUrl = await uploadToCDN(
    result.data[0].url,
    `visuals/${profile.businessId}/${trigger}.png`
  );

  // Generate thumbnail
  const thumbnailUrl = await generateThumbnail(imageUrl);

  return {
    id: generateId('scene'),
    trigger,
    imageUrl,
    thumbnailUrl,
    promptUsed: prompt,
    generatedAt: new Date(),
    expiresAt: addDays(new Date(), 30) // Refresh monthly
  };
}
```

### Refresh Strategy

```typescript
// Cron job: Daily at 3am
async function refreshExpiredScenes() {
  const expiredScenes = await db.query.generatedScenes.findMany({
    where: lt(generatedScenes.expiresAt, new Date())
  });

  for (const scene of expiredScenes) {
    const profile = await getVisualProfile(scene.businessId);
    await regenerateScene(scene.trigger, profile);
  }
}

// Also trigger on profile update
async function onVisualProfileUpdate(businessId: string) {
  const profile = await getVisualProfile(businessId);

  // Increment version to mark all scenes as stale
  await db.update(tenantVisualProfiles)
    .set({ generationVersion: profile.generationVersion + 1 })
    .where(eq(tenantVisualProfiles.businessId, businessId));

  // Queue regeneration
  await queueSceneRegeneration(businessId);
}
```

---

## Customer Experience

### Reward Unlocked

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│    ╔═══════════════════════════════════════════════════╗    │
│    ║                                                   ║    │
│    ║        [AI-Generated Treasure Scene]              ║    │
│    ║                                                   ║    │
│    ║     Glowing treasure chest in Italian             ║    │
│    ║     countryside setting, warm rustic tones        ║    │
│    ║                                                   ║    │
│    ║              ✨ sparkle effects ✨                ║    │
│    ║                                                   ║    │
│    ╠═══════════════════════════════════════════════════╣    │
│    ║                                                   ║    │
│    ║         🎉 TREASURE UNLOCKED! 🎉                  ║    │
│    ║                                                   ║    │
│    ║            FREE APPETIZER                         ║    │
│    ║           at Tony's Restaurant                    ║    │
│    ║                                                   ║    │
│    ╚═══════════════════════════════════════════════════╝    │
│                                                             │
│              [Claim Now]    [Save for Later]                │
│                                                             │
│                     [Share 📤]                              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Voyage Complete

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│    ╔═══════════════════════════════════════════════════╗    │
│    ║                                                   ║    │
│    ║        [AI-Generated Ship Scene]                  ║    │
│    ║                                                   ║    │
│    ║     Pirate ship arriving at sunset port,          ║    │
│    ║     with Italian villa elements in background     ║    │
│    ║                                                   ║    │
│    ║         🎆 celebration effects 🎆                 ║    │
│    ║                                                   ║    │
│    ╠═══════════════════════════════════════════════════╣    │
│    ║                                                   ║    │
│    ║      ⚓ VOYAGE COMPLETE! ⚓                       ║    │
│    ║                                                   ║    │
│    ║       "The Grand Tour" Conquered!                 ║    │
│    ║                                                   ║    │
│    ║   🪙 500 Doubloons    🏆 Explorer Badge           ║    │
│    ║                                                   ║    │
│    ╚═══════════════════════════════════════════════════╝    │
│                                                             │
│                    [View Rewards]                           │
│                                                             │
│                     [Share 📤]                              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Check-in Animation

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                    Tony's Restaurant                        │
│                                                             │
│         ┌─────────────────────────────────┐                │
│         │                                 │                │
│         │    🪙→    🪙→    🪙→            │                │
│         │       🪙→    🪙→                │                │
│         │   [Coins flying animation]      │                │
│         │          🪙→                    │                │
│         │              ↓                  │                │
│         │           📦                    │                │
│         │      [Treasure Chest]           │                │
│         │                                 │                │
│         └─────────────────────────────────┘                │
│                                                             │
│                    +75 DOUBLOONS                           │
│                                                             │
│               Total: 1,250 Doubloons                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Tenant Admin UI

### Visual Settings Page

```
┌─────────────────────────────────────────────────────────────┐
│ 🎨 Visual Experience                           Tony's Admin │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ YOUR BRAND COLORS                                          │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │  [■] Primary: Warm Brown     [Extract from Logo]       │ │
│ │  [■] Secondary: Gold                                   │ │
│ │  [■] Accent: Forest Green                              │ │
│ │  [■] Background: Cream                                 │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ YOUR VIBE                                                  │
│ Select words that describe your business:                  │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │                                                         │ │
│ │ ATMOSPHERE                                              │ │
│ │ [✓] Rustic  [ ] Modern  [ ] Elegant  [✓] Cozy         │ │
│ │ [ ] Vibrant [ ] Minimalist  [ ] Industrial            │ │
│ │                                                         │ │
│ │ MOOD                                                    │ │
│ │ [✓] Warm  [ ] Energetic  [ ] Calm  [ ] Playful        │ │
│ │ [ ] Sophisticated  [ ] Fun  [ ] Relaxed               │ │
│ │                                                         │ │
│ │ AUDIENCE                                                │ │
│ │ [✓] Family-friendly  [ ] Upscale  [✓] Casual          │ │
│ │ [ ] Trendy  [✓] Traditional                           │ │
│ │                                                         │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ CUSTOM ADDITIONS (Optional)                                │
│ Add specific elements to include in your scenes:           │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Italian countryside, vineyard elements, Tuscan         │ │
│ │ architecture, olive branches                           │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ─────────────────────────────────────────────────────────   │
│                                                             │
│ PREVIEW YOUR SCENES                                        │
│                                                             │
│ ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌──────────┐ │
│ │            │ │            │ │            │ │          │ │
│ │  Reward    │ │  Victory   │ │  Voyage    │ │ Welcome  │ │
│ │  Unlocked  │ │ Celebration│ │  Complete  │ │  Aboard  │ │
│ │            │ │            │ │            │ │          │ │
│ │ [Preview]  │ │ [Preview]  │ │ [Preview]  │ │[Preview] │ │
│ └────────────┘ └────────────┘ └────────────┘ └──────────┘ │
│                                                             │
│ [Regenerate All Scenes]    Last generated: 2 days ago      │
│                                                             │
│ [Save Changes]                                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Scene Preview Modal

```
┌─────────────────────────────────────────────────────────────┐
│ Preview: Reward Unlocked                           [Close]  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│    ┌───────────────────────────────────────────────────┐   │
│    │                                                   │   │
│    │                                                   │   │
│    │        [Full-size scene preview]                  │   │
│    │                                                   │   │
│    │     Glowing treasure chest in Italian             │   │
│    │     countryside setting                           │   │
│    │                                                   │   │
│    │                                                   │   │
│    └───────────────────────────────────────────────────┘   │
│                                                             │
│    This is what customers see when they unlock a reward    │
│    at your business.                                       │
│                                                             │
│    [◀ Previous]      2 of 4      [Next ▶]                  │
│                                                             │
│    [Regenerate This Scene]    [Use Different Style ▼]      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Animation Library

### Pre-built Animations (Lottie/CSS)

Platform provides animated overlays that work on any background:

| Animation | Use Case | Customization |
|-----------|----------|---------------|
| `confetti_burst` | Victory celebrations | Colors from brand palette |
| `coins_flying` | Points earned | Gold color, quantity varies |
| `sparkle_glow` | Item reveal | Accent color tint |
| `fire_grow` | Streaks | Orange/red, size by streak |
| `rank_up_flash` | Level increase | Primary color burst |
| `treasure_shimmer` | Reward preview | Gold tint |
| `ship_sail` | Voyage progress | Subtle wave motion |
| `badge_stamp` | Achievement | Metallic effect |

### Animation Layering

```typescript
interface CelebrationScene {
  background: {
    type: "ai_generated" | "static" | "gradient";
    url?: string;
    colors?: string[];
  };

  animations: {
    type: LottieAnimation;
    position: "center" | "top" | "bottom" | "overlay";
    delay: number;      // ms after scene loads
    duration: number;   // ms
    loop: boolean;
    colorOverrides?: {
      primary?: string;
      secondary?: string;
    };
  }[];

  text: {
    headline: string;
    subheadline?: string;
    details?: string[];
    position: "bottom" | "center" | "top";
  };

  actions: {
    primary: { label: string; action: string };
    secondary?: { label: string; action: string };
    share?: boolean;
  };
}
```

---

## Tier Integration

### Free Tier

```
- Platform-wide shared scenes (streaks, badges, etc.)
- Basic celebration overlays
- No tenant customization
- Generic treasure/pirate theme
```

### Pro Tier

```
- Tenant-specific AI-generated scenes
- Brand color integration
- Vibe keyword selection
- 1 regeneration per month included
- Additional regenerations: $1 each
```

### Enterprise Tier

```
- Everything in Pro
- Custom prompt additions
- Unlimited regenerations
- Priority generation queue
- Multiple scene variants per trigger
- Custom animation requests
```

### Addon: "Visual Experience Pack"

```
For tenants wanting more without full tier upgrade:

$15/month:
- AI-generated tenant scenes
- Brand integration
- 3 regenerations/month

Can be added to any tier.
```

---

## Database Schema

```sql
-- Visual slot definitions (platform-defined, rarely changes)
CREATE TABLE visual_slots (
  id TEXT PRIMARY KEY,                 -- "rule_complete"
  category TEXT NOT NULL,              -- "animation", "static", "icon", "character"

  -- Behavior
  trigger_event TEXT,                  -- Event that activates
  duration_ms INT,                     -- Animation duration
  position TEXT,                       -- "center", "top", "fullscreen"
  layer_order INT DEFAULT 1,

  -- Asset requirements
  asset_type TEXT NOT NULL,            -- "image", "lottie", "sprite_sheet"
  width INT NOT NULL,
  height INT NOT NULL,
  formats TEXT[] DEFAULT '{"png"}',

  -- Default
  platform_default_url TEXT NOT NULL,

  -- AI hints
  ai_prompt_hints TEXT,                -- Guidance for generation

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tenant visual profiles
CREATE TABLE tenant_visual_profiles (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL UNIQUE REFERENCES businesses(id),

  -- Core identity
  business_name TEXT NOT NULL,
  business_type TEXT NOT NULL,
  logo_url TEXT,

  -- Colors
  color_primary TEXT,
  color_secondary TEXT,
  color_accent TEXT,
  color_background TEXT,

  -- Vibe
  vibe_keywords TEXT[],              -- ["rustic", "warm", "family"]
  custom_prompt_additions TEXT,

  -- Generation state
  generation_version INT DEFAULT 1,
  last_generated_at TIMESTAMPTZ,
  generation_status TEXT DEFAULT 'pending',  -- 'pending', 'generating', 'ready', 'failed'

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Generated scenes
CREATE TABLE generated_scenes (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  profile_version INT NOT NULL,      -- Match to profile.generation_version

  trigger TEXT NOT NULL,             -- 'reward_unlocked', 'voyage_complete', etc.
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  prompt_used TEXT,                  -- For debugging

  generation_cost DECIMAL(10,4),     -- Track costs
  generation_time_ms INT,            -- Performance tracking

  expires_at TIMESTAMPTZ,
  generated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Platform-wide scenes (shared)
CREATE TABLE platform_scenes (
  id TEXT PRIMARY KEY,
  trigger TEXT NOT NULL UNIQUE,
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  animation_config JSONB,            -- Lottie animation settings

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Generation queue
CREATE TABLE scene_generation_queue (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL,
  trigger TEXT NOT NULL,
  priority INT DEFAULT 5,            -- 1=highest, 10=lowest
  status TEXT DEFAULT 'pending',     -- 'pending', 'processing', 'completed', 'failed'
  attempts INT DEFAULT 0,
  last_error TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_scenes_business ON generated_scenes(business_id, trigger);
CREATE INDEX idx_scenes_expires ON generated_scenes(expires_at);
CREATE INDEX idx_queue_status ON scene_generation_queue(status, priority);

-- Tenant assets (the actual generated visuals per slot)
CREATE TABLE tenant_assets (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  slot_id TEXT NOT NULL REFERENCES visual_slots(id),

  -- Asset info
  asset_url TEXT NOT NULL,             -- CDN URL
  thumbnail_url TEXT,
  version INT NOT NULL DEFAULT 1,      -- Increment on regeneration
  status TEXT DEFAULT 'active',        -- 'active', 'pending', 'failed'

  -- Generation metadata
  prompt_used TEXT,
  generation_cost DECIMAL(10,4),
  generation_time_ms INT,

  generated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,              -- For refresh scheduling

  UNIQUE(business_id, slot_id, version)
);

-- Asset pack status (track overall generation progress)
CREATE TABLE asset_pack_status (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL UNIQUE REFERENCES businesses(id),

  status TEXT DEFAULT 'pending',       -- 'pending', 'generating', 'ready', 'failed'
  total_slots INT NOT NULL,
  completed_slots INT DEFAULT 0,
  failed_slots INT DEFAULT 0,

  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  last_error TEXT
);

CREATE INDEX idx_tenant_assets_business ON tenant_assets(business_id, slot_id);
CREATE INDEX idx_tenant_assets_active ON tenant_assets(business_id, status)
  WHERE status = 'active';
```

---

## Seed Data: Platform Default Slots

```typescript
// Platform defines all slots with defaults
const VISUAL_SLOTS_SEED = [
  // === ANIMATION SLOTS ===
  {
    id: 'rule_complete',
    category: 'animation',
    trigger_event: 'RULE_COMPLETED',
    duration_ms: 3000,
    position: 'center',
    asset_type: 'image',
    width: 1024,
    height: 1024,
    platform_default_url: '/defaults/animations/rule_complete.png',
    ai_prompt_hints: 'Celebratory, treasure chest opening, victory moment'
  },
  {
    id: 'voyage_complete',
    category: 'animation',
    trigger_event: 'VOYAGE_COMPLETED',
    duration_ms: 5000,
    position: 'fullscreen',
    asset_type: 'image',
    width: 1080,
    height: 1920,
    platform_default_url: '/defaults/animations/voyage_complete.png',
    ai_prompt_hints: 'Epic arrival, ship at treasure island, triumphant'
  },
  {
    id: 'reward_unlocked',
    category: 'animation',
    trigger_event: 'REWARD_UNLOCKED',
    duration_ms: 3000,
    position: 'center',
    asset_type: 'image',
    width: 1024,
    height: 1024,
    platform_default_url: '/defaults/animations/reward_unlocked.png',
    ai_prompt_hints: 'Treasure revealed, glowing chest, anticipation'
  },
  {
    id: 'reward_claimed',
    category: 'animation',
    trigger_event: 'REWARD_CLAIMED',
    duration_ms: 4000,
    position: 'center',
    asset_type: 'image',
    width: 1024,
    height: 1024,
    platform_default_url: '/defaults/animations/reward_claimed.png',
    ai_prompt_hints: 'Victory celebration, treasure in hand, joy'
  },
  {
    id: 'points_earned',
    category: 'animation',
    trigger_event: 'POINTS_EARNED',
    duration_ms: 2000,
    position: 'top',
    asset_type: 'lottie',
    width: 400,
    height: 300,
    platform_default_url: '/defaults/animations/points_earned.json',
    ai_prompt_hints: 'Coins flying, collecting treasure, dynamic motion'
  },
  {
    id: 'check_in',
    category: 'animation',
    trigger_event: 'CHECK_IN',
    duration_ms: 2000,
    position: 'center',
    asset_type: 'image',
    width: 800,
    height: 800,
    platform_default_url: '/defaults/animations/check_in.png',
    ai_prompt_hints: 'Welcome, dropping anchor, arrival at port'
  },
  {
    id: 'streak_continue',
    category: 'animation',
    trigger_event: 'STREAK_CONTINUED',
    duration_ms: 1500,
    position: 'top',
    asset_type: 'lottie',
    width: 200,
    height: 200,
    platform_default_url: '/defaults/animations/streak_continue.json',
    ai_prompt_hints: 'Fire growing, flame intensifying, streak building'
  },
  {
    id: 'level_up',
    category: 'animation',
    trigger_event: 'LEVEL_UP',
    duration_ms: 4000,
    position: 'center',
    asset_type: 'image',
    width: 1024,
    height: 1024,
    platform_default_url: '/defaults/animations/level_up.png',
    ai_prompt_hints: 'Rank promotion, insignia reveal, prestigious'
  },

  // === BACKGROUND SLOTS ===
  {
    id: 'app_background',
    category: 'static',
    asset_type: 'image',
    width: 1080,
    height: 1920,
    platform_default_url: '/defaults/backgrounds/app_background.png',
    ai_prompt_hints: 'Ambient, atmospheric, subtle, does not distract'
  },
  {
    id: 'rewards_background',
    category: 'static',
    asset_type: 'image',
    width: 1080,
    height: 1920,
    platform_default_url: '/defaults/backgrounds/rewards_background.png',
    ai_prompt_hints: 'Treasure room, warm, inviting, mysterious'
  },
  {
    id: 'voyages_background',
    category: 'static',
    asset_type: 'image',
    width: 1080,
    height: 1920,
    platform_default_url: '/defaults/backgrounds/voyages_background.png',
    ai_prompt_hints: 'Adventure map, exploration, quest feeling'
  },

  // === ICON SLOTS ===
  {
    id: 'icon_points',
    category: 'icon',
    asset_type: 'image',
    width: 64,
    height: 64,
    platform_default_url: '/defaults/icons/points.png',
    ai_prompt_hints: 'Gold doubloon, currency, treasure coin'
  },
  {
    id: 'icon_reward',
    category: 'icon',
    asset_type: 'image',
    width: 64,
    height: 64,
    platform_default_url: '/defaults/icons/reward.png',
    ai_prompt_hints: 'Treasure chest, gift, prize'
  },
  {
    id: 'icon_voyage',
    category: 'icon',
    asset_type: 'image',
    width: 64,
    height: 64,
    platform_default_url: '/defaults/icons/voyage.png',
    ai_prompt_hints: 'Map, compass, adventure quest'
  },
  {
    id: 'icon_streak',
    category: 'icon',
    asset_type: 'image',
    width: 64,
    height: 64,
    platform_default_url: '/defaults/icons/streak.png',
    ai_prompt_hints: 'Flame, fire, burning streak'
  },

  // === CHARACTER SLOTS ===
  {
    id: 'mascot_happy',
    category: 'character',
    asset_type: 'image',
    width: 256,
    height: 256,
    platform_default_url: '/defaults/characters/mascot_happy.png',
    ai_prompt_hints: 'Friendly pirate mascot, celebrating, joyful'
  },
  {
    id: 'mascot_sad',
    category: 'character',
    asset_type: 'image',
    width: 256,
    height: 256,
    platform_default_url: '/defaults/characters/mascot_sad.png',
    ai_prompt_hints: 'Friendly pirate mascot, disappointed, sad'
  },
  {
    id: 'beast_guardian',
    category: 'character',
    asset_type: 'image',
    width: 256,
    height: 256,
    platform_default_url: '/defaults/characters/beast_guardian.png',
    ai_prompt_hints: 'Challenge creature, boss monster, formidable but not scary'
  }
];
```

---

## Customer App Integration

### React Hooks

```tsx
// Hook to get asset for a slot
function useAsset(slotId: string, businessId: string) {
  const [asset, setAsset] = useState<ResolvedAsset | null>(null);

  useEffect(() => {
    async function loadAsset() {
      // Check local cache first
      const cached = await assetCache.get(`${businessId}:${slotId}`);
      if (cached && !isExpired(cached)) {
        setAsset(cached);
        return;
      }

      // Fetch from API
      const resolved = await api.getAsset(slotId, businessId);
      await assetCache.set(`${businessId}:${slotId}`, resolved);
      setAsset(resolved);
    }

    loadAsset();
  }, [slotId, businessId]);

  return asset;
}

// Hook to get slot behavior config
function useSlotConfig(slotId: string) {
  // Slot configs are static, can be bundled with app
  return SLOT_CONFIGS[slotId];
}
```

### Animation Components

```tsx
// Universal animation player - same component everywhere
function SlotAnimation({
  slotId,
  businessId,
  onComplete,
  dynamicText
}: SlotAnimationProps) {
  const asset = useAsset(slotId, businessId);
  const config = useSlotConfig(slotId);

  if (!asset) return null;

  return (
    <AnimationOverlay
      position={config.position}
      duration={config.duration_ms}
      onComplete={onComplete}
    >
      {/* Layer 1: AI-generated background */}
      <img
        src={asset.url}
        className="animation-background"
        alt=""
      />

      {/* Layer 2: Platform animations (confetti, sparkles) */}
      <LottieOverlay
        animation={PLATFORM_EFFECTS[slotId]}
        loop={false}
      />

      {/* Layer 3: Dynamic text */}
      {dynamicText && (
        <TextOverlay>
          <h1>{dynamicText.headline}</h1>
          <p>{dynamicText.subheadline}</p>
        </TextOverlay>
      )}
    </AnimationOverlay>
  );
}

// Usage example
function RewardUnlockedScreen({ reward, businessId }) {
  return (
    <SlotAnimation
      slotId="reward_unlocked"
      businessId={businessId}
      dynamicText={{
        headline: "TREASURE UNLOCKED!",
        subheadline: reward.name
      }}
      onComplete={() => navigate('/rewards')}
    />
  );
}
```

### Background Components

```tsx
// App background that uses tenant-specific asset
function AppBackground({ businessId, children }) {
  const asset = useAsset('app_background', businessId);

  return (
    <div
      className="app-container"
      style={{
        backgroundImage: asset ? `url(${asset.url})` : undefined,
        backgroundSize: 'cover'
      }}
    >
      {children}
    </div>
  );
}
```

### Icon Components

```tsx
// Icon that resolves to tenant or platform default
function SlotIcon({ slotId, businessId, size = 24 }) {
  const asset = useAsset(slotId, businessId);

  if (!asset) {
    // Fallback to emoji while loading
    return <span>{EMOJI_FALLBACKS[slotId]}</span>;
  }

  return (
    <img
      src={asset.url}
      width={size}
      height={size}
      alt=""
      className="slot-icon"
    />
  );
}

// Usage
<SlotIcon slotId="icon_points" businessId={businessId} />
<span>1,250 Doubloons</span>
```

### Prefetching Strategy

```tsx
// On app load, prefetch all assets for current business
async function prefetchBusinessAssets(businessId: string) {
  const assets = await api.prefetchAssets(businessId);

  for (const asset of assets) {
    // Preload images
    const img = new Image();
    img.src = asset.url;

    // Cache for later
    await assetCache.set(`${businessId}:${asset.slotId}`, asset);
  }
}

// Call on business context change
useEffect(() => {
  if (currentBusinessId) {
    prefetchBusinessAssets(currentBusinessId);
  }
}, [currentBusinessId]);
```

---

## API Endpoints

### Tenant Admin

```typescript
// Get visual profile
GET /api/admin/visual-profile
Response: TenantVisualProfile

// Update visual profile
PUT /api/admin/visual-profile
Body: { vibeKeywords, customPromptAdditions, colors }
Response: TenantVisualProfile
// Triggers regeneration queue

// Preview scenes
GET /api/admin/visual-profile/scenes
Response: GeneratedScene[]

// Regenerate specific scene
POST /api/admin/visual-profile/scenes/:trigger/regenerate
Response: { queued: true, estimatedTime: "2 minutes" }

// Regenerate all scenes
POST /api/admin/visual-profile/regenerate-all
Response: { queued: true, sceneCount: 5 }
```

### Customer App

```typescript
// Get scene for trigger
GET /api/customer/scenes/:trigger
Query: { businessId }
Response: {
  background: { url, type },
  animations: [...],
  text: { headline, subheadline },
  cacheKey: "scene_xyz_v3"
}

// Pre-fetch scenes for business
GET /api/customer/scenes/prefetch
Query: { businessId }
Response: {
  scenes: [
    { trigger: "reward_unlocked", url: "...", cacheUntil: "..." },
    { trigger: "voyage_complete", url: "...", cacheUntil: "..." }
  ]
}
```

---

## Implementation Plan

### Phase 1: Foundation (MVP)

- [ ] Database schema (visual_slots, tenant_visual_profiles, tenant_assets)
- [ ] Seed visual_slots table with all slot definitions
- [ ] TenantVisualProfile model and API
- [ ] Color extraction from logo upload
- [ ] Basic vibe keywords selection UI
- [ ] Event → Celebration tier mapping
- [ ] CelebrationQueue for managing display
- [ ] CSS confetti/sparkle overlay animations (Lottie)
- [ ] Platform default assets (static placeholders initially)

### Phase 2: AI Generation Pipeline

- [ ] **Write detailed prompts for each slot** (see [VISUAL_GENERATION_BRIEF.md](./VISUAL_GENERATION_BRIEF.md))
- [ ] Test prompts with image AI (DALL-E/Gemini/Midjourney)
- [ ] Iterate and refine prompt templates
- [ ] Generate platform default assets using finalized prompts
- [ ] AI generation service integration (API wrapper)
- [ ] Prompt assembly from tenant profile
- [ ] Generation queue with retry logic and error handling
- [ ] CDN upload and asset registration
- [ ] Tenant admin preview UI

### Phase 3: Customer Experience

- [ ] Asset resolution hook (useAsset)
- [ ] SlotAnimation component
- [ ] Background components with asset loading
- [ ] Icon components with fallbacks
- [ ] Dynamic text overlay system
- [ ] Celebration display by intensity tier
- [ ] Share button with scene screenshot capture
- [ ] Asset prefetching on app/business load

### Phase 4: Polish & Optimization

- [ ] Regeneration controls in tenant admin
- [ ] Usage tracking (generations per tenant)
- [ ] Tier-based generation limits
- [ ] Cost monitoring dashboard
- [ ] A/B testing different prompt variations
- [ ] Analytics: which celebrations get shared most
- [ ] Cache optimization and expiration
- [ ] Fallback handling for generation failures

---

## Cost Projections

### Per-Tenant Costs

| Tier | Scenes | Cost/Scene | Total/Tenant | Monthly Refresh |
|------|--------|------------|--------------|-----------------|
| Free | 0 (shared only) | $0 | $0 | $0 |
| Pro | 5 | $0.03 | $0.15 | $0.15 |
| Enterprise | 8 | $0.03 | $0.24 | $0.24 |

### Scale Projections

| Tenants | Monthly Gen Cost | CDN Storage | Total |
|---------|------------------|-------------|-------|
| 100 | $15 | $5 | $20/mo |
| 1,000 | $150 | $50 | $200/mo |
| 10,000 | $1,500 | $500 | $2,000/mo |

Very manageable even at scale.

---

## Future Enhancements

### Video/Animation Generation (v2.0+)

When AI video costs drop:
- Short celebration clips (3-5 seconds)
- Animated voyage completion scenes
- Personalized "year in review" videos

### Avatar System

- Customer creates pirate avatar
- Avatar appears in celebration scenes
- Social sharing with personalized avatar

### Sports Prediction Mini-Games

- Predict game outcomes
- Battle scenes between team mascots
- Bonus points for correct predictions
- Tenant sponsors specific games

### AR Experiences

- Point phone at receipt → treasure animation
- Location-based AR treasure hunts
- Photo booth with pirate overlays

---

*Last updated: January 2025*
