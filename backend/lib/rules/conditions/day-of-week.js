/**
 * Day of Week Condition Evaluator
 *
 * Evaluates conditions based on the current day of the week.
 */

/**
 * Evaluate day of week condition
 *
 * @param {Object} params - Condition parameters
 * @param {string[]} params.days - Array of days to match
 *        e.g., ['monday', 'tuesday'] or ['saturday', 'sunday']
 * @param {Object} context - Evaluation context
 * @returns {boolean}
 */
function evaluateDayOfWeek(params, context) {
  const { days } = params;

  if (!days || days.length === 0) {
    return true; // No restriction
  }

  // Get current day name
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    timeZone: context.timezone || 'America/New_York',
  }).toLowerCase();

  // Normalize day names to lowercase for comparison
  const normalizedDays = days.map(d => d.toLowerCase());

  // Handle special values like 'weekdays' and 'weekends'
  if (normalizedDays.includes('weekends')) {
    return today === 'saturday' || today === 'sunday';
  }

  if (normalizedDays.includes('weekdays')) {
    return !['saturday', 'sunday'].includes(today);
  }

  return normalizedDays.includes(today);
}

module.exports = { evaluateDayOfWeek };
