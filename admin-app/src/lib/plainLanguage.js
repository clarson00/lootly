/**
 * Plain Language Utilities
 *
 * Converts rule/voyage data structures into human-readable descriptions.
 * Used by: SimulatorPage, WalkthroughDrawer, Marketing component
 */

/**
 * Get location name with icon from location ID
 */
export function getLocationName(locationId, locations = []) {
  const loc = locations.find(l => l.id === locationId);
  return loc ? `${loc.icon || ''} ${loc.name}`.trim() : locationId || 'a location';
}

/**
 * Get location group name from group ID
 */
export function getGroupName(groupId, locationGroups = []) {
  const group = locationGroups.find(g => g.id === groupId);
  return group ? group.name : groupId || 'a group';
}

/**
 * Describe a single condition in plain language
 */
export function describeCondition(condition, locations = [], locationGroups = []) {
  if (!condition) return 'No condition';

  const { type, params = {} } = condition;

  switch (type) {
    case 'location_visit':
      if (params.scope === 'all') return 'Customer visits ALL locations';
      if (params.scope === 'specific') {
        const locName = getLocationName(params.locationId, locations);
        const times = params.value || 1;
        const comparison = params.comparison || '>=';
        if (comparison === '>=' && times === 1) {
          return `Customer visits ${locName}`;
        }
        return `Customer visits ${locName} at least ${times} time${times > 1 ? 's' : ''}`;
      }
      if (params.scope === 'group') {
        const groupName = getGroupName(params.groupId, locationGroups);
        return `Customer visits any location in "${groupName}"`;
      }
      return 'Customer visits any location';

    case 'spend_amount':
      const amount = params.value || 0;
      if (params.scope === 'cumulative') return `Customer has spent $${amount} total (lifetime)`;
      return `Customer spends $${amount} in a single visit`;

    case 'day_of_week':
      const days = params.days || [];
      if (days.length === 0) return 'On specific days';
      if (days.length === 7) return 'Any day of the week';
      return `Visit happens on ${days.map(d => d.charAt(0).toUpperCase() + d.slice(1)).join(', ')}`;

    case 'time_of_day':
      return `Visit happens between ${params.startTime || '00:00'} and ${params.endTime || '23:59'}`;

    case 'date_range':
      if (params.startDate && params.endDate) {
        return `Between ${formatDate(params.startDate)} and ${formatDate(params.endDate)}`;
      }
      if (params.startDate) return `Starting from ${formatDate(params.startDate)}`;
      if (params.endDate) return `Until ${formatDate(params.endDate)}`;
      return 'Within a date range';

    case 'customer_attribute':
      const attrName = formatAttributeName(params.attribute);
      return `Customer's ${attrName} is ${formatComparison(params.comparison)} ${params.value || 0}`;

    case 'customer_tag':
      return `Customer ${params.match === 'has_not' ? 'does NOT have' : 'has'} tag "${params.tag || '...'}"`;

    case 'rule_triggered':
      return `Customer has completed another rule`;

    default:
      return type ? `${type} condition` : 'Condition being configured...';
  }
}

/**
 * Describe conditions (handles nested AND/OR operators)
 */
export function describeConditions(conditions, locations = [], locationGroups = []) {
  if (!conditions) return 'No conditions defined';

  // Handle composite conditions with operator
  if (conditions.operator) {
    const items = conditions.items || [];
    if (items.length === 0) return 'No conditions defined';

    const parts = items.map(item => describeConditions(item, locations, locationGroups));
    const connector = conditions.operator === 'AND' ? ' AND ' : ' OR ';

    if (parts.length === 1) return parts[0];
    return parts.join(connector);
  }

  // Single condition
  return describeCondition(conditions, locations, locationGroups);
}

/**
 * Describe a single award
 */
export function describeSingleAward(award) {
  if (!award) return 'No award';

  switch (award.type) {
    case 'bonus_points':
      return `${award.value || 0} bonus points`;
    case 'multiplier':
      const duration = award.duration === 'days' ? ` for ${award.durationValue || 7} days` : '';
      return `${award.value || 2}x points multiplier${duration}`;
    case 'unlock_reward':
      return `Unlock special reward${award.rewardId ? `: ${award.rewardId}` : ''}`;
    case 'apply_tag':
      const expires = award.expiresDays ? ` (expires in ${award.expiresDays} days)` : '';
      return `Apply tag "${award.tag || award.value || '...'}"${expires}`;
    default:
      return award.type || 'Award';
  }
}

