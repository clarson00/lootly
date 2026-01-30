/**
 * Feature Registry - Frontend version
 *
 * Must stay in sync with backend/lib/features/registry.js
 * These are the feature keys used for gating UI elements.
 */

export const FEATURES = {
  // Core (always available on all tiers)
  CORE_POINTS: 'core:points',
  CORE_REWARDS: 'core:rewards',
  CORE_CHECKIN: 'core:checkin',
  CORE_STAFF_APP: 'core:staff_app',
  CORE_CUSTOMER_APP: 'core:customer_app',

  // Rules Engine
  RULES_BASIC: 'rules:basic',
  RULES_ADVANCED: 'rules:advanced',
  RULES_TIME_BOUND: 'rules:time_bound',
  RULES_PRODUCT: 'rules:product',

  // Journeys (Treasure Maps)
  JOURNEYS_BASIC: 'journeys:basic',
  JOURNEYS_UNLIMITED: 'journeys:unlimited',
  JOURNEYS_ADVANCED: 'journeys:advanced',

  // Marketing
  MARKETING_PUSH: 'marketing:push',
  MARKETING_SMS: 'marketing:sms',
  MARKETING_EMAIL: 'marketing:email',
  MARKETING_CAMPAIGNS: 'marketing:campaigns',

  // Analytics
  ANALYTICS_BASIC: 'analytics:basic',
  ANALYTICS_ADVANCED: 'analytics:advanced',
  ANALYTICS_REALTIME: 'analytics:realtime',

  // AI
  AI_ASSISTANT: 'ai:assistant',
  AI_INSIGHTS: 'ai:insights',
  AI_COPYWRITING: 'ai:copywriting',

  // Operations
  LOCATIONS_MULTI: 'locations:multi',
  LOCATIONS_UNLIMITED: 'locations:unlimited',
  STAFF_UNLIMITED: 'staff:unlimited',
  API_ACCESS: 'api:access',
  WHITE_LABEL: 'white_label',
  SSO: 'sso',

  // Limits
  LIMIT_LOCATIONS: 'limit:locations',
  LIMIT_STAFF: 'limit:staff',
  LIMIT_CUSTOMERS: 'limit:customers',
  LIMIT_MESSAGES_MONTH: 'limit:messages_month',
  LIMIT_AI_QUERIES_MONTH: 'limit:ai_queries_month',
};

export const TIERS = {
  FREE: 'free',
  STARTER: 'starter',
  PRO: 'pro',
  ENTERPRISE: 'enterprise',
};

/**
 * Feature metadata for UI display
 */
export const FEATURE_INFO = {
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
  [FEATURES.JOURNEYS_BASIC]: {
    name: 'Customer Journeys',
    description: 'Create multi-step reward quests for customers',
    tier: 'starter',
  },
  [FEATURES.MARKETING_CAMPAIGNS]: {
    name: 'Marketing Campaigns',
    description: 'Send targeted promotions to your customers',
    tier: 'pro',
  },
  [FEATURES.RULES_TIME_BOUND]: {
    name: 'Time-Limited Promotions',
    description: 'Create limited-time offers and flash sales',
    tier: 'starter',
  },
};
