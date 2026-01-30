/**
 * Entitlements Routes
 *
 * API endpoints for checking feature access and subscription info.
 */

const express = require('express');
const router = express.Router();
const { entitlements } = require('../services/entitlements');
const { FEATURES, TIERS, getFeaturesForTier, getLimitsForTier } = require('../lib/features/registry');

/**
 * GET /api/entitlements
 * Get all entitlements for the current business
 *
 * Requires: businessId in query or authenticated context
 */
router.get('/', async (req, res) => {
  try {
    const businessId = req.businessId || req.query.businessId;

    if (!businessId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'BUSINESS_ID_REQUIRED',
          message: 'Business ID is required',
        },
      });
    }

    const result = await entitlements.getAllEntitlements(businessId);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Get entitlements error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch entitlements',
      },
    });
  }
});

/**
 * GET /api/entitlements/check/:feature
 * Check if business has access to a specific feature
 *
 * Requires: businessId in query or authenticated context
 */
router.get('/check/:feature', async (req, res) => {
  try {
    const businessId = req.businessId || req.query.businessId;
    const { feature } = req.params;

    if (!businessId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'BUSINESS_ID_REQUIRED',
          message: 'Business ID is required',
        },
      });
    }

    // Validate feature key exists
    const validFeatures = Object.values(FEATURES);
    if (!validFeatures.includes(feature)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_FEATURE',
          message: `Unknown feature key: ${feature}`,
          validFeatures,
        },
      });
    }

    const hasAccess = await entitlements.hasFeature(businessId, feature);

    res.json({
      success: true,
      data: {
        feature,
        hasAccess,
      },
    });
  } catch (error) {
    console.error('Check feature error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to check feature access',
      },
    });
  }
});

/**
 * GET /api/entitlements/tiers
 * Get all available tiers and their features (public info for pricing page)
 */
router.get('/tiers', async (req, res) => {
  try {
    const tiers = Object.values(TIERS).map(tier => ({
      id: tier,
      features: getFeaturesForTier(tier),
      limits: getLimitsForTier(tier),
    }));

    res.json({
      success: true,
      data: { tiers },
    });
  } catch (error) {
    console.error('Get tiers error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch tiers',
      },
    });
  }
});

/**
 * GET /api/entitlements/features
 * Get all available feature keys (for documentation/admin)
 */
router.get('/features', async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        features: FEATURES,
      },
    });
  } catch (error) {
    console.error('Get features error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch features',
      },
    });
  }
});

module.exports = router;
