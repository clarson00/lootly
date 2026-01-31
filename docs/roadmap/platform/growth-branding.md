# Platform Growth Branding & White-Label

> **Status:** 📋 Planned
> **Priority:** High - Platform viral growth mechanism
> **Entitlement:** Branding (all tiers), White-label (TBD - premium)

---

## Dependencies

- **Requires:**
  - Marketing Social Posting (in progress)
  - Marketing Messages (planned)
  - Social Sharing Rewards (planned)
  - Platform Admin interface (new requirement)

- **Enables:**
  - Platform viral growth (customer acquisition)
  - Merchant acquisition (B2B growth)
  - Premium white-label tenant experience

---

## Roadmap Position

- **Tier:** 2 (Core Infrastructure) for branding, 4+ for white-label
- **Phase:** v1.1 (branding), v2.0 (white-label)
- **Category:** Platform

---

## Cross-References

- Related specs:
  - [Marketing Social Posting](../tenant/marketing-social-posting.md)
  - [Marketing Messages](../tenant/marketing-messages.md)
  - [Social Sharing Rewards](../customer/social-sharing-rewards.md)
  - [Configurable Themes](./configurable-themes.md)
  - [Entitlements](../../ENTITLEMENTS.md)

---

## Overview

All marketing content generated through the platform includes default branding that promotes Rewards Pirate to both potential customers and merchants. Premium tiers can customize or remove this branding (white-label).

This is a **platform growth mechanism** - every tenant's marketing becomes a channel for platform acquisition.

---

## Default Branding (All Tiers)

### What Gets Branded

| Content Type | Customer CTA | Merchant CTA | Notes |
|--------------|--------------|--------------|-------|
| Social posts (FB, IG, Twitter) | ✅ Yes | ✅ Yes | Public-facing |
| Social shares (customer) | ✅ Yes | ✅ Yes | Public-facing |
| Push notifications | ✅ Yes | ❌ No | Direct to customer |
| Marketing emails | ✅ Yes | ❌ No | Direct to customer |
| In-app messages | ❌ No | ❌ No | Already in app |

