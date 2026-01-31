# Visual Generation Brief

> **Status:** 📋 Template - Prompts to be written during implementation
> **Purpose:** Reference document for image AI (Gemini, DALL-E, Midjourney, etc.)
> **Category:** Platform Infrastructure

---

## How To Use This Document

This brief provides everything an image AI needs to generate visual assets for Rewards Pirate. During implementation:

1. **Platform Defaults** - Generate one set of default assets for the platform
2. **Tenant Assets** - Use tenant context section to generate per-tenant variations

Copy relevant sections into your image AI of choice.

---

## Platform Overview

```
REWARDS PIRATE - VISUAL ASSET BRIEF
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

WHAT IT IS:
Rewards Pirate is a mobile loyalty/rewards app where customers earn
"doubloons" (points) and collect "treasure" (rewards) at local
businesses. It's heavily gamified with:
- Quests called "voyages"
- Daily streaks with growing flames
- Beasts/creatures to capture
- Badges and achievements
- Leaderboards and friend competition
- Levels and ranks

Think: Pirate-themed game meets Starbucks Rewards meets Pokemon Go

TARGET AUDIENCE:
- Families, casual gamers, everyday people
- Ages 16-55
- Should feel fun but not childish

OVERALL MOOD:
- Adventurous and exciting
- Rewarding and satisfying
- Friendly and welcoming
- Celebratory and joyful
```

---

## Visual Style Guide

```
STYLE REQUIREMENTS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ART STYLE:
- Game-like, NOT realistic or photographic
- Similar to: Clash of Clans, Coin Master, Candy Crush, Sea of Thieves
- Stylized, slightly cartoonish but not juvenile
- Clean lines, good readability at small sizes

COLORS:
- Vibrant, saturated palette
- Primary: Golds, warm browns, deep ocean blues
- Accents: Treasure greens (emerald), ruby reds, purple gems
- Avoid: Muted tones, pastels, grayscale

MOOD SPECTRUM:
- Celebrations: Joyful, triumphant, exciting
- Backgrounds: Warm, inviting, atmospheric
- Icons: Clear, friendly, recognizable
- Characters: Approachable, expressive, memorable

TECHNICAL RULES:
- NO TEXT in any images (text overlaid dynamically by app)
- Clean compositions with space for UI overlays
- Consistent lighting direction (top-left to bottom-right)
- Transparent backgrounds where noted
- Mobile-first (vertical compositions for fullscreen)

THEME ELEMENTS:
- Treasure chests (various states: closed, glowing, open, overflowing)
- Gold doubloons and coins
- Pirate ships (friendly, adventure-style)
- Treasure maps and compasses
- Tropical islands and ports
- Anchors, ship wheels, ropes
- Gems and jewels (emeralds, rubies, sapphires)
- Flames and torches (for streaks)
- Friendly sea creatures (not scary)
- Pirate mascot characters (welcoming, not threatening)
```

---

## Asset Slots Reference

### Celebration Tiers

| Slot ID | Dimensions | Duration | Purpose |
|---------|------------|----------|---------|
| `celebration_subtle` | 400x200 | 1.5s | Small wins, quick acknowledgment |
| `celebration_normal` | 800x800 | 3s | Notable achievements |
| `celebration_big` | 1080x1920 | 4s | Major milestones, fullscreen |
| `celebration_epic` | 1080x1920 | 6s | Rare achievements, maximum celebration |

### Special Occasions

| Slot ID | Dimensions | Purpose |
|---------|------------|---------|
| `first_visit` | 1080x1920 | Welcome new customer |
| `comeback` | 1080x1920 | Welcome back after 30+ days |
| `voyage_complete` | 1080x1920 | Quest/voyage finished |
| `beast_captured` | 800x800 | Caught a creature |
| `rare_item_found` | 800x800 | Found rare collectible |
| `sports_victory` | 800x800 | Won a prediction |

### Backgrounds

