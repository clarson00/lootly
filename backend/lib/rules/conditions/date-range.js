/**
 * Date Range Condition Evaluator
 *
 * Evaluates conditions based on whether the current date falls within a range.
 */

/**
 * Evaluate date range condition
 *
 * @param {Object} params - Condition parameters
 * @param {string} [params.startDate] - Start date (ISO string or YYYY-MM-DD)
 * @param {string} [params.endDate] - End date (ISO string or YYYY-MM-DD)
 * @param {Object} context - Evaluation context
 * @returns {boolean}
 */
function evaluateDateRange(params, context) {
  const { startDate, endDate } = params;
  const now = new Date();

  if (startDate) {
    const start = new Date(startDate);
    // Set to start of day
    start.setHours(0, 0, 0, 0);
    if (now < start) {
      return false;
    }
  }

  if (endDate) {
    const end = new Date(endDate);
    // Set to end of day
    end.setHours(23, 59, 59, 999);
    if (now > end) {
      return false;
    }
  }

  return true;
}

module.exports = { evaluateDateRange };
