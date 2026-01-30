# Feature Flags & Subscription Tiers

> **Architecture Decision:** All features must be gated through a centralized feature flag system.  
> This enables subscription tiers, add-ons, A/B testing, and gradual rollouts.

---

## Overview

Every feature in Lootly should be wrapped in a feature check. This allows us to:

1. **Monetize** - Gate features by subscription tier
2. **Upsell** - Offer add-ons to lower tiers
3. **Rollout** - Gradually enable features for testing
4. **Kill switch** - Disable problematic features instantly
5. **Custom deals** - Enable specific features for enterprise clients

---

## Subscription Tiers

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SUBSCRIPTION TIERS                                │
├─────────────────┬─────────────────┬─────────────────┬─────────────────────┤
│     FREE        │      PRO        │   ENTERPRISE    │     ADD-ONS         │
│   (Pilot)       │   $49/mo        │   Custom        │   Per Feature       │
├─────────────────┼─────────────────┼─────────────────┼─────────────────────┤
│ • 1 location    │ • 5 locations   │ • Unlimited     │ • AI Assistant      │
│ • 500 customers │ • Unlimited     │ • All features  │ • Advanced Analytics│
│ • Basic rewards │ • All rewards   │ • Priority support│ • White Label     │
│ • QR check-in   │ • Journeys      │ • Custom integrations│ • API Access   │
│ • Basic rules   │ • Time promos   │ • Dedicated CSM │ • SMS (per msg)     │
│                 │ • Push notifs   │ • SLA           │                     │
│                 │ • Basic analytics│                │                     │
│                 │ • Marketing msgs │                │                     │
└─────────────────┴─────────────────┴─────────────────┴─────────────────────┘
```

---

## Feature Registry

Every feature has a unique key and tier assignment:

```typescript
// backend/lib/features/registry.ts

export const FEATURES = {
  // Core (all tiers)
  CORE_QR_CHECKIN: 'core.qr_checkin',
  CORE_POINTS: 'core.points',
  CORE_BASIC_REWARDS: 'core.basic_rewards',
  CORE_BASIC_RULES: 'core.basic_rules',
  CORE_STAFF_APP: 'core.staff_app',
  CORE_CUSTOMER_APP: 'core.customer_app',
  
  // Pro tier
  PRO_JOURNEYS: 'pro.journeys',
  PRO_TIME_BOUND_PROMOS: 'pro.time_bound_promos',
  PRO_PUSH_NOTIFICATIONS: 'pro.push_notifications',
  PRO_MARKETING_MESSAGES: 'pro.marketing_messages',
  PRO_BASIC_ANALYTICS: 'pro.basic_analytics',
  PRO_MULTIPLE_LOCATIONS: 'pro.multiple_locations',
  PRO_ADVANCED_RULES: 'pro.advanced_rules',
  PRO_EXPIRING_REWARDS: 'pro.expiring_rewards',
  
  // Enterprise tier
  ENTERPRISE_UNLIMITED_LOCATIONS: 'enterprise.unlimited_locations',
  ENTERPRISE_CUSTOM_INTEGRATIONS: 'enterprise.custom_integrations',
  ENTERPRISE_SSO: 'enterprise.sso',
  ENTERPRISE_AUDIT_LOG: 'enterprise.audit_log',
  ENTERPRISE_PRIORITY_SUPPORT: 'enterprise.priority_support',
  
  // Add-ons (can be added to any tier)
  ADDON_AI_ASSISTANT: 'addon.ai_assistant',
  ADDON_ADVANCED_ANALYTICS: 'addon.advanced_analytics',
  ADDON_WHITE_LABEL: 'addon.white_label',
  ADDON_PUBLIC_API: 'addon.public_api',
  ADDON_POS_INTEGRATION: 'addon.pos_integration',
  ADDON_RECEIPT_SCANNING: 'addon.receipt_scanning',
  
  // Usage-based
  USAGE_SMS: 'usage.sms',
  USAGE_EMAIL: 'usage.email',
} as const;

export type FeatureKey = typeof FEATURES[keyof typeof FEATURES];
```

---

## Tier Definitions

```typescript
// backend/lib/features/tiers.ts

import { FEATURES } from './registry';

export type Tier = 'free' | 'pro' | 'enterprise';

