/**
 * Rule Triggered Condition Evaluator
 *
 * Evaluates conditions based on whether a customer has triggered other rules.
 * This enables rule chaining and multi-step voyages/quests.
 */

const { db } = require('../../../db');
const { eq, and, gte, inArray, sql } = require('drizzle-orm');
const schema = require('../../../db/schema');

/**
 * Evaluate rule triggered condition
 *
 * @param {Object} params - Condition parameters
 * @param {string[]} params.ruleIds - Rule IDs to check
 * @param {string} params.match - 'all', 'any', 'at_least'
 * @param {number} [params.atLeastCount] - Minimum count for 'at_least' match
 * @param {number} [params.withinDays] - Only count triggers within X days
 * @param {Object} context - Evaluation context
 * @returns {Promise<boolean>}
 */
async function evaluateRuleTriggered(params, context) {
  const { customerId } = context;
  const { ruleIds, match, atLeastCount, withinDays } = params;

  if (!ruleIds || ruleIds.length === 0) {
    return true;
  }

  // Calculate time boundary if withinDays is specified
  let since = null;
  if (withinDays) {
    since = new Date();
    since.setDate(since.getDate() - withinDays);
  }

  // Get triggered rules for this customer
  let query = db
    .select({ ruleId: schema.ruleTriggers.ruleId })
    .from(schema.ruleTriggers)
    .where(
      and(
        eq(schema.ruleTriggers.customerId, customerId),
        inArray(schema.ruleTriggers.ruleId, ruleIds),
        since ? gte(schema.ruleTriggers.triggeredAt, since) : undefined
      )
    );

  const triggers = await query;
  const triggeredRuleIds = new Set(triggers.map(t => t.ruleId));

  switch (match) {
    case 'all':
      // All specified rules must have been triggered
      return ruleIds.every(id => triggeredRuleIds.has(id));

    case 'any':
      // At least one of the specified rules must have been triggered
      return ruleIds.some(id => triggeredRuleIds.has(id));

    case 'at_least':
      // At least X of the specified rules must have been triggered
      const count = ruleIds.filter(id => triggeredRuleIds.has(id)).length;
      return count >= (atLeastCount || 1);

    default:
      // Default to 'all'
      return ruleIds.every(id => triggeredRuleIds.has(id));
  }
}

module.exports = { evaluateRuleTriggered };
