/**
 * Product Purchase Condition Evaluator
 *
 * Evaluates conditions based on product purchases.
 * Note: This is a placeholder - requires transaction metadata to track products.
 */

const { db } = require('../../../db');
const { eq, and, gte, sql } = require('drizzle-orm');
const schema = require('../../../db/schema');

/**
 * Evaluate product purchase condition
 *
 * @param {Object} params - Condition parameters
 * @param {string} [params.productName] - Product name to match
 * @param {string} [params.productCategory] - Product category to match
 * @param {string} params.comparison - '>=', '=', '<='
 * @param {number} params.value - Required quantity
 * @param {Object} context - Evaluation context
 * @param {Object} [timeWindow] - Time window modifier
 * @returns {Promise<boolean>}
 */
async function evaluateProductPurchase(params, context, timeWindow = null) {
  const { customerId, businessId } = context;
  const { productName, productCategory, comparison, value } = params;

  // Get cumulative product purchases from transaction metadata
  const since = timeWindow ? subtractTime(new Date(), timeWindow) : null;

  // Query transactions with product metadata
  let query = db
    .select({
      metadata: schema.transactions.metadata,
    })
    .from(schema.transactions)
    .innerJoin(schema.enrollments, eq(schema.transactions.enrollmentId, schema.enrollments.id))
    .where(
      and(
        eq(schema.enrollments.customerId, customerId),
        eq(schema.enrollments.businessId, businessId),
        eq(schema.transactions.type, 'purchase'),
        eq(schema.transactions.voided, false),
        since ? gte(schema.transactions.createdAt, since) : undefined
      )
    );

  const transactions = await query;

  // Count matching products
  let productCount = 0;
  for (const txn of transactions) {
    const metadata = txn.metadata || {};
    const items = metadata.items || [];

    for (const item of items) {
      if (productName && item.name?.toLowerCase().includes(productName.toLowerCase())) {
        productCount += item.quantity || 1;
      } else if (productCategory && item.category?.toLowerCase() === productCategory.toLowerCase()) {
        productCount += item.quantity || 1;
      }
    }
  }

  return compare(productCount, comparison, value);
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
function compare(actual, comparison, expected) {
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
    default:
      return actual >= expected;
  }
}

module.exports = { evaluateProductPurchase };