export const TIER_FEATURES: Record<Tier, FeatureKey[]> = {
  free: [
    FEATURES.CORE_QR_CHECKIN,
    FEATURES.CORE_POINTS,
    FEATURES.CORE_BASIC_REWARDS,
    FEATURES.CORE_BASIC_RULES,
    FEATURES.CORE_STAFF_APP,
    FEATURES.CORE_CUSTOMER_APP,
  ],
  
  pro: [
    // Includes all free features
    ...TIER_FEATURES.free,
    
    // Plus pro features
    FEATURES.PRO_JOURNEYS,
    FEATURES.PRO_TIME_BOUND_PROMOS,
    FEATURES.PRO_PUSH_NOTIFICATIONS,
    FEATURES.PRO_MARKETING_MESSAGES,
    FEATURES.PRO_BASIC_ANALYTICS,
    FEATURES.PRO_MULTIPLE_LOCATIONS,
    FEATURES.PRO_ADVANCED_RULES,
    FEATURES.PRO_EXPIRING_REWARDS,
  ],
  
  enterprise: [
    // Includes all pro features
    ...TIER_FEATURES.pro,
    
    // Plus enterprise features
    FEATURES.ENTERPRISE_UNLIMITED_LOCATIONS,
    FEATURES.ENTERPRISE_CUSTOM_INTEGRATIONS,
    FEATURES.ENTERPRISE_SSO,
    FEATURES.ENTERPRISE_AUDIT_LOG,
    FEATURES.ENTERPRISE_PRIORITY_SUPPORT,
    
    // Enterprise gets all add-ons included
    FEATURES.ADDON_AI_ASSISTANT,
    FEATURES.ADDON_ADVANCED_ANALYTICS,
    FEATURES.ADDON_WHITE_LABEL,
    FEATURES.ADDON_PUBLIC_API,
  ],
};

export const TIER_LIMITS: Record<Tier, {
  maxLocations: number;
  maxCustomers: number;
  maxStaff: number;
  maxRules: number;
  maxRewards: number;
  maxJourneys: number;
  monthlyPushNotifications: number;
  monthlyMarketingMessages: number;
}> = {
  free: {
    maxLocations: 1,
    maxCustomers: 500,
    maxStaff: 5,
    maxRules: 10,
    maxRewards: 5,
    maxJourneys: 0,
    monthlyPushNotifications: 0,
    monthlyMarketingMessages: 0,
  },
  pro: {
    maxLocations: 5,
    maxCustomers: -1, // unlimited
    maxStaff: 25,
    maxRules: 50,
    maxRewards: 25,
    maxJourneys: 10,
    monthlyPushNotifications: 5000,
    monthlyMarketingMessages: 2500,
  },
  enterprise: {
    maxLocations: -1, // unlimited
    maxCustomers: -1,
    maxStaff: -1,
    maxRules: -1,
    maxRewards: -1,
    maxJourneys: -1,
    monthlyPushNotifications: -1,
    monthlyMarketingMessages: -1,
  },
};
```

---

## Database Schema

```sql
-- Add to businesses table
ALTER TABLE businesses ADD COLUMN subscription_tier TEXT DEFAULT 'free';
ALTER TABLE businesses ADD COLUMN subscription_status TEXT DEFAULT 'active';
ALTER TABLE businesses ADD COLUMN stripe_customer_id TEXT;
ALTER TABLE businesses ADD COLUMN stripe_subscription_id TEXT;
ALTER TABLE businesses ADD COLUMN trial_ends_at TIMESTAMPTZ;
ALTER TABLE businesses ADD COLUMN subscription_ends_at TIMESTAMPTZ;

-- Feature overrides (for add-ons and custom deals)
CREATE TABLE business_features (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  feature_key TEXT NOT NULL,
  enabled BOOLEAN DEFAULT true,
  
  -- Source of this override
  source TEXT NOT NULL,  -- 'addon', 'custom', 'trial', 'promo'
  source_id TEXT,        -- stripe_subscription_id, promo_code, etc.
  
  -- Limits override (for usage-based features)
  limit_value INTEGER,
  limit_period TEXT,     -- 'monthly', 'daily', 'lifetime'
  
  -- Validity
  starts_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(business_id, feature_key)
);

-- Usage tracking (for metered billing)
CREATE TABLE feature_usage (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  feature_key TEXT NOT NULL,
  
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  usage_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ,
  
  UNIQUE(business_id, feature_key, period_start)
);

