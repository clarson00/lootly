/**
 * Admin Routes Index
 *
 * Aggregates all admin API routes.
 */

const express = require('express');
const router = express.Router();

const rulesRouter = require('./rules');
const rulesetsRouter = require('./rulesets');

// Mount admin routes
router.use('/rules', rulesRouter);
router.use('/rulesets', rulesetsRouter);

module.exports = router;
