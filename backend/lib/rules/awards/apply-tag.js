/**
 * Apply Tag Award Handler
 *
 * Applies a tag to a customer for segmentation and rule chaining.
 */

const { db } = require('../../../db');
const { eq, and } = require('drizzle-orm');
const schema = require('../../../db/schema');

/**
 * Apply tag award
 *
 * @param {Object} award - Award object
 * @param {string} award.tag - Tag to apply
 * @param {string} [award.value] - Alternative tag location (legacy)
 * @param {number} [award.expiresDays] - Days until tag expires
 * @param {Object} context - Application context
 * @returns {Promise<Object>} Result of award application
 */
async function applyTag(award, context) {
  const { customerId, businessId, ruleId } = context;
  const tag = award.tag || award.value;

  if (!tag) {
    return { success: false, error: 'No tag specified' };
  }

  try {
    // Calculate expiration date
    let expiresAt = null;
    if (award.expiresDays) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + award.expiresDays);
    }

    const { nanoid } = await import('nanoid');

    // Check if tag already exists
    const existing = await db
      .select()
      .from(schema.customerTags)
      .where(
        and(
          eq(schema.customerTags.customerId, customerId),
          eq(schema.customerTags.businessId, businessId),
          eq(schema.customerTags.tag, tag)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      // Tag already exists - update expiration if needed
      if (expiresAt) {
        await db
          .update(schema.customerTags)
          .set({ expiresAt })
          .where(eq(schema.customerTags.id, existing[0].id));
      }

      return {
        success: true,
        tag,
        action: 'updated',
        expiresAt,
      };
    }

    // Create new tag
    await db.insert(schema.customerTags).values({
      id: `ctag_${nanoid(12)}`,
      customerId,
      businessId,
      tag,
      sourceType: 'rule',
      sourceRuleId: ruleId,
      expiresAt,
    });

    return {
      success: true,
      tag,
      action: 'created',
      expiresAt,
    };
  } catch (error) {
    console.error('Failed to apply tag:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

module.exports = { applyTag };