-- Indexes
CREATE INDEX idx_business_features_business ON business_features(business_id);
CREATE INDEX idx_business_features_key ON business_features(feature_key);
CREATE INDEX idx_feature_usage_business ON feature_usage(business_id);
CREATE INDEX idx_feature_usage_period ON feature_usage(period_start, period_end);
```

---

## Feature Service

```typescript
// backend/lib/features/feature-service.ts

import { db } from '../db';
import { FEATURES, FeatureKey } from './registry';
import { TIER_FEATURES, TIER_LIMITS, Tier } from './tiers';

export class FeatureService {
  
  /**
   * Check if a business has access to a feature
   */
  async hasFeature(businessId: string, feature: FeatureKey): Promise<boolean> {
    const business = await db.query.businesses.findFirst({
      where: eq(businesses.id, businessId)
    });
    
    if (!business) return false;
    
    // Check subscription status
    if (business.subscription_status !== 'active') {
      // Allow grace period or read-only access?
      return false;
    }
    
    // Check tier-based access
    const tier = business.subscription_tier as Tier;
    if (TIER_FEATURES[tier].includes(feature)) {
      return true;
    }
    
    // Check for add-on override
    const override = await db.query.businessFeatures.findFirst({
      where: and(
        eq(businessFeatures.business_id, businessId),
        eq(businessFeatures.feature_key, feature),
        eq(businessFeatures.enabled, true),
        or(
          isNull(businessFeatures.expires_at),
          gt(businessFeatures.expires_at, new Date())
        )
      )
    });
    
    return !!override;
  }
  
  /**
   * Check if business is within limits for a feature
   */
  async checkLimit(
    businessId: string, 
    limitType: keyof typeof TIER_LIMITS['free'],
    currentCount: number
  ): Promise<{ allowed: boolean; limit: number; remaining: number }> {
    const business = await db.query.businesses.findFirst({
      where: eq(businesses.id, businessId)
    });
    
    const tier = (business?.subscription_tier || 'free') as Tier;
    const limit = TIER_LIMITS[tier][limitType];
    
    // -1 means unlimited
    if (limit === -1) {
      return { allowed: true, limit: -1, remaining: -1 };
    }
    
    return {
      allowed: currentCount < limit,
      limit,
      remaining: Math.max(0, limit - currentCount)
    };
  }
  
  /**
   * Track usage for metered features
   */
  async trackUsage(
    businessId: string, 
    feature: FeatureKey,
    count: number = 1
  ): Promise<void> {
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    await db.insert(featureUsage)
      .values({
        id: generateId('usage'),
        business_id: businessId,
        feature_key: feature,
        period_start: periodStart,
        period_end: periodEnd,
        usage_count: count
      })
      .onConflictDoUpdate({
        target: [featureUsage.business_id, featureUsage.feature_key, featureUsage.period_start],
        set: {
          usage_count: sql`${featureUsage.usage_count} + ${count}`,
          updated_at: new Date()
        }
      });
  }
  
  /**
   * Get all features for a business (for UI display)
   */
  async getBusinessFeatures(businessId: string): Promise<{
    tier: Tier;
    features: Record<FeatureKey, boolean>;
    limits: typeof TIER_LIMITS['free'];
    addons: FeatureKey[];
  }> {
    const business = await db.query.businesses.findFirst({
      where: eq(businesses.id, businessId)
    });
    
    const tier = (business?.subscription_tier || 'free') as Tier;
    const tierFeatures = TIER_FEATURES[tier];
    
    // Get active add-ons
    const addons = await db.query.businessFeatures.findMany({
      where: and(
        eq(businessFeatures.business_id, businessId),
        eq(businessFeatures.enabled, true),
        eq(businessFeatures.source, 'addon')
      )
    });
    
    const addonKeys = addons.map(a => a.feature_key as FeatureKey);
    
    // Build feature map
    const features: Record<string, boolean> = {};
    for (const key of Object.values(FEATURES)) {
      features[key] = tierFeatures.includes(key) || addonKeys.includes(key);
    }
    
    return {
      tier,
      features: features as Record<FeatureKey, boolean>,
      limits: TIER_LIMITS[tier],
      addons: addonKeys
    };
  }
  
