/**
 * Condition Evaluators - Main Entry Point
 *
 * Routes condition evaluation to the appropriate handler based on type.
 */

const { evaluateLocationVisit } = require('./location-visit');
const { evaluateSpendAmount } = require('./spend-amount');
const { evaluateProductPurchase } = require('./product-purchase');
const { evaluateTimeWindow } = require('./time-window');
const { evaluateDayOfWeek } = require('./day-of-week');
const { evaluateDateRange } = require('./date-range');
const { evaluateTimeOfDay } = require('./time-of-day');
const { evaluateCustomerAttribute } = require('./customer-attribute');
const { evaluateCustomerTag } = require('./customer-tag');
const { evaluateRuleTriggered } = require('./rule-triggered');

/**
 * Evaluate a condition tree
 *
 * @param {Object} condition - Condition object or tree
 * @param {Object} context - Evaluation context
 * @param {Object} timeWindow - Time window modifier (optional)
 * @returns {Promise<boolean>} Whether condition is satisfied
 */
async function evaluateCondition(condition, context, timeWindow = null) {
  if (!condition) return true;

  // Handle AND/OR groups
  if (condition.operator) {
    const results = await Promise.all(
      condition.items.map(item => evaluateCondition(item, context, timeWindow))
    );

    if (condition.operator === 'AND') {
      return results.every(r => r === true);
    } else if (condition.operator === 'OR') {
      return results.some(r => r === true);
    }

    return false;
  }

  // Handle specific condition types
  switch (condition.type) {
    case 'time_window':
      // Time window is a modifier, always returns true
      // The actual time window is extracted and applied to other conditions
      return true;

    case 'location_visit':
      return await evaluateLocationVisit(condition.params, context, timeWindow);

    case 'spend_amount':
      return await evaluateSpendAmount(condition.params, context, timeWindow);

    case 'product_purchase':
      return await evaluateProductPurchase(condition.params, context, timeWindow);

    case 'day_of_week':
      return evaluateDayOfWeek(condition.params, context);

    case 'date_range':
      return evaluateDateRange(condition.params, context);

    case 'time_of_day':
      return evaluateTimeOfDay(condition.params, context);

    case 'customer_attribute':
      return await evaluateCustomerAttribute(condition.params, context);

    case 'customer_tag':
      return await evaluateCustomerTag(condition.params, context);

    case 'rule_triggered':
      return await evaluateRuleTriggered(condition.params, context);

    default:
      console.warn(`Unknown condition type: ${condition.type}`);
      return false;
  }
}

module.exports = {
  evaluateCondition,
  evaluateLocationVisit,
  evaluateSpendAmount,
  evaluateProductPurchase,
  evaluateTimeWindow,
  evaluateDayOfWeek,
  evaluateDateRange,
  evaluateTimeOfDay,
  evaluateCustomerAttribute,
  evaluateCustomerTag,
  evaluateRuleTriggered,
};
