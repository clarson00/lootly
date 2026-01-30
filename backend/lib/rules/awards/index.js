/**
 * Award Handlers - Main Entry Point
 *
 * Routes award application to the appropriate handler based on type.
 */

const { applyBonusPoints } = require('./bonus-points');
const { applyMultiplier } = require('./multiplier');
const { applyUnlockReward } = require('./unlock-reward');
const { applyTag } = require('./apply-tag');

/**
 * Apply an award to a customer
 *
 * @param {Object} award - Award object
 * @param {string} award.type - Award type: 'bonus_points', 'multiplier', 'unlock_reward', 'apply_tag'
 * @param {*} award.value - Award value (varies by type)
 * @param {Object} context - Application context
 * @returns {Promise<Object>} Result of award application
 */
async function applyAward(award, context) {
  if (!award || !award.type) {
    return { success: false, error: 'Invalid award' };
  }

  switch (award.type) {
    case 'bonus_points':
      return await applyBonusPoints(award, context);

    case 'multiplier':
      return await applyMultiplier(award, context);

    case 'unlock_reward':
      return await applyUnlockReward(award, context);

    case 'apply_tag':
      return await applyTag(award, context);

    // Legacy award types
    case 'points':
      return await applyBonusPoints({ ...award, value: parseInt(award.value) }, context);

    case 'points_per_dollar':
      // This is handled during transaction processing, not as a post-trigger award
      return { success: true, note: 'Handled during transaction processing' };

    case 'reward':
      return await applyUnlockReward({ ...award, rewardId: award.value }, context);

    default:
      console.warn(`Unknown award type: ${award.type}`);
      return { success: false, error: `Unknown award type: ${award.type}` };
  }
}

module.exports = {
  applyAward,
  applyBonusPoints,
  applyMultiplier,
  applyUnlockReward,
  applyTag,
};
