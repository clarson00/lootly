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

const rules = pgTable('rules', {
  id: text('id').primaryKey(), // rule_ prefix
  businessId: text('business_id').notNull().references(() => businesses.id),
  name: text('name').notNull(),
  description: text('description'),
  conditions: jsonb('conditions').notNull(),
  awardType: text('award_type').notNull(), // 'points', 'points_per_dollar', 'multiplier', 'reward'
  awardValue: text('award_value').notNull(),
  priority: integer('priority').default(0),
  isActive: boolean('is_active').default(true),
  isRepeatable: boolean('is_repeatable').default(true),
  cooldownDays: integer('cooldown_days'),
  maxTriggers: integer('max_triggers'),
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at'),
}, (table) => ({
  businessIdx: index('idx_rules_business').on(table.businessId),
}));

const ruleTriggers = pgTable('rule_triggers', {
  id: text('id').primaryKey(),
  ruleId: text('rule_id').notNull().references(() => rules.id),
  enrollmentId: text('enrollment_id').notNull().references(() => enrollments.id),
  transactionId: text('transaction_id').references(() => transactions.id),
  triggeredAt: timestamp('triggered_at').defaultNow(),
});

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
  businesses,
  locations,
  locationGroups,
  locationGroupMembers,
  staff,
  customers,
  enrollments,
  transactions,
  rules,
  ruleTriggers,
  rewards,
  customerRewards,
  qrCodes,
  verificationCodes,
  sessions,
  businessFeatures,
  featureUsage,
  earningRules,
  visits,
};