/**
 * Describe awards (handles simple array and composable OR/AND structure)
 *
 * @returns {string | { type: 'choice' | 'all', groups: Array<{ label, desc, location }> }}
 */
export function describeAwards(awards, locations = []) {
  if (!awards) return 'No rewards defined';

  // Handle composable awards with operator
  if (awards.operator && awards.groups) {
    const groups = awards.groups || [];
    if (groups.length === 0) return 'No rewards defined';

    const groupDescs = groups.map((group, i) => {
      const awardsDesc = (group.awards || []).map(a => describeSingleAward(a)).join(' + ');
      const locationNote = group.locationId
        ? ` (claim at ${getLocationName(group.locationId, locations)})`
        : '';
      return {
        label: `Option ${i + 1}`,
        desc: awardsDesc || 'No rewards',
        location: locationNote
      };
    });

    return {
      type: awards.operator === 'OR' ? 'choice' : 'all',
      groups: groupDescs
    };
  }

  // Handle simple array
  if (Array.isArray(awards)) {
    if (awards.length === 0) return 'No rewards (checkpoint only)';
    return awards.map(a => describeSingleAward(a)).join(' + ');
  }

  return 'No rewards defined';
}

/**
 * Convert awards to a plain text string (flattens composable awards)
 */
export function describeAwardsAsText(awards, locations = []) {
  const result = describeAwards(awards, locations);

  if (typeof result === 'string') return result;

  // Composable awards
  const prefix = result.type === 'choice' ? 'Choose ONE: ' : 'Receive ALL: ';
  const groupTexts = result.groups.map(g => `${g.desc}${g.location}`);
  return prefix + groupTexts.join(' | ');
}

/**
 * Generate a full plain language description of a rule
 */
export function describeRule(rule, locations = [], locationGroups = []) {
  if (!rule) return null;

  const conditions = describeConditions(rule.conditions, locations, locationGroups);
  const awards = describeAwardsAsText(rule.awards, locations);

  const parts = [];

  // Main description
  parts.push(`**${rule.name || 'Untitled Rule'}**`);
  if (rule.description) parts.push(rule.description);

  // Conditions
  parts.push(`\n**When:** ${conditions}`);

  // Awards
  parts.push(`**Then:** ${awards}`);

  // Time bounds
  if (rule.startsAt || rule.endsAt) {
    let timeBound = '**Active:** ';
    if (rule.startsAt) timeBound += `From ${formatDate(rule.startsAt)}`;
    if (rule.startsAt && rule.endsAt) timeBound += ' ';
    if (rule.endsAt) timeBound += `Until ${formatDate(rule.endsAt)}`;
    parts.push(timeBound);
  }

  // Behavior
  const behaviors = [];
  if (rule.isRepeatable) {
    behaviors.push('Repeatable');
    if (rule.cooldownDays) behaviors.push(`${rule.cooldownDays} day cooldown`);
  } else {
    behaviors.push('One-time only');
  }
  if (behaviors.length > 0) {
    parts.push(`**Behavior:** ${behaviors.join(', ')}`);
  }

  return {
    name: rule.name || 'Untitled Rule',
    icon: rule.icon || '📜',
    summary: `When ${conditions.toLowerCase()}, then ${awards.toLowerCase()}`,
    full: parts.join('\n'),
    conditions,
    awards,
    isRepeatable: rule.isRepeatable,
    cooldownDays: rule.cooldownDays,
    startsAt: rule.startsAt,
    endsAt: rule.endsAt
  };
}

/**
 * Generate a full plain language description of a voyage
 */
