/**
 * Time Window Condition
 *
 * This is a modifier condition that affects other conditions.
 * It always returns true - the actual time window is extracted
 * and applied to sibling conditions in the evaluator.
 */

/**
 * Evaluate time window condition (always true - it's a modifier)
 *
 * @param {Object} params - Condition parameters
 * @param {number} params.value - Time value
 * @param {string} params.unit - Time unit: 'days', 'weeks', 'months'
 * @param {Object} context - Evaluation context
 * @returns {boolean}
 */
function evaluateTimeWindow(params, context) {
  // Time window is a modifier, not a standalone condition
  // It's extracted by the evaluator and applied to other conditions
  return true;
}

module.exports = { evaluateTimeWindow };