| Slot ID | Dimensions | Purpose |
|---------|------------|---------|
| `app_background` | 1080x1920 | Main app ambient background |
| `rewards_background` | 1080x1920 | Rewards list screen |
| `voyages_background` | 1080x1920 | Quests/voyages screen |
| `profile_background` | 1080x1920 | Customer profile screen |
| `loading_screen` | 1080x1920 | App loading state |

### Icons (64x64 each, transparent background)

| Slot ID | Represents |
|---------|------------|
| `icon_points` | Currency/doubloons |
| `icon_reward` | Rewards/treasure |
| `icon_voyage` | Quests/adventures |
| `icon_streak` | Daily streaks/fire |
| `icon_badge` | Achievements |
| `icon_level` | Rank/level |
| `icon_checkin` | Check-in action |
| `icon_location` | Business/port |
| `icon_friend` | Friends/crew |
| `icon_leaderboard` | Rankings |

### Characters (256x256 each, transparent background)

| Slot ID | Character |
|---------|-----------|
| `mascot_happy` | Main mascot celebrating |
| `mascot_sad` | Main mascot disappointed |
| `mascot_excited` | Main mascot amazed |
| `mascot_neutral` | Main mascot default |
| `beast_common` | Common capturable creature |
| `beast_rare` | Rare capturable creature |
| `beast_legendary` | Legendary capturable creature |

---

## Slot Specifications

> **NOTE:** Detailed prompts to be written during implementation phase.
> Each slot below will receive a full prompt specification.

### celebration_subtle

```
PURPOSE: Quick acknowledgment of small wins
WHEN SHOWN: Points earned (<100), daily check-in, streak continued
DURATION: 1.5 seconds
POSITION: Top of screen (toast notification)
MOOD: Quick joy, "nice!", lightweight

REQUIREMENTS:
- Should not be visually heavy or distracting
- Works as a small banner/toast
- Suggests reward without being a big moment
- Coins, sparkles, small treasure glimmer

PROMPT: [To be written during implementation]
```

### celebration_normal

```
PURPOSE: Notable achievement celebration
WHEN SHOWN: Rule completed, beast caught, prediction won, 100-500 points
DURATION: 3 seconds
POSITION: Center of screen (popup overlay)
MOOD: Victory, accomplishment, "yes!"

REQUIREMENTS:
- Treasure chest is central element
- Opening/revealing motion implied
- Gold and light spilling out
- Space at bottom for text overlay
- Should feel satisfying and rewarding

PROMPT: [To be written during implementation]
```

### celebration_big

```
PURPOSE: Major milestone celebration
WHEN SHOWN: Reward claimed, level up, 30-day streak, 500+ points
DURATION: 4 seconds
POSITION: Fullscreen takeover
MOOD: Triumphant, epic, "I DID IT!"

REQUIREMENTS:
- Full treasure room or discovery scene
- Overwhelming abundance of treasure
- Dramatic lighting
- Clear center space for text
- Should feel like a BIG moment

PROMPT: [To be written during implementation]
```

### celebration_epic

```
PURPOSE: Rare, maximum celebration
WHEN SHOWN: Voyage complete, 365-day streak, #1 leaderboard, legendary finds
DURATION: 6 seconds
POSITION: Fullscreen with effects
MOOD: Legendary, once-in-a-lifetime, "INCREDIBLE!"

REQUIREMENTS:
- Most dramatic composition
- Ship arriving at legendary treasure
- Maximum visual impact
- Fireworks/celebration implied
- Should feel truly special and rare

PROMPT: [To be written during implementation]
```

### Backgrounds

```
app_background:
- Subtle, atmospheric, doesn't compete with UI
- Warm ambient pirate port or ship deck
- Muted enough for readability
- No focal point, purely environmental

rewards_background:
- Treasure room atmosphere
- Inviting, warm, mysterious
- Suggests abundance without being busy

voyages_background:
- Adventure map feeling
- Horizon, ships, unexplored waters
- Sense of journey and discovery

PROMPTS: [To be written during implementation]
```

