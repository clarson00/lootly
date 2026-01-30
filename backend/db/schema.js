const { pgTable, text, integer, boolean, real, timestamp, unique, index, jsonb } = require('drizzle-orm/pg-core');

// ============================================
// BUSINESSES & LOCATIONS
// ============================================

const businesses = pgTable('businesses', {
  id: text('id').primaryKey(), // biz_ prefix
  name: text('name').notNull(),
  slug: text('slug').unique(),
  ownerName: text('owner_name'),
  ownerEmail: text('owner_email'),
  ownerPhone: text('owner_phone'),
  logoUrl: text('logo_url'),
  primaryColor: text('primary_color').default('#f59e0b'),

  // Subscription fields
  subscriptionTier: text('subscription_tier').default('free'), // 'free', 'pro', 'enterprise'
  subscriptionStatus: text('subscription_status').default('active'), // 'active', 'past_due', 'cancelled', 'trialing'
  stripeCustomerId: text('stripe_customer_id'),
  stripeSubscriptionId: text('stripe_subscription_id'),
  trialEndsAt: timestamp('trial_ends_at'),
  subscriptionEndsAt: timestamp('subscription_ends_at'),

  settings: jsonb('settings'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at'),
});

const locations = pgTable('locations', {
  id: text('id').primaryKey(), // loc_ prefix
  businessId: text('business_id').notNull().references(() => businesses.id),
  name: text('name').notNull(),
  slug: text('slug'),
  icon: text('icon'),
  description: text('description'),
  addressLine1: text('address_line1'),
  addressLine2: text('address_line2'),
  city: text('city'),
  state: text('state'),
  postalCode: text('postal_code'),
  country: text('country').default('US'),
  phone: text('phone'),
  email: text('email'),
  latitude: real('latitude'),
  longitude: real('longitude'),
  timezone: text('timezone'),
  hours: jsonb('hours'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at'),
}, (table) => ({
  businessIdx: index('idx_locations_business').on(table.businessId),
}));

const locationGroups = pgTable('location_groups', {
  id: text('id').primaryKey(), // grp_ prefix
  businessId: text('business_id').notNull().references(() => businesses.id),
  name: text('name').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
});

const locationGroupMembers = pgTable('location_group_members', {
  id: text('id').primaryKey(),
  groupId: text('group_id').notNull().references(() => locationGroups.id),
  locationId: text('location_id').notNull().references(() => locations.id),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  uniqueGroupLocation: unique().on(table.groupId, table.locationId),
}));

// ============================================
// STAFF
// ============================================

const staff = pgTable('staff', {
  id: text('id').primaryKey(), // staff_ prefix
  locationId: text('location_id').notNull().references(() => locations.id),
  name: text('name').notNull(),
  pinHash: text('pin_hash').notNull(),
  role: text('role').default('staff'), // 'staff', 'manager', 'admin'
  canVoid: boolean('can_void').default(false),
  canAdjustPoints: boolean('can_adjust_points').default(false),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at'),
}, (table) => ({
  locationIdx: index('idx_staff_location').on(table.locationId),
}));

// ============================================
// CUSTOMERS & ENROLLMENTS
// ============================================

const customers = pgTable('customers', {
  id: text('id').primaryKey(), // cust_ prefix
  phone: text('phone').unique().notNull(),
  phoneVerified: boolean('phone_verified').default(false),
  name: text('name'),
  email: text('email'),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at'),
});

const enrollments = pgTable('enrollments', {
  id: text('id').primaryKey(), // enroll_ prefix
  customerId: text('customer_id').notNull().references(() => customers.id),
  businessId: text('business_id').notNull().references(() => businesses.id),
  pointsBalance: integer('points_balance').default(0),
  lifetimePoints: integer('lifetime_points').default(0),
  lifetimeSpend: integer('lifetime_spend').default(0), // cents
  visitCount: integer('visit_count').default(0),
  tier: text('tier').default('member'),
  pointsMultiplier: real('points_multiplier').default(1.0),
  multiplierExpiresAt: timestamp('multiplier_expires_at'),
  enrolledAt: timestamp('enrolled_at').defaultNow(),
  lastVisitAt: timestamp('last_visit_at'),
  isActive: boolean('is_active').default(true),
}, (table) => ({
  uniqueCustomerBusiness: unique().on(table.customerId, table.businessId),
  customerIdx: index('idx_enrollments_customer').on(table.customerId),
  businessIdx: index('idx_enrollments_business').on(table.businessId),
}));

// ============================================
// TRANSACTIONS
// ============================================

const transactions = pgTable('transactions', {
  id: text('id').primaryKey(), // txn_ prefix
  enrollmentId: text('enrollment_id').notNull().references(() => enrollments.id),
  locationId: text('location_id').notNull().references(() => locations.id),
  staffId: text('staff_id').references(() => staff.id),
  type: text('type').notNull(), // 'check_in', 'purchase', 'adjustment', 'redemption'
  amountCents: integer('amount_cents'),
  pointsEarned: integer('points_earned').default(0),
  pointsSpent: integer('points_spent').default(0),
  pointsBalanceAfter: integer('points_balance_after'),
  notes: text('notes'),
  metadata: jsonb('metadata'),
  voided: boolean('voided').default(false),
  voidedAt: timestamp('voided_at'),
  voidedBy: text('voided_by').references(() => staff.id),
  voidReason: text('void_reason'),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  enrollmentIdx: index('idx_transactions_enrollment').on(table.enrollmentId),
  locationIdx: index('idx_transactions_location').on(table.locationId),
  createdIdx: index('idx_transactions_created').on(table.createdAt),
}));

