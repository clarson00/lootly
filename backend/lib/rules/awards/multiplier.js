/**
 * Multiplier Award Handler
 *
 * Applies a points multiplier to a customer's enrollment.
 */

const { db } = require('../../../db');
const { eq, and } = require('drizzle-orm');
const schema = require('../../../db/schema');

/**
 * Apply multiplier award
 *
 * @param {Object} award - Award object
 * @param {number} award.value - Multiplier value (e.g., 2 for double points)
 * @param {string} [award.duration] - 'permanent', 'days', 'until_date'
 * @param {number} [award.durationValue] - Number of days (if duration is 'days')
 * @param {string} [award.scope] - 'all', 'specific_location' (future feature)
 * @param {Object} context - Application context
 * @returns {Promise<Object>} Result of award application
 */
async function applyMultiplier(award, context) {
  const { customerId, businessId } = context;
  const multiplierValue = parseFloat(award.value) || 1.0;
  const duration = award.duration || 'permanent';

  if (multiplierValue <= 0) {
    return { success: false, error: 'Invalid multiplier value' };
  }

  try {
    // Calculate expiration date
    let expiresAt = null;

    if (duration === 'days' && award.durationValue) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + award.durationValue);
    } else if (duration === 'until_date' && award.untilDate) {
      expiresAt = new Date(award.untilDate);
    }
    // 'permanent' means no expiration

    // Update enrollment multiplier
    await db
      .update(schema.enrollments)
      .set({
        pointsMultiplier: multiplierValue,
        multiplierExpiresAt: expiresAt,
      })
      .where(
        and(
          eq(schema.enrollments.customerId, customerId),
          eq(schema.enrollments.businessId, businessId)
        )
      );

    return {
      success: true,
      multiplier: multiplierValue,
      expiresAt,
    };
  } catch (error) {
    console.error('Failed to apply multiplier:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

module.exports = { applyMultiplier };
