/**
 * Plain Language Generator
 *
 * Generates human-readable descriptions of rules and conditions.
 * Optionally with pirate theme for customer-facing text.
 */

/**
 * Generate plain language description for a rule
 *
 * @param {Object} rule - Rule object
 * @param {boolean} [pirateTheme=false] - Use pirate-themed language
 * @returns {string} Human-readable description
 */
function generatePlainLanguage(rule, pirateTheme = false) {
  const conditionText = describeConditions(rule.conditions, pirateTheme);
  const awardText = describeAwards(rule.awards || [], pirateTheme);

  if (pirateTheme) {
    return `When ye ${conditionText}, ye earn ${awardText}!`;
  }

  return `When ${conditionText}, earn ${awardText}.`;
}

/**
 * Describe conditions in plain language
 */
function describeConditions(conditions, pirateTheme = false) {
  if (!conditions) return pirateTheme ? 'complete any action' : 'any action is completed';

  // Handle compound conditions
  if (conditions.operator) {
    const parts = conditions.items
      .filter(item => item.type !== 'time_window') // Skip time_window, handle separately
      .map(item => describeCondition(item, pirateTheme));

    const connector = conditions.operator === 'AND'
      ? (pirateTheme ? ' and ' : ' and ')
      : (pirateTheme ? ' or ' : ' or ');

    let text = parts.join(connector);

    // Add time window if present
    const timeWindow = conditions.items.find(item => item.type === 'time_window');
    if (timeWindow) {
      text += ` ${describeTimeWindow(timeWindow.params, pirateTheme)}`;
    }

    return text;
  }

  // Single condition
  return describeCondition(conditions, pirateTheme);
}

/**
 * Describe a single condition
 */
function describeCondition(condition, pirateTheme = false) {
  if (!condition || !condition.type) return '';

  const { type, params } = condition;

  switch (type) {
    case 'location_visit':
      return describeLocationVisit(params, pirateTheme);

    case 'spend_amount':
      return describeSpendAmount(params, pirateTheme);

    case 'product_purchase':
      return describeProductPurchase(params, pirateTheme);

    case 'day_of_week':
      return describeDayOfWeek(params, pirateTheme);

    case 'date_range':
      return describeDateRange(params, pirateTheme);

    case 'time_of_day':
      return describeTimeOfDay(params, pirateTheme);

    case 'customer_attribute':
      return describeCustomerAttribute(params, pirateTheme);

    case 'customer_tag':
      return describeCustomerTag(params, pirateTheme);

    case 'rule_triggered':
      return describeRuleTriggered(params, pirateTheme);

    case 'time_window':
      return ''; // Handled separately

    default:
      return `meet condition "${type}"`;
  }
}

function describeLocationVisit(params, pirateTheme) {
  const { scope, comparison, value } = params;
  const visits = pirateTheme ? 'drop anchor at' : 'visit';
  const locations = pirateTheme ? 'ports' : 'locations';
  const location = pirateTheme ? 'port' : 'location';

  switch (scope) {
    case 'any':
      if (value === 1) {
        return `${visits} any ${location}`;
      }
      return `${visits} ${comparisonText(comparison)} ${value} different ${locations}`;

    case 'specific':
      if (value === 1) {
        return `${visits} a specific ${location}`;
      }
      return `${visits} a specific ${location} ${comparisonText(comparison)} ${value} times`;

    case 'group':
      return `${visits} ${comparisonText(comparison)} ${value} ${locations} in a group`;

    case 'all':
      return pirateTheme
        ? `drop anchor at all ports`
        : `visit all locations`;

    default:
      return `${visits} ${locations}`;
  }
}

function describeSpendAmount(params, pirateTheme) {
  const { scope, comparison, value } = params;
  const currency = pirateTheme ? 'doubloons' : 'dollars';
  const spend = pirateTheme ? 'spend' : 'spend';

  if (scope === 'single_transaction') {
    return `${spend} ${comparisonText(comparison)} $${value} in a single ${pirateTheme ? 'purchase' : 'transaction'}`;
  }

  return `${spend} ${comparisonText(comparison)} $${value} ${pirateTheme ? 'worth of ' + currency : 'total'}`;
}