// ============================================
// RULES ENGINE
// ============================================

// Rulesets (Voyages) - Collections of rules with dependencies
const rulesets = pgTable('rulesets', {
  id: text('id').primaryKey(), // rset_ prefix
  businessId: text('business_id').notNull().references(() => businesses.id),

  // Identity
  name: text('name').notNull(),
  description: text('description'),

  // Gamification Theme (Pirate-themed by default)
  theme: text('theme').default('voyage'), // 'voyage', 'treasure_hunt', 'quest', 'expedition'
  displayName: text('display_name'), // Customer-facing: 'The Grand Voyage'
  tagline: text('tagline'), // 'Chart yer course to riches!'
  narrativeIntro: text('narrative_intro'), // 'Ahoy! Yer adventure begins...'
  narrativeComplete: text('narrative_complete'), // 'Shiver me timbers! Ye did it!'

  // Visual
  icon: text('icon'), // Emoji or icon name: '🗺️'
  color: text('color'), // Hex color: '#FF6B35'
  badgeImageUrl: text('badge_image_url'), // URL to completion badge
  backgroundImageUrl: text('background_image_url'), // Quest card background

  // Chain Configuration
  chainType: text('chain_type').default('parallel'), // 'sequential', 'parallel', 'branching', 'progressive'
  timeLimitValue: integer('time_limit_value'),
  timeLimitUnit: text('time_limit_unit'), // 'days', 'weeks', 'months'

  // Customer Visibility
  isVisibleToCustomer: boolean('is_visible_to_customer').default(true),
  showProgress: boolean('show_progress').default(true),
  showLockedSteps: boolean('show_locked_steps').default(true),

  // Status
  isActive: boolean('is_active').default(false),
  priority: integer('priority').default(0),

  // Scheduling
  startsAt: timestamp('starts_at'),
  endsAt: timestamp('ends_at'),

  // Metadata
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at'),
}, (table) => ({
  businessIdx: index('idx_rulesets_business').on(table.businessId),
}));

