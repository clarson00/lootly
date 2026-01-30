# Marketing & Social Posting

> **Status:** Next up (after Rules Engine + Admin App)
> **Priority:** High - drives customer acquisition for tenants
> **Dependencies:** Rules Engine, Plain Language Component

---

## Overview

Allow tenant admins to promote their rules and voyages on social media (Facebook, Instagram) directly from the admin app.

**Key insight:** Reuse the `PlainLanguagePreview` component already being built for the rule builder, voyage builder, and simulator. It already knows how to summarize rules/voyages in human-readable form - just drop that into the post editor as starting content.

---

## MVP Scope

### What's Included

1. **Integrations Page** - Connect Facebook/Instagram accounts (Meta OAuth)
2. **Marketing Page** - View posts, create new posts
3. **Post Builder Flow:**
   - Select a rule OR voyage (or write custom)
   - Auto-generate content using `PlainLanguagePreview` output
   - Edit in WYSIWYG editor (TinyMCE)
   - Select platforms (FB, IG)
   - Post immediately
4. **Post History** - See what was posted and when

### What's NOT in MVP

- Scheduling posts for later
- Image templates / auto-generated graphics
- Engagement stats
- Twitter/X integration
- Email integrations (Mailchimp, etc.)
- AI content generation (planned - see below)

---

## User Flow

```
Admin clicks "Marketing" in nav
    ↓
Sees post history + [Create Post] button
    ↓
Clicks Create Post
    ↓
Step 1: Choose source
  - A Rule (select from list)
  - A Voyage (select from list)  
  - Custom (blank)
    ↓
Step 2: Edit content
  - Auto-populated from PlainLanguagePreview component
  - TinyMCE editor for customization
  - Add image (optional, required for IG)
  - Character count indicator
  - [Future: AI assist buttons]
    ↓
Step 3: Publish
  - Select platforms (checkboxes)
  - Preview per platform
  - [Post Now] button
    ↓
Post appears in history with platform links
```

---

## Component Reuse

The `PlainLanguagePreview` component (being built for rule builder/voyage builder/simulator) outputs something like:

**For a Rule:**
```
When a customer visits on Saturday or Sunday,
they earn 2x points on their purchase.

This rule is active and has no end date.
```

**For a Voyage:**
```
"The Grand Voyage" - 4 quests to complete

Quest 1: Visit any location 3 times
  → Earn 100 bonus doubloons

Quest 2: Spend $50 or more in a single visit  
  → Earn 150 bonus doubloons

Quest 3: Visit on a weekend
  → Earn 2x points

Quest 4: Refer a friend who joins
  → Unlock "Captain's Feast" reward

Complete all quests to earn: Legendary Voyager badge + 500 doubloons
```

**For marketing,** we wrap this in promotional language:

```javascript
function generateMarketingContent(source, plainLanguageSummary) {
  const parts = [];
  
  // Header with emoji
  parts.push(`🏴‍☠️ ${source.name.toUpperCase()} 🏴‍☠️`);
  parts.push('');
  
  // The plain language summary (from existing component)
  parts.push(plainLanguageSummary);
  parts.push('');
  
  // Time urgency if applicable
  if (source.end_date) {
    parts.push(`⏰ Hurry - ends ${formatDate(source.end_date)}!`);
    parts.push('');
  }
  
  // CTA
  parts.push('Download our app and start earning today! 🏆');
  parts.push('');
  
  // Hashtags
  parts.push(`#${businessName} #Rewards #LocalLoyalty`);
  
  return parts.join('\n');
}
```

---

## Database Schema

```sql
-- Connected social accounts
CREATE TABLE social_integrations (
  id TEXT PRIMARY KEY DEFAULT 'sint_' || nanoid(),
  business_id TEXT NOT NULL REFERENCES businesses(id),
  platform TEXT NOT NULL, -- 'facebook', 'instagram', 'twitter'
  platform_account_id TEXT NOT NULL,
  platform_account_name TEXT,
  access_token TEXT NOT NULL, -- encrypted
  refresh_token TEXT, -- encrypted  
  token_expires_at TIMESTAMPTZ,
  scopes JSONB,
  is_active BOOLEAN DEFAULT true,
  connected_at TIMESTAMPTZ DEFAULT NOW(),
  connected_by TEXT REFERENCES users(id),
  UNIQUE(business_id, platform)
);