function describeProductPurchase(params, pirateTheme) {
  const { productName, productCategory, comparison, value } = params;
  const buy = pirateTheme ? 'procure' : 'purchase';

  if (productName) {
    return `${buy} ${comparisonText(comparison)} ${value} "${productName}"`;
  }

  if (productCategory) {
    return `${buy} ${comparisonText(comparison)} ${value} items from "${productCategory}"`;
  }

  return `${buy} specific products`;
}

function describeDayOfWeek(params, pirateTheme) {
  const { days } = params;

  if (!days || days.length === 0) return '';

  if (days.includes('weekends')) {
    return pirateTheme ? 'on the weekend' : 'on weekends';
  }

  if (days.includes('weekdays')) {
    return pirateTheme ? 'on a weekday' : 'on weekdays';
  }

  const dayList = days.map(d => d.charAt(0).toUpperCase() + d.slice(1)).join(', ');
  return `on ${dayList}`;
}

function describeDateRange(params, pirateTheme) {
  const { startDate, endDate } = params;

  if (startDate && endDate) {
    return `between ${formatDate(startDate)} and ${formatDate(endDate)}`;
  }

  if (startDate) {
    return `after ${formatDate(startDate)}`;
  }

  if (endDate) {
    return `before ${formatDate(endDate)}`;
  }

  return '';
}

function describeTimeOfDay(params, pirateTheme) {
  const { startTime, endTime } = params;

  if (!startTime || !endTime) return '';

  return `between ${formatTime(startTime)} and ${formatTime(endTime)}`;
}

function describeTimeWindow(params, pirateTheme) {
  const { value, unit } = params;
  return `within ${value} ${unit}`;
}

function describeCustomerAttribute(params, pirateTheme) {
  const { attribute, comparison, value } = params;

  const attrMap = {
    membership_age_days: pirateTheme ? 'crew member for' : 'a member for',
    tier: 'at tier',
    lifetime_spend: pirateTheme ? 'spent in total' : 'spent lifetime',
    lifetime_points: pirateTheme ? 'earned doubloons' : 'earned points',
    visit_count: pirateTheme ? 'made voyages' : 'visited',
    points_balance: pirateTheme ? 'have doubloons' : 'have points',
  };

  const attrText = attrMap[attribute] || attribute;

  if (attribute === 'tier') {
    return `${pirateTheme ? 'ye be' : 'you are'} ${attrText} "${value}"`;
  }

  return `${pirateTheme ? 'ye' : 'you'} ${attrText} ${comparisonText(comparison)} ${value}`;
}

function describeCustomerTag(params, pirateTheme) {
  const { tag, tags, match } = params;
  const tagList = tags || [tag];

  switch (match) {
    case 'has':
    case 'has_all':
      return `${pirateTheme ? 'ye have' : 'you have'} the "${tagList.join('", "')}" ${tagList.length > 1 ? 'badges' : 'badge'}`;
    case 'has_not':
      return `${pirateTheme ? 'ye don\'t have' : 'you don\'t have'} the "${tagList.join('", "')}" badge`;
    case 'has_any':
      return `${pirateTheme ? 'ye have' : 'you have'} any of: "${tagList.join('", "')}"`;
    default:
      return `have tag "${tag}"`;
  }
}

function describeRuleTriggered(params, pirateTheme) {
  const { ruleIds, match } = params;
  const count = ruleIds.length;
  const quest = pirateTheme ? 'quest' : 'rule';
  const quests = pirateTheme ? 'quests' : 'rules';

  switch (match) {
    case 'all':
      return `complete all ${count} ${quests}`;
    case 'any':
      return `complete any of ${count} ${quests}`;
    case 'at_least':
      return `complete at least ${params.atLeastCount || 1} ${quests}`;
    default:
      return `complete ${count} ${quests}`;
  }
}

