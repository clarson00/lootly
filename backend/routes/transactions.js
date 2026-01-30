const express = require('express');
const router = express.Router();
const { db, generateId } = require('../db/database');
const { authenticateCustomer } = require('../middleware/auth');

// All routes require customer authentication
router.use(authenticateCustomer);

// POST /api/transactions/check-in - Record a customer check-in
// Note: This is typically called by staff app, but can be used for self-check-in
router.post('/check-in', (req, res) => {
  const { location_id, spend_amount } = req.body;
  const customerId = req.customer.id;

  if (!location_id) {
    return res.status(400).json({
      success: false,
      error: { code: 'MISSING_LOCATION', message: 'location_id is required' }
    });
  }

  // Get location and its business
  const location = db.prepare(`
    SELECT l.*, b.id as business_id
    FROM locations l
    JOIN businesses b ON l.business_id = b.id
    WHERE l.id = ? AND l.is_active = 1
  `).get(location_id);

  if (!location) {
    return res.status(404).json({
      success: false,
      error: { code: 'LOCATION_NOT_FOUND', message: 'Location not found' }
    });
  }

  // Get or create enrollment
  let enrollment = db.prepare(`
    SELECT * FROM enrollments
    WHERE customer_id = ? AND business_id = ?
  `).get(customerId, location.business_id);

  if (!enrollment) {
    const enrollmentId = generateId('enroll');
    db.prepare(`
      INSERT INTO enrollments (id, customer_id, business_id)
      VALUES (?, ?, ?)
    `).run(enrollmentId, customerId, location.business_id);
    enrollment = db.prepare('SELECT * FROM enrollments WHERE id = ?').get(enrollmentId);
  }

  // Calculate points based on earning rules
  const earningRules = db.prepare(`
    SELECT * FROM earning_rules
    WHERE business_id = ? AND is_active = 1
  `).all(location.business_id);

  let pointsEarned = 0;
  const amount = parseFloat(spend_amount) || 0;

  for (const rule of earningRules) {
    if (rule.type === 'spend' && amount > 0) {
      pointsEarned += Math.floor(amount * rule.points_per_dollar);
    } else if (rule.type === 'visit') {
      pointsEarned += rule.points_per_visit || 0;
    }
  }

  // Apply multiplier
  pointsEarned = Math.floor(pointsEarned * enrollment.points_multiplier);

  // Record visit
  const visitId = generateId('visit');
  db.prepare(`
    INSERT INTO visits (id, customer_id, location_id, spend_amount, points_earned)
    VALUES (?, ?, ?, ?, ?)
  `).run(visitId, customerId, location_id, amount, pointsEarned);

  // Update enrollment
  db.prepare(`
    UPDATE enrollments
    SET points_balance = points_balance + ?,
        total_points_earned = total_points_earned + ?,
        total_spend = total_spend + ?
    WHERE id = ?
  `).run(pointsEarned, pointsEarned, amount, enrollment.id);

  // Check for milestone rules
  const milestonesUnlocked = checkMilestones(customerId, location.business_id, enrollment.id);

  // Get updated balance
  const updatedEnrollment = db.prepare('SELECT * FROM enrollments WHERE id = ?').get(enrollment.id);

  res.json({
    success: true,
    data: {
      transaction: {
        id: visitId,
        location_id,
        location_name: location.name,
        location_icon: location.icon,
        spend_amount: amount,
        points_earned: pointsEarned
      },
      new_balance: updatedEnrollment.points_balance,
      new_multiplier: updatedEnrollment.points_multiplier,
      milestones_unlocked: milestonesUnlocked
    }
  });
});

// GET /api/transactions/history - Get transaction history
router.get('/history', (req, res) => {
  const { business_id } = req.query;
  const customerId = req.customer.id;

  let query = `
    SELECT v.*, l.name as location_name, l.icon as location_icon, l.business_id
    FROM visits v
    JOIN locations l ON v.location_id = l.id
    WHERE v.customer_id = ?
  `;
  const params = [customerId];

  if (business_id) {
    query += ' AND l.business_id = ?';
    params.push(business_id);
  }

  query += ' ORDER BY v.created_at DESC LIMIT 50';

  const transactions = db.prepare(query).all(...params);

  res.json({
    success: true,
    data: {
      transactions
    }
  });
});