// Rules - Individual rule definitions with conditions and awards
const rules = pgTable('rules', {
  id: text('id').primaryKey(), // rule_ prefix
  businessId: text('business_id').notNull().references(() => businesses.id),
  rulesetId: text('ruleset_id').references(() => rulesets.id), // Optional: link to voyage

  // Identity
  name: text('name').notNull(),
  description: text('description'),

  // Customer-Facing (pirate-themed)
  displayName: text('display_name'), // 'Port o\' Call: Tony\'s Pizza'
  displayDescription: text('display_description'), // 'Drop anchor at Tony\'s'
  hint: text('hint'), // 'Hint: The pepperoni be legendary!'
  icon: text('icon'), // '🍕'

  // Conditions (JSONB tree with AND/OR logic)
  conditions: jsonb('conditions').notNull(),

  // Awards (array of award objects)
  awards: jsonb('awards').notNull().default('[]'),

  // Legacy fields (backward compatibility)
  awardType: text('award_type'), // 'points', 'points_per_dollar', 'multiplier', 'reward'
  awardValue: text('award_value'),

  // Behavior
  isRepeatable: boolean('is_repeatable').default(false),
  cooldownDays: integer('cooldown_days'),
  maxTriggersPerCustomer: integer('max_triggers_per_customer'),

  // Chaining (within ruleset)
  sequenceOrder: integer('sequence_order'),
  dependsOnRuleIds: jsonb('depends_on_rule_ids'), // TEXT[] as JSONB array

  // Status
  isActive: boolean('is_active').default(false),
  priority: integer('priority').default(0),

  // Scheduling
  startsAt: timestamp('starts_at'),
  endsAt: timestamp('ends_at'),

  // Feature gating
  requiredFeature: text('required_feature'),

  // Metadata
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at'),
}, (table) => ({
  businessIdx: index('idx_rules_business').on(table.businessId),
  rulesetIdx: index('idx_rules_ruleset').on(table.rulesetId),
}));

// Rule Triggers - Audit log of when rules are triggered
const ruleTriggers = pgTable('rule_triggers', {
  id: text('id').primaryKey(), // rtrig_ prefix
  ruleId: text('rule_id').notNull().references(() => rules.id),
  rulesetId: text('ruleset_id').references(() => rulesets.id),
  customerId: text('customer_id').notNull().references(() => customers.id),
  enrollmentId: text('enrollment_id').references(() => enrollments.id),
  businessId: text('business_id').notNull().references(() => businesses.id),

  // What triggered it
  triggerTransactionId: text('trigger_transaction_id').references(() => transactions.id),
  triggerType: text('trigger_type').notNull(), // 'transaction', 'visit', 'manual', 'scheduled'

  // Awards given
  awardsGiven: jsonb('awards_given').notNull(),
  pointsAwarded: integer('points_awarded').default(0),
  rewardIdUnlocked: text('reward_id_unlocked').references(() => rewards.id),

  // Metadata
  triggeredAt: timestamp('triggered_at').defaultNow(),
  conditionSnapshot: jsonb('condition_snapshot'),
  evaluationContext: jsonb('evaluation_context'),
}, (table) => ({
  ruleIdx: index('idx_rule_triggers_rule').on(table.ruleId),
  customerIdx: index('idx_rule_triggers_customer').on(table.customerId),
  businessIdx: index('idx_rule_triggers_business').on(table.businessId),
}));

// Ruleset Progress - Customer progress through voyages
const rulesetProgress = pgTable('ruleset_progress', {
  id: text('id').primaryKey(), // rsprog_ prefix
  rulesetId: text('ruleset_id').notNull().references(() => rulesets.id),
  customerId: text('customer_id').notNull().references(() => customers.id),
  businessId: text('business_id').notNull().references(() => businesses.id),

  // Progress State
  status: text('status').default('not_started'), // 'not_started', 'in_progress', 'completed', 'expired'

  // Tracking
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
  expiresAt: timestamp('expires_at'),

  // Progress Data
  completedRuleIds: jsonb('completed_rule_ids').default('[]'), // TEXT[] as JSONB array
  currentStep: integer('current_step').default(0),

  // Stats
  totalPointsEarned: integer('total_points_earned').default(0),
  totalRewardsUnlocked: integer('total_rewards_unlocked').default(0),

  // Metadata
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at'),
}, (table) => ({
  uniqueRulesetCustomer: unique().on(table.rulesetId, table.customerId),
  rulesetIdx: index('idx_ruleset_progress_ruleset').on(table.rulesetId),
  customerIdx: index('idx_ruleset_progress_customer').on(table.customerId),
  businessIdx: index('idx_ruleset_progress_business').on(table.businessId),
}));

