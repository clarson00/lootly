# Feature Entitlements & Monetization

> **Purpose:** Architecture for feature gating, subscription tiers, and add-ons.  
> **Priority:** Build into MVP foundation — retrofitting is painful.

---

## Overview

Every feature in Lootly should be "entitlement-aware" from day one. This means:

1. Features check if the business has access before rendering/executing
2. Subscription tiers unlock sets of features
3. Add-ons can unlock individual features independently
4. Easy to change what's in each tier without code changes

---

## Core Concepts

### Feature Keys

Every gated feature has a unique key:

```typescript
// features.ts - Single source of truth for all feature keys
export const FEATURES = {
  // Core (always available)
  CORE_POINTS: 'core:points',
  CORE_REWARDS: 'core:rewards',
  CORE_CHECKIN: 'core:checkin',
  CORE_STAFF_APP: 'core:staff_app',
  CORE_CUSTOMER_APP: 'core:customer_app',
  
  // Rules Engine
  RULES_BASIC: 'rules:basic',           // Points per dollar, visit bonuses
  RULES_ADVANCED: 'rules:advanced',     // Complex conditions, AND/OR
  RULES_TIME_BOUND: 'rules:time_bound', // Limited-time promos
  RULES_PRODUCT: 'rules:product',       // Product-based bonuses
  
  // Journeys
  JOURNEYS_BASIC: 'journeys:basic',     // Single journey
  JOURNEYS_UNLIMITED: 'journeys:unlimited',
  JOURNEYS_ADVANCED: 'journeys:advanced', // Branching, complex logic
  
  // Marketing
  MARKETING_PUSH: 'marketing:push',
  MARKETING_SMS: 'marketing:sms',
  MARKETING_EMAIL: 'marketing:email',
  MARKETING_CAMPAIGNS: 'marketing:campaigns',
  
  // Analytics
  ANALYTICS_BASIC: 'analytics:basic',       // Dashboard, basic metrics
  ANALYTICS_ADVANCED: 'analytics:advanced', // Deep reports, exports
  ANALYTICS_REALTIME: 'analytics:realtime',
  
  // AI
  AI_ASSISTANT: 'ai:assistant',
  AI_INSIGHTS: 'ai:insights',
  AI_COPYWRITING: 'ai:copywriting',
  
  // Operations
  LOCATIONS_MULTI: 'locations:multi',   // More than 1 location
  LOCATIONS_UNLIMITED: 'locations:unlimited',
  STAFF_UNLIMITED: 'staff:unlimited',
  API_ACCESS: 'api:access',
  WHITE_LABEL: 'white_label',
  SSO: 'sso',
  
  // Limits (special - these have numeric values)
  LIMIT_LOCATIONS: 'limit:locations',
  LIMIT_STAFF: 'limit:staff',
  LIMIT_CUSTOMERS: 'limit:customers',
  LIMIT_MESSAGES_MONTH: 'limit:messages_month',
  LIMIT_AI_QUERIES_MONTH: 'limit:ai_queries_month',
} as const;

export type FeatureKey = typeof FEATURES[keyof typeof FEATURES];
```

### Subscription Tiers

