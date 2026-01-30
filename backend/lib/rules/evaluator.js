/**
 * Rules Evaluator
 *
 * Core evaluation logic for the composable rules engine.
 * Evaluates rules against customer context and applies awards.
 */

const { db } = require('../../db');
const { eq, and, gte, desc } = require('drizzle-orm');
const schema = require('../../db/schema');
const { evaluateCondition } = require('./conditions');
const { applyAward } = require('./awards');

class RulesEvaluator {
  constructor() {
    this.db = db;
  }

  /**
   * Evaluate all active rules for a business against a customer context
   *
   * @param {Object} context - Evaluation context
   * @param {string} context.customerId - Customer ID
   * @param {string} context.businessId - Business ID
   * @param {string} context.enrollmentId - Enrollment ID
   * @param {string} [context.locationId] - Current location ID (for visits)
   * @param {string} [context.transactionId] - Transaction that triggered evaluation
   * @param {number} [context.amountCents] - Transaction amount in cents
   * @param {string} [context.triggerType] - Type of trigger: 'transaction', 'visit', 'manual', 'scheduled'
   * @returns {Promise<Array>} Array of triggered rules with awards
   */
  async evaluateRules(context) {
    const { customerId, businessId, enrollmentId, triggerType = 'transaction' } = context;

    // Load active rules for business, sorted by priority
    const rules = await this.db
      .select()
      .from(schema.rules)
      .where(
        and(
          eq(schema.rules.businessId, businessId),
          eq(schema.rules.isActive, true)
        )
      )
      .orderBy(desc(schema.rules.priority));

    const triggeredRules = [];
    const now = new Date();

    for (const rule of rules) {
      // Check date range
      if (rule.startsAt && new Date(rule.startsAt) > now) continue;
      if (rule.endsAt && new Date(rule.endsAt) < now) continue;

      // Check if already triggered (for non-repeatable rules)
      if (!rule.isRepeatable) {
        const alreadyTriggered = await this.hasTriggered(customerId, rule.id);
        if (alreadyTriggered) continue;
      }

      // Check cooldown
      if (rule.cooldownDays) {
        const inCooldown = await this.isInCooldown(customerId, rule.id, rule.cooldownDays);
        if (inCooldown) continue;
      }

      // Check max triggers
      if (rule.maxTriggersPerCustomer) {
        const triggerCount = await this.getTriggerCount(customerId, rule.id);
        if (triggerCount >= rule.maxTriggersPerCustomer) continue;
      }

      // Extract time window from conditions if present
      const timeWindow = this.extractTimeWindow(rule.conditions);

      // Evaluate conditions
      const result = await evaluateCondition(rule.conditions, context, timeWindow);

      if (result) {
        // Rule triggered! Apply awards
        const appliedAwards = await this.applyAwards(rule, context);

        // Log the trigger
        await this.logTrigger(rule, context, appliedAwards, triggerType);

        // Update ruleset progress if part of a voyage
        if (rule.rulesetId) {
          await this.updateRulesetProgress(rule, context);
        }

        triggeredRules.push({
          rule,
          awards: appliedAwards,
        });
      }
    }

    return triggeredRules;
  }

  /**
   * Evaluate a single rule
   */
  async evaluateRule(ruleId, context) {
    const rule = await this.db
      .select()
      .from(schema.rules)
      .where(eq(schema.rules.id, ruleId))
      .limit(1);

    if (!rule.length) {
      return { triggered: false, reason: 'rule_not_found' };
    }

    const r = rule[0];
    const now = new Date();

    // Check prerequisites
    if (!r.isActive) {
      return { triggered: false, reason: 'rule_inactive' };
    }

    if (r.startsAt && new Date(r.startsAt) > now) {
      return { triggered: false, reason: 'not_started' };
    }

    if (r.endsAt && new Date(r.endsAt) < now) {
      return { triggered: false, reason: 'ended' };
    }

    if (!r.isRepeatable) {
      const alreadyTriggered = await this.hasTriggered(context.customerId, r.id);
      if (alreadyTriggered) {
        return { triggered: false, reason: 'already_triggered' };
      }
    }

    if (r.cooldownDays) {
      const inCooldown = await this.isInCooldown(context.customerId, r.id, r.cooldownDays);
      if (inCooldown) {
        return { triggered: false, reason: 'cooldown' };
      }
    }

    // Extract time window and evaluate
    const timeWindow = this.extractTimeWindow(r.conditions);
    const result = await evaluateCondition(r.conditions, context, timeWindow);

    if (result) {
      return { triggered: true, awards: r.awards };
    }

    return { triggered: false, reason: 'conditions_not_met' };
  }

  /**
   * Check if a rule has been triggered for a customer
   */
  async hasTriggered(customerId, ruleId) {
    const triggers = await this.db
      .select()
      .from(schema.ruleTriggers)
      .where(
        and(
          eq(schema.ruleTriggers.customerId, customerId),
          eq(schema.ruleTriggers.ruleId, ruleId)
        )
      )
      .limit(1);

    return triggers.length > 0;
  }

