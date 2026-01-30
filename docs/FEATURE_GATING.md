# Feature Gating & Subscription Architecture

> **Purpose:** Define how features are gated by subscription tier and add-ons.  
> **Audience:** Claude Code (implementation), Product (planning)  
> **Status:** Reference architecture — implement from day one

---

## Overview

Every feature in Lootly should be gatable. This allows us to:

1. **Monetize** — Gate premium features behind paid tiers
2. **Experiment** — Roll out features gradually
3. **Customize** — Enable specific features per business
4. **Upsell** — Show locked features to encourage upgrades

## Subscription Tiers

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  FREE              │  PRO ($X/mo)        │  ENTERPRISE (custom)            │
│  Get Started       │  Growing Business   │  Multi-Location Chains          │
├────────────────────┼─────────────────────┼─────────────────────────────────┤
│ • 1 location       │ • Up to 5 locations │ • Unlimited locations           │
│ • 500 customers    │ • Unlimited customers│ • Unlimited customers          │
│ • Basic rewards    │ • All reward types  │ • All reward types              │
│ • Basic rules      │ • Advanced rules    │ • Advanced rules                │
│ • QR check-in      │ • Time-bound promos │ • Time-bound promos             │
│                    │ • Marketing messages│ • Marketing messages            │
│                    │ • Basic analytics   │ • Advanced analytics            │
│                    │ • User journeys     │ • User journeys                 │
│                    │                     │ • AI marketing assistant        │
│                    │                     │ • API access                    │
│                    │                     │ • White-label                   │
│                    │                     │ • Priority support              │
└────────────────────┴─────────────────────┴─────────────────────────────────┘
```

### Tier Definitions

```typescript
// Defined in code, not database (tiers rarely change)
export const SUBSCRIPTION_TIERS = {
  free: {
    name: 'Free',
    price: 0,
    limits: {
      locations: 1,
      customers: 500,
      staff: 3,
      messages_per_month: 0,
      rules: 5,
    },
    features: [
      'basic_rewards',
      'basic_rules',
      'qr_checkin',
      'staff_tablet',
      'customer_app',
    ],
  },
  pro: {
    name: 'Pro',
    price: 49, // $49/month example
    limits: {
      locations: 5,
      customers: -1, // unlimited
      staff: -1,
      messages_per_month: 1000,
      rules: -1,
    },
    features: [
      // All free features plus:
      'advanced_rules',
      'time_bound_promos',
      'marketing_messages',
      'user_journeys',
      'basic_analytics',
      'push_notifications',
      'expiring_rewards',
      'day_of_week_rules',
    ],
  },
  enterprise: {
    name: 'Enterprise',
    price: -1, // custom pricing
    limits: {
      locations: -1,
      customers: -1,
      staff: -1,
      messages_per_month: -1,
      rules: -1,
    },
    features: [
      // All pro features plus:
      'advanced_analytics',
      'ai_marketing_assistant',
      'api_access',
      'white_label',
      'custom_integrations',
      'sso',
      'priority_support',
    ],
  },
} as const;
```

## Feature Registry

Every feature has a unique identifier and metadata:

```typescript
// features/registry.ts
export const FEATURES = {
  // Core (always available)
  basic_rewards: {
    id: 'basic_rewards',
    name: 'Basic Rewards',
    description: 'Points-based rewards redemption',
    category: 'rewards',
    tier: 'free',
    addOn: false,
  },
  
  // Pro features
  time_bound_promos: {
    id: 'time_bound_promos',
    name: 'Time-Bound Promotions',
    description: 'Limited-time promotional rules',
    category: 'rules',
    tier: 'pro',
    addOn: true, // Can also be purchased as add-on
    addOnPrice: 15, // $15/month if purchased separately
  },
  
  user_journeys: {
    id: 'user_journeys',
    name: 'User Journeys',
    description: 'Multi-step reward quests',
    category: 'engagement',
    tier: 'pro',
    addOn: true,
    addOnPrice: 20,
  },
  
  marketing_messages: {
    id: 'marketing_messages',
    name: 'Marketing Messages',
    description: 'Send promotional messages to customers',
    category: 'marketing',
    tier: 'pro',
    addOn: true,
    addOnPrice: 25,
  },
  
  basic_analytics: {
    id: 'basic_analytics',
    name: 'Basic Analytics',
    description: 'Dashboard with key metrics',
    category: 'analytics',
    tier: 'pro',
    addOn: false,
  },
  
  // Enterprise features
  advanced_analytics: {
    id: 'advanced_analytics',
    name: 'Advanced Analytics',
    description: 'Deep insights, cohorts, predictions',
    category: 'analytics',
    tier: 'enterprise',
    addOn: true,
    addOnPrice: 50,
  },
  
  ai_marketing_assistant: {
    id: 'ai_marketing_assistant',
    name: 'AI Marketing Assistant',
    description: 'AI-powered campaign recommendations',
    category: 'ai',
    tier: 'enterprise',
    addOn: true,
    addOnPrice: 75,
  },
  
  api_access: {
    id: 'api_access',
    name: 'API Access',
    description: 'Public API for integrations',
    category: 'integrations',
    tier: 'enterprise',
    addOn: true,
    addOnPrice: 100,
  },
} as const;