// Pending Award Choices - Track OR-based awards waiting for customer selection
const pendingAwardChoices = pgTable('pending_award_choices', {
  id: text('id').primaryKey(), // pac_ prefix
  customerId: text('customer_id').notNull().references(() => customers.id),
  businessId: text('business_id').notNull().references(() => businesses.id),
  ruleId: text('rule_id').notNull().references(() => rules.id),
  ruleTriggerid: text('rule_trigger_id').references(() => ruleTriggers.id),

  // The full award options structure
  awardOptions: jsonb('award_options').notNull(), // { operator: 'OR', groups: [...] }

  // Status
  status: text('status').default('pending'), // 'pending', 'claimed', 'expired'

  // Claim tracking
  claimedGroupIndex: integer('claimed_group_index'), // Which group was chosen
  claimedLocationId: text('claimed_location_id').references(() => locations.id),
  claimedAt: timestamp('claimed_at'),
  awardsGiven: jsonb('awards_given'), // The actual awards that were applied

  // Metadata
  createdAt: timestamp('created_at').defaultNow(),
  expiresAt: timestamp('expires_at'),
}, (table) => ({
  customerIdx: index('idx_pending_awards_customer').on(table.customerId),
  businessIdx: index('idx_pending_awards_business').on(table.businessId),
  statusIdx: index('idx_pending_awards_status').on(table.status),
}));

// Customer Tags - Tags applied to customers (from rules or manual)
  id: text('id').primaryKey(), // ctag_ prefix
  customerId: text('customer_id').notNull().references(() => customers.id),
  businessId: text('business_id').notNull().references(() => businesses.id),

  tag: text('tag').notNull(),

  // Source
  sourceType: text('source_type').notNull(), // 'rule', 'manual', 'import'
  sourceRuleId: text('source_rule_id').references(() => rules.id),

  // Metadata
  createdAt: timestamp('created_at').defaultNow(),
  expiresAt: timestamp('expires_at'),
}, (table) => ({
  uniqueCustomerBusinessTag: unique().on(table.customerId, table.businessId, table.tag),
  customerIdx: index('idx_customer_tags_customer').on(table.customerId),
  businessIdx: index('idx_customer_tags_business').on(table.businessId),
  tagIdx: index('idx_customer_tags_tag').on(table.tag),
}));

// ============================================
// REWARDS
// ============================================

const rewards = pgTable('rewards', {
  id: text('id').primaryKey(), // reward_ prefix
  businessId: text('business_id').notNull().references(() => businesses.id),
  name: text('name').notNull(),
  description: text('description'),
  icon: text('icon'),
  imageUrl: text('image_url'),
  pointsRequired: integer('points_required').notNull(),
  rewardType: text('reward_type').notNull(), // 'points_redemption', 'milestone', 'birthday'
  valueType: text('value_type'), // 'fixed_discount', 'percent_discount', 'free_item', 'multiplier'
  valueAmount: text('value_amount'),
  validLocations: jsonb('valid_locations'),
  terms: text('terms'),
  isActive: boolean('is_active').default(true),
  isHidden: boolean('is_hidden').default(false),
  sortOrder: integer('sort_order').default(0),
  expiresDays: integer('expires_days'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at'),
}, (table) => ({
  businessIdx: index('idx_rewards_business').on(table.businessId),
}));

const customerRewards = pgTable('customer_rewards', {
  id: text('id').primaryKey(), // cr_ prefix
  enrollmentId: text('enrollment_id').notNull().references(() => enrollments.id),
  rewardId: text('reward_id').notNull().references(() => rewards.id),
  sourceType: text('source_type').notNull(), // 'points_redemption', 'rule_unlock', 'manual'
  sourceId: text('source_id'),
  pointsSpent: integer('points_spent').default(0),
  status: text('status').default('available'), // 'available', 'redeemed', 'expired', 'voided'
  redemptionCode: text('redemption_code').unique(),
  earnedAt: timestamp('earned_at').defaultNow(),
  expiresAt: timestamp('expires_at'),
  redeemedAt: timestamp('redeemed_at'),
  redeemedLocationId: text('redeemed_location_id').references(() => locations.id),
  redeemedStaffId: text('redeemed_staff_id').references(() => staff.id),
  redeemedTransactionId: text('redeemed_transaction_id').references(() => transactions.id),
}, (table) => ({
  enrollmentIdx: index('idx_customer_rewards_enrollment').on(table.enrollmentId),
}));

// ============================================
// QR CODES & AUTH
// ============================================

const qrCodes = pgTable('qr_codes', {
  id: text('id').primaryKey(), // qr_ prefix
  customerId: text('customer_id').notNull().references(() => customers.id),
  code: text('code').unique().notNull(),
  type: text('type').default('primary'), // 'primary', 'temporary', 'card'
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  expiresAt: timestamp('expires_at'),
  lastUsedAt: timestamp('last_used_at'),
}, (table) => ({
  codeIdx: index('idx_qr_codes_code').on(table.code),
  customerIdx: index('idx_qr_codes_customer').on(table.customerId),
}));

const verificationCodes = pgTable('verification_codes', {
  id: text('id').primaryKey(),
  phone: text('phone').notNull(),
  code: text('code').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  verified: boolean('verified').default(false),
  attempts: integer('attempts').default(0),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  phoneIdx: index('idx_verification_phone').on(table.phone),
}));