-- Marketing posts
CREATE TABLE marketing_posts (
  id TEXT PRIMARY KEY DEFAULT 'mpost_' || nanoid(),
  business_id TEXT NOT NULL REFERENCES businesses(id),
  
  -- Content source
  source_type TEXT, -- 'rule', 'voyage', 'custom'
  source_id TEXT, -- rule_id or ruleset_id if applicable
  
  -- Content
  content TEXT NOT NULL,
  image_url TEXT,
  
  -- Publishing
  platforms JSONB NOT NULL DEFAULT '[]', -- ['facebook', 'instagram']
  published_at TIMESTAMPTZ,
  status TEXT DEFAULT 'draft', -- 'draft', 'published', 'failed'
  
  -- Platform responses
  platform_post_ids JSONB, -- { facebook: '123', instagram: '456' }
  error_message TEXT, -- if failed
  
  -- Metadata
  created_by TEXT REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## API Endpoints

```typescript
// Integrations
GET    /api/admin/integrations              // List connected integrations
POST   /api/admin/integrations/facebook     // Start FB OAuth flow
GET    /api/admin/integrations/facebook/callback  // OAuth callback
DELETE /api/admin/integrations/:id          // Disconnect

// Marketing posts
GET    /api/admin/marketing/posts           // List posts
POST   /api/admin/marketing/posts           // Create & publish post
GET    /api/admin/marketing/posts/:id       // Get post details
DELETE /api/admin/marketing/posts/:id       // Delete post record

// Helpers
GET    /api/admin/marketing/preview         // Generate preview content for rule/voyage

// AI (future)
POST   /api/admin/marketing/ai/generate     // Generate post content
POST   /api/admin/marketing/ai/improve      // Improve existing content
```

---

## Admin App Pages

```
admin-app/src/
├── pages/
│   ├── IntegrationsPage.tsx      // Settings > Integrations
│   ├── MarketingPage.tsx         // Post list + create
│   └── PostBuilderPage.tsx       // Multi-step post creation
├── components/
│   ├── integrations/
│   │   ├── IntegrationCard.tsx   // Single integration status
│   │   └── OAuthButton.tsx       // Connect button with OAuth
│   └── marketing/
│       ├── PostList.tsx          // History of posts
│       ├── SourcePicker.tsx      // Select rule/voyage/custom
│       ├── PostEditor.tsx        // TinyMCE wrapper
│       ├── PlatformSelector.tsx  // Checkboxes for FB/IG
│       ├── PostPreview.tsx       // Platform-specific previews
│       └── AIAssistPanel.tsx     // [Future] AI content tools
```

---

## Technical Notes

### Meta (Facebook/Instagram) OAuth

- Single OAuth flow gets both FB and IG (if business has IG linked)
- Required scopes: `pages_manage_posts`, `pages_read_engagement`, `instagram_basic`, `instagram_content_publish`
- Access tokens expire - need refresh logic
- Instagram REQUIRES an image for posts

### TinyMCE

- Use free/open source version or cloud with API key
- Simple toolbar: bold, italic, emoji, link, undo/redo
- Character count plugin for platform limits
- Strip HTML for actual API posts (platforms want plain text)

### Image Handling

For MVP:
- Optional image upload
- If posting to Instagram and no image → warn user or skip IG
- Store images in existing file storage (S3/etc)

Future:
- Pre-designed templates user can customize
- Auto-generate simple graphics with rule/voyage name

---

## Feature Gating

| Feature | Free | Starter | Pro | Enterprise |
|---------|------|---------|-----|------------|
| Connect social accounts | ❌ | ✅ | ✅ | ✅ |
| Post to FB/IG | ❌ | ✅ | ✅ | ✅ |
| Post history | ❌ | ✅ | ✅ | ✅ |
| Scheduled posts | ❌ | ❌ | ✅ | ✅ |
| Engagement stats | ❌ | ❌ | ✅ | ✅ |
| AI content assist | ❌ | ❌ | ✅ | ✅ |

---

## 🤖 AI Agent Integration (Planned)

> **Status:** Future enhancement - will be part of broader AI agent for the admin app
> **Note:** Design the MVP with AI in mind so it's easy to add later

### Vision

An AI agent will assist admins throughout the app. For marketing specifically:

```
┌─────────────────────────────────────────────────────────┐
│  📣 CREATE POST > Edit                                  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ [B] [I] [U] | [🖼️] [🔗] | [Undo] [Redo]         │   │
│  ├─────────────────────────────────────────────────┤   │
│  │                                                 │   │
│  │ 🏴‍☠️ HAPPY HOUR HERO 🏴‍☠️                          │   │
│  │                                                 │   │
│  │ [content here...]                              │   │
│  │                                                 │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  🤖 AI ASSIST                                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │ [✨ Make it exciting]  [📝 Make it shorter]     │   │
│  │ [🎯 Add urgency]       [😄 Make it fun]         │   │
│  │ [🔄 Try a different angle]                      │   │
│  │                                                 │   │
│  │ Or describe what you want:                      │   │
│  │ [____________________________________] [Go]     │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### AI Capabilities

| Capability | Description |
|------------|-------------|
| **Generate from scratch** | "Write a post promoting our weekend bonus" |
| **Improve existing** | Make content more engaging, urgent, fun, etc. |
| **Adjust tone** | Professional ↔ casual ↔ playful |
| **Shorten/lengthen** | Fit platform character limits |
| **Add hashtags** | Suggest relevant hashtags |
| **Multiple variations** | Generate 3 options to choose from |
| **Platform-specific** | Optimize for FB vs IG vs Twitter |

### Context the AI Will Have

When generating content, the AI agent will know:

- The rule/voyage details (from PlainLanguagePreview)
- Business name and branding
- Business type (coffee shop, restaurant, etc.)
- Previous successful posts (engagement data)
- Target platform and its constraints
- Current season/time of year
- Any active promotions or events

### Example Interaction

```
User clicks [✨ Make it exciting]

AI rewrites:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🚨 ALERT: HAPPY HOUR HERO MODE ACTIVATED! 🚨

Ahoy, fellow pirates! ⚓

Drop anchor between 3-6pm on weekdays and we'll 
load your treasure chest with 50 BONUS DOUBLOONS! 💰

That's FREE loot just for stopping by during 
the golden hours. No catch. No tricks. Just rewards.

⏰ But hurry - this voyage ends Feb 28th!

Who's in? Tag your crew! 👇

#JoesCoffee #HappyHour #FreeLoot #Rewards

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Use this] [Try another] [Edit more]
```

### Technical Approach

```typescript
// POST /api/admin/marketing/ai/generate
{
  source_type: 'rule',
  source_id: 'rule_abc123',
  plain_language_summary: '...from PlainLanguagePreview...',
  instruction: 'make it exciting', // or custom prompt
  platform: 'facebook',
  business_context: {
    name: "Joe's Coffee",
    type: 'coffee_shop',
    tone: 'friendly_casual' // from business settings
  }
}

