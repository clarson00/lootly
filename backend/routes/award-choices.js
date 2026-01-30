/**
 * Award Choices API
 *
 * Routes for customers to view and claim pending award choices.
 * Handles OR-based awards that require customer selection.
 */

const express = require('express');
const router = express.Router();
const { db, schema, generateId } = require('../db');
const { eq, and, desc } = require('drizzle-orm');
const { authenticateCustomer } = require('../middleware/auth');
const { applyAwardGroup } = require('../lib/rules/awards');

const { pendingAwardChoices, rules, locations } = schema;

// All routes require customer authentication
router.use(authenticateCustomer);

/**
 * GET /api/award-choices
 * List pending award choices for the customer
 */
router.get('/', async (req, res) => {
  try {
    const customerId = req.customer.id;
    const { business_id, status = 'pending' } = req.query;

    if (!business_id) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_BUSINESS', message: 'business_id is required' }
      });
    }

    const choices = await db.select({
      id: pendingAwardChoices.id,
      ruleId: pendingAwardChoices.ruleId,
      awardOptions: pendingAwardChoices.awardOptions,
      status: pendingAwardChoices.status,
      createdAt: pendingAwardChoices.createdAt,
      expiresAt: pendingAwardChoices.expiresAt,
      ruleName: rules.name,
      ruleDisplayName: rules.displayName,
      ruleIcon: rules.icon,
    })
      .from(pendingAwardChoices)
      .leftJoin(rules, eq(pendingAwardChoices.ruleId, rules.id))
      .where(and(
        eq(pendingAwardChoices.customerId, customerId),
        eq(pendingAwardChoices.businessId, business_id),
        eq(pendingAwardChoices.status, status)
      ))
      .orderBy(desc(pendingAwardChoices.createdAt));

    // Enrich with location info for each group
    const enrichedChoices = await Promise.all(choices.map(async (choice) => {
      const groups = choice.awardOptions?.groups || [];

      const enrichedGroups = await Promise.all(groups.map(async (group, index) => {
        let location = null;
        if (group.locationId) {
          const [loc] = await db.select({
            id: locations.id,
            name: locations.name,
            icon: locations.icon,
          })
            .from(locations)
            .where(eq(locations.id, group.locationId));
          location = loc;
        }

        return {
          index,
          locationId: group.locationId,
          location,
          awards: group.awards || [],
          awardCount: (group.awards || []).length,
        };
      }));

      return {
        id: choice.id,
        ruleId: choice.ruleId,
        ruleName: choice.ruleDisplayName || choice.ruleName,
        ruleIcon: choice.ruleIcon || '🎁',
        status: choice.status,
        createdAt: choice.createdAt,
        expiresAt: choice.expiresAt,
        operator: choice.awardOptions?.operator || 'OR',
        groups: enrichedGroups,
      };
    }));

    res.json({
      success: true,
      data: {
        choices: enrichedChoices,
        total: enrichedChoices.length,
      }
    });
  } catch (error) {
    console.error('Error listing award choices:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to list award choices' }
    });
  }
});

/**
 * GET /api/award-choices/:id
 * Get details of a specific pending award choice
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const customerId = req.customer.id;

    const [choice] = await db.select()
      .from(pendingAwardChoices)
      .where(and(
        eq(pendingAwardChoices.id, id),
        eq(pendingAwardChoices.customerId, customerId)
      ));

    if (!choice) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Award choice not found' }
      });
    }

    // Get rule details
    const [rule] = await db.select()
      .from(rules)
      .where(eq(rules.id, choice.ruleId));

    // Enrich groups with location info
    const groups = choice.awardOptions?.groups || [];
    const enrichedGroups = await Promise.all(groups.map(async (group, index) => {
      let location = null;
      if (group.locationId) {
        const [loc] = await db.select()
          .from(locations)
          .where(eq(locations.id, group.locationId));
        location = loc;
      }

      return {
        index,
        locationId: group.locationId,
        location,
        awards: group.awards || [],
      };
    }));

    res.json({
      success: true,
      data: {
        choice: {
          id: choice.id,
          ruleId: choice.ruleId,
          ruleName: rule?.displayName || rule?.name,
          ruleDescription: rule?.displayDescription || rule?.description,
          ruleIcon: rule?.icon || '🎁',
          status: choice.status,
          createdAt: choice.createdAt,
          expiresAt: choice.expiresAt,
          claimedAt: choice.claimedAt,
          claimedGroupIndex: choice.claimedGroupIndex,
          claimedLocationId: choice.claimedLocationId,
          awardsGiven: choice.awardsGiven,
        },
        operator: choice.awardOptions?.operator || 'OR',
        groups: enrichedGroups,
      }
    });
  } catch (error) {
    console.error('Error getting award choice:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to get award choice' }
    });
  }
});

/**
 * POST /api/award-choices/:id/claim
 * Claim a specific award group from an OR choice
 */
router.post('/:id/claim', async (req, res) => {
  try {
    const { id } = req.params;
    const customerId = req.customer.id;
    const { group_index } = req.body;

    if (group_index === undefined || group_index === null) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_GROUP', message: 'group_index is required' }
      });
    }

    // Get the pending choice
    const [choice] = await db.select()
      .from(pendingAwardChoices)
      .where(and(
        eq(pendingAwardChoices.id, id),
        eq(pendingAwardChoices.customerId, customerId),
        eq(pendingAwardChoices.status, 'pending')
      ));

    if (!choice) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Pending award choice not found' }
      });
    }

    // Check expiry
    if (choice.expiresAt && new Date(choice.expiresAt) < new Date()) {
      await db.update(pendingAwardChoices)
        .set({ status: 'expired' })
        .where(eq(pendingAwardChoices.id, id));

      return res.status(400).json({
        success: false,
        error: { code: 'EXPIRED', message: 'This award choice has expired' }
      });
    }

    const awardOptions = choice.awardOptions;
    const groups = awardOptions?.groups || [];

    if (group_index < 0 || group_index >= groups.length) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_GROUP', message: 'Invalid group index' }
      });
    }

    const selectedGroup = groups[group_index];

    // Build context for award application
    const context = {
      customerId,
      businessId: choice.businessId,
      ruleId: choice.ruleId,
      locationId: selectedGroup.locationId,
    };

    // Apply the awards from the selected group
    const result = await applyAwardGroup(awardOptions, group_index, context);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: { code: 'APPLY_FAILED', message: result.error || 'Failed to apply awards' }
      });
    }

    // Update the pending choice record
    await db.update(pendingAwardChoices)
      .set({
        status: 'claimed',
        claimedGroupIndex: group_index,
        claimedLocationId: selectedGroup.locationId,
        claimedAt: new Date(),
        awardsGiven: result.appliedAwards,
      })
      .where(eq(pendingAwardChoices.id, id));

    // Get location info for response
    let location = null;
    if (selectedGroup.locationId) {
      const [loc] = await db.select({
        id: locations.id,
        name: locations.name,
        icon: locations.icon,
      })
        .from(locations)
        .where(eq(locations.id, selectedGroup.locationId));
      location = loc;
    }

    res.json({
      success: true,
      data: {
        message: 'Awards claimed successfully!',
        claimedGroupIndex: group_index,
        claimedLocation: location,
        awardsGiven: result.appliedAwards,
      }
    });
  } catch (error) {
    console.error('Error claiming award:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to claim award' }
    });
  }
});

module.exports = router;