```typescript
// tiers.ts
export const TIERS = {
  FREE: 'free',
  STARTER: 'starter',
  PRO: 'pro',
  ENTERPRISE: 'enterprise',
} as const;

export type Tier = typeof TIERS[keyof typeof TIERS];

// What each tier includes
export const TIER_FEATURES: Record<Tier, FeatureKey[]> = {
  free: [
    FEATURES.CORE_POINTS,
    FEATURES.CORE_REWARDS,
    FEATURES.CORE_CHECKIN,
    FEATURES.CORE_STAFF_APP,
    FEATURES.CORE_CUSTOMER_APP,
    FEATURES.RULES_BASIC,
    FEATURES.ANALYTICS_BASIC,
  ],
  
  starter: [
    // Everything in free, plus:
    FEATURES.RULES_ADVANCED,
    FEATURES.RULES_TIME_BOUND,
    FEATURES.MARKETING_PUSH,
    FEATURES.JOURNEYS_BASIC,
    FEATURES.LOCATIONS_MULTI,
  ],
  
  pro: [
    // Everything in starter, plus:
    FEATURES.RULES_PRODUCT,
    FEATURES.JOURNEYS_UNLIMITED,
    FEATURES.MARKETING_CAMPAIGNS,
    FEATURES.ANALYTICS_ADVANCED,
    FEATURES.AI_ASSISTANT,
    FEATURES.AI_INSIGHTS,
    FEATURES.LOCATIONS_UNLIMITED,
    FEATURES.STAFF_UNLIMITED,
  ],
  
  enterprise: [
    // Everything in pro, plus:
    FEATURES.JOURNEYS_ADVANCED,
    FEATURES.ANALYTICS_REALTIME,
    FEATURES.AI_COPYWRITING,
    FEATURES.API_ACCESS,
    FEATURES.WHITE_LABEL,
    FEATURES.SSO,
  ],
};

// Numeric limits per tier
export const TIER_LIMITS: Record<Tier, Record<string, number>> = {
  free: {
    [FEATURES.LIMIT_LOCATIONS]: 1,
    [FEATURES.LIMIT_STAFF]: 3,
    [FEATURES.LIMIT_CUSTOMERS]: 500,
    [FEATURES.LIMIT_MESSAGES_MONTH]: 0,
    [FEATURES.LIMIT_AI_QUERIES_MONTH]: 0,
  },
  starter: {
    [FEATURES.LIMIT_LOCATIONS]: 3,
    [FEATURES.LIMIT_STAFF]: 10,
    [FEATURES.LIMIT_CUSTOMERS]: 2000,
    [FEATURES.LIMIT_MESSAGES_MONTH]: 1000,
    [FEATURES.LIMIT_AI_QUERIES_MONTH]: 0,
  },
  pro: {
    [FEATURES.LIMIT_LOCATIONS]: 10,
    [FEATURES.LIMIT_STAFF]: 50,
    [FEATURES.LIMIT_CUSTOMERS]: 10000,
    [FEATURES.LIMIT_MESSAGES_MONTH]: 10000,
    [FEATURES.LIMIT_AI_QUERIES_MONTH]: 500,
  },
  enterprise: {
    [FEATURES.LIMIT_LOCATIONS]: -1,  // -1 = unlimited
    [FEATURES.LIMIT_STAFF]: -1,
    [FEATURES.LIMIT_CUSTOMERS]: -1,
    [FEATURES.LIMIT_MESSAGES_MONTH]: -1,
    [FEATURES.LIMIT_AI_QUERIES_MONTH]: -1,
  },
};
```

### Add-ons

Features that can be purchased separately:

```typescript
// addons.ts
export const ADDONS = {
  AI_PACK: {
    id: 'addon_ai',
    name: 'AI Marketing Assistant',
    features: [
      FEATURES.AI_ASSISTANT,
      FEATURES.AI_INSIGHTS,
      FEATURES.AI_COPYWRITING,
    ],
    limits: {
      [FEATURES.LIMIT_AI_QUERIES_MONTH]: 1000,
    },
    price_monthly: 2900, // $29/month in cents
  },
  
  SMS_PACK: {
    id: 'addon_sms',
    name: 'SMS Marketing',
    features: [
      FEATURES.MARKETING_SMS,
    ],
    limits: {
      [FEATURES.LIMIT_MESSAGES_MONTH]: 5000, // adds to existing
    },
    price_monthly: 1900,
  },
  
  ANALYTICS_PACK: {
    id: 'addon_analytics',
    name: 'Advanced Analytics',
    features: [
      FEATURES.ANALYTICS_ADVANCED,
      FEATURES.ANALYTICS_REALTIME,
    ],
    price_monthly: 1900,
  },
  
  API_ACCESS: {
    id: 'addon_api',
    name: 'API Access',
    features: [
      FEATURES.API_ACCESS,
    ],
    price_monthly: 4900,
  },
} as const;
```

---

## Database Schema

