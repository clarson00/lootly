/**
 * Location Visit Condition Evaluator
 *
 * Evaluates conditions based on customer location visits.
 * Supports: any location, specific location, location group, all locations
 */

const { db } = require('../../../db');
const { eq, and, gte, sql, inArray } = require('drizzle-orm');
const schema = require('../../../db/schema');

/**
 * Evaluate location visit condition
 *
 * @param {Object} params - Condition parameters
 * @param {string} params.scope - 'any', 'specific', 'group', 'all'
 * @param {string} [params.locationId] - Specific location ID (when scope is 'specific')
 * @param {string} [params.locationGroupId] - Location group ID (when scope is 'group')
 * @param {string} params.comparison - '>=', '=', '<='
 * @param {number} params.value - Required visit count
 * @param {Object} context - Evaluation context
 * @param {Object} [timeWindow] - Time window modifier
 * @returns {Promise<boolean>}
 */
async function evaluateLocationVisit(params, context, timeWindow = null) {
  const { customerId, businessId } = context;
  const { scope, locationId, locationGroupId, comparison, value } = params;

  // Calculate time boundary
  const since = timeWindow ? subtractTime(new Date(), timeWindow) : null;

  let visitCount = 0;

  switch (scope) {
    case 'any':
      // Count distinct locations visited
      visitCount = await countDistinctLocations(customerId, businessId, since);
      break;

    case 'specific':
      // Count visits to a specific location
      visitCount = await countVisitsToLocation(customerId, locationId, since);
      break;

    case 'group':
      // Count distinct locations visited within a group
      visitCount = await countDistinctLocationsInGroup(customerId, locationGroupId, since);
      break;

    case 'all':
      // Check if visited ALL locations for the business
      const allVisited = await hasVisitedAllLocations(customerId, businessId, since);
      return allVisited;

    default:
      console.warn(`Unknown location visit scope: ${scope}`);
      return false;
  }

  return compare(visitCount, comparison, value);
}

/**
 * Count distinct locations a customer has visited
 */
async function countDistinctLocations(customerId, businessId, since) {
  let query = db
    .select({ count: sql`COUNT(DISTINCT ${schema.visits.locationId})` })
    .from(schema.visits)
    .innerJoin(schema.locations, eq(schema.visits.locationId, schema.locations.id))
    .where(
      and(
        eq(schema.visits.customerId, customerId),
        eq(schema.locations.businessId, businessId),
        since ? gte(schema.visits.createdAt, since) : undefined
      )
    );

  const result = await query;
  return parseInt(result[0]?.count || 0);
}

/**
 * Count visits to a specific location
 */
async function countVisitsToLocation(customerId, locationId, since) {
  let query = db
    .select({ count: sql`COUNT(*)` })
    .from(schema.visits)
    .where(
      and(
        eq(schema.visits.customerId, customerId),
        eq(schema.visits.locationId, locationId),
        since ? gte(schema.visits.createdAt, since) : undefined
      )
    );

  const result = await query;
  return parseInt(result[0]?.count || 0);
}

/**
 * Count distinct locations visited within a location group
 */
async function countDistinctLocationsInGroup(customerId, locationGroupId, since) {
  // Get location IDs in the group
  const groupMembers = await db
    .select({ locationId: schema.locationGroupMembers.locationId })
    .from(schema.locationGroupMembers)
    .where(eq(schema.locationGroupMembers.groupId, locationGroupId));

  if (groupMembers.length === 0) return 0;

  const locationIds = groupMembers.map(m => m.locationId);

  let query = db
    .select({ count: sql`COUNT(DISTINCT ${schema.visits.locationId})` })
    .from(schema.visits)
    .where(
      and(
        eq(schema.visits.customerId, customerId),
        inArray(schema.visits.locationId, locationIds),
        since ? gte(schema.visits.createdAt, since) : undefined
      )
    );

  const result = await query;
  return parseInt(result[0]?.count || 0);
}

/**
 * Check if customer has visited all locations for a business
 */
async function hasVisitedAllLocations(customerId, businessId, since) {
  // Get all active locations for the business
  const allLocations = await db
    .select({ id: schema.locations.id })
    .from(schema.locations)
    .where(
      and(
        eq(schema.locations.businessId, businessId),
        eq(schema.locations.isActive, true)
      )
    );

  if (allLocations.length === 0) return true;

  // Get locations the customer has visited
  let visitedQuery = db
    .select({ locationId: schema.visits.locationId })
    .from(schema.visits)
    .innerJoin(schema.locations, eq(schema.visits.locationId, schema.locations.id))
    .where(
      and(
        eq(schema.visits.customerId, customerId),
        eq(schema.locations.businessId, businessId),
        since ? gte(schema.visits.createdAt, since) : undefined
      )
    );

  const visited = await visitedQuery;
  const visitedIds = new Set(visited.map(v => v.locationId));

  // Check if all locations are visited
  return allLocations.every(loc => visitedIds.has(loc.id));
}

/**
 * Subtract time from a date based on time window
 */
function subtractTime(date, timeWindow) {
  const result = new Date(date);
  const { value, unit } = timeWindow;

  switch (unit) {
    case 'days':
      result.setDate(result.getDate() - value);
      break;
    case 'weeks':
      result.setDate(result.getDate() - (value * 7));
      break;
    case 'months':
      result.setMonth(result.getMonth() - value);
      break;
    default:
      result.setDate(result.getDate() - value);
  }

  return result;
}

/**
 * Compare values using comparison operator
 */
function compare(actual, comparison, expected) {
  switch (comparison) {
    case '>=':
      return actual >= expected;
    case '=':
    case '==':
      return actual === expected;
    case '<=':
      return actual <= expected;
    case '>':
      return actual > expected;
    case '<':
      return actual < expected;
    default:
      return actual >= expected;
  }
}

module.exports = { evaluateLocationVisit };
