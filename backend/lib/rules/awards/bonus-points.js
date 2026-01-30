/**
 * Bonus Points Award Handler
 *
 * Awards bonus points to a customer's enrollment.
 */

const { db } = require('../../../db');
const { eq, and, sql } = require('drizzle-orm');
const schema = require('../../../db/schema');

/**
 * Apply bonus points award
 *
 * @param {Object} award - Award object
 * @param {number} award.value - Number of bonus points to award
 * @param {Object} context - Application context
 * @returns {Promise<Object>} Result of award application
 */
async function applyBonusPoints(award, context) {
  const { customerId, businessId, enrollmentId } = context;
  const pointsToAdd = parseInt(award.value) || 0;

  if (pointsToAdd <= 0) {
    return { success: false, error: 'Invalid points value' };
  }

  try {
    // Update enrollment points balance
    await db
      .update(schema.enrollments)
      .set({
        pointsBalance: sql`${schema.enrollments.pointsBalance} + ${pointsToAdd}`,
        lifetimePoints: sql`${schema.enrollments.lifetimePoints} + ${pointsToAdd}`,
      })
      .where(
        and(
          eq(schema.enrollments.customerId, customerId),
          eq(schema.enrollments.businessId, businessId)
        )
      );

    return {
      success: true,
      pointsAwarded: pointsToAdd,
    };
  } catch (error) {
    console.error('Failed to apply bonus points:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

module.exports = { applyBonusPoints };