/**
 * Describe awards in plain language
 */
function describeAwards(awards, pirateTheme = false) {
  if (!awards) {
    return pirateTheme ? 'treasure' : 'rewards';
  }

  // Handle composable awards structure (OR/AND groups)
  if (awards.operator && awards.groups) {
    const groupDescriptions = awards.groups.map(group => {
      const awardsDesc = group.awards && group.awards.length > 0
        ? group.awards.map(a => describeAward(a, pirateTheme)).join(' + ')
        : (pirateTheme ? 'treasure' : 'rewards');

      if (group.locationId) {
        return `(${awardsDesc} at specific location)`;
      }
      return awardsDesc;
    });

    if (awards.operator === 'OR') {
      return groupDescriptions.join(' OR ');
    }
    return groupDescriptions.join(' + ');
  }

  // Handle simple array format
  if (!Array.isArray(awards) || awards.length === 0) {
    return pirateTheme ? 'treasure' : 'rewards';
  }

  const parts = awards.map(award => describeAward(award, pirateTheme));
  return parts.join(' + ');
}

function describeAward(award, pirateTheme) {
  const { type, value, tag, rewardId } = award;
  const points = pirateTheme ? 'doubloons' : 'points';

  switch (type) {
    case 'bonus_points':
      return `${value} bonus ${points}`;

    case 'multiplier':
      return `${value}x ${points} multiplier`;

    case 'unlock_reward':
      return pirateTheme ? 'unlock special loot' : 'unlock a reward';

    case 'apply_tag':
      return pirateTheme ? `the "${tag || value}" badge` : `"${tag || value}" tag`;

    default:
      return pirateTheme ? 'treasure' : 'reward';
  }
}

/**
 * Helper functions
 */
