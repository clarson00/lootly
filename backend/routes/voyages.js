/**
 * Customer Voyages API
 *
 * Customer-facing routes for viewing and tracking voyage progress.
 * Requires customer authentication.
 */

const express = require('express');
const router = express.Router();
const { db, schema, generateId } = require('../db');
const { eq, and, desc, gte, lte, or, isNull } = require('drizzle-orm');
const { generatePlainLanguage } = require('../lib/rules');
const { authenticateCustomer } = require('../middleware/auth');

const { rulesets, rules, rulesetProgress, ruleTriggers, customers, enrollments } = schema;

// All routes require customer authentication
router.use(authenticateCustomer);

/**
 * GET /api/voyages
 * List all active voyages visible to the customer for a business
 */
router.get('/', async (req, res) => {
  try {
    const customerId = req.customer?.id;
    const { business_id } = req.query;

    if (!business_id) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_BUSINESS', message: 'business_id is required' }
      });
    }

    if (!customerId) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
      });
    }

    const now = new Date();

    // Get active, visible voyages within date range
    const activeVoyages = await db.select()
      .from(rulesets)
      .where(
        and(
          eq(rulesets.businessId, business_id),
          eq(rulesets.isActive, true),
          eq(rulesets.isVisibleToCustomer, true),
          or(isNull(rulesets.startsAt), lte(rulesets.startsAt, now)),
          or(isNull(rulesets.endsAt), gte(rulesets.endsAt, now))
        )
      )
      .orderBy(desc(rulesets.priority), desc(rulesets.createdAt));

    // Get customer's progress for each voyage
    const voyagesWithProgress = await Promise.all(
      activeVoyages.map(async (voyage) => {
        // Get voyage rules
        const voyageRules = await db.select()
          .from(rules)
          .where(and(eq(rules.rulesetId, voyage.id), eq(rules.isActive, true)))
          .orderBy(rules.sequenceOrder, rules.priority);

        // Get customer's progress record
        const [progress] = await db.select()
          .from(rulesetProgress)
          .where(and(
            eq(rulesetProgress.rulesetId, voyage.id),
            eq(rulesetProgress.customerId, customerId)
          ));

        // Get which rules the customer has completed
        const completedRuleIds = progress?.completedRuleIds || [];

        // Calculate progress percentage
        const totalSteps = voyageRules.length;
        const completedSteps = completedRuleIds.length;
        const progressPercent = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

        return {
          id: voyage.id,
          name: voyage.displayName || voyage.name,
          tagline: voyage.tagline,
          theme: voyage.theme,
          icon: voyage.icon || '🗺️',
          color: voyage.color,
          badgeImageUrl: voyage.badgeImageUrl,
          backgroundImageUrl: voyage.backgroundImageUrl,
          chainType: voyage.chainType,
          timeLimitValue: voyage.timeLimitValue,
          timeLimitUnit: voyage.timeLimitUnit,
          totalSteps,
          completedSteps,
          progressPercent,
          status: progress?.status || 'not_started',
          startedAt: progress?.startedAt,
          completedAt: progress?.completedAt,
          expiresAt: progress?.expiresAt,
        };
      })
    );

    res.json({
      success: true,
      data: {
        voyages: voyagesWithProgress,
        total: voyagesWithProgress.length,
      }
    });
  } catch (error) {
    console.error('Error listing voyages:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to list voyages' }
    });
  }
});

