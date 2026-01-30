/**
 * Admin Rules API
 *
 * CRUD operations for rules and rule simulation.
 * All routes require business admin authentication and feature gating.
 */

const express = require('express');
const router = express.Router();
const { db, schema, generateId } = require('../../db');
const { eq, and, desc } = require('drizzle-orm');
const { RulesEvaluator, RulesSimulator, generatePlainLanguage } = require('../../lib/rules');
const { requireFeature } = require('../../middleware/requireFeature');
const { FEATURES } = require('../../lib/features/registry');

const { rules, rulesets } = schema;

// Middleware to extract businessId from auth (placeholder - implement based on your auth)
const extractBusinessId = (req, res, next) => {
  // TODO: Extract from JWT or session
  // For now, require it in query/body
  req.businessId = req.query.business_id || req.body.business_id;

  if (!req.businessId) {
    return res.status(400).json({
      success: false,
      error: { code: 'MISSING_BUSINESS', message: 'business_id is required' }
    });
  }

  next();
};

/**
 * GET /api/admin/rules
 * List all rules for a business
 */
router.get('/', extractBusinessId, async (req, res) => {
  try {
    const { businessId } = req;
    const { ruleset_id, active_only } = req.query;

    let query = db.select().from(rules).where(eq(rules.businessId, businessId));

    if (ruleset_id) {
      query = query.where(eq(rules.rulesetId, ruleset_id));
    }

    if (active_only === 'true') {
      query = query.where(eq(rules.isActive, true));
    }

    const allRules = await query.orderBy(desc(rules.priority), desc(rules.createdAt));

    // Add plain language descriptions
    const rulesWithDescriptions = allRules.map(rule => ({
      ...rule,
      plainLanguage: generatePlainLanguage(rule),
    }));

    res.json({
      success: true,
      data: {
        rules: rulesWithDescriptions,
        total: rulesWithDescriptions.length,
      }
    });
  } catch (error) {
    console.error('Error listing rules:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to list rules' }
    });
  }
});

/**
 * GET /api/admin/rules/:id
 * Get a single rule with details
 */
router.get('/:id', extractBusinessId, async (req, res) => {
  try {
    const { id } = req.params;
    const { businessId } = req;

    const [rule] = await db.select()
      .from(rules)
      .where(and(eq(rules.id, id), eq(rules.businessId, businessId)));

    if (!rule) {
      return res.status(404).json({
        success: false,
        error: { code: 'RULE_NOT_FOUND', message: 'Rule not found' }
      });
    }

    // Get ruleset info if part of one
    let ruleset = null;
    if (rule.rulesetId) {
      const [rs] = await db.select().from(rulesets).where(eq(rulesets.id, rule.rulesetId));
      ruleset = rs;
    }

    res.json({
      success: true,
      data: {
        rule: {
          ...rule,
          plainLanguage: generatePlainLanguage(rule),
        },
        ruleset,
      }
    });
  } catch (error) {
    console.error('Error getting rule:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to get rule' }
    });
  }
});

/**
 * POST /api/admin/rules
 * Create a new rule
 */
router.post('/', extractBusinessId, requireFeature(FEATURES.RULES_BASIC), async (req, res) => {
  try {
    const { businessId } = req;
    const {
      name,
      description,
      displayName,
      displayDescription,
      hint,
      icon,
      conditions,
      awards,
      awardType,
      awardValue,
      isRepeatable,
      cooldownDays,
      maxTriggersPerCustomer,
      rulesetId,
      sequenceOrder,
      dependsOnRuleIds,
      isActive,
      priority,
      startsAt,
      endsAt,
      requiredFeature,
    } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_NAME', message: 'Rule name is required' }
      });
    }

    if (!conditions) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_CONDITIONS', message: 'Rule conditions are required' }
      });
    }

    // Check feature requirements for advanced conditions
    const hasAdvancedConditions = checkAdvancedConditions(conditions);
    if (hasAdvancedConditions) {
      // TODO: Check RULES_ADVANCED feature
    }

    const ruleId = generateId('rule');

    await db.insert(rules).values({
      id: ruleId,
      businessId,
      name,
      description,
      displayName,
      displayDescription,
      hint,
      icon,
      conditions,
      awards: awards || [],
      awardType,
      awardValue,
      isRepeatable: isRepeatable ?? false,
      cooldownDays,
      maxTriggersPerCustomer,
      rulesetId,
      sequenceOrder,
      dependsOnRuleIds,
      isActive: isActive ?? false,
      priority: priority ?? 0,
      startsAt: startsAt ? new Date(startsAt) : null,
      endsAt: endsAt ? new Date(endsAt) : null,
      requiredFeature,
    });

    const [newRule] = await db.select().from(rules).where(eq(rules.id, ruleId));

    res.status(201).json({
      success: true,
      data: {
        rule: {
          ...newRule,
          plainLanguage: generatePlainLanguage(newRule),
        }
      }
    });
  } catch (error) {
    console.error('Error creating rule:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to create rule' }
    });
  }
});

/**
 * PUT /api/admin/rules/:id
 * Update an existing rule
 */
