/**
 * Admin API Routes
 * Combines all admin-specific routes (rules, integrations, marketing)
 */
const express = require('express');
const router = express.Router();

// Import admin route modules
const integrationsRoutes = require('./integrations');
const marketingRoutes = require('./marketing');

// Mount routes
router.use('/integrations', integrationsRoutes);
router.use('/marketing', marketingRoutes);

// TODO: Add rules admin routes when migrated
// router.use('/rules', require('./rules'));
// router.use('/rulesets', require('./rulesets'));

module.exports = router;