// Response
{
  content: '🚨 ALERT: HAPPY HOUR HERO MODE ACTIVATED!...',
  hashtags: ['#JoesCoffee', '#HappyHour', ...],
  character_count: 342,
  variations: [...] // optional: multiple options
}
```

### Integration Points

The AI agent will eventually be used across the admin app:

| Area | AI Assist |
|------|-----------|
| **Marketing** | Generate/improve post content |
| **Rule Builder** | "Create a rule that rewards weekend visitors" |
| **Voyage Builder** | "Design a voyage for new customers" |
| **Analytics** | "What's working? What should I try?" |
| **Customer Support** | "Draft a response to this feedback" |

### MVP Prep for AI

Even in MVP (no AI), design for easy AI addition:

1. **Separate content generation logic** - Don't hardcode the template generation
2. **Add API endpoint stubs** - `/api/admin/marketing/ai/*` returns 501 for now
3. **UI placeholder** - "AI Assist coming soon" in the editor
4. **Store business context** - Tone, type, branding for future AI use

---

## Future Enhancements (Post-MVP)

1. **Scheduling** - Pick date/time to post
2. **Image templates** - Pre-designed graphics
3. **Engagement tracking** - Pull likes/comments from APIs
4. **Twitter/X** - Additional platform
5. **Email integration** - Mailchimp, Constant Contact
6. **AI content generation** - See section above
7. **A/B testing** - Post variations, track performance
8. **Best time recommendations** - When to post based on past engagement
9. **AI image generation** - Generate promotional graphics

---

## Open Questions

1. **Multi-location:** If business has multiple FB pages, let them pick which one(s)?
2. **Approval workflow:** For teams, should there be draft → approve → publish?
3. **Link in bio:** Should we help manage their "link in bio" for IG?
4. **AI model:** Which LLM for content generation? (Claude API, OpenAI, etc.)

---

## Implementation Order

1. Database migrations for `social_integrations` and `marketing_posts`
2. Meta OAuth flow (backend)
3. Integrations page (frontend)
4. Marketing page with post list (frontend)
5. Post builder - source picker step
6. Post builder - editor step (integrate TinyMCE + PlainLanguagePreview)
7. Post builder - publish step (platform selector + API calls)
8. Post to Meta API (backend)
9. Post history display
10. [Future] AI assist integration
