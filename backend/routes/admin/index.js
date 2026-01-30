/**
 * Admin API Routes
 * Combines all admin-specific routes (rules, integrations, marketing)
 */
const express = require('express');
const router = express.Router();

// Import admin route modules
const integrationsRoutes = require('./integrations');
const marketingRoutes = require('./marketing');
const rulesRoutes = require('./rules');
const rulesetsRoutes = require('./rulesets');

// Mount routes
router.use('/integrations', integrationsRoutes);
router.use('/marketing', marketingRoutes);
router.use('/rules', rulesRoutes);
router.use('/rulesets', rulesetsRoutes);

module.exports = router;
