/**
 * Customer Tag Condition Evaluator
 *
 * Evaluates conditions based on customer tags.
 * Tags can be applied by rules, manually, or via import.
 */

const { db } = require('../../../db');
const { eq, and, inArray, gte } = require('drizzle-orm');
const schema = require('../../../db/schema');

/**
 * Evaluate customer tag condition
 *
 * @param {Object} params - Condition parameters
 * @param {string} [params.tag] - Single tag to check
 * @param {string[]} [params.tags] - Multiple tags to check
 * @param {string} params.match - 'has', 'has_not', 'has_any', 'has_all'
 * @param {Object} context - Evaluation context
 * @returns {Promise<boolean>}
 */
async function evaluateCustomerTag(params, context) {
  const { customerId, businessId } = context;
  const { tag, tags, match } = params;

  // Normalize to array
  const tagsToCheck = tags || (tag ? [tag] : []);

  if (tagsToCheck.length === 0) {
    return true;
  }

  // Get customer's active tags (not expired)
  const now = new Date();
  const customerTags = await db
    .select({ tag: schema.customerTags.tag })
    .from(schema.customerTags)
    .where(
      and(
        eq(schema.customerTags.customerId, customerId),
        eq(schema.customerTags.businessId, businessId)
      )
    );

  // Filter out expired tags
  const activeTags = customerTags
    .filter(t => !t.expiresAt || new Date(t.expiresAt) > now)
    .map(t => t.tag.toLowerCase());

  const normalizedTagsToCheck = tagsToCheck.map(t => t.toLowerCase());

  switch (match) {
    case 'has':
      // Has the single tag
      return normalizedTagsToCheck.every(t => activeTags.includes(t));

    case 'has_not':
      // Does not have any of the tags
      return normalizedTagsToCheck.every(t => !activeTags.includes(t));

    case 'has_any':
      // Has at least one of the tags
      return normalizedTagsToCheck.some(t => activeTags.includes(t));

    case 'has_all':
      // Has all of the tags
      return normalizedTagsToCheck.every(t => activeTags.includes(t));

    default:
      // Default to 'has'
      return normalizedTagsToCheck.every(t => activeTags.includes(t));
  }
}

module.exports = { evaluateCustomerTag };
