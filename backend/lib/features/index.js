/**
 * Feature Gating - Main Export
 *
 * Usage:
 *   const { FEATURES, requireFeature, entitlements } = require('./lib/features');
 */

const { FEATURES, TIERS, getFeaturesForTier, getLimitsForTier } = require('./registry');
const { entitlements, EntitlementsService } = require('../../services/entitlements');
const { requireFeature, checkLimit, attachEntitlements } = require('../../middleware/requireFeature');

module.exports = {
  // Feature keys
  FEATURES,
  TIERS,

  // Helpers
  getFeaturesForTier,
  getLimitsForTier,

  // Service
  entitlements,
  EntitlementsService,

  // Middleware
  requireFeature,
  checkLimit,
  attachEntitlements,
};