router.put('/:id', extractBusinessId, requireFeature(FEATURES.RULES_BASIC), async (req, res) => {
  try {
    const { id } = req.params;
    const { businessId } = req;

    // Verify rule exists and belongs to business
    const [existingRule] = await db.select()
      .from(rules)
      .where(and(eq(rules.id, id), eq(rules.businessId, businessId)));

    if (!existingRule) {
      return res.status(404).json({
        success: false,
        error: { code: 'RULE_NOT_FOUND', message: 'Rule not found' }
      });
    }

    const updates = {};
    const allowedFields = [
      'name', 'description', 'displayName', 'displayDescription', 'hint', 'icon',
      'conditions', 'awards', 'awardType', 'awardValue',
      'isRepeatable', 'cooldownDays', 'maxTriggersPerCustomer',
      'rulesetId', 'sequenceOrder', 'dependsOnRuleIds',
      'isActive', 'priority', 'startsAt', 'endsAt', 'requiredFeature'
    ];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        if (field === 'startsAt' || field === 'endsAt') {
          updates[field] = req.body[field] ? new Date(req.body[field]) : null;
        } else {
          updates[field] = req.body[field];
        }
      }
    }

    updates.updatedAt = new Date();

    await db.update(rules).set(updates).where(eq(rules.id, id));

    const [updatedRule] = await db.select().from(rules).where(eq(rules.id, id));

    res.json({
      success: true,
      data: {
        rule: {
          ...updatedRule,
          plainLanguage: generatePlainLanguage(updatedRule),
        }
      }
    });
  } catch (error) {
    console.error('Error updating rule:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to update rule' }
    });
  }
});

/**
 * DELETE /api/admin/rules/:id
 * Delete a rule
 */
router.delete('/:id', extractBusinessId, async (req, res) => {
  try {
    const { id } = req.params;
    const { businessId } = req;

    // Verify rule exists and belongs to business
    const [existingRule] = await db.select()
      .from(rules)
      .where(and(eq(rules.id, id), eq(rules.businessId, businessId)));

    if (!existingRule) {
      return res.status(404).json({
        success: false,
        error: { code: 'RULE_NOT_FOUND', message: 'Rule not found' }
      });
    }

    // Don't delete, just deactivate (soft delete)
    await db.update(rules)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(rules.id, id));

    res.json({
      success: true,
      message: 'Rule deleted (deactivated)'
    });
  } catch (error) {
    console.error('Error deleting rule:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to delete rule' }
    });
  }
});

/**
 * POST /api/admin/rules/simulate/bulk
 * Simulate a rule against all customers
 */
router.post('/simulate/bulk', extractBusinessId, async (req, res) => {
  try {
    const { businessId } = req;
    const { rule_id } = req.body;

    if (!rule_id) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_RULE_ID', message: 'rule_id is required' }
      });
    }

    const simulator = new RulesSimulator();
    const results = await simulator.simulateBulk(rule_id, businessId);

    if (results.error) {
      return res.status(404).json({
        success: false,
        error: { code: 'SIMULATION_ERROR', message: results.error }
      });
    }

    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Error in bulk simulation:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to run simulation' }
    });
  }
});

/**
 * POST /api/admin/rules/simulate/customer
 * Simulate a rule for a specific customer
 */
router.post('/simulate/customer', extractBusinessId, async (req, res) => {
  try {
    const { businessId } = req;
    const { rule_id, customer_id } = req.body;

    if (!rule_id || !customer_id) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_PARAMS', message: 'rule_id and customer_id are required' }
      });
    }

    const simulator = new RulesSimulator();
    const results = await simulator.simulateCustomer(rule_id, customer_id, businessId);

    if (results.error) {
      return res.status(404).json({
        success: false,
        error: { code: 'SIMULATION_ERROR', message: results.error }
      });
    }

    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Error in customer simulation:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to run simulation' }
    });
  }
});

/**
 * POST /api/admin/rules/simulate/what-if
 * Simulate a what-if scenario
 */
router.post('/simulate/what-if', extractBusinessId, async (req, res) => {
  try {
    const { businessId } = req;
    const { rule_id, customer_id, scenario } = req.body;

    if (!rule_id || !customer_id || !scenario) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_PARAMS', message: 'rule_id, customer_id, and scenario are required' }
      });
    }

    const simulator = new RulesSimulator();
    const results = await simulator.simulateWhatIf(rule_id, customer_id, businessId, scenario);

    if (results.error) {
      return res.status(404).json({
        success: false,
        error: { code: 'SIMULATION_ERROR', message: results.error }
      });
    }

    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Error in what-if simulation:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to run simulation' }
    });
  }
});

/**
 * Helper: Check if conditions use advanced features
 */
function checkAdvancedConditions(conditions) {
  if (!conditions) return false;

  // Check for compound conditions (AND/OR)
  if (conditions.operator) {
    return true;
  }

  // Check for advanced condition types
  const advancedTypes = ['time_of_day', 'date_range', 'product_purchase', 'customer_tag'];
  if (advancedTypes.includes(conditions.type)) {
    return true;
  }

  return false;
}

module.exports = router;
