/**
 * Spend Amount Condition Evaluator
 *
 * Evaluates conditions based on customer spending.
 * Supports: single transaction, cumulative spend
 */

const { db } = require('../../../db');
const { eq, and, gte, sql } = require('drizzle-orm');
const schema = require('../../../db/schema');

/**
 * Evaluate spend amount condition
 *
 * @param {Object} params - Condition parameters
 * @param {string} params.scope - 'single_transaction', 'cumulative'
 * @param {string} params.comparison - '>=', '=', '<=', 'between'
 * @param {number} params.value - Required amount in dollars
 * @param {number} [params.valueMax] - Max amount for 'between' comparison
 * @param {string} [params.locationId] - Specific location (optional)
 * @param {string} [params.locationGroupId] - Location group (optional)
 * @param {Object} context - Evaluation context
 * @param {Object} [timeWindow] - Time window modifier
 * @returns {Promise<boolean>}
 */
async function evaluateSpendAmount(params, context, timeWindow = null) {
  const { customerId, businessId, amountCents } = context;
  const { scope, comparison, value, valueMax, locationId } = params;

  // Convert value to cents for comparison
  const valueCents = value * 100;
  const valueMaxCents = valueMax ? valueMax * 100 : null;

  let spendAmount = 0;

  switch (scope) {
    case 'single_transaction':
      // Use the current transaction amount
      spendAmount = amountCents || 0;
      break;

    case 'cumulative':
      // Sum all purchases for the customer
      spendAmount = await getCumulativeSpend(customerId, businessId, locationId, timeWindow);
      break;

    default:
      console.warn(`Unknown spend scope: ${scope}`);
      return false;
  }

  return compare(spendAmount, comparison, valueCents, valueMaxCents);
}

/**
 * Get cumulative spend for a customer
 */
async function getCumulativeSpend(customerId, businessId, locationId, timeWindow) {
  const since = timeWindow ? subtractTime(new Date(), timeWindow) : null;

  let query = db
    .select({ total: sql`COALESCE(SUM(${schema.transactions.amountCents}), 0)` })
    .from(schema.transactions)
    .innerJoin(schema.enrollments, eq(schema.transactions.enrollmentId, schema.enrollments.id))
    .where(
      and(
        eq(schema.enrollments.customerId, customerId),
        eq(schema.enrollments.businessId, businessId),
        eq(schema.transactions.type, 'purchase'),
        eq(schema.transactions.voided, false),
        since ? gte(schema.transactions.createdAt, since) : undefined,
        locationId ? eq(schema.transactions.locationId, locationId) : undefined
      )
    );

  const result = await query;
  return parseInt(result[0]?.total || 0);
}

/**
 * Subtract time from a date based on time window
 */
function subtractTime(date, timeWindow) {
  const result = new Date(date);
  const { value, unit } = timeWindow;

  switch (unit) {
    case 'days':
      result.setDate(result.getDate() - value);
      break;
    case 'weeks':
      result.setDate(result.getDate() - (value * 7));
      break;
    case 'months':
      result.setMonth(result.getMonth() - value);
      break;
    default:
      result.setDate(result.getDate() - value);
  }

  return result;
}

/**
 * Compare values using comparison operator
 */
function compare(actual, comparison, expected, expectedMax = null) {
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
    case 'between':
      return actual >= expected && actual <= expectedMax;
    default:
      return actual >= expected;
  }
}

module.exports = { evaluateSpendAmount };
