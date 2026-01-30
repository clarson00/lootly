/**
 * Rules Simulator
 *
 * Test simulator for validating rules before activation.
 * Supports bulk simulation, individual customer testing, and what-if scenarios.
 */

const { db } = require('../../db');
const { eq, and, sql } = require('drizzle-orm');
const schema = require('../../db/schema');
const { evaluateCondition } = require('./conditions');
const { generatePlainLanguage } = require('./plain-language');

class RulesSimulator {
  constructor() {
    this.db = db;
  }

  /**
   * Simulate a rule against all customers (bulk simulation)
   *
   * @param {string} ruleId - Rule ID to simulate
   * @param {string} businessId - Business ID
   * @returns {Promise<Object>} Simulation results
   */
  async simulateBulk(ruleId, businessId) {
    const rule = await this.getRule(ruleId, businessId);
    if (!rule) {
      return { error: 'Rule not found' };
    }

    // Get all enrolled customers for this business
    const enrollments = await this.db
      .select({
        customerId: schema.enrollments.customerId,
        enrollmentId: schema.enrollments.id,
      })
      .from(schema.enrollments)
      .where(
        and(
          eq(schema.enrollments.businessId, businessId),
          eq(schema.enrollments.isActive, true)
        )
      );

    const results = {
      ruleId,
      ruleName: rule.name,
      totalCustomers: enrollments.length,
      wouldTrigger: 0,
      wouldNotTrigger: 0,
      alreadyTriggered: 0,
      inCooldown: 0,
      customers: [],
    };

    // Extract time window
    const timeWindow = this.extractTimeWindow(rule.conditions);

    for (const enrollment of enrollments) {
      const context = {
        customerId: enrollment.customerId,
        businessId,
        enrollmentId: enrollment.enrollmentId,
      };

      // Check if already triggered
      if (!rule.isRepeatable) {
        const triggered = await this.hasTriggered(enrollment.customerId, ruleId);
        if (triggered) {
          results.alreadyTriggered++;
          results.customers.push({
            customerId: enrollment.customerId,
            status: 'already_triggered',
          });
          continue;
        }
      }

      // Check cooldown
      if (rule.cooldownDays) {
        const inCooldown = await this.isInCooldown(
          enrollment.customerId,
          ruleId,
          rule.cooldownDays
        );
        if (inCooldown) {
          results.inCooldown++;
          results.customers.push({
            customerId: enrollment.customerId,
            status: 'in_cooldown',
          });
          continue;
        }
      }

      // Evaluate conditions
      const conditionsMet = await evaluateCondition(rule.conditions, context, timeWindow);

      if (conditionsMet) {
        results.wouldTrigger++;
        results.customers.push({
          customerId: enrollment.customerId,
          status: 'would_trigger',
        });
      } else {
        results.wouldNotTrigger++;
        results.customers.push({
          customerId: enrollment.customerId,
          status: 'conditions_not_met',
        });
      }
    }

    return results;
  }

