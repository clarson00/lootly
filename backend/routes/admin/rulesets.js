/**
 * Admin Rulesets (Voyages) API
 *
 * CRUD operations for rulesets (multi-rule journeys/voyages).
 * All routes require business admin authentication and feature gating.
 */

const express = require('express');
const router = express.Router();
const { db, schema, generateId } = require('../../db');
const { eq, and, desc } = require('drizzle-orm');
const { RulesSimulator, generatePlainLanguage } = require('../../lib/rules');
const { requireFeature } = require('../../middleware/requireFeature');
const { FEATURES } = require('../../lib/features/registry');

const { rulesets, rules, rulesetProgress } = schema;

// Middleware to extract businessId from auth
const extractBusinessId = (req, res, next) => {
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
 * GET /api/admin/rulesets
 * List all rulesets for a business
 */
router.get('/', extractBusinessId, async (req, res) => {
  try {
    const { businessId } = req;
    const { active_only } = req.query;

    let query = db.select().from(rulesets).where(eq(rulesets.businessId, businessId));

    if (active_only === 'true') {
      query = query.where(eq(rulesets.isActive, true));
    }

    const allRulesets = await query.orderBy(desc(rulesets.priority), desc(rulesets.createdAt));

    // Get rule counts for each ruleset
    const rulesetsWithCounts = await Promise.all(
      allRulesets.map(async (rs) => {
        const rsRules = await db.select()
          .from(rules)
          .where(eq(rules.rulesetId, rs.id));

        return {
          ...rs,
          rulesCount: rsRules.length,
          activeRulesCount: rsRules.filter(r => r.isActive).length,
        };
      })
    );

    res.json({
      success: true,
      data: {
        rulesets: rulesetsWithCounts,
        total: rulesetsWithCounts.length,
      }
    });
  } catch (error) {
    console.error('Error listing rulesets:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to list rulesets' }
    });
  }
});

/**
 * GET /api/admin/rulesets/:id
 * Get a single ruleset with all its rules
 */
router.get('/:id', extractBusinessId, async (req, res) => {
  try {
    const { id } = req.params;
    const { businessId } = req;

    const [ruleset] = await db.select()
      .from(rulesets)
      .where(and(eq(rulesets.id, id), eq(rulesets.businessId, businessId)));

    if (!ruleset) {
      return res.status(404).json({
        success: false,
        error: { code: 'RULESET_NOT_FOUND', message: 'Ruleset not found' }
      });
    }

    // Get all rules in this ruleset
    const rulesetRules = await db.select()
      .from(rules)
      .where(eq(rules.rulesetId, id))
      .orderBy(rules.sequenceOrder, rules.priority);

    // Add plain language to each rule
    const rulesWithDescriptions = rulesetRules.map(rule => ({
      ...rule,
      plainLanguage: generatePlainLanguage(rule),
    }));

    res.json({
      success: true,
      data: {
        ruleset,
        rules: rulesWithDescriptions,
      }
    });
  } catch (error) {
    console.error('Error getting ruleset:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to get ruleset' }
    });
  }
});

/**
 * POST /api/admin/rulesets
 * Create a new ruleset (voyage)
 */
router.post('/', extractBusinessId, requireFeature(FEATURES.RULESETS), async (req, res) => {
  try {
    const { businessId } = req;
    const {
      name,
      description,
      theme,
      displayName,
      tagline,
      narrativeIntro,
      narrativeComplete,
      icon,
      color,
      badgeImageUrl,
      backgroundImageUrl,
      chainType,
      timeLimitValue,
      timeLimitUnit,
      isVisibleToCustomer,
      showProgress,
      showLockedSteps,
      isActive,
      priority,
      startsAt,
      endsAt,
    } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_NAME', message: 'Ruleset name is required' }
      });
    }

    const rulesetId = generateId('rset');

    await db.insert(rulesets).values({
      id: rulesetId,
      businessId,
      name,
      description,
      theme: theme || 'voyage',
      displayName,
      tagline,
      narrativeIntro,
      narrativeComplete,
      icon,
      color,
      badgeImageUrl,
      backgroundImageUrl,
      chainType: chainType || 'parallel',
      timeLimitValue,
      timeLimitUnit,
      isVisibleToCustomer: isVisibleToCustomer ?? true,
      showProgress: showProgress ?? true,
      showLockedSteps: showLockedSteps ?? true,
      isActive: isActive ?? false,
      priority: priority ?? 0,
      startsAt: startsAt ? new Date(startsAt) : null,
      endsAt: endsAt ? new Date(endsAt) : null,
    });

    const [newRuleset] = await db.select().from(rulesets).where(eq(rulesets.id, rulesetId));

    res.status(201).json({
      success: true,
      data: {
        ruleset: newRuleset
      }
    });
  } catch (error) {
    console.error('Error creating ruleset:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to create ruleset' }
    });
  }
});

/**
 * PUT /api/admin/rulesets/:id
 * Update an existing ruleset
 */