// Helper function to check and trigger milestone rules
function checkMilestones(customerId, businessId, enrollmentId) {
  const triggered = [];

  // Get all active rules for this business
  const rules = db.prepare(`
    SELECT * FROM rules
    WHERE business_id = ? AND is_active = 1
  `).all(businessId);

  for (const rule of rules) {
    // Check if already triggered (for non-repeatable rules)
    if (!rule.is_repeatable) {
      const existingTrigger = db.prepare(`
        SELECT id FROM customer_rule_triggers
        WHERE customer_id = ? AND rule_id = ?
      `).get(customerId, rule.id);

      if (existingTrigger) continue;
    }

    // Check cooldown
    if (rule.cooldown_days) {
      const lastTrigger = db.prepare(`
        SELECT triggered_at FROM customer_rule_triggers
        WHERE customer_id = ? AND rule_id = ?
        ORDER BY triggered_at DESC
        LIMIT 1
      `).get(customerId, rule.id);

      if (lastTrigger) {
        const cooldownEnd = new Date(lastTrigger.triggered_at);
        cooldownEnd.setDate(cooldownEnd.getDate() + rule.cooldown_days);
        if (new Date() < cooldownEnd) continue;
      }
    }

    // Evaluate rule conditions
    const conditions = JSON.parse(rule.conditions);
    const result = evaluateConditions(conditions, customerId, businessId);

    if (result) {
      // Trigger the rule
      const triggerId = generateId('trigger');

      // Apply award
      let awardGiven = '';
      if (rule.award_type === 'points') {
        const points = parseInt(rule.award_value);
        db.prepare(`
          UPDATE enrollments
          SET points_balance = points_balance + ?,
              total_points_earned = total_points_earned + ?
          WHERE id = ?
        `).run(points, points, enrollmentId);
        awardGiven = `${points} points`;
      } else if (rule.award_type === 'reward') {
        // Unlock the reward
        const rewardId = rule.award_value;
        const reward = db.prepare('SELECT * FROM rewards WHERE id = ?').get(rewardId);

        if (reward) {
          const customerRewardId = generateId('cr');
          const redemptionCode = `RED_${generateId('')}`;
          db.prepare(`
            INSERT INTO customer_rewards (id, customer_id, reward_id, redemption_code)
            VALUES (?, ?, ?, ?)
          `).run(customerRewardId, customerId, rewardId, redemptionCode);

          // If milestone has multiplier, apply it
          if (reward.milestone_bonus_multiplier) {
            db.prepare(`
              UPDATE enrollments
              SET points_multiplier = ?
              WHERE id = ?
            `).run(reward.milestone_bonus_multiplier, enrollmentId);
          }

          awardGiven = reward.name;
          triggered.push({
            rule_id: rule.id,
            rule_name: rule.name,
            award_type: 'reward',
            reward_id: rewardId,
            reward_name: reward.name,
            reward_icon: reward.icon,
            reward_value: reward.dollar_value
          });
        }
      } else if (rule.award_type === 'multiplier') {
        const multiplier = parseFloat(rule.award_value);
        db.prepare(`
          UPDATE enrollments
          SET points_multiplier = ?
          WHERE id = ?
        `).run(multiplier, enrollmentId);
        awardGiven = `${multiplier}x multiplier`;
      }

      // Record the trigger
      db.prepare(`
        INSERT INTO customer_rule_triggers (id, customer_id, rule_id, award_given)
        VALUES (?, ?, ?, ?)
      `).run(triggerId, customerId, rule.id, awardGiven);
    }
  }

  return triggered;
}

// Evaluate rule conditions recursively
function evaluateConditions(conditions, customerId, businessId) {
  // Single condition
  if (!conditions.operator) {
    return evaluateSingleCondition(conditions, customerId, businessId);
  }

  // AND/OR group
  const results = conditions.items.map(item =>
    evaluateConditions(item, customerId, businessId)
  );

  if (conditions.operator === 'AND') {
    return results.every(r => r === true);
  } else if (conditions.operator === 'OR') {
    return results.some(r => r === true);
  }

  return false;
}

// Evaluate a single condition
function evaluateSingleCondition(condition, customerId, businessId) {
  if (condition.type === 'time_window') {
    // Time window is a modifier - always true as it modifies other conditions
    return true;
  }

  if (condition.type === 'day_of_week') {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    return condition.days.includes(today);
  }

  // Location-based conditions
  if (condition.subject === 'location') {
    if (condition.action === 'visit') {
      let count;
      if (condition.scope === 'specific') {
        count = db.prepare(`
          SELECT COUNT(DISTINCT location_id) as count
          FROM visits
          WHERE customer_id = ? AND location_id = ?
        `).get(customerId, condition.location_id)?.count || 0;
      } else {
        // 'any' scope - count distinct locations visited
        count = db.prepare(`
          SELECT COUNT(DISTINCT v.location_id) as count
          FROM visits v
          JOIN locations l ON v.location_id = l.id
          WHERE v.customer_id = ? AND l.business_id = ?
        `).get(customerId, businessId)?.count || 0;
      }

      return compare(count, condition.comparison, condition.value);
    } else if (condition.action === 'spend') {
      let total;
      if (condition.scope === 'specific') {
        total = db.prepare(`
          SELECT COALESCE(SUM(spend_amount), 0) as total
          FROM visits
          WHERE customer_id = ? AND location_id = ?
        `).get(customerId, condition.location_id)?.total || 0;
      } else {
        total = db.prepare(`
          SELECT COALESCE(SUM(v.spend_amount), 0) as total
          FROM visits v
          JOIN locations l ON v.location_id = l.id
          WHERE v.customer_id = ? AND l.business_id = ?
        `).get(customerId, businessId)?.total || 0;
      }

      return compare(total, condition.comparison, condition.value);
    }
  }

  return false;
}

// Compare values
function compare(actual, operator, expected) {
  switch (operator) {
    case '=': return actual === expected;
    case '>=': return actual >= expected;
    case '<=': return actual <= expected;
    case '>': return actual > expected;
    case '<': return actual < expected;
    default: return false;
  }
}

module.exports = router;