```sql
-- Subscription status for each business
CREATE TABLE subscriptions (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL UNIQUE REFERENCES businesses(id),
  
  -- Current plan
  tier TEXT NOT NULL DEFAULT 'free',  -- 'free', 'starter', 'pro', 'enterprise'
  status TEXT NOT NULL DEFAULT 'active',  -- 'active', 'past_due', 'cancelled', 'trialing'
  
  -- Billing
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  
  -- Trial
  trial_ends_at TIMESTAMPTZ,
  
  -- Billing cycle
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  
  -- Cancellation
  cancel_at_period_end BOOLEAN DEFAULT false,
  cancelled_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- Active add-ons for each business
CREATE TABLE subscription_addons (
  id TEXT PRIMARY KEY,
  subscription_id TEXT NOT NULL REFERENCES subscriptions(id),
  addon_id TEXT NOT NULL,  -- 'addon_ai', 'addon_sms', etc.
  
  status TEXT NOT NULL DEFAULT 'active',
  stripe_subscription_item_id TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  cancelled_at TIMESTAMPTZ,
  
  UNIQUE(subscription_id, addon_id)
);

-- Feature overrides (for special deals, grandfathering, etc.)
CREATE TABLE feature_overrides (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  feature_key TEXT NOT NULL,
  
  -- Override type
  granted BOOLEAN DEFAULT true,  -- true = enable, false = disable
  limit_value INTEGER,  -- for limit features, overrides tier limit
  
  -- Why this override exists
  reason TEXT,  -- 'beta_tester', 'special_deal', 'grandfathered', etc.
  granted_by TEXT,  -- admin user who granted it
  
  -- Expiration (NULL = permanent)
  expires_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(business_id, feature_key)
);

-- Usage tracking for metered features
CREATE TABLE feature_usage (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  feature_key TEXT NOT NULL,
  
  -- Period (monthly reset)
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  -- Usage count
  usage_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ,
  
  UNIQUE(business_id, feature_key, period_start)
);
```

---

## Entitlements Service

```typescript
// services/entitlements.ts

import { db } from '../db';
import { TIER_FEATURES, TIER_LIMITS, ADDONS } from '../config/tiers';

export class EntitlementsService {
  
  /**
   * Check if a business has access to a feature
   */
  async hasFeature(businessId: string, feature: FeatureKey): Promise<boolean> {
    // 1. Check for override (highest priority)
    const override = await this.getOverride(businessId, feature);
    if (override !== null) {
      return override.granted && !this.isExpired(override);
    }
    
    // 2. Get subscription
    const subscription = await this.getSubscription(businessId);
    if (!subscription || subscription.status !== 'active') {
      // Fall back to free tier
      return TIER_FEATURES.free.includes(feature);
    }
    
    // 3. Check tier features
    if (TIER_FEATURES[subscription.tier]?.includes(feature)) {
      return true;
    }
    
    // 4. Check add-ons
    const addons = await this.getActiveAddons(subscription.id);
    for (const addon of addons) {
      const addonConfig = Object.values(ADDONS).find(a => a.id === addon.addon_id);
      if (addonConfig?.features.includes(feature)) {
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * Get the limit for a metered feature
   */
  async getLimit(businessId: string, limitKey: FeatureKey): Promise<number> {
    // 1. Check for override
    const override = await this.getOverride(businessId, limitKey);
    if (override?.limit_value !== null && !this.isExpired(override)) {
      return override.limit_value;
    }
    
    // 2. Get base limit from tier
    const subscription = await this.getSubscription(businessId);
    const tier = subscription?.tier || 'free';
    let limit = TIER_LIMITS[tier][limitKey] || 0;
    
    // 3. Add limits from add-ons
    if (subscription) {
      const addons = await this.getActiveAddons(subscription.id);
      for (const addon of addons) {
        const addonConfig = Object.values(ADDONS).find(a => a.id === addon.addon_id);
        if (addonConfig?.limits?.[limitKey]) {
          limit += addonConfig.limits[limitKey];
        }
      }
    }
    
    return limit;
  }
  
  /**
   * Check if usage is within limit
   */
  async checkUsageLimit(
    businessId: string, 
    limitKey: FeatureKey
  ): Promise<{ allowed: boolean; used: number; limit: number }> {
    const limit = await this.getLimit(businessId, limitKey);
    
    // -1 means unlimited
    if (limit === -1) {
      return { allowed: true, used: 0, limit: -1 };
    }
    
    const used = await this.getCurrentUsage(businessId, limitKey);
    
    return {
      allowed: used < limit,
      used,
      limit,
    };
  }
  
  /**
   * Increment usage counter
   */
  async incrementUsage(businessId: string, limitKey: FeatureKey): Promise<void> {
    const period = this.getCurrentPeriod();
    
    await db.query(`
      INSERT INTO feature_usage (id, business_id, feature_key, period_start, period_end, usage_count)
      VALUES ($1, $2, $3, $4, $5, 1)
      ON CONFLICT (business_id, feature_key, period_start)
      DO UPDATE SET usage_count = feature_usage.usage_count + 1, updated_at = NOW()
    `, [generateId(), businessId, limitKey, period.start, period.end]);
  }
  
  /**
   * Get all features for a business (for UI rendering)
   */
  async getAllEntitlements(businessId: string): Promise<{
    tier: Tier;
    features: Record<FeatureKey, boolean>;
    limits: Record<string, { limit: number; used: number }>;
    addons: string[];
  }> {
    const subscription = await this.getSubscription(businessId);
    const tier = subscription?.tier || 'free';
    
    // Build feature map
    const features: Record<string, boolean> = {};
    for (const key of Object.values(FEATURES)) {
      if (!key.startsWith('limit:')) {
        features[key] = await this.hasFeature(businessId, key);
      }
    }
    
    // Build limits map
    const limits: Record<string, { limit: number; used: number }> = {};
    for (const key of Object.values(FEATURES)) {
      if (key.startsWith('limit:')) {
        const limit = await this.getLimit(businessId, key);
        const used = await this.getCurrentUsage(businessId, key);
        limits[key] = { limit, used };
      }
    }
    
    // Get active addons
    const addonRecords = subscription 
      ? await this.getActiveAddons(subscription.id)
      : [];
    const addons = addonRecords.map(a => a.addon_id);
    
    return { tier, features, limits, addons };
  }
}

export const entitlements = new EntitlementsService();
```