export type FeatureId = keyof typeof FEATURES;
```

## Database Schema

### Business Subscription State

```sql
-- In businesses table (already exists)
ALTER TABLE businesses ADD COLUMN subscription_tier TEXT DEFAULT 'free';
ALTER TABLE businesses ADD COLUMN subscription_status TEXT DEFAULT 'active';

-- Add-ons purchased by business
CREATE TABLE business_addons (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  feature_id TEXT NOT NULL,  -- matches FEATURES registry key
  status TEXT DEFAULT 'active',  -- 'active', 'cancelled', 'expired'
  purchased_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,  -- NULL = never expires
  stripe_subscription_id TEXT,  -- for billing
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_addons_business ON business_addons(business_id);
CREATE UNIQUE INDEX idx_addons_unique ON business_addons(business_id, feature_id) 
  WHERE status = 'active';

-- Feature overrides (for custom deals, trials, etc.)
CREATE TABLE business_feature_overrides (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  feature_id TEXT NOT NULL,
  enabled BOOLEAN NOT NULL,  -- true = force enable, false = force disable
  reason TEXT,  -- "Trial", "Custom deal", "Beta tester"
  expires_at TIMESTAMPTZ,
  created_by TEXT,  -- admin who set this
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_overrides_business ON business_feature_overrides(business_id);
```

## Feature Access Logic

### Core Function

```typescript
// features/access.ts
import { SUBSCRIPTION_TIERS, FEATURES, FeatureId } from './registry';

interface BusinessFeatureContext {
  tier: keyof typeof SUBSCRIPTION_TIERS;
  addons: string[];  // active addon feature_ids
  overrides: Map<string, { enabled: boolean; expires_at: Date | null }>;
}

export function hasFeature(
  featureId: FeatureId,
  context: BusinessFeatureContext
): boolean {
  // 1. Check overrides first (highest priority)
  const override = context.overrides.get(featureId);
  if (override) {
    // Check if override has expired
    if (override.expires_at && override.expires_at < new Date()) {
      // Override expired, fall through to normal logic
    } else {
      return override.enabled;
    }
  }
  
  // 2. Check if feature is in their tier
  const tierFeatures = SUBSCRIPTION_TIERS[context.tier].features;
  if (tierFeatures.includes(featureId)) {
    return true;
  }
  
  // 3. Check if they have the add-on
  if (context.addons.includes(featureId)) {
    return true;
  }
  
  // 4. Check if lower tier includes it (tier inheritance)
  const tierOrder = ['free', 'pro', 'enterprise'];
  const currentTierIndex = tierOrder.indexOf(context.tier);
  for (let i = 0; i < currentTierIndex; i++) {
    const lowerTier = tierOrder[i] as keyof typeof SUBSCRIPTION_TIERS;
    if (SUBSCRIPTION_TIERS[lowerTier].features.includes(featureId)) {
      return true;
    }
  }
  
  return false;
}

export function getLimit(
  limitKey: string,
  context: BusinessFeatureContext
): number {
  return SUBSCRIPTION_TIERS[context.tier].limits[limitKey] ?? 0;
}
```

### Loading Business Context

```typescript
// features/loader.ts
export async function loadBusinessFeatures(
  db: Database,
  businessId: string
): Promise<BusinessFeatureContext> {
  // Get business tier
  const business = await db.query.businesses.findFirst({
    where: eq(businesses.id, businessId),
    columns: { subscription_tier: true },
  });
  
  // Get active add-ons
  const addons = await db.query.business_addons.findMany({
    where: and(
      eq(business_addons.business_id, businessId),
      eq(business_addons.status, 'active')
    ),
    columns: { feature_id: true },
  });
  
  // Get overrides
  const overrides = await db.query.business_feature_overrides.findMany({
    where: eq(business_feature_overrides.business_id, businessId),
  });
  
  return {
    tier: business?.subscription_tier ?? 'free',
    addons: addons.map(a => a.feature_id),
    overrides: new Map(
      overrides.map(o => [o.feature_id, { 
        enabled: o.enabled, 
        expires_at: o.expires_at 
      }])
    ),
  };
}
```

## Usage in Code

### Backend: API Route Protection

```typescript
// middleware/featureGate.ts
export function requireFeature(featureId: FeatureId) {
  return async (c: Context, next: Next) => {
    const businessId = c.get('businessId');
    const features = await loadBusinessFeatures(db, businessId);
    
    if (!hasFeature(featureId, features)) {
      return c.json({
        error: 'feature_not_available',
        feature: featureId,
        message: `This feature requires ${FEATURES[featureId].tier} plan`,
        upgrade_url: `/upgrade?feature=${featureId}`,
      }, 403);
    }
    
    await next();
  };
}

// Usage in routes
app.post('/api/journeys', 
  requireFeature('user_journeys'),
  async (c) => {
    // Only runs if business has user_journeys feature
  }
);

app.post('/api/messages/send',
  requireFeature('marketing_messages'),
  async (c) => {
    // Only runs if business has marketing_messages
  }
);
```

### Backend: Checking Limits

```typescript
// Example: checking location limit
async function createLocation(businessId: string, data: LocationData) {
  const features = await loadBusinessFeatures(db, businessId);
  const limit = getLimit('locations', features);
  
  if (limit !== -1) { // -1 means unlimited
    const currentCount = await db.query.locations.count({
      where: eq(locations.business_id, businessId)
    });
    
    if (currentCount >= limit) {
      throw new FeatureLimitError('locations', limit);
    }
  }
  
  // Proceed with creation
}
```

### Frontend: Conditional UI

```typescript
// hooks/useFeature.ts
export function useFeature(featureId: FeatureId) {
  const { business } = useAuth();
  const [features, setFeatures] = useState<BusinessFeatureContext | null>(null);
  
  useEffect(() => {
    // Load from API or cached context
    loadFeatures(business.id).then(setFeatures);
  }, [business.id]);
  
  return {
    hasFeature: features ? hasFeature(featureId, features) : false,
    isLoading: !features,
    featureInfo: FEATURES[featureId],
  };
}

// Usage in component
function Dashboard() {
  const { hasFeature: hasAnalytics } = useFeature('basic_analytics');
  const { hasFeature: hasAI } = useFeature('ai_marketing_assistant');
  
  return (
    <div>
      {hasAnalytics ? (
        <AnalyticsDashboard />
      ) : (
        <UpgradePrompt feature="basic_analytics" />
      )}
      
      {hasAI ? (
        <AIAssistant />
      ) : (
        <LockedFeature feature="ai_marketing_assistant" />
      )}
    </div>
  );
}
```

### Frontend: Locked Feature Component

```typescript
// components/LockedFeature.tsx
function LockedFeature({ feature }: { feature: FeatureId }) {
  const featureInfo = FEATURES[feature];
  
  return (
    <div className="locked-feature">
      <div className="blur-overlay">
        {/* Show preview/mockup of feature */}
      </div>
      <div className="upgrade-cta">
        <Lock className="icon" />
        <h3>{featureInfo.name}</h3>
        <p>{featureInfo.description}</p>
        <p>Available on {featureInfo.tier} plan</p>
        {featureInfo.addOn && (
          <p>Or add for ${featureInfo.addOnPrice}/month</p>
        )}
        <Button href={`/upgrade?feature=${feature}`}>
          Unlock Feature
        </Button>
      </div>
    </div>
  );
}
```

## Feature Context API

Provide feature context to frontend:

```typescript
// GET /api/business/features
app.get('/api/business/features', async (c) => {
  const businessId = c.get('businessId');
  const context = await loadBusinessFeatures(db, businessId);
  
  // Build a map of all features and their status
  const featureStatus = Object.keys(FEATURES).reduce((acc, featureId) => {
    acc[featureId] = {
      ...FEATURES[featureId],
      enabled: hasFeature(featureId as FeatureId, context),
    };
    return acc;
  }, {});
  
  return c.json({
    tier: context.tier,
    features: featureStatus,
    limits: SUBSCRIPTION_TIERS[context.tier].limits,
    addons: context.addons,
  });
});
```

## Admin: Feature Overrides

For internal use (trials, custom deals, beta testers):

```typescript
// Admin endpoint to grant feature access
app.post('/admin/business/:id/features/:featureId/override', async (c) => {
  const { id: businessId, featureId } = c.req.param();
  const { enabled, reason, expires_at } = await c.req.json();
  
  await db.insert(business_feature_overrides).values({
    id: generateId('override'),
    business_id: businessId,
    feature_id: featureId,
    enabled,
    reason,
    expires_at,
    created_by: c.get('adminId'),
  });
  
  return c.json({ success: true });
});

// Example uses:
// - Give 30-day trial of AI assistant
// - Disable a feature for a problem customer
// - Enable beta feature for testers
// - Custom enterprise deal with specific features
```

## Billing Integration

When integrating with Stripe:

```typescript
// On subscription change
async function handleSubscriptionUpdate(stripeEvent: Stripe.Event) {
  const subscription = stripeEvent.data.object as Stripe.Subscription;
  const businessId = subscription.metadata.business_id;
  
  // Map Stripe price to our tier
  const tier = STRIPE_PRICE_TO_TIER[subscription.items.data[0].price.id];
  
  await db.update(businesses)
    .set({ 
      subscription_tier: tier,
      subscription_status: subscription.status,
    })
    .where(eq(businesses.id, businessId));
}

// On add-on purchase
async function handleAddOnPurchase(stripeEvent: Stripe.Event) {
  const subscription = stripeEvent.data.object as Stripe.Subscription;
  const businessId = subscription.metadata.business_id;
  const featureId = subscription.metadata.feature_id;
  
  await db.insert(business_addons).values({
    id: generateId('addon'),
    business_id: businessId,
    feature_id: featureId,
    status: 'active',
    stripe_subscription_id: subscription.id,
  });
}
```

## Testing Features

```typescript
// In tests, easily mock feature access
const mockFeatureContext: BusinessFeatureContext = {
  tier: 'pro',
  addons: ['ai_marketing_assistant'],
  overrides: new Map(),
};

// Or use helper
function withFeatures(features: FeatureId[]): BusinessFeatureContext {
  return {
    tier: 'free',
    addons: [],
    overrides: new Map(
      features.map(f => [f, { enabled: true, expires_at: null }])
    ),
  };
}

test('journey creation requires feature', async () => {
  // Without feature
  const ctx1 = withFeatures([]);
  expect(hasFeature('user_journeys', ctx1)).toBe(false);
  
  // With feature
  const ctx2 = withFeatures(['user_journeys']);
  expect(hasFeature('user_journeys', ctx2)).toBe(true);
});
```

## Implementation Checklist

- [ ] Add `subscription_tier` to businesses table
- [ ] Create `business_addons` table
- [ ] Create `business_feature_overrides` table
- [ ] Implement `features/registry.ts` with all features
- [ ] Implement `features/access.ts` with `hasFeature()` and `getLimit()`
- [ ] Create `requireFeature()` middleware
- [ ] Create `/api/business/features` endpoint
- [ ] Create `useFeature()` React hook
- [ ] Create `<LockedFeature>` component
- [ ] Add feature gates to existing routes as features ship

## Feature Tagging Convention

When building a new feature, always:

1. **Add to registry:** Add feature to `FEATURES` in `features/registry.ts`
2. **Tag the routes:** Wrap API routes with `requireFeature('feature_id')`
3. **Tag the UI:** Use `useFeature()` to conditionally render
4. **Document:** Note the tier in the feature's spec doc

```typescript
// Every new feature file should import and use:
import { requireFeature } from '@/features/access';
import { useFeature } from '@/hooks/useFeature';
```

---

## Summary

| Layer | How to Gate |
|-------|-------------|
| Database | `subscription_tier`, `business_addons`, `business_feature_overrides` |
| Backend Routes | `requireFeature('feature_id')` middleware |
| Backend Logic | `hasFeature()` and `getLimit()` functions |
| Frontend | `useFeature()` hook + `<LockedFeature>` component |
| Admin | Override endpoints for trials/custom deals |
| Billing | Stripe webhooks update tier and addons |

This architecture ensures any feature can be gated at any time with minimal code changes.

---

*See also: [Subscription Billing](docs/roadmap/billing.md)*
