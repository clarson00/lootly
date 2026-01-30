/**
 * Award Handlers - Main Entry Point
 *
 * Routes award application to the appropriate handler based on type.
 * Supports composable awards with AND/OR logic and location targeting.
 */

const { applyBonusPoints } = require('./bonus-points');
const { applyMultiplier } = require('./multiplier');
const { applyUnlockReward } = require('./unlock-reward');
const { applyTag } = require('./apply-tag');

/**
 * Check if awards structure requires customer choice (has OR operator)
 *
 * @param {Array|Object} awards - Awards array or composable structure
 * @returns {boolean} True if customer must choose between options
 */
function requiresChoice(awards) {
  if (!awards) return false;

  // New composable structure with operator
  if (awards.operator === 'OR' && Array.isArray(awards.groups)) {
    return awards.groups.length > 1;
  }

  return false;
}

/**
 * Check if awards are location-targeted
 *
 * @param {Array|Object} awards - Awards array or composable structure
 * @returns {boolean} True if any award group has location targeting
 */
function hasLocationTargeting(awards) {
  if (!awards) return false;

  if (awards.operator && Array.isArray(awards.groups)) {
    return awards.groups.some(g => g.locationId);
  }

  return false;
}

/**
 * Get award groups for customer display
 *
 * @param {Object} awards - Composable awards structure
 * @returns {Array} Array of groups with their awards and location info
 */
function getAwardGroups(awards) {
  if (!awards) return [];

  // Simple array - wrap in single group
  if (Array.isArray(awards)) {
    return [{ awards, locationId: null }];
  }

  // Composable structure
  if (awards.operator && Array.isArray(awards.groups)) {
    return awards.groups.map((group, index) => ({
      index,
      locationId: group.locationId || null,
      awards: group.awards || [],
    }));
  }

  return [];
}

/**
 * Apply a single award to a customer
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

/**
 * Apply all awards from an array
 *
 * @param {Array} awards - Array of award objects
 * @param {Object} context - Application context
 * @returns {Promise<Array>} Results of each award application
 */
async function applyAwardsArray(awards, context) {
  const results = [];
  for (const award of awards) {
    const result = await applyAward(award, context);
    results.push({ award, result });
  }
  return results;
}

/**
 * Apply awards from a specific group (used when customer claims OR choice)
 *
 * @param {Object} awards - Composable awards structure
 * @param {number} groupIndex - Index of the group to apply
 * @param {Object} context - Application context
 * @returns {Promise<Object>} Results including applied awards
 */
async function applyAwardGroup(awards, groupIndex, context) {
  if (!awards || !awards.groups || !awards.groups[groupIndex]) {
    return { success: false, error: 'Invalid group index' };
  }

  const group = awards.groups[groupIndex];
  const groupAwards = group.awards || [];

  // Apply all awards in the group
  const results = await applyAwardsArray(groupAwards, context);

  return {
    success: true,
    groupIndex,
    locationId: group.locationId,
    appliedAwards: results,
  };
}

/**
 * Process awards - either apply immediately or create pending choice
 *
 * @param {Array|Object} awards - Awards array or composable structure
 * @param {Object} context - Application context
 * @returns {Promise<Object>} Processing result
 */
async function processAwards(awards, context) {
  if (!awards) {
    return { success: true, applied: [], pendingChoice: false };
  }

  // Simple array - apply all immediately
  if (Array.isArray(awards)) {
    const results = await applyAwardsArray(awards, context);
    return { success: true, applied: results, pendingChoice: false };
  }

  // Composable structure
  if (awards.operator) {
    // AND operator - apply all groups
    if (awards.operator === 'AND') {
      const allResults = [];
      for (const group of (awards.groups || [])) {
        const groupAwards = group.awards || [];
        const results = await applyAwardsArray(groupAwards, context);
        allResults.push(...results);
      }
      return { success: true, applied: allResults, pendingChoice: false };
    }

    // OR operator - requires customer choice (unless only 1 group)
    if (awards.operator === 'OR') {
      const groups = awards.groups || [];

      if (groups.length === 0) {
        return { success: true, applied: [], pendingChoice: false };
      }

      if (groups.length === 1) {
        // Only one option - apply immediately
        const results = await applyAwardsArray(groups[0].awards || [], context);
        return { success: true, applied: results, pendingChoice: false };
      }

      // Multiple options - customer must choose
      return {
        success: true,
        applied: [],
        pendingChoice: true,
        awardOptions: awards,
        groups: getAwardGroups(awards),
      };
    }
  }

  // Unknown structure - try to apply as-is
  return { success: false, error: 'Unknown awards structure' };
}

module.exports = {
  applyAward,
  applyAwardsArray,
  applyAwardGroup,
  processAwards,
  requiresChoice,
  hasLocationTargeting,
  getAwardGroups,
  applyBonusPoints,
  applyMultiplier,
  applyUnlockReward,
  applyTag,
};