  /**
   * Simulate a rule for a specific customer
   *
   * @param {string} ruleId - Rule ID to simulate
   * @param {string} customerId - Customer ID to test
   * @param {string} businessId - Business ID
   * @returns {Promise<Object>} Simulation results with detailed breakdown
   */
  async simulateCustomer(ruleId, customerId, businessId) {
    const rule = await this.getRule(ruleId, businessId);
    if (!rule) {
      return { error: 'Rule not found' };
    }

    // Get enrollment
    const enrollment = await this.db
      .select()
      .from(schema.enrollments)
      .where(
        and(
          eq(schema.enrollments.customerId, customerId),
          eq(schema.enrollments.businessId, businessId)
        )
      )
      .limit(1);

    if (!enrollment.length) {
      return { error: 'Customer not enrolled in this business' };
    }

    const context = {
      customerId,
      businessId,
      enrollmentId: enrollment[0].id,
    };

    const result = {
      ruleId,
      ruleName: rule.name,
      customerId,
      plainLanguage: generatePlainLanguage(rule),
      checks: [],
      wouldTrigger: false,
      reason: null,
    };

    // Check active status
    if (!rule.isActive) {
      result.checks.push({ name: 'Rule Active', passed: false, note: 'Rule is inactive' });
      result.reason = 'Rule is inactive';
      return result;
    }
    result.checks.push({ name: 'Rule Active', passed: true });

    // Check date range
    const now = new Date();
    if (rule.startsAt && new Date(rule.startsAt) > now) {
      result.checks.push({ name: 'Start Date', passed: false, note: 'Rule has not started yet' });
      result.reason = 'Rule has not started';
      return result;
    }
    if (rule.endsAt && new Date(rule.endsAt) < now) {
      result.checks.push({ name: 'End Date', passed: false, note: 'Rule has ended' });
      result.reason = 'Rule has ended';
      return result;
    }
    result.checks.push({ name: 'Date Range', passed: true });

    // Check repeatable/already triggered
    if (!rule.isRepeatable) {
      const triggered = await this.hasTriggered(customerId, ruleId);
      if (triggered) {
        result.checks.push({ name: 'Not Already Triggered', passed: false });
        result.reason = 'Already triggered (non-repeatable)';
        return result;
      }
    }
    result.checks.push({ name: 'Repeatable Check', passed: true });

    // Check cooldown
    if (rule.cooldownDays) {
      const inCooldown = await this.isInCooldown(customerId, ruleId, rule.cooldownDays);
      if (inCooldown) {
        result.checks.push({ name: 'Cooldown', passed: false, note: `In ${rule.cooldownDays}-day cooldown` });
        result.reason = 'In cooldown period';
        return result;
      }
    }
    result.checks.push({ name: 'Cooldown Check', passed: true });

    // Evaluate each condition
    const timeWindow = this.extractTimeWindow(rule.conditions);
    const conditionResults = await this.evaluateConditionsDetailed(rule.conditions, context, timeWindow);
    result.conditions = conditionResults;

    // Overall result
    const conditionsMet = conditionResults.every(c => c.passed);
    result.checks.push({
      name: 'Conditions',
      passed: conditionsMet,
      details: conditionResults,
    });

    result.wouldTrigger = conditionsMet;
    if (!conditionsMet) {
      const failedConditions = conditionResults.filter(c => !c.passed);
      result.reason = `Conditions not met: ${failedConditions.map(c => c.description).join(', ')}`;
    }

    if (conditionsMet) {
      result.awards = rule.awards;
    }

    return result;
  }

  /**
   * What-if scenario simulation
   *
   * @param {string} ruleId - Rule ID to simulate
   * @param {string} customerId - Customer ID
   * @param {string} businessId - Business ID
   * @param {Object} scenario - Hypothetical scenario
   * @returns {Promise<Object>} What would happen
   */
  async simulateWhatIf(ruleId, customerId, businessId, scenario) {
    const rule = await this.getRule(ruleId, businessId);
    if (!rule) {
      return { error: 'Rule not found' };
    }

    const enrollment = await this.db
      .select()
      .from(schema.enrollments)
      .where(
        and(
          eq(schema.enrollments.customerId, customerId),
          eq(schema.enrollments.businessId, businessId)
        )
      )
      .limit(1);

    if (!enrollment.length) {
      return { error: 'Customer not enrolled' };
    }

    // Create hypothetical context
    const context = {
      customerId,
      businessId,
      enrollmentId: enrollment[0].id,
      // Include scenario data
      locationId: scenario.locationId,
      amountCents: scenario.amountCents,
      ...scenario,
    };

    const timeWindow = this.extractTimeWindow(rule.conditions);
    const conditionsMet = await evaluateCondition(rule.conditions, context, timeWindow);

    return {
      ruleId,
      ruleName: rule.name,
      scenario,
      wouldTrigger: conditionsMet,
      awards: conditionsMet ? rule.awards : null,
      message: conditionsMet
        ? `If this scenario happens, the customer would trigger "${rule.name}" and earn: ${JSON.stringify(rule.awards)}`
        : `This scenario would not trigger "${rule.name}"`,
    };
  }