/**
 * GET /api/voyages/:id
 * Get detailed voyage info with customer's progress on each step
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const customerId = req.customer?.id;
    const { business_id } = req.query;

    if (!business_id) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_BUSINESS', message: 'business_id is required' }
      });
    }

    if (!customerId) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
      });
    }

    // Get the voyage
    const [voyage] = await db.select()
      .from(rulesets)
      .where(
        and(
          eq(rulesets.id, id),
          eq(rulesets.businessId, business_id),
          eq(rulesets.isVisibleToCustomer, true)
        )
      );

    if (!voyage) {
      return res.status(404).json({
        success: false,
        error: { code: 'VOYAGE_NOT_FOUND', message: 'Voyage not found' }
      });
    }

    // Get voyage rules
    const voyageRules = await db.select()
      .from(rules)
      .where(and(eq(rules.rulesetId, id), eq(rules.isActive, true)))
      .orderBy(rules.sequenceOrder, rules.priority);

    // Get customer's progress record
    const [progress] = await db.select()
      .from(rulesetProgress)
      .where(and(
        eq(rulesetProgress.rulesetId, id),
        eq(rulesetProgress.customerId, customerId)
      ));

    const completedRuleIds = progress?.completedRuleIds || [];

    // Get rule triggers for this customer to show completion details
    const customerTriggers = await db.select()
      .from(ruleTriggers)
      .where(eq(ruleTriggers.customerId, customerId));

    const triggersByRuleId = {};
    customerTriggers.forEach(t => {
      if (!triggersByRuleId[t.ruleId] || t.triggeredAt > triggersByRuleId[t.ruleId].triggeredAt) {
        triggersByRuleId[t.ruleId] = t;
      }
    });

    // Build steps with customer-visible info
    const steps = voyageRules.map((rule, index) => {
      const isCompleted = completedRuleIds.includes(rule.id);
      const trigger = triggersByRuleId[rule.id];

      // Determine if step is locked (for sequential voyages)
      let isLocked = false;
      if (voyage.chainType === 'sequential' && index > 0) {
        const prevRuleId = voyageRules[index - 1].id;
        isLocked = !completedRuleIds.includes(prevRuleId);
      }

      // Don't show locked steps if showLockedSteps is false
      if (isLocked && !voyage.showLockedSteps) {
        return null;
      }

      return {
        id: rule.id,
        name: rule.displayName || rule.name,
        description: rule.displayDescription || generatePlainLanguage(rule, 'pirate'),
        icon: rule.displayIcon || '⭐',
        sequenceOrder: rule.sequenceOrder || index,
        isCompleted,
        completedAt: trigger?.triggeredAt || null,
        isLocked,
        // Only show awards preview if not locked
        awards: isLocked ? null : rule.awards,
      };
    }).filter(Boolean);

    // Calculate overall progress
    const totalSteps = steps.length;
    const completedSteps = steps.filter(s => s.isCompleted).length;
    const progressPercent = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

    res.json({
      success: true,
      data: {
        voyage: {
          id: voyage.id,
          name: voyage.displayName || voyage.name,
          tagline: voyage.tagline,
          narrativeIntro: voyage.narrativeIntro,
          narrativeComplete: voyage.narrativeComplete,
          theme: voyage.theme,
          icon: voyage.icon || '🗺️',
          color: voyage.color,
          badgeImageUrl: voyage.badgeImageUrl,
          backgroundImageUrl: voyage.backgroundImageUrl,
          chainType: voyage.chainType,
          timeLimitValue: voyage.timeLimitValue,
          timeLimitUnit: voyage.timeLimitUnit,
        },
        steps,
        progress: {
          totalSteps,
          completedSteps,
          progressPercent,
          status: progress?.status || 'not_started',
          startedAt: progress?.startedAt,
          completedAt: progress?.completedAt,
          expiresAt: progress?.expiresAt,
        }
      }
    });
  } catch (error) {
    console.error('Error getting voyage:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to get voyage' }
    });
  }
});

/**
 * POST /api/voyages/:id/start
 * Start a voyage (creates progress record)
 */
router.post('/:id/start', async (req, res) => {
  try {
    const { id } = req.params;
    const customerId = req.customer?.id;
    const { business_id } = req.body;

    if (!business_id) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_BUSINESS', message: 'business_id is required' }
      });
    }

    if (!customerId) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
      });
    }

    // Get the voyage
    const [voyage] = await db.select()
      .from(rulesets)
      .where(
        and(
          eq(rulesets.id, id),
          eq(rulesets.businessId, business_id),
          eq(rulesets.isActive, true),
          eq(rulesets.isVisibleToCustomer, true)
        )
      );

    if (!voyage) {
      return res.status(404).json({
        success: false,
        error: { code: 'VOYAGE_NOT_FOUND', message: 'Voyage not found' }
      });
    }

    // Check if already started
    const [existingProgress] = await db.select()
      .from(rulesetProgress)
      .where(and(
        eq(rulesetProgress.rulesetId, id),
        eq(rulesetProgress.customerId, customerId)
      ));

    if (existingProgress) {
      return res.json({
        success: true,
        data: {
          message: 'Voyage already started',
          progress: existingProgress
        }
      });
    }

    // Calculate expiry if time-limited
    let expiresAt = null;
    if (voyage.timeLimitValue && voyage.timeLimitUnit) {
      expiresAt = new Date();
      switch (voyage.timeLimitUnit) {
        case 'hours':
          expiresAt.setHours(expiresAt.getHours() + voyage.timeLimitValue);
          break;
        case 'days':
          expiresAt.setDate(expiresAt.getDate() + voyage.timeLimitValue);
          break;
        case 'weeks':
          expiresAt.setDate(expiresAt.getDate() + (voyage.timeLimitValue * 7));
          break;
      }
    }

    // Create progress record
    const progressId = generateId('rsprog');
    await db.insert(rulesetProgress).values({
      id: progressId,
      rulesetId: id,
      customerId,
      status: 'in_progress',
      completedRuleIds: [],
      startedAt: new Date(),
      expiresAt,
    });

    const [newProgress] = await db.select()
      .from(rulesetProgress)
      .where(eq(rulesetProgress.id, progressId));

    res.status(201).json({
      success: true,
      data: {
        message: 'Voyage started!',
        progress: newProgress
      }
    });
  } catch (error) {
    console.error('Error starting voyage:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to start voyage' }
    });
  }
});

module.exports = router;