  /**
   * Enable an add-on for a business
   */
  async enableAddon(
    businessId: string,
    feature: FeatureKey,
    options: {
      source: 'addon' | 'custom' | 'trial' | 'promo';
      sourceId?: string;
      expiresAt?: Date;
    }
  ): Promise<void> {
    await db.insert(businessFeatures)
      .values({
        id: generateId('bf'),
        business_id: businessId,
        feature_key: feature,
        enabled: true,
        source: options.source,
        source_id: options.sourceId,
        expires_at: options.expiresAt
      })
      .onConflictDoUpdate({
        target: [businessFeatures.business_id, businessFeatures.feature_key],
        set: {
          enabled: true,
          source: options.source,
          source_id: options.sourceId,
          expires_at: options.expiresAt
        }
      });
  }
}

export const featureService = new FeatureService();
```

---

## Usage in Code

### API Route Protection

```typescript
// backend/middleware/require-feature.ts

import { featureService } from '../lib/features';
import { FEATURES, FeatureKey } from '../lib/features/registry';

export function requireFeature(feature: FeatureKey) {
  return async (c: Context, next: Next) => {
    const businessId = c.get('businessId');
    
    const hasAccess = await featureService.hasFeature(businessId, feature);
    
    if (!hasAccess) {
      return c.json({
        error: 'Feature not available',
        code: 'FEATURE_NOT_AVAILABLE',
        feature,
        upgrade_url: `/settings/billing?upgrade=${feature}`
      }, 403);
    }
    
    await next();
  };
}

// Usage in routes
app.post('/api/journeys', 
  requireAuth,
  requireFeature(FEATURES.PRO_JOURNEYS),  // <-- Gate the feature
  createJourneyHandler
);

app.post('/api/ai/suggest',
  requireAuth,
  requireFeature(FEATURES.ADDON_AI_ASSISTANT),  // <-- Requires add-on
  aiSuggestHandler
);
```

### UI Feature Checks

```typescript
// frontend/lib/features.ts

import { useQuery } from '@tanstack/react-query';
import { FEATURES, FeatureKey } from '@/shared/features/registry';

export function useFeatures() {
  return useQuery({
    queryKey: ['features'],
    queryFn: () => api.get('/api/features')
  });
}

export function useHasFeature(feature: FeatureKey): boolean {
  const { data } = useFeatures();
  return data?.features[feature] ?? false;
}

// Usage in components
function JourneysPage() {
  const hasJourneys = useHasFeature(FEATURES.PRO_JOURNEYS);
  
  if (!hasJourneys) {
    return <UpgradePrompt feature="journeys" />;
  }
  
  return <JourneysList />;
}
```

### Conditional UI Elements

```tsx
// frontend/components/FeatureGate.tsx

interface FeatureGateProps {
  feature: FeatureKey;
  children: React.ReactNode;
  fallback?: React.ReactNode;  // Show upgrade prompt
  hide?: boolean;              // Just hide if no access
}

export function FeatureGate({ feature, children, fallback, hide }: FeatureGateProps) {
  const hasFeature = useHasFeature(feature);
  
  if (hasFeature) {
    return <>{children}</>;
  }
  
  if (hide) {
    return null;
  }
  
  return fallback ?? <UpgradePrompt feature={feature} />;
}

// Usage
<FeatureGate feature={FEATURES.ADDON_AI_ASSISTANT}>
  <AIAssistantWidget />
</FeatureGate>

<FeatureGate feature={FEATURES.PRO_ANALYTICS} hide>
  <AnalyticsLink />  {/* Just hidden for free tier */}
</FeatureGate>
```

---

## Upgrade Prompts

```tsx
// frontend/components/UpgradePrompt.tsx

const FEATURE_INFO: Record<FeatureKey, {
  name: string;
  description: string;
  tier: 'pro' | 'enterprise' | 'addon';
  price?: string;
}> = {
  [FEATURES.PRO_JOURNEYS]: {
    name: 'Customer Journeys',
    description: 'Create multi-step treasure hunts that guide customers to rewards',
    tier: 'pro',
  },
  [FEATURES.ADDON_AI_ASSISTANT]: {
    name: 'AI Marketing Assistant',
    description: 'Get AI-powered suggestions for campaigns, rewards, and promotions',
    tier: 'addon',
    price: '$29/mo',
  },
  // ... etc
};