### Branding Format

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  [Tenant's Marketing Content]                               │
│                                                             │
│  "Double points this weekend at Tony's! 🎉"                 │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  🏴‍☠️ Earn rewards everywhere: rewardspirate.com/download    │
│                                                             │
│  🏪 Own a business? Join the fastest growing rewards        │
│     platform → rewardspirate.com/merchants                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Line Placement Rules

| Line | Shows On | Purpose |
|------|----------|---------|
| **Customer CTA** | All marketing content | Drive app downloads |
| **Merchant CTA** | Public social content only | B2B acquisition |

**Why merchant line only on public content:**
- Social posts/shares are seen by non-customers
- Push notifications go to existing customers (already have app)
- Direct messages don't need B2B pitch

---

## Platform Admin Configuration

Platform administrators (Rewards Pirate staff) configure global branding:

### Admin Settings UI

```
┌─────────────────────────────────────────────────────────────┐
│ ⚙️ Platform Growth Branding                                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ CUSTOMER ACQUISITION                                        │
│ ─────────────────────────────────────────────────────────   │
│                                                             │
│ Enabled: [✓]                                               │
│                                                             │
│ CTA Text:                                                  │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 🏴‍☠️ Earn rewards everywhere: {link}                      │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ Link URL: [https://rewardspirate.com/download        ]     │
│                                                             │
│ Show on:                                                   │
│ [✓] Social posts  [✓] Social shares  [✓] Push  [✓] Email  │
│                                                             │
│ ─────────────────────────────────────────────────────────   │
│                                                             │
│ MERCHANT ACQUISITION                                        │
│ ─────────────────────────────────────────────────────────   │
│                                                             │
│ Enabled: [✓]                                               │
│                                                             │
│ CTA Text:                                                  │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 🏪 Own a business? Join the fastest growing rewards      │ │
│ │    platform → {link}                                     │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ Link URL: [https://rewardspirate.com/merchants       ]     │
│                                                             │
│ Show on:                                                   │
│ [✓] Social posts  [✓] Social shares  [ ] Push  [ ] Email  │
│                                                             │
│ [Save Settings]                                            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Configuration Storage

```typescript
// Platform-level settings (not per-tenant)
interface PlatformBrandingConfig {
  customerCTA: {
    enabled: boolean;
    text: string;           // Supports {link} placeholder
    url: string;
    showOn: ('social_post' | 'social_share' | 'push' | 'email')[];
  };
  merchantCTA: {
    enabled: boolean;
    text: string;
    url: string;
    showOn: ('social_post' | 'social_share')[];  // Public only
  };
}
```

---

## White-Label Option (Premium)

### What White-Label Provides

| Capability | Standard | White-Label |
|------------|----------|-------------|
| Platform customer CTA | Required | Optional/Customizable |
| Platform merchant CTA | Required | Optional/Customizable |
| Custom branding text | ❌ | ✅ |
| No branding at all | ❌ | ✅ |

### Tenant Configuration (White-Label)

```
┌─────────────────────────────────────────────────────────────┐
│ ⚙️ Marketing Branding                            [Pro+]     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Branding Style:                                            │
│                                                             │
│ ○ Platform Default                                         │
│   "Earn rewards everywhere: rewardspirate.com/download"    │
│   "Own a business? Join..."                                │
│                                                             │
│ ● Custom Branding                                          │
│   ┌─────────────────────────────────────────────────────┐  │
│   │ Powered by Tony's Rewards Program                   │  │
│   │ Learn more: tonysrewards.com                        │  │
│   └─────────────────────────────────────────────────────┘  │
│                                                             │
│ ○ No Branding                                              │
│   Marketing content only, no footer                        │
│                                                             │
│ [Save]                                                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Tenant Override Storage

```typescript
// Per-tenant override (only if white-label entitled)
interface TenantBrandingOverride {
  brandingStyle: 'platform_default' | 'custom' | 'none';
  customText?: string;      // If style is 'custom'
  customUrl?: string;       // Optional link
}
```

---

## Entitlements

### Tier Model (Cumulative)

Each tier includes everything from lower tiers plus new features:

| Tier | Branding | Notes |
|------|----------|-------|
| **Free** | Platform branding required | Full customer + merchant CTAs |
| **Starter** | Platform branding required | Full customer + merchant CTAs |
| **Pro** | White-label available | Can customize or remove |
| **Enterprise** | White-label included | Full control |

### Feature Keys

```typescript
// In FEATURES registry
BRANDING_PLATFORM: 'branding:platform',      // Default, all tiers
BRANDING_WHITE_LABEL: 'branding:white_label' // Premium feature
```

### Add-On Option

White-label could also be offered as an add-on for lower tiers:

```typescript
// Add-on definition
{
  id: 'addon_white_label',
  name: 'White-Label Marketing',
  description: 'Remove or customize platform branding on your marketing',
  monthlyPrice: 29,  // Example
  features: ['branding:white_label']
}
```

---

## Implementation

### Branding Injection Points

```typescript
// When generating marketing content
function generateMarketingContent(
  tenant: Tenant,
  content: string,
  contentType: ContentType
): string {
  const config = getPlatformBrandingConfig();
  const tenantOverride = getTenantBrandingOverride(tenant.id);

  // Check if tenant has white-label and has overridden
  if (hasFeature(tenant, 'branding:white_label') && tenantOverride) {
    if (tenantOverride.brandingStyle === 'none') {
      return content;
    }
    if (tenantOverride.brandingStyle === 'custom') {
      return appendBranding(content, tenantOverride.customText);
    }
  }

  // Default platform branding
  let branding = '';

  if (config.customerCTA.enabled && config.customerCTA.showOn.includes(contentType)) {
    branding += formatCTA(config.customerCTA);
  }

  if (config.merchantCTA.enabled && config.merchantCTA.showOn.includes(contentType)) {
    branding += formatCTA(config.merchantCTA);
  }

  return appendBranding(content, branding);
}
```

### Database Schema

```sql
-- Platform-level config (single row)
CREATE TABLE platform_branding_config (
  id TEXT PRIMARY KEY DEFAULT 'default',
  customer_cta_enabled BOOLEAN DEFAULT TRUE,
  customer_cta_text TEXT,
  customer_cta_url TEXT,
  customer_cta_show_on TEXT[],  -- Array of content types
  merchant_cta_enabled BOOLEAN DEFAULT TRUE,
  merchant_cta_text TEXT,
  merchant_cta_url TEXT,
  merchant_cta_show_on TEXT[],
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Per-tenant overrides (white-label only)
CREATE TABLE tenant_branding_overrides (
  business_id TEXT PRIMARY KEY,
  branding_style TEXT NOT NULL,  -- 'platform_default', 'custom', 'none'
  custom_text TEXT,
  custom_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Implementation Plan

### Phase 1: Platform Branding Infrastructure
- [ ] Platform branding config table
- [ ] Platform admin UI for config
- [ ] Branding injection in social posting
- [ ] Branding injection in marketing messages

### Phase 2: Integrate with All Marketing
- [ ] Social sharing rewards branding
- [ ] Push notification branding
- [ ] Email branding (when added)

### Phase 3: White-Label Feature
- [ ] Tenant override table
- [ ] Entitlement check (`branding:white_label`)
- [ ] Tenant settings UI
- [ ] Override logic in content generation

### Phase 4: Analytics
- [ ] Track clicks on platform CTAs
- [ ] Attribution: which tenants drive signups
- [ ] Merchant conversion tracking

---

## Analytics & Tracking

### What to Track

| Metric | Purpose |
|--------|---------|
| CTA impressions | How many times branding shown |
| CTA clicks | Click-through rate |
| App downloads attributed | Customer acquisition |
| Merchant signups attributed | B2B acquisition |
| Top referring tenants | Identify growth drivers |

### Attribution

Include UTM parameters in links:
```
https://rewardspirate.com/download?utm_source=marketing&utm_medium=social&utm_campaign=tenant_content&utm_content={tenant_id}
```

---

## Open Questions

1. **White-label tier?** Pro, Enterprise, or add-on only?
2. **Merchant CTA frequency?** Show on every post or periodically?
3. **A/B testing?** Test different CTA copy for conversion?
4. **Revenue share?** Should tenants who drive signups get credit/discount?

---

*Last updated: January 2025*