---

## Usage in Code

### Backend: Route Protection

```typescript
// middleware/requireFeature.ts
import { entitlements } from '../services/entitlements';

export function requireFeature(feature: FeatureKey) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const businessId = req.business.id;
    
    const hasAccess = await entitlements.hasFeature(businessId, feature);
    
    if (!hasAccess) {
      return res.status(403).json({
        error: 'feature_not_available',
        feature,
        message: 'Upgrade your plan to access this feature',
        upgrade_url: `/settings/billing?feature=${feature}`,
      });
    }
    
    next();
  };
}

// Usage in routes
router.post('/api/ai/suggest', 
  requireFeature(FEATURES.AI_ASSISTANT),
  aiController.suggest
);

router.post('/api/campaigns',
  requireFeature(FEATURES.MARKETING_CAMPAIGNS),
  campaignController.create
);
```

### Backend: Usage Limits

```typescript
// middleware/checkUsageLimit.ts
export function checkUsageLimit(limitKey: FeatureKey) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const businessId = req.business.id;
    
    const { allowed, used, limit } = await entitlements.checkUsageLimit(
      businessId, 
      limitKey
    );
    
    if (!allowed) {
      return res.status(429).json({
        error: 'limit_exceeded',
        feature: limitKey,
        used,
        limit,
        message: `You've reached your monthly limit (${used}/${limit})`,
        upgrade_url: `/settings/billing?limit=${limitKey}`,
      });
    }
    
    // Increment after successful request (call in controller)
    req.incrementUsage = () => entitlements.incrementUsage(businessId, limitKey);
    
    next();
  };
}

// Usage
router.post('/api/ai/query',
  requireFeature(FEATURES.AI_ASSISTANT),
  checkUsageLimit(FEATURES.LIMIT_AI_QUERIES_MONTH),
  async (req, res) => {
    const result = await ai.query(req.body);
    await req.incrementUsage(); // Only count if successful
    res.json(result);
  }
);
```

### Frontend: Conditional Rendering

```tsx
// hooks/useEntitlements.ts
import { useQuery } from '@tanstack/react-query';

export function useEntitlements() {
  const { data } = useQuery({
    queryKey: ['entitlements'],
    queryFn: () => api.get('/api/entitlements'),
  });
  
  return {
    tier: data?.tier || 'free',
    hasFeature: (feature: FeatureKey) => data?.features[feature] || false,
    getLimit: (limit: string) => data?.limits[limit] || { limit: 0, used: 0 },
    addons: data?.addons || [],
  };
}