router.put('/:id', extractBusinessId, requireFeature(FEATURES.RULESETS), async (req, res) => {
  try {
    const { id } = req.params;
    const { businessId } = req;

    // Verify ruleset exists and belongs to business
    const [existingRuleset] = await db.select()
      .from(rulesets)
      .where(and(eq(rulesets.id, id), eq(rulesets.businessId, businessId)));

    if (!existingRuleset) {
      return res.status(404).json({
        success: false,
        error: { code: 'RULESET_NOT_FOUND', message: 'Ruleset not found' }
      });
    }

    const updates = {};
    const allowedFields = [
      'name', 'description', 'theme', 'displayName', 'tagline',
      'narrativeIntro', 'narrativeComplete', 'icon', 'color',
      'badgeImageUrl', 'backgroundImageUrl', 'chainType',
      'timeLimitValue', 'timeLimitUnit', 'isVisibleToCustomer',
      'showProgress', 'showLockedSteps', 'isActive', 'priority',
      'startsAt', 'endsAt'
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

    await db.update(rulesets).set(updates).where(eq(rulesets.id, id));

    const [updatedRuleset] = await db.select().from(rulesets).where(eq(rulesets.id, id));

    res.json({
      success: true,
      data: {
        ruleset: updatedRuleset
      }
    });
  } catch (error) {
    console.error('Error updating ruleset:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to update ruleset' }
    });
  }
});

/**
 * DELETE /api/admin/rulesets/:id
 * Delete a ruleset (and unlink its rules)
 */
router.delete('/:id', extractBusinessId, async (req, res) => {
  try {
    const { id } = req.params;
    const { businessId } = req;

    // Verify ruleset exists and belongs to business
    const [existingRuleset] = await db.select()
      .from(rulesets)
      .where(and(eq(rulesets.id, id), eq(rulesets.businessId, businessId)));

    if (!existingRuleset) {
      return res.status(404).json({
        success: false,
        error: { code: 'RULESET_NOT_FOUND', message: 'Ruleset not found' }
      });
    }

    // Unlink rules from this ruleset (don't delete them)
    await db.update(rules)
      .set({ rulesetId: null, updatedAt: new Date() })
      .where(eq(rules.rulesetId, id));

    // Soft delete - deactivate the ruleset
    await db.update(rulesets)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(rulesets.id, id));

    res.json({
      success: true,
      message: 'Ruleset deleted (deactivated) and rules unlinked'
    });
  } catch (error) {
    console.error('Error deleting ruleset:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to delete ruleset' }
    });
  }
});

/**
 * POST /api/admin/rulesets/:id/rules
 * Add rules to a ruleset
 */
router.post('/:id/rules', extractBusinessId, requireFeature(FEATURES.RULESETS), async (req, res) => {
  try {
    const { id } = req.params;
    const { businessId } = req;
    const { rule_ids } = req.body;

    if (!rule_ids || !Array.isArray(rule_ids)) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_RULE_IDS', message: 'rule_ids array is required' }
      });
    }

    // Verify ruleset exists
    const [ruleset] = await db.select()
      .from(rulesets)
      .where(and(eq(rulesets.id, id), eq(rulesets.businessId, businessId)));

    if (!ruleset) {
      return res.status(404).json({
        success: false,
        error: { code: 'RULESET_NOT_FOUND', message: 'Ruleset not found' }
      });
    }

    // Update rules to link to this ruleset
    for (let i = 0; i < rule_ids.length; i++) {
      await db.update(rules)
        .set({
          rulesetId: id,
          sequenceOrder: i,
          updatedAt: new Date()
        })
        .where(and(eq(rules.id, rule_ids[i]), eq(rules.businessId, businessId)));
    }

    // Get updated rules
    const updatedRules = await db.select()
      .from(rules)
      .where(eq(rules.rulesetId, id))
      .orderBy(rules.sequenceOrder);

    res.json({
      success: true,
      data: {
        ruleset,
        rules: updatedRules,
      }
    });
  } catch (error) {
    console.error('Error adding rules to ruleset:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to add rules' }
    });
  }
});

/**
 * GET /api/admin/rulesets/:id/progress
 * Get customer progress for a ruleset
 */
router.get('/:id/progress', extractBusinessId, async (req, res) => {
  try {
    const { id } = req.params;
    const { businessId } = req;
    const { customer_id } = req.query;

    // Verify ruleset exists
    const [ruleset] = await db.select()
      .from(rulesets)
      .where(and(eq(rulesets.id, id), eq(rulesets.businessId, businessId)));

    if (!ruleset) {
      return res.status(404).json({
        success: false,
        error: { code: 'RULESET_NOT_FOUND', message: 'Ruleset not found' }
      });
    }

    // If customer_id provided, get specific customer progress
    if (customer_id) {
      const simulator = new RulesSimulator();
      const progress = await simulator.getRulesetProgress(id, customer_id, businessId);

      if (progress.error) {
        return res.status(404).json({
          success: false,
          error: { code: 'PROGRESS_ERROR', message: progress.error }
        });
      }

      return res.json({
        success: true,
        data: progress
      });
    }

    // Otherwise, get aggregate progress stats
    const allProgress = await db.select()
      .from(rulesetProgress)
      .where(eq(rulesetProgress.rulesetId, id));

    const stats = {
      totalParticipants: allProgress.length,
      notStarted: allProgress.filter(p => p.status === 'not_started').length,
      inProgress: allProgress.filter(p => p.status === 'in_progress').length,
      completed: allProgress.filter(p => p.status === 'completed').length,
      expired: allProgress.filter(p => p.status === 'expired').length,
    };

    res.json({
      success: true,
      data: {
        ruleset,
        stats,
      }
    });
  } catch (error) {
    console.error('Error getting ruleset progress:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to get progress' }
    });
  }
});

module.exports = router;
