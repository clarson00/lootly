/**
 * Customer Attribute Condition Evaluator
 *
 * Evaluates conditions based on customer/enrollment attributes.
 * Supports: membership age, tier, lifetime spend, visit count, etc.
 */

const { db } = require('../../../db');
const { eq, and } = require('drizzle-orm');
const schema = require('../../../db/schema');

/**
 * Evaluate customer attribute condition
 *
 * @param {Object} params - Condition parameters
 * @param {string} params.attribute - Attribute to check:
 *        'membership_age_days', 'tier', 'lifetime_spend', 'lifetime_points',
 *        'visit_count', 'points_balance', 'points_multiplier'
 * @param {string} params.comparison - '>=', '=', '<=', '>', '<'
 * @param {*} params.value - Value to compare against
 * @param {Object} context - Evaluation context
 * @returns {Promise<boolean>}
 */
async function evaluateCustomerAttribute(params, context) {
  const { customerId, businessId, enrollmentId } = context;
  const { attribute, comparison, value } = params;

  // Get enrollment data
  const enrollment = await db
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
    return false;
  }

  const enr = enrollment[0];
  let actualValue;

  switch (attribute) {
    case 'membership_age_days':
      // Days since enrollment
      const enrolledAt = new Date(enr.enrolledAt);
      const now = new Date();
      actualValue = Math.floor((now - enrolledAt) / (1000 * 60 * 60 * 24));
      break;

    case 'tier':
      // Tier comparison (string equality)
      actualValue = enr.tier;
      return compare(actualValue, comparison, value, true);

    case 'lifetime_spend':
      // Total spend in dollars
      actualValue = (enr.lifetimeSpend || 0) / 100;
      break;

    case 'lifetime_points':
      // Total points ever earned
      actualValue = enr.lifetimePoints || 0;
      break;

    case 'visit_count':
      // Total visits
      actualValue = enr.visitCount || 0;
      break;

    case 'points_balance':
      // Current points balance
      actualValue = enr.pointsBalance || 0;
      break;

    case 'points_multiplier':
      // Current multiplier
      actualValue = enr.pointsMultiplier || 1.0;
      break;

    default:
      console.warn(`Unknown customer attribute: ${attribute}`);
      return false;
  }

  return compare(actualValue, comparison, value);
}

/**
 * Compare values using comparison operator
 */
function compare(actual, comparison, expected, isString = false) {
  if (isString) {
    switch (comparison) {
      case '=':
      case '==':
        return actual?.toLowerCase() === expected?.toLowerCase();
      case '!=':
        return actual?.toLowerCase() !== expected?.toLowerCase();
      default:
        return actual?.toLowerCase() === expected?.toLowerCase();
    }
  }

  switch (comparison) {
    case '>=':
      return actual >= expected;
    case '=':
    case '==':
      return actual === expected;
    case '<=':
      return actual <= expected;
    case '>':
      return actual > expected;
    case '<':
      return actual < expected;
    case '!=':
      return actual !== expected;
    default:
      return actual >= expected;
  }
}

module.exports = { evaluateCustomerAttribute };
