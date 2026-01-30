/**
 * Time of Day Condition Evaluator
 *
 * Evaluates conditions based on the current time of day.
 * Useful for happy hour promotions, lunch specials, etc.
 */

/**
 * Evaluate time of day condition
 *
 * @param {Object} params - Condition parameters
 * @param {string} params.startTime - Start time in HH:MM format (24-hour)
 * @param {string} params.endTime - End time in HH:MM format (24-hour)
 * @param {Object} context - Evaluation context
 * @returns {boolean}
 */
function evaluateTimeOfDay(params, context) {
  const { startTime, endTime } = params;

  if (!startTime || !endTime) {
    return true; // No restriction
  }

  // Get current time in the business timezone
  const now = new Date();
  const timezone = context.timezone || 'America/New_York';

  const currentTime = now.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    timeZone: timezone,
  });

  // Convert times to minutes for easier comparison
  const currentMinutes = timeToMinutes(currentTime);
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);

  // Handle overnight ranges (e.g., 22:00 to 02:00)
  if (startMinutes > endMinutes) {
    // Current time is either after start OR before end
    return currentMinutes >= startMinutes || currentMinutes <= endMinutes;
  }

  // Normal range (e.g., 11:00 to 14:00)
  return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
}

/**
 * Convert HH:MM time string to minutes since midnight
 */
function timeToMinutes(timeStr) {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

module.exports = { evaluateTimeOfDay };