  /**
   * Get ruleset progress for a customer
   */
  async getRulesetProgress(rulesetId, customerId, businessId) {
    const ruleset = await this.db
      .select()
      .from(schema.rulesets)
      .where(
        and(
          eq(schema.rulesets.id, rulesetId),
          eq(schema.rulesets.businessId, businessId)
        )
      )
      .limit(1);

    if (!ruleset.length) {
      return { error: 'Ruleset not found' };
    }

    const rs = ruleset[0];

    // Get all rules in this ruleset
    const rules = await this.db
      .select()
      .from(schema.rules)
      .where(eq(schema.rules.rulesetId, rulesetId));

    // Get progress record
    const progress = await this.db
      .select()
      .from(schema.rulesetProgress)
      .where(
        and(
          eq(schema.rulesetProgress.rulesetId, rulesetId),
          eq(schema.rulesetProgress.customerId, customerId)
        )
      )
      .limit(1);

    const completedRuleIds = progress.length ? (progress[0].completedRuleIds || []) : [];

    return {
      ruleset: {
        id: rs.id,
        name: rs.name,
        displayName: rs.displayName,
        theme: rs.theme,
        chainType: rs.chainType,
      },
      totalRules: rules.length,
      completedRules: completedRuleIds.length,
      percentComplete: rules.length > 0
        ? Math.round((completedRuleIds.length / rules.length) * 100)
        : 0,
      status: progress.length ? progress[0].status : 'not_started',
      rules: rules.map(r => ({
        id: r.id,
        name: r.name,
        displayName: r.displayName,
        icon: r.icon,
        completed: completedRuleIds.includes(r.id),
        sequenceOrder: r.sequenceOrder,
      })),
    };
  }

  /**
   * Evaluate conditions with detailed results
   */
  async evaluateConditionsDetailed(conditions, context, timeWindow) {
    if (!conditions) return [];

    const results = [];

    if (conditions.operator) {
      for (const item of conditions.items) {
        if (item.type === 'time_window') continue;

        const passed = await evaluateCondition(item, context, timeWindow);
        results.push({
          type: item.type,
          params: item.params,
          passed,
          description: this.describeConditionShort(item),
        });
      }
    } else if (conditions.type && conditions.type !== 'time_window') {
      const passed = await evaluateCondition(conditions, context, timeWindow);
      results.push({
        type: conditions.type,
        params: conditions.params,
        passed,
        description: this.describeConditionShort(conditions),
      });
    }

    return results;
  }

  describeConditionShort(condition) {
    const { type, params } = condition;

    switch (type) {
      case 'location_visit':
        return `Visit ${params.value || 1} locations (${params.scope})`;
      case 'spend_amount':
        return `Spend $${params.value} (${params.scope})`;
      case 'day_of_week':
        return `On ${params.days?.join(', ') || 'specific days'}`;
      case 'rule_triggered':
        return `Complete ${params.ruleIds?.length || 0} other rules`;
      default:
        return type;
    }
  }

  /**
   * Helper methods
   */
  async getRule(ruleId, businessId) {
    const rules = await this.db
      .select()
      .from(schema.rules)
      .where(
        and(
          eq(schema.rules.id, ruleId),
          eq(schema.rules.businessId, businessId)
        )
      )
      .limit(1);

    return rules[0] || null;
  }

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

  async isInCooldown(customerId, ruleId, cooldownDays) {
    const cooldownStart = new Date();
    cooldownStart.setDate(cooldownStart.getDate() - cooldownDays);

    const recentTriggers = await this.db
      .select()
      .from(schema.ruleTriggers)
      .where(
        and(
          eq(schema.ruleTriggers.customerId, customerId),
          eq(schema.ruleTriggers.ruleId, ruleId)
        )
      )
      .limit(1);

    if (!recentTriggers.length) return false;

    return new Date(recentTriggers[0].triggeredAt) > cooldownStart;
  }

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
}

module.exports = { RulesSimulator };