// components/FeatureGate.tsx
export function FeatureGate({ 
  feature, 
  children, 
  fallback 
}: { 
  feature: FeatureKey;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const { hasFeature } = useEntitlements();
  
  if (hasFeature(feature)) {
    return <>{children}</>;
  }
  
  return fallback || <UpgradePrompt feature={feature} />;
}

// Usage in components
function Dashboard() {
  return (
    <div>
      <BasicMetrics />
      
      <FeatureGate feature={FEATURES.ANALYTICS_ADVANCED}>
        <AdvancedAnalytics />
      </FeatureGate>
      
      <FeatureGate feature={FEATURES.AI_INSIGHTS}>
        <AIInsightsPanel />
      </FeatureGate>
    </div>
  );
}
```

### Frontend: Upgrade Prompts

```tsx
// components/UpgradePrompt.tsx
const FEATURE_INFO: Record<FeatureKey, { name: string; description: string; tier: Tier }> = {
  [FEATURES.AI_ASSISTANT]: {
    name: 'AI Marketing Assistant',
    description: 'Get AI-powered suggestions for campaigns and rewards',
    tier: 'pro',
  },
  [FEATURES.ANALYTICS_ADVANCED]: {
    name: 'Advanced Analytics',
    description: 'Deep insights into your loyalty program performance',
    tier: 'pro',
  },
  // ... etc
};

export function UpgradePrompt({ feature }: { feature: FeatureKey }) {
  const info = FEATURE_INFO[feature];
  
  return (
    <div className="upgrade-prompt">
      <Lock className="icon" />
      <h3>{info.name}</h3>
      <p>{info.description}</p>
      <p>Available on {info.tier} plan and above</p>
      <Button href={`/settings/billing?feature=${feature}`}>
        Upgrade to Unlock
      </Button>
    </div>
  );
}
```

---

## Pricing Page Data

```typescript
// config/pricing.ts
export const PRICING = {
  free: {
    name: 'Free',
    price: 0,
    description: 'Get started with basic loyalty',
    highlights: [
      '1 location',
      'Up to 500 customers',
      'Basic points & rewards',
      'QR check-in',
    ],
  },
  starter: {
    name: 'Starter',
    price: 2900, // $29/month
    description: 'For growing businesses',
    highlights: [
      'Up to 3 locations',
      'Up to 2,000 customers',
      'Advanced rules',
      'Push notifications',
      '1 customer journey',
    ],
  },
  pro: {
    name: 'Pro',
    price: 7900, // $79/month
    description: 'Full-featured loyalty platform',
    popular: true,
    highlights: [
      'Up to 10 locations',
      'Up to 10,000 customers',
      'Unlimited journeys',
      'AI marketing assistant',
      'Advanced analytics',
      'Priority support',
    ],
  },
  enterprise: {
    name: 'Enterprise',
    price: null, // Contact us
    description: 'For large organizations',
    highlights: [
      'Unlimited everything',
      'White-label apps',
      'API access',
      'SSO integration',
      'Dedicated support',
      'Custom features',
    ],
  },
};
```

---

## Feature Tagging in Specs

When writing feature specs, include entitlement info:

```markdown
# AI Marketing Assistant

> **Status:** 💡 Idea  
> **Entitlement:** `ai:assistant`, `ai:insights`, `ai:copywriting`  
> **Available:** Pro tier, or AI Add-on  
> **Metered:** `limit:ai_queries_month` (500/mo Pro, 1000/mo with add-on)  
```

---

## Implementation Checklist

### MVP (Do Now)
- [ ] Create `features.ts` with all feature keys
- [ ] Create `tiers.ts` with tier definitions (can be mostly empty)
- [ ] Create `subscriptions` table (even if everyone is "free")
- [ ] Create `EntitlementsService` with basic `hasFeature()`
- [ ] Create `requireFeature()` middleware
- [ ] Create `<FeatureGate>` component

### Post-MVP
- [ ] Stripe integration for billing
- [ ] Add-ons support
- [ ] Usage tracking and limits
- [ ] Feature overrides for special deals
- [ ] Upgrade prompts and flows
- [ ] Admin tools for managing subscriptions

---

## Benefits of This Approach

1. **Single source of truth** — All features defined in one place
2. **Easy tier changes** — Move features between tiers without code changes
3. **Flexible overrides** — Give specific businesses access to specific features
4. **Add-on ready** — Sell individual features separately
5. **Usage tracking** — Metered billing ready
6. **Good UX** — Graceful upgrade prompts, not hard blocks
7. **Future-proof** — Can add new tiers, features, bundles easily

---

*This document should be referenced when building any new feature.*
