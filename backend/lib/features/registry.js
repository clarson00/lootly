/**
 * Feature Registry - Single source of truth for all feature keys
 *
 * Every gated feature has a unique key. Features are grouped by category.
 * See docs/ENTITLEMENTS.md for full documentation.
 */

const FEATURES = {
  // Core (always available on all tiers)
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
  RULESETS: 'rules:rulesets',           // Multi-step voyages/quests

  // Journeys (Treasure Maps)
  JOURNEYS_BASIC: 'journeys:basic',       // Single journey
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
  LOCATIONS_MULTI: 'locations:multi',     // More than 1 location
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
};

/**
 * Subscription Tiers
 */
const TIERS = {
  FREE: 'free',
  STARTER: 'starter',
  PRO: 'pro',
  ENTERPRISE: 'enterprise',
};

/**
 * Features included in each tier
 * Higher tiers include all features from lower tiers
 */
const TIER_FEATURES = {
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
    FEATURES.RULESETS,
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
    FEATURES.MARKETING_SMS,
    FEATURES.MARKETING_EMAIL,
    FEATURES.API_ACCESS,
    FEATURES.WHITE_LABEL,
    FEATURES.SSO,
  ],
};

/**
 * Numeric limits per tier
 * -1 means unlimited
 */
const TIER_LIMITS = {
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
    [FEATURES.LIMIT_LOCATIONS]: -1,
    [FEATURES.LIMIT_STAFF]: -1,
    [FEATURES.LIMIT_CUSTOMERS]: -1,
    [FEATURES.LIMIT_MESSAGES_MONTH]: -1,
    [FEATURES.LIMIT_AI_QUERIES_MONTH]: -1,
  },
};

/**
 * Get all features available for a tier (including inherited from lower tiers)
 */
function getFeaturesForTier(tier) {
  const tierOrder = ['free', 'starter', 'pro', 'enterprise'];
  const tierIndex = tierOrder.indexOf(tier);

  if (tierIndex === -1) {
    return TIER_FEATURES.free;
  }

  // Accumulate features from all tiers up to and including this one
  const features = new Set();
  for (let i = 0; i <= tierIndex; i++) {
    const tierFeatures = TIER_FEATURES[tierOrder[i]] || [];
    tierFeatures.forEach(f => features.add(f));
  }

  return Array.from(features);
}

/**
 * Get limits for a tier
 */
function getLimitsForTier(tier) {
  return TIER_LIMITS[tier] || TIER_LIMITS.free;
}

/**
 * Check if a feature is a limit feature (has numeric value)
 */
function isLimitFeature(feature) {
  return feature.startsWith('limit:');
}

module.exports = {
  FEATURES,
  TIERS,
  TIER_FEATURES,
  TIER_LIMITS,
  getFeaturesForTier,
  getLimitsForTier,
  isLimitFeature,
};