const sessions = pgTable('sessions', {
  id: text('id').primaryKey(),
  token: text('token').unique().notNull(),
  type: text('type').notNull(), // 'customer', 'staff'
  customerId: text('customer_id').references(() => customers.id),
  staffId: text('staff_id').references(() => staff.id),
  deviceInfo: jsonb('device_info'),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  tokenIdx: index('idx_sessions_token').on(table.token),
}));

// ============================================
// FEATURE GATING & SUBSCRIPTIONS
// ============================================

const businessFeatures = pgTable('business_features', {
  id: text('id').primaryKey(),
  businessId: text('business_id').notNull().references(() => businesses.id),
  featureKey: text('feature_key').notNull(),
  enabled: boolean('enabled').default(true),
  source: text('source').notNull(), // 'addon', 'custom', 'trial', 'promo'
  sourceId: text('source_id'),
  limitValue: integer('limit_value'),
  limitPeriod: text('limit_period'), // 'monthly', 'daily', 'lifetime'
  startsAt: timestamp('starts_at').defaultNow(),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  uniqueBusinessFeature: unique().on(table.businessId, table.featureKey),
  businessIdx: index('idx_business_features_business').on(table.businessId),
  featureIdx: index('idx_business_features_key').on(table.featureKey),
}));

const featureUsage = pgTable('feature_usage', {
  id: text('id').primaryKey(),
  businessId: text('business_id').notNull().references(() => businesses.id),
  featureKey: text('feature_key').notNull(),
  periodStart: timestamp('period_start').notNull(),
  periodEnd: timestamp('period_end').notNull(),
  usageCount: integer('usage_count').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at'),
}, (table) => ({
  uniqueUsagePeriod: unique().on(table.businessId, table.featureKey, table.periodStart),
  businessIdx: index('idx_feature_usage_business').on(table.businessId),
}));

// ============================================
// LEGACY SUPPORT (for migration)
// These mirror the old SQLite tables structure for easier migration
// ============================================

const earningRules = pgTable('earning_rules', {
  id: text('id').primaryKey(),
  businessId: text('business_id').notNull().references(() => businesses.id),
  name: text('name').notNull(),
  type: text('type').notNull(),
  pointsPerVisit: integer('points_per_visit'),
  pointsPerDollar: real('points_per_dollar'),
  productName: text('product_name'),
  bonusPoints: integer('bonus_points'),
  locationGroupId: text('location_group_id').references(() => locationGroups.id),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

const visits = pgTable('visits', {
  id: text('id').primaryKey(),
  customerId: text('customer_id').notNull().references(() => customers.id),
  locationId: text('location_id').notNull().references(() => locations.id),
  spendAmount: real('spend_amount'),
  pointsEarned: integer('points_earned'),
  staffId: text('staff_id'),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  customerIdx: index('idx_visits_customer').on(table.customerId),
  locationIdx: index('idx_visits_location').on(table.locationId),
}));

module.exports = {
  // Businesses & Locations
  businesses,
  locations,
  locationGroups,
  locationGroupMembers,
  // Staff
  staff,
  // Customers & Enrollments
  customers,
  enrollments,
  // Transactions
  transactions,
  // Rules Engine
  rulesets,
  rules,
  ruleTriggers,
  rulesetProgress,
  customerTags,
  pendingAwardChoices,
  // Rewards
  rewards,
  customerRewards,
  // QR Codes & Auth
  qrCodes,
  verificationCodes,
  sessions,
  // Feature Gating
  businessFeatures,
  featureUsage,
  // Legacy Support
  earningRules,
  visits,
};