export function UpgradePrompt({ feature }: { feature: FeatureKey }) {
  const info = FEATURE_INFO[feature];
  
  return (
    <Card className="border-dashed">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-5 w-5" />
          {info.name}
        </CardTitle>
        <CardDescription>{info.description}</CardDescription>
      </CardHeader>
      <CardFooter>
        {info.tier === 'addon' ? (
          <Button>Add for {info.price}</Button>
        ) : (
          <Button>Upgrade to {info.tier}</Button>
        )}
      </CardFooter>
    </Card>
  );
}
```

---

## Limit Enforcement

```typescript
// Example: Enforce location limit when adding new location

async function createLocation(businessId: string, data: LocationData) {
  // Check limit
  const currentCount = await db.query.locations.count({
    where: eq(locations.business_id, businessId)
  });
  
  const limitCheck = await featureService.checkLimit(
    businessId, 
    'maxLocations', 
    currentCount
  );
  
  if (!limitCheck.allowed) {
    throw new FeatureLimitError({
      code: 'LOCATION_LIMIT_REACHED',
      limit: limitCheck.limit,
      current: currentCount,
      message: `Your plan allows ${limitCheck.limit} locations. Upgrade to add more.`
    });
  }
  
  // Proceed with creation
  return db.insert(locations).values({ ... });
}
```

---

## Trial & Promo Support

```typescript
// Grant 14-day trial of AI Assistant
await featureService.enableAddon(businessId, FEATURES.ADDON_AI_ASSISTANT, {
  source: 'trial',
  expiresAt: addDays(new Date(), 14)
});

// Grant feature via promo code
await featureService.enableAddon(businessId, FEATURES.PRO_JOURNEYS, {
  source: 'promo',
  sourceId: 'SUMMER2025',
  expiresAt: new Date('2025-09-01')
});
```

---

## Admin Overrides

For enterprise deals or special cases:

```typescript
// Grant unlimited everything to enterprise client
await db.update(businesses)
  .set({ subscription_tier: 'enterprise' })
  .where(eq(businesses.id, businessId));

// Or grant specific feature permanently
await featureService.enableAddon(businessId, FEATURES.ADDON_WHITE_LABEL, {
  source: 'custom',
  sourceId: 'enterprise-deal-001',
  expiresAt: null  // Never expires
});
```

---

## Stripe Integration

```typescript
// Handle subscription changes from Stripe webhooks

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const businessId = subscription.metadata.business_id;
  const priceId = subscription.items.data[0].price.id;
  
  // Map Stripe price to tier
  const tier = STRIPE_PRICE_TO_TIER[priceId];
  
  await db.update(businesses)
    .set({
      subscription_tier: tier,
      subscription_status: subscription.status,
      stripe_subscription_id: subscription.id,
      subscription_ends_at: new Date(subscription.current_period_end * 1000)
    })
    .where(eq(businesses.id, businessId));
  
  // Handle add-ons in subscription
  for (const item of subscription.items.data) {
    const addonFeature = STRIPE_PRICE_TO_ADDON[item.price.id];
    if (addonFeature) {
      await featureService.enableAddon(businessId, addonFeature, {
        source: 'addon',
        sourceId: subscription.id
      });
    }
  }
}
```

---

## Feature Flag Best Practices

### DO:
- ✅ Check features at API level (security)
- ✅ Check features at UI level (UX - show upgrade prompts)
- ✅ Use typed feature keys (no magic strings)
- ✅ Make limits configurable (can change tiers later)
- ✅ Track usage for metered features
- ✅ Cache feature checks (Redis or in-memory)

### DON'T:
- ❌ Hard-code tier checks (`if (tier === 'pro')`)
- ❌ Skip API-level checks (security risk)
- ❌ Forget to handle expired add-ons
- ❌ Block read access when subscription lapses (grace period)

---

## Implementation Checklist

When adding a new feature:

1. [ ] Add feature key to `FEATURES` registry
2. [ ] Assign to appropriate tier in `TIER_FEATURES`
3. [ ] Add API middleware `requireFeature(FEATURES.XXX)`
4. [ ] Add UI gate `<FeatureGate feature={FEATURES.XXX}>`
5. [ ] Add upgrade prompt info to `FEATURE_INFO`
6. [ ] If usage-based, add tracking calls
7. [ ] If has limits, add limit checks
8. [ ] Update pricing page
9. [ ] Add to Stripe products if add-on

---

*See also: [Billing spec](roadmap/billing.md) for Stripe integration details*