### Icons

```
All icons should:
- Be immediately recognizable at 64x64
- Use consistent style across the set
- Work on both light and dark backgrounds
- Have transparent backgrounds
- Feel cohesive as a family

PROMPT (for full set): [To be written during implementation]
```

### Characters

```
MASCOT CHARACTER:
- Friendly pirate character
- Approachable, not threatening
- Expressive face for different emotions
- Consistent design across all states
- Could be human pirate, parrot, or friendly sea creature

BEASTS:
- Collectible creatures
- Friendly even when "challenging"
- Distinct silhouettes for rarity tiers
- Common: Cute, everyday sea creatures
- Rare: More impressive, colorful
- Legendary: Majestic, awe-inspiring

PROMPTS: [To be written during implementation]
```

---

## Tenant Customization Template

When generating tenant-specific assets, include this context:

```
TENANT CONTEXT TEMPLATE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

BUSINESS: [Business Name]
TYPE: [Business Type - restaurant, cafe, gym, retail, etc.]

COLORS:
- Primary: [Hex code] ([color name])
- Secondary: [Hex code] ([color name])
- Accent: [Hex code] ([color name])

VIBE KEYWORDS: [comma-separated list]
Examples: rustic, modern, elegant, cozy, family-friendly, upscale,
casual, trendy, traditional, warm, energetic, calm

CUSTOM ELEMENTS: [specific things to include]
Examples: Italian countryside, coffee beans, gym equipment,
vintage decor, beach vibes, urban setting

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EXAMPLE - TONY'S RESTAURANT:

BUSINESS: Tony's Restaurant
TYPE: Italian Restaurant

COLORS:
- Primary: #8B4513 (warm brown)
- Secondary: #D4AF37 (gold)
- Accent: #2F4F4F (forest green)

VIBE KEYWORDS: rustic, family-friendly, warm, traditional, cozy

CUSTOM ELEMENTS: Italian countryside, vineyard, Tuscan architecture,
olive branches, wine barrels, warm kitchen feeling

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TENANT-SPECIFIC PROMPT STRUCTURE:

"[Base slot description]. Setting blends pirate treasure theme with
[business type] atmosphere. Colors: [color palette description].
[Vibe keywords] mood. Elements of [custom elements] in the background
or details. [Technical requirements]."
```

---

## Implementation Checklist

### Phase 1: Platform Defaults
- [ ] Write detailed prompts for each slot
- [ ] Generate platform default assets
- [ ] Review and iterate on prompts
- [ ] Select best results for each slot
- [ ] Upload to CDN as platform defaults

### Phase 2: Tenant Generation Pipeline
- [ ] Build prompt assembly from tenant profile
- [ ] Test with sample tenants (varied business types)
- [ ] Refine prompt templates based on results
- [ ] Implement generation queue
- [ ] Set up CDN storage structure

### Phase 3: Refinement
- [ ] A/B test different prompt variations
- [ ] Gather feedback on generated assets
- [ ] Create prompt variations for different AI providers
- [ ] Document which AI produces best results per slot type

---

## AI Provider Notes

> To be filled in during implementation based on testing

### DALL-E 3
- Best for: [TBD]
- Prompt style: [TBD]
- Cost per image: ~$0.04

### Midjourney
- Best for: [TBD]
- Prompt style: [TBD]
- Cost per image: [TBD]

### Stable Diffusion (via Replicate/Stability)
- Best for: [TBD]
- Prompt style: [TBD]
- Cost per image: ~$0.01-0.02

### Google Gemini / Imagen
- Best for: [TBD]
- Prompt style: [TBD]
- Cost per image: [TBD]

---

## Cross-References

- [Visual Experience Engine](./visual-experience-engine.md) - Full system architecture
- [Gamification Theme](../../GAMIFICATION.md) - Pirate terminology and theme guide

---

*This document is designed to be given to image generation AI. Update prompts during implementation phase.*

*Last updated: January 2025*