function comparisonText(comparison) {
  switch (comparison) {
    case '>=':
      return 'at least';
    case '=':
    case '==':
      return 'exactly';
    case '<=':
      return 'at most';
    case '>':
      return 'more than';
    case '<':
      return 'less than';
    default:
      return 'at least';
  }
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatTime(timeStr) {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

/**
 * Generate a complete rule description
 * @param {Object} rule - The rule object
 * @param {Array} locations - Array of location objects for name resolution
 * @param {Array} locationGroups - Array of location group objects
 * @returns {string} Human-readable rule description
 */
function describeRule(rule, locations = [], locationGroups = []) {
  const parts = [];

  // Rule name
  const name = rule.displayName || rule.name || 'Unnamed Rule';
  parts.push(`**${name}**`);

  // Conditions
  const conditionsText = describeConditionsWithLocations(rule.conditions, locations, locationGroups);
  if (conditionsText) {
    parts.push(`When: ${conditionsText}`);
  }

  // Awards
  const awardsText = describeAwardsWithLocations(rule.awards, locations);
  if (awardsText) {
    parts.push(`Earn: ${awardsText}`);
  }

  // Time constraints
  if (rule.startsAt || rule.endsAt) {
    const timeText = describeDateRange({ startDate: rule.startsAt, endDate: rule.endsAt });
    if (timeText) {
      parts.push(`Active: ${timeText}`);
    }
  }

  // Repeatability
  if (rule.isRepeatable) {
    parts.push(`Can be earned ${rule.cooldownDays ? `every ${rule.cooldownDays} days` : 'multiple times'}`);
  } else {
    parts.push('One-time only');
  }

  return parts.join('\n');
}

/**
 * Generate a complete voyage description
 * @param {Object} voyage - The voyage/ruleset object
 * @param {Array} steps - Array of rule objects (voyage steps)
 * @param {Array} locations - Array of location objects
 * @param {Array} locationGroups - Array of location group objects
 * @returns {string} Human-readable voyage description
 */
function describeVoyage(voyage, steps = [], locations = [], locationGroups = []) {
  const parts = [];

  // Voyage name
  const name = voyage.displayName || voyage.name || 'Unnamed Voyage';
  parts.push(`**${name}**`);

  // Tagline
  if (voyage.tagline) {
    parts.push(`_${voyage.tagline}_`);
  }

  // Description
  if (voyage.description) {
    parts.push(voyage.description);
  }

  // Steps
  if (steps && steps.length > 0) {
    parts.push('');
    parts.push(`**${steps.length} Steps to Complete:**`);

    steps
      .sort((a, b) => (a.sequenceOrder || 0) - (b.sequenceOrder || 0))
      .forEach((step, index) => {
        const stepName = step.displayName || step.name || `Step ${index + 1}`;
        const conditionsText = describeConditionsWithLocations(step.conditions, locations, locationGroups);
        const awardsText = describeAwardsWithLocations(step.awards, locations);

        parts.push(`${index + 1}. **${stepName}**`);
        if (conditionsText) {
          parts.push(`   Do: ${conditionsText}`);
        }
        if (awardsText) {
          parts.push(`   Earn: ${awardsText}`);
        }
      });
  }

  // Time limit
  if (voyage.timeLimitValue && voyage.timeLimitUnit) {
    parts.push('');
    parts.push(`⏰ Complete within ${voyage.timeLimitValue} ${voyage.timeLimitUnit}`);
  }

  // Active dates
  if (voyage.startsAt || voyage.endsAt) {
    const timeText = describeDateRange({ startDate: voyage.startsAt, endDate: voyage.endsAt });
    if (timeText) {
      parts.push(`Active: ${timeText}`);
    }
  }

  return parts.join('\n');
}

/**
 * Generate marketing-ready content from a rule or voyage
 * @param {string} type - 'rule' or 'voyage'
 * @param {Object} data - The rule or voyage object (with steps for voyage)
 * @param {Array} locations - Array of location objects
 * @param {Array} locationGroups - Array of location group objects
 * @param {string} businessName - The business name to include
 * @returns {string} Marketing-ready post content
 */
function generateMarketingSummary(type, data, locations = [], locationGroups = [], businessName = '') {
  const parts = [];

  // Header with emoji and promo name
  const name = data.displayName || data.name || 'Special Offer';
  parts.push(`🏴‍☠️ ${name.toUpperCase()} 🏴‍☠️`);
  parts.push('');

  // Extract location info from conditions (includes AND/OR logic)
  const locationInfo = extractLocationInfo(data.conditions, locations, locationGroups);

  if (type === 'rule') {
    // Show where this applies with AND/OR logic
    if (locationInfo.names.length > 0) {
      if (locationInfo.requireAll) {
        // Must visit ALL locations
        parts.push(`📍 Visit ALL ${locationInfo.names.length} locations to qualify:`);
        locationInfo.names.forEach(name => parts.push(`   • ${name}`));
      } else if (locationInfo.names.length === 1) {
        parts.push(`📍 Visit us at: ${locationInfo.names[0]}`);
      } else {
        // Can visit ANY location
        parts.push(`📍 Visit ANY of our locations:`);
        locationInfo.names.slice(0, 5).forEach(name => parts.push(`   • ${name}`));
        if (locationInfo.names.length > 5) {
          parts.push(`   • ...and ${locationInfo.names.length - 5} more!`);
        }
      }
    } else if (locations.length > 0) {
      // Show all locations if no specific ones in conditions
      parts.push(`📍 Available at any of our locations:`);
      locations.slice(0, 5).forEach(loc => parts.push(`   • ${loc.name}`));
      if (locations.length > 5) {
        parts.push(`   • ...and ${locations.length - 5} more!`);
      }
    }
    parts.push('');

    // Describe what you earn with AND/OR logic
    const awardsText = describeAwardsForMarketing(data.awards, locations, data.awardType, data.awardValue, data.rewardName);
    if (awardsText) {
      parts.push(awardsText);
    }

    parts.push('');
  } else if (type === 'voyage') {
    // Voyage-based marketing content
    if (data.tagline) {
      parts.push(`⚓ ${data.tagline}`);
      parts.push('');
    }

    if (data.description) {
      parts.push(data.description);
      parts.push('');
    }

    // Show steps summary with location names
    const steps = data.steps || [];
    if (steps.length > 0) {
      parts.push(`🗺️ Complete ${steps.length} stops to claim your treasure!`);
      parts.push('');

      // Show first few steps with locations
      steps.slice(0, 4).forEach((step, index) => {
        const stepName = step.displayName || step.name || `Stop ${index + 1}`;
        const stepLocations = extractLocationNames(step.conditions, locations, locationGroups);
        const locationHint = stepLocations.length > 0 ? ` @ ${stepLocations[0]}` : '';
        parts.push(`${index + 1}. ${stepName}${locationHint}`);
      });

      if (steps.length > 4) {
        parts.push(`   ...and ${steps.length - 4} more stops!`);
      }
      parts.push('');
    }
  }

  // Time bounds
  const timeInfo = [];
  if (data.startsAt) {
    const startDate = new Date(data.startsAt);
    if (startDate > new Date()) {
      timeInfo.push(`Starts ${formatDate(data.startsAt)}`);
    }
  }
  if (data.endsAt) {
    timeInfo.push(`Ends ${formatDate(data.endsAt)}`);
  }
  if (timeInfo.length > 0) {
    parts.push(`⏰ ${timeInfo.join(' • ')}`);
    parts.push('');
  }

  // CTA with business name
  if (businessName) {
    parts.push(`Join ${businessName}'s rewards program and start earning today! 🏆`);
  } else {
    parts.push('Join our rewards program and start earning today! 🏆');
  }
  parts.push('');

  // Hashtags
  const hashtags = ['#Rewards', '#LocalLoyalty', '#EarnRewards'];
  if (businessName) {
    const businessTag = businessName.replace(/[^a-zA-Z0-9]/g, '');
    if (businessTag) hashtags.unshift(`#${businessTag}`);
  }
  parts.push(hashtags.join(' '));

  return parts.join('\n');
}

/**
 * Extract location info from conditions
 * Returns { names: [...], requireAll: boolean }
 */
function extractLocationInfo(conditions, locations = [], locationGroups = []) {
  const names = [];
  let requireAll = false;

  if (!conditions) return { names, requireAll };

  function extractFromCondition(cond, parentOperator = null) {
    if (!cond) return;

    if (cond.operator && cond.items) {
      // Track if we have AND at the top level with multiple location conditions
      cond.items.forEach(item => extractFromCondition(item, cond.operator));
      return;
    }

    if (cond.type === 'location_visit' && cond.params) {
      const { scope, locationId, locationGroupId, comparison, value } = cond.params;

      if (scope === 'all') {
        // Must visit ALL locations
        requireAll = true;
        locations.forEach(loc => names.push(loc.name));
      } else if (scope === 'any') {
        // Can visit any location
        requireAll = false;
        locations.forEach(loc => names.push(loc.name));
      } else if (scope === 'specific' && locationId) {
        const location = locations.find(l => l.id === locationId);
        if (location) {
          names.push(location.name);
        }
      } else if (scope === 'group' && locationGroupId) {
        const group = locationGroups.find(g => g.id === locationGroupId);
        if (group) {
          names.push(`${group.name} locations`);
        }
      }

      // Check if comparison requires multiple visits
      if (comparison === 'gte' && value > 1) {
        requireAll = true;
      }
    }
  }

  extractFromCondition(conditions);
  return { names: [...new Set(names)], requireAll };
}

// Keep old function name for backward compatibility
function extractLocationNames(conditions, locations = [], locationGroups = []) {
  return extractLocationInfo(conditions, locations, locationGroups).names;
}

/**
 * Describe awards in a marketing-friendly way
 * Handles both new composable format and legacy awardType/awardValue format
 */
function describeAwardsForMarketing(awards, locations = [], legacyAwardType = null, legacyAwardValue = null, rewardName = null) {
  // Handle legacy format first
  if (legacyAwardType && legacyAwardValue) {
    return `🎁 Earn: ${describeLegacyAward(legacyAwardType, legacyAwardValue, rewardName)}`;
  }

  if (!awards) return '';

  // Handle composable awards with OR choices (pick one)
  if (awards.operator === 'OR' && awards.groups) {
    const hasLocationSpecific = awards.groups.some(g => g.locationId);

    if (hasLocationSpecific) {
      // Different locations offer different rewards
      const lines = ['🎁 CHOOSE YOUR REWARD:'];
      awards.groups.forEach(group => {
        const awardDescs = (group.awards || []).map(a => describeAwardMarketing(a)).filter(Boolean);
        const desc = awardDescs.length > 0 ? awardDescs.join(' + ') : 'special rewards';
        if (group.locationId) {
          const loc = locations.find(l => l.id === group.locationId);
          lines.push(`   • ${loc ? loc.name : 'Location'}: ${desc}`);
        } else {
          lines.push(`   • ${desc}`);
        }
      });
      return lines.join('\n');
    } else {
      // Same location, choose between rewards
      const options = awards.groups.map(group => {
        const awardDescs = (group.awards || []).map(a => describeAwardMarketing(a)).filter(Boolean);
        return awardDescs.length > 0 ? awardDescs.join(' + ') : 'special rewards';
      });
      return `🎁 CHOOSE YOUR REWARD:\n   • ${options.join('\n   • ')}`;
    }
  }

  // Handle AND awards (get all of them - stacked!)
  if (awards.operator === 'AND' && awards.groups) {
    const hasLocationSpecific = awards.groups.some(g => g.locationId);

    if (hasLocationSpecific) {
      // Different locations each give rewards (stacked)
      const lines = ['🎁 EARN AT EACH LOCATION:'];
      awards.groups.forEach(group => {
        const awardDescs = (group.awards || []).map(a => describeAwardMarketing(a)).filter(Boolean);
        const desc = awardDescs.length > 0 ? awardDescs.join(' + ') : 'special rewards';
        if (group.locationId) {
          const loc = locations.find(l => l.id === group.locationId);
          lines.push(`   • ${loc ? loc.name : 'Location'}: ${desc}`);
        } else {
          lines.push(`   • ${desc}`);
        }
      });
      lines.push('');
      lines.push('✨ Complete them all for STACKED rewards!');
      return lines.join('\n');
    } else {
      // Stacked rewards at same location
      const allRewards = awards.groups.flatMap(g => g.awards || []);
      const awardDescs = allRewards.map(a => describeAwardMarketing(a)).filter(Boolean);
      const desc = awardDescs.length > 0 ? awardDescs.join(' + ') : 'special rewards';
      return `🎁 STACKED REWARDS: ${desc}`;
    }
  }

  // Handle simple array
  if (Array.isArray(awards) && awards.length > 0) {
    const awardDescs = awards.map(a => describeAwardMarketing(a)).filter(Boolean);
    if (awardDescs.length === 0) return '';
    if (awardDescs.length === 1) {
      return `🎁 Earn: ${awardDescs[0]}`;
    }
    return `🎁 Earn: ${awardDescs.join(' + ')}`;
  }

  return '';
}

/**
 * Describe a single award for marketing
 */
function describeAwardMarketing(award) {
  if (!award) return null;

  const { type, value, rewardId, rewardName } = award;

  // Skip if no type defined
  if (!type) return null;

  switch (type) {
    case 'points':
    case 'bonus_points':
      return `${value || 0} bonus doubloons`;
    case 'points_per_dollar':
      return `${value || 1}x points per dollar`;
    case 'multiplier':
    case 'points_multiplier':
      return `${value || 2}x points multiplier`;
    case 'reward':
    case 'unlock_reward':
      // Use rewardName if available (enriched from DB lookup), otherwise fall back to rewardId
      if (rewardName) return `🎁 ${rewardName}`;
      if (rewardId) return `🎁 ${rewardId}`;
      return 'a special reward';
    case 'tag':
    case 'add_tag':
      return 'VIP status';
    default:
      return null;
  }
}

/**
 * Describe legacy award format (awardType/awardValue)
 * @param {string} awardType - The type of award
 * @param {string} awardValue - The value or ID of the award
 * @param {string} rewardName - Optional: the looked-up reward name
 */
function describeLegacyAward(awardType, awardValue, rewardName = null) {
  switch (awardType) {
    case 'points':
      return `${awardValue} bonus doubloons`;
    case 'points_per_dollar':
      return `${awardValue}x points per dollar`;
    case 'multiplier':
      return `${awardValue}x points multiplier`;
    case 'reward':
      return rewardName ? `🎁 ${rewardName}` : 'a special reward';
    case 'tag':
      return 'VIP status earned!';
    default:
      return 'special rewards';
  }
}

/**
 * Enhanced condition description with location name resolution
 */
function describeConditionsWithLocations(conditions, locations = [], locationGroups = [], marketing = false) {
  if (!conditions) return '';

  // Handle compound conditions
  if (conditions.operator) {
    const parts = conditions.items
      .filter(item => item.type !== 'time_window')
      .map(item => describeConditionWithLocations(item, locations, locationGroups, marketing));

    const connector = conditions.operator === 'AND' ? ' and ' : ' or ';
    let text = parts.filter(p => p).join(connector);

    // Add time window
    const timeWindow = conditions.items.find(item => item.type === 'time_window');
    if (timeWindow) {
      text += ` ${describeTimeWindow(timeWindow.params)}`;
    }

    return text;
  }

  return describeConditionWithLocations(conditions, locations, locationGroups, marketing);
}

function describeConditionWithLocations(condition, locations = [], locationGroups = [], marketing = false) {
  if (!condition || !condition.type) return '';

  const { type, params } = condition;

  // Handle location-based conditions with name resolution
  if (type === 'location_visit' && params) {
    const { scope, locationId, locationGroupId, comparison, value } = params;

    if (scope === 'specific' && locationId) {
      const location = locations.find(l => l.id === locationId);
      const locationName = location ? `${location.icon || ''} ${location.name}`.trim() : 'a specific location';
      return marketing
        ? `Visit ${locationName}`
        : `visit ${locationName}${value > 1 ? ` ${comparisonText(comparison)} ${value} times` : ''}`;
    }

    if (scope === 'group' && locationGroupId) {
      const group = locationGroups.find(g => g.id === locationGroupId);
      const groupName = group ? group.name : 'a location group';
      return `visit ${comparisonText(comparison)} ${value} locations in ${groupName}`;
    }
  }

  // Fall back to original description
  return describeCondition(condition, marketing);
}

/**
 * Enhanced awards description with location name resolution
 */
function describeAwardsWithLocations(awards, locations = [], marketing = false) {
  if (!awards) return '';

  // Handle composable awards with location targeting
  if (awards.operator && awards.groups) {
    const groupDescriptions = awards.groups.map(group => {
      const awardsDesc = group.awards && group.awards.length > 0
        ? group.awards.map(a => describeAward(a, marketing)).join(' + ')
        : 'rewards';

      if (group.locationId) {
        const location = locations.find(l => l.id === group.locationId);
        const locationName = location ? location.name : 'specific location';
        return `${awardsDesc} at ${locationName}`;
      }

      return awardsDesc;
    });

    if (awards.operator === 'OR') {
      return marketing
        ? `Choose from: ${groupDescriptions.join(' OR ')}`
        : groupDescriptions.join(' OR ');
    }
    return groupDescriptions.join(' + ');
  }

  // Handle simple array
  if (Array.isArray(awards) && awards.length > 0) {
    return awards.map(a => describeAward(a, marketing)).join(' + ');
  }

  return '';
}

module.exports = {
  generatePlainLanguage,
  describeConditions,
  describeAwards,
  describeRule,
  describeVoyage,
  generateMarketingSummary,
};