  /**
   * Check if customer is in cooldown period for a rule
   */
  async isInCooldown(customerId, ruleId, cooldownDays) {
    const cooldownStart = new Date();
    cooldownStart.setDate(cooldownStart.getDate() - cooldownDays);

    const recentTriggers = await this.db
      .select()
      .from(schema.ruleTriggers)
      .where(
        and(
          eq(schema.ruleTriggers.customerId, customerId),
          eq(schema.ruleTriggers.ruleId, ruleId),
          gte(schema.ruleTriggers.triggeredAt, cooldownStart)
        )
      )
      .limit(1);

    return recentTriggers.length > 0;
  }

  /**
   * Get total trigger count for a customer and rule
   */
  async getTriggerCount(customerId, ruleId) {
    const triggers = await this.db
      .select()
      .from(schema.ruleTriggers)
      .where(
        and(
          eq(schema.ruleTriggers.customerId, customerId),
          eq(schema.ruleTriggers.ruleId, ruleId)
        )
      );

    return triggers.length;
  }

  /**
   * Extract time window from conditions tree
   */
  extractTimeWindow(conditions) {
    if (!conditions) return null;

    if (conditions.type === 'time_window') {
      return conditions.params;
    }

    if (conditions.operator && conditions.items) {
      for (const item of conditions.items) {
        const tw = this.extractTimeWindow(item);
        if (tw) return tw;
      }
    }

    return null;
  }

  /**
   * Apply all awards from a rule
   */
  async applyAwards(rule, context) {
    const appliedAwards = [];

    // Support both new awards array and legacy awardType/awardValue
    let awards = rule.awards || [];

    // Convert legacy format if needed
    if ((!awards || awards.length === 0) && rule.awardType && rule.awardValue) {
      awards = [{
        type: rule.awardType,
        value: rule.awardValue,
      }];
    }

    for (const award of awards) {
      const result = await applyAward(award, context);
      appliedAwards.push({
        ...award,
        applied: result,
      });
    }

    return appliedAwards;
  }

  /**
   * Log a rule trigger
   */
  async logTrigger(rule, context, appliedAwards, triggerType) {
    const { nanoid } = await import('nanoid');

    const pointsAwarded = appliedAwards
      .filter(a => a.type === 'bonus_points')
      .reduce((sum, a) => sum + (a.applied?.pointsAwarded || 0), 0);

    const rewardUnlocked = appliedAwards.find(a => a.type === 'unlock_reward');

    await this.db.insert(schema.ruleTriggers).values({
      id: `rtrig_${nanoid(12)}`,
      ruleId: rule.id,
      rulesetId: rule.rulesetId,
      customerId: context.customerId,
      enrollmentId: context.enrollmentId,
      businessId: context.businessId,
      triggerTransactionId: context.transactionId,
      triggerType,
      awardsGiven: appliedAwards,
      pointsAwarded,
      rewardIdUnlocked: rewardUnlocked?.rewardId,
      conditionSnapshot: rule.conditions,
      evaluationContext: {
        locationId: context.locationId,
        amountCents: context.amountCents,
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
   * Update ruleset progress when a rule is triggered
   */
  async updateRulesetProgress(rule, context) {
    const { nanoid } = await import('nanoid');
    const { customerId, businessId } = context;
    const { rulesetId } = rule;

    // Get or create progress record
    let progress = await this.db
      .select()
      .from(schema.rulesetProgress)
      .where(
        and(
          eq(schema.rulesetProgress.rulesetId, rulesetId),
          eq(schema.rulesetProgress.customerId, customerId)
        )
      )
      .limit(1);

    if (progress.length === 0) {
      // Create new progress record
      await this.db.insert(schema.rulesetProgress).values({
        id: `rsprog_${nanoid(12)}`,
        rulesetId,
        customerId,
        businessId,
        status: 'in_progress',
        startedAt: new Date(),
        completedRuleIds: [rule.id],
        currentStep: 1,
      });
    } else {
      // Update existing progress
      const currentProgress = progress[0];
      const completedRules = currentProgress.completedRuleIds || [];

      if (!completedRules.includes(rule.id)) {
        completedRules.push(rule.id);

        // Check if ruleset is complete
        const ruleset = await this.db
          .select()
          .from(schema.rulesets)
          .where(eq(schema.rulesets.id, rulesetId))
          .limit(1);

        const rulesetRules = await this.db
          .select()
          .from(schema.rules)
          .where(eq(schema.rules.rulesetId, rulesetId));

        const allComplete = rulesetRules.every(r =>
          completedRules.includes(r.id)
        );

        await this.db
          .update(schema.rulesetProgress)
          .set({
            completedRuleIds: completedRules,
            currentStep: completedRules.length,
            status: allComplete ? 'completed' : 'in_progress',
            completedAt: allComplete ? new Date() : null,
            updatedAt: new Date(),
          })
          .where(eq(schema.rulesetProgress.id, currentProgress.id));
      }
    }
  }
}

module.exports = { RulesEvaluator };
