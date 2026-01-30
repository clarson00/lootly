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
- AI content suggestions

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
│       └── PostPreview.tsx       // Platform-specific previews
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

---

## Future Enhancements (Post-MVP)

1. **Scheduling** - Pick date/time to post
2. **Image templates** - Pre-designed graphics
3. **Engagement tracking** - Pull likes/comments from APIs
4. **Twitter/X** - Additional platform
5. **Email integration** - Mailchimp, Constant Contact
6. **AI suggestions** - "Make it more exciting" button
7. **A/B testing** - Post variations, track performance
8. **Best time recommendations** - When to post based on past engagement

---

## Open Questions

1. **Multi-location:** If business has multiple FB pages, let them pick which one(s)?
2. **Approval workflow:** For teams, should there be draft → approve → publish?
3. **Link in bio:** Should we help manage their "link in bio" for IG?

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
