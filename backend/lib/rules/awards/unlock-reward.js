/**
 * Unlock Reward Award Handler
 *
 * Unlocks a reward for a customer without spending points.
 */

const { db } = require('../../../db');
const { eq, and } = require('drizzle-orm');
const schema = require('../../../db/schema');

/**
 * Apply unlock reward award
 *
 * @param {Object} award - Award object
 * @param {string} award.rewardId - ID of the reward to unlock
 * @param {Object} context - Application context
 * @returns {Promise<Object>} Result of award application
 */
async function applyUnlockReward(award, context) {
  const { customerId, businessId, enrollmentId } = context;
  const rewardId = award.rewardId || award.value;

  if (!rewardId) {
    return { success: false, error: 'No reward ID specified' };
  }

  try {
    // Verify reward exists and belongs to this business
    const reward = await db
      .select()
      .from(schema.rewards)
      .where(
        and(
          eq(schema.rewards.id, rewardId),
          eq(schema.rewards.businessId, businessId)
        )
      )
      .limit(1);

    if (!reward.length) {
      return { success: false, error: 'Reward not found' };
    }

    // Get enrollment
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
      return { success: false, error: 'Enrollment not found' };
    }

    const r = reward[0];
    const enrollmentRecord = enrollment[0];

    // Generate redemption code
    const { nanoid } = await import('nanoid');
    const redemptionCode = nanoid(8).toUpperCase();

    // Calculate expiration date
    let expiresAt = null;
    if (r.expiresDays) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + r.expiresDays);
    }

    // Create customer reward record
    await db.insert(schema.customerRewards).values({
      id: `cr_${nanoid(12)}`,
      enrollmentId: enrollmentRecord.id,
      rewardId,
      sourceType: 'rule_unlock',
      sourceId: context.ruleId,
      pointsSpent: 0, // No points spent - unlocked by rule
      status: 'available',
      redemptionCode,
      expiresAt,
    });

    return {
      success: true,
      rewardId,
      rewardName: r.name,
      redemptionCode,
      expiresAt,
    };
  } catch (error) {
    console.error('Failed to unlock reward:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

module.exports = { applyUnlockReward };
