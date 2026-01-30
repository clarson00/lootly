/**
 * Feature Gating Middleware
 *
 * Protects routes by checking if the business has access to a feature.
 * See docs/ENTITLEMENTS.md for usage examples.
 *
 * Usage:
 *   const { requireFeature } = require('../middleware/requireFeature');
 *   const { FEATURES } = require('../lib/features/registry');
 *
 *   router.post('/api/campaigns',
 *     requireFeature(FEATURES.MARKETING_CAMPAIGNS),
 *     campaignController.create
 *   );
 */

const { entitlements } = require('../services/entitlements');
const { FEATURES } = require('../lib/features/registry');

/**
 * Middleware factory that checks if a business has access to a feature
 * @param {string} feature - Feature key from FEATURES constant
 * @returns {Function} Express middleware
 */
function requireFeature(feature) {
  return async (req, res, next) => {
    try {
      // Get business ID from request
      // Can come from authenticated user's enrollment, staff's location, or direct business context
      const businessId = getBusinessId(req);

      if (!businessId) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'BUSINESS_CONTEXT_REQUIRED',
            message: 'Business context is required for this operation',
          },
        });
      }

      const hasAccess = await entitlements.hasFeature(businessId, feature);

      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FEATURE_NOT_AVAILABLE',
            feature,
            message: 'Upgrade your plan to access this feature',
            upgradeUrl: `/settings/billing?feature=${encodeURIComponent(feature)}`,
          },
        });
      }

      // Attach entitlements context to request for downstream use
      req.featureContext = {
        businessId,
        feature,
        granted: true,
      };

      next();
    } catch (error) {
      console.error('Feature check error:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 'FEATURE_CHECK_FAILED',
          message: 'Failed to verify feature access',
        },
      });
    }
  };
}

/**
 * Middleware factory that checks usage limits for metered features
 * @param {string} limitKey - Limit feature key (e.g., FEATURES.LIMIT_MESSAGES_MONTH)
 * @returns {Function} Express middleware
 */
function checkLimit(limitKey) {
  return async (req, res, next) => {
    try {
      const businessId = getBusinessId(req);

      if (!businessId) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'BUSINESS_CONTEXT_REQUIRED',
            message: 'Business context is required for this operation',
          },
        });
      }

      const limit = await entitlements.getLimit(businessId, limitKey);

      // -1 means unlimited
      if (limit === -1) {
        req.limitContext = { businessId, limitKey, limit: -1, unlimited: true };
        return next();
      }

      // TODO: Get current usage from feature_usage table
      const used = 0;

      if (used >= limit) {
        return res.status(429).json({
          success: false,
          error: {
            code: 'LIMIT_EXCEEDED',
            feature: limitKey,
            used,
            limit,
            message: `You've reached your limit (${used}/${limit})`,
            upgradeUrl: `/settings/billing?limit=${encodeURIComponent(limitKey)}`,
          },
        });
      }

      req.limitContext = { businessId, limitKey, limit, used };
      next();
    } catch (error) {
      console.error('Limit check error:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 'LIMIT_CHECK_FAILED',
          message: 'Failed to verify usage limit',
        },
      });
    }
  };
}

/**
 * Extract business ID from request context
 * Checks multiple sources in order of priority
 * @private
 */
function getBusinessId(req) {
  // 1. Explicitly set on request (e.g., by auth middleware)
  if (req.businessId) {
    return req.businessId;
  }

  // 2. From authenticated staff member
  if (req.staff?.businessId) {
    return req.staff.businessId;
  }

  // 3. From route params
  if (req.params?.businessId) {
    return req.params.businessId;
  }

  // 4. From query params
  if (req.query?.businessId) {
    return req.query.businessId;
  }

  // 5. From request body
  if (req.body?.businessId) {
    return req.body.businessId;
  }

  return null;
}

/**
 * Middleware to attach entitlements to request for use in handlers
 * Call this early in the middleware chain if you need entitlements info
 */
function attachEntitlements() {
  return async (req, res, next) => {
    try {
      const businessId = getBusinessId(req);

      if (businessId) {
        req.entitlements = await entitlements.getAllEntitlements(businessId);
      }

      next();
    } catch (error) {
      console.error('Attach entitlements error:', error);
      next(); // Don't fail the request, just continue without entitlements
    }
  };
}

module.exports = {
  requireFeature,
  checkLimit,
  attachEntitlements,
  getBusinessId,
  FEATURES, // Re-export for convenience
};