export function describeVoyage(voyage, steps = [], locations = [], locationGroups = []) {
  if (!voyage) return null;

  const isSequential = voyage.chainType === 'sequential' || voyage.sequenceType === 'ordered';

  const stepDescriptions = steps.map((step, index) => {
    const conditions = describeConditions(step.conditions, locations, locationGroups);
    const awards = describeAwardsAsText(step.awards, locations);

    return {
      number: index + 1,
      name: step.name || `Step ${index + 1}`,
      icon: step.icon || '📍',
      conditions,
      awards,
      isCheckpoint: awards === 'No rewards (checkpoint only)'
    };
  });

  const parts = [];

  // Header
  parts.push(`**${voyage.name || voyage.voyageName || 'Untitled Voyage'}**`);
  if (voyage.description || voyage.voyageDescription) {
    parts.push(voyage.description || voyage.voyageDescription);
  }

  // Sequence type
  parts.push(`\n**Type:** ${isSequential ? 'Sequential (steps must be completed in order)' : 'Flexible (steps can be completed in any order)'}`);

  // Steps
  parts.push(`\n**Steps (${steps.length}):**`);
  stepDescriptions.forEach(step => {
    parts.push(`${step.number}. **${step.name}** - When: ${step.conditions} → Then: ${step.awards}`);
  });

  // Time bounds
  if (voyage.startsAt || voyage.endsAt) {
    let timeBound = '\n**Active:** ';
    if (voyage.startsAt) timeBound += `From ${formatDate(voyage.startsAt)}`;
    if (voyage.startsAt && voyage.endsAt) timeBound += ' ';
    if (voyage.endsAt) timeBound += `Until ${formatDate(voyage.endsAt)}`;
    parts.push(timeBound);
  }

  // Time limit
  if (voyage.timeLimitValue) {
    parts.push(`**Time Limit:** Must complete within ${voyage.timeLimitValue} ${voyage.timeLimitUnit || 'days'}`);
  }

  return {
    name: voyage.name || voyage.voyageName || 'Untitled Voyage',
    icon: voyage.icon || voyage.voyageIcon || '🗺️',
    summary: `${steps.length}-step ${isSequential ? 'sequential' : 'flexible'} voyage`,
    full: parts.join('\n'),
    steps: stepDescriptions,
    isSequential,
    stepCount: steps.length,
    startsAt: voyage.startsAt,
    endsAt: voyage.endsAt,
    timeLimitValue: voyage.timeLimitValue,
    timeLimitUnit: voyage.timeLimitUnit
  };
}

/**
 * Generate marketing-friendly description for social media
 */
export function generateMarketingSummary(type, data, locations = [], locationGroups = []) {
  if (type === 'rule') {
    const desc = describeRule(data, locations, locationGroups);
    return {
      type: 'rule',
      name: desc.name,
      icon: desc.icon,
      hook: desc.summary,
      details: desc.full,
      // Raw data for AI prompt
      conditions: desc.conditions,
      awards: desc.awards,
      isRepeatable: desc.isRepeatable,
      hasTimeLimit: !!(data.startsAt || data.endsAt)
    };
  }

  if (type === 'voyage') {
    const desc = describeVoyage(data.voyage || data, data.steps || [], locations, locationGroups);
    return {
      type: 'voyage',
      name: desc.name,
      icon: desc.icon,
      hook: desc.summary,
      details: desc.full,
      // Raw data for AI prompt
      steps: desc.steps,
      stepCount: desc.stepCount,
      isSequential: desc.isSequential,
      hasTimeLimit: !!(data.startsAt || data.endsAt || data.timeLimitValue)
    };
  }

  return null;
}

// Helper functions

function formatDate(dateStr) {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch {
    return dateStr;
  }
}

function formatComparison(comparison) {
  const map = {
    '>=': 'at least',
    '>': 'more than',
    '<=': 'at most',
    '<': 'less than',
    '==': 'exactly',
    '=': 'exactly',
    '!=': 'not'
  };
  return map[comparison] || comparison || 'at least';
}

function formatAttributeName(attr) {
  const map = {
    'lifetimePoints': 'lifetime points',
    'lifetimeSpend': 'lifetime spend',
    'pointsBalance': 'points balance',
    'visitCount': 'visit count',
    'enrollmentDate': 'enrollment date'
  };
  return map[attr] || attr || 'attribute';
}
