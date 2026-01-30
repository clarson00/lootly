/**
 * Entitlements Service
 *
 * Handles feature access checks for businesses based on their subscription tier
 * and any feature overrides. See docs/ENTITLEMENTS.md for full documentation.
 */

const { db } = require('../db');
const { businesses, businessFeatures } = require('../db/schema');
const { eq, and, or, isNull, gt } = require('drizzle-orm');
const {
  FEATURES,
  getFeaturesForTier,
  getLimitsForTier,
  isLimitFeature,
} = require('../lib/features/registry');

class EntitlementsService {
  /**
   * Check if a business has access to a feature
   * @param {string} businessId
   * @param {string} feature - Feature key from FEATURES
   * @returns {Promise<boolean>}
   */
  async hasFeature(businessId, feature) {
    // 1. Check for override (highest priority)
    const override = await this.getOverride(businessId, feature);
    if (override !== null) {
      return override.enabled && !this.isExpired(override);
    }

    // 2. Get business subscription tier
    const business = await this.getBusiness(businessId);
    if (!business) {
      return false;
    }

    const tier = business.subscriptionTier || 'free';
    const status = business.subscriptionStatus || 'active';

    // If subscription is not active, fall back to free tier
    if (status !== 'active' && status !== 'trialing') {
      return getFeaturesForTier('free').includes(feature);
    }

    // 3. Check if feature is included in tier
    return getFeaturesForTier(tier).includes(feature);
  }

  /**
   * Get the limit value for a metered feature
   * @param {string} businessId
   * @param {string} limitKey - Limit feature key (e.g., FEATURES.LIMIT_LOCATIONS)
   * @returns {Promise<number>} -1 means unlimited
   */
  async getLimit(businessId, limitKey) {
    // 1. Check for override
    const override = await this.getOverride(businessId, limitKey);
    if (override && override.limitValue !== null && !this.isExpired(override)) {
      return override.limitValue;
    }

    // 2. Get base limit from tier
    const business = await this.getBusiness(businessId);
    const tier = business?.subscriptionTier || 'free';
    const limits = getLimitsForTier(tier);

    return limits[limitKey] ?? 0;
  }

  /**
   * Get all entitlements for a business (for API response / frontend)
   * @param {string} businessId
   * @returns {Promise<object>}
   */
  async getAllEntitlements(businessId) {
    const business = await this.getBusiness(businessId);
    const tier = business?.subscriptionTier || 'free';

    // Build feature map
    const features = {};
    for (const key of Object.values(FEATURES)) {
      if (!isLimitFeature(key)) {
        features[key] = await this.hasFeature(businessId, key);
      }
    }

    // Build limits map
    const limits = {};
    for (const key of Object.values(FEATURES)) {
      if (isLimitFeature(key)) {
        limits[key] = {
          limit: await this.getLimit(businessId, key),
          used: 0, // TODO: implement usage tracking
        };
      }
    }

    return {
      tier,
      status: business?.subscriptionStatus || 'active',
      features,
      limits,
    };
  }

  /**
   * Get a feature override for a business
   * @private
   */
  async getOverride(businessId, featureKey) {
    const result = await db
      .select()
      .from(businessFeatures)
      .where(
        and(
          eq(businessFeatures.businessId, businessId),
          eq(businessFeatures.featureKey, featureKey)
        )
      )
      .limit(1);

    return result[0] || null;
  }

  /**
   * Check if an override is expired
   * @private
   */
  isExpired(override) {
    if (!override?.expiresAt) {
      return false;
    }
    return new Date(override.expiresAt) < new Date();
  }

  /**
   * Get business by ID (with caching potential)
   * @private
   */
  async getBusiness(businessId) {
    const result = await db
      .select({
        id: businesses.id,
        subscriptionTier: businesses.subscriptionTier,
        subscriptionStatus: businesses.subscriptionStatus,
        trialEndsAt: businesses.trialEndsAt,
        subscriptionEndsAt: businesses.subscriptionEndsAt,
      })
      .from(businesses)
      .where(eq(businesses.id, businessId))
      .limit(1);

    return result[0] || null;
  }

  /**
   * Grant a feature override to a business
   * @param {string} businessId
   * @param {string} featureKey
   * @param {object} options
   * @returns {Promise<object>}
   */
  async grantFeature(businessId, featureKey, options = {}) {
    const { nanoid } = await import('nanoid');
    const id = `bf_${nanoid(12)}`;

    const override = {
      id,
      businessId,
      featureKey,
      enabled: options.enabled ?? true,
      source: options.source || 'manual',
      sourceId: options.sourceId || null,
      limitValue: options.limitValue ?? null,
      expiresAt: options.expiresAt || null,
      createdAt: new Date(),
    };

    await db.insert(businessFeatures).values(override).onConflictDoUpdate({
      target: [businessFeatures.businessId, businessFeatures.featureKey],
      set: {
        enabled: override.enabled,
        source: override.source,
        sourceId: override.sourceId,
        limitValue: override.limitValue,
        expiresAt: override.expiresAt,
      },
    });

    return override;
  }

  /**
   * Revoke a feature override from a business
   * @param {string} businessId
   * @param {string} featureKey
   */
  async revokeFeature(businessId, featureKey) {
    await db
      .delete(businessFeatures)
      .where(
        and(
          eq(businessFeatures.businessId, businessId),
          eq(businessFeatures.featureKey, featureKey)
        )
      );
  }
}

// Export singleton instance
const entitlements = new EntitlementsService();

module.exports = {
  EntitlementsService,
  entitlements,
};
