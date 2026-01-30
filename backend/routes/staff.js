const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { db, generateId } = require('../db/database');
const { generateToken, authenticateStaff } = require('../middleware/auth');

// POST /api/staff/login - Staff authentication
router.post('/login', (req, res) => {
  const { location_id, pin } = req.body;

  if (!location_id || !pin) {
    return res.status(400).json({
      success: false,
      error: { code: 'MISSING_FIELDS', message: 'location_id and pin are required' }
    });
  }

  // Get location
  const location = db.prepare(`
    SELECT l.*, b.id as business_id, b.name as business_name
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

  // Find staff member for this location
  const staff = db.prepare(`
    SELECT * FROM staff
    WHERE location_id = ? AND is_active = 1
  `).get(location_id);

  if (!staff) {
    return res.status(404).json({
      success: false,
      error: { code: 'NO_STAFF', message: 'No staff configured for this location' }
    });
  }

  // Verify PIN
  const isValidPin = bcrypt.compareSync(pin, staff.pin_hash);

  if (!isValidPin) {
    return res.status(401).json({
      success: false,
      error: { code: 'INVALID_PIN', message: 'Invalid PIN' }
    });
  }

  // Generate token
  const token = generateToken({
    type: 'staff',
    staff_id: staff.id,
    location_id: location.id,
    business_id: location.business_id
  }, '12h'); // Staff tokens expire in 12 hours

  console.log(`[STAFF] Staff logged in: ${staff.id} at ${location.name}`);

  res.json({
    success: true,
    data: {
      token,
      staff: {
        id: staff.id,
        name: staff.name
      },
      location: {
        id: location.id,
        name: location.name,
        icon: location.icon,
        address: location.address
      },
      business: {
        id: location.business_id,
        name: location.business_name
      }
    }
  });
});

// GET /api/staff/customer/:qr_code - Look up customer by QR code
router.get('/customer/:qr_code', authenticateStaff, (req, res) => {
  const { qr_code } = req.params;
  const businessId = req.staff.business_id;

  // Parse QR code - format: lootly:customer:cust_xxx
  let customerId;
  if (qr_code.startsWith('lootly:customer:')) {
    customerId = qr_code.replace('lootly:customer:', '');
  } else {
    // Assume it's just the customer ID
    customerId = qr_code;
  }

  // Find customer
  const customer = db.prepare(`
    SELECT * FROM customers
    WHERE id = ? OR qr_code = ?
  `).get(customerId, qr_code);

  if (!customer) {
    return res.status(404).json({
      success: false,
      error: { code: 'CUSTOMER_NOT_FOUND', message: 'Customer not found' }
    });
  }

  // Get enrollment for this business
  let enrollment = db.prepare(`
    SELECT * FROM enrollments
    WHERE customer_id = ? AND business_id = ?
  `).get(customer.id, businessId);

  // Auto-enroll if not enrolled
  if (!enrollment) {
    const enrollmentId = generateId('enroll');
    db.prepare(`
      INSERT INTO enrollments (id, customer_id, business_id)
      VALUES (?, ?, ?)
    `).run(enrollmentId, customer.id, businessId);
    enrollment = db.prepare('SELECT * FROM enrollments WHERE id = ?').get(enrollmentId);
  }

  // Get pending rewards (unlocked but not redeemed)
  const pendingRewards = db.prepare(`
    SELECT cr.*, r.name, r.description, r.icon, r.dollar_value, r.reward_type
    FROM customer_rewards cr
    JOIN rewards r ON cr.reward_id = r.id
    WHERE cr.customer_id = ? AND r.business_id = ? AND cr.status = 'unlocked'
  `).all(customer.id, businessId);

  // Get visit history at this business
  const recentVisits = db.prepare(`
    SELECT v.*, l.name as location_name, l.icon as location_icon
    FROM visits v
    JOIN locations l ON v.location_id = l.id
    WHERE v.customer_id = ? AND l.business_id = ?
    ORDER BY v.created_at DESC
    LIMIT 5
  `).all(customer.id, businessId);

  res.json({
    success: true,
    data: {
      customer: {
        id: customer.id,
        name: customer.name,
        phone: customer.phone
      },
      enrollment: {
        points_balance: enrollment.points_balance,
        total_points_earned: enrollment.total_points_earned,
        total_spend: enrollment.total_spend,
        points_multiplier: enrollment.points_multiplier
      },
      pending_rewards: pendingRewards,
      recent_visits: recentVisits
    }
  });
});

// POST /api/staff/record-visit - Record a customer visit
router.post('/record-visit', authenticateStaff, (req, res) => {
  const { customer_qr, spend_amount } = req.body;
  const staffId = req.staff.id;
  const locationId = req.staff.location_id;
  const businessId = req.staff.business_id;

  if (!customer_qr) {
    return res.status(400).json({
      success: false,
      error: { code: 'MISSING_CUSTOMER', message: 'customer_qr is required' }
    });
  }

  // Parse customer QR code
  let customerId;
  if (customer_qr.startsWith('lootly:customer:')) {
    customerId = customer_qr.replace('lootly:customer:', '');
  } else {
    customerId = customer_qr;
  }

  // Find customer
  const customer = db.prepare(`
    SELECT * FROM customers
    WHERE id = ? OR qr_code = ?
  `).get(customerId, customer_qr);

  if (!customer) {
    return res.status(404).json({
      success: false,
      error: { code: 'CUSTOMER_NOT_FOUND', message: 'Customer not found' }
    });
  }

  // Get or create enrollment
  let enrollment = db.prepare(`
    SELECT * FROM enrollments
    WHERE customer_id = ? AND business_id = ?
  `).get(customer.id, businessId);

  if (!enrollment) {
    const enrollmentId = generateId('enroll');
    db.prepare(`
      INSERT INTO enrollments (id, customer_id, business_id)
      VALUES (?, ?, ?)
    `).run(enrollmentId, customer.id, businessId);
    enrollment = db.prepare('SELECT * FROM enrollments WHERE id = ?').get(enrollmentId);
  }

  // Calculate points based on earning rules
  const earningRules = db.prepare(`
    SELECT * FROM earning_rules
    WHERE business_id = ? AND is_active = 1
  `).all(businessId);

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
    INSERT INTO visits (id, customer_id, location_id, spend_amount, points_earned, staff_id)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(visitId, customer.id, locationId, amount, pointsEarned, staffId);

  // Update enrollment
  db.prepare(`
    UPDATE enrollments
    SET points_balance = points_balance + ?,
        total_points_earned = total_points_earned + ?,
        total_spend = total_spend + ?
    WHERE id = ?
  `).run(pointsEarned, pointsEarned, amount, enrollment.id);

  // Check for milestone rules
  const milestonesUnlocked = checkMilestones(customer.id, businessId, enrollment.id);

  // Get updated balance
  const updatedEnrollment = db.prepare('SELECT * FROM enrollments WHERE id = ?').get(enrollment.id);

  // Get location info
  const location = db.prepare('SELECT name, icon FROM locations WHERE id = ?').get(locationId);

  console.log(`[STAFF] Visit recorded: ${customer.id} at ${location.name} - $${amount} = ${pointsEarned} pts`);

  res.json({
    success: true,
    data: {
      transaction: {
        id: visitId,
        location_name: location.name,
        location_icon: location.icon,
        spend_amount: amount,
        points_earned: pointsEarned
      },
      customer: {
        id: customer.id,
        name: customer.name
      },
      customer_new_balance: updatedEnrollment.points_balance,
      customer_multiplier: updatedEnrollment.points_multiplier,
      milestones_unlocked: milestonesUnlocked
    }
  });
});

// POST /api/staff/redeem - Process reward redemption
router.post('/redeem', authenticateStaff, (req, res) => {
  const { redemption_code } = req.body;
  const locationId = req.staff.location_id;

  if (!redemption_code) {
    return res.status(400).json({
      success: false,
      error: { code: 'MISSING_CODE', message: 'redemption_code is required' }
    });
  }

  // Parse redemption code if it's a QR code format
  let code = redemption_code;
  if (redemption_code.startsWith('lootly:redeem:')) {
    code = redemption_code.replace('lootly:redeem:', '');
  }

  // Find the customer reward
  const customerReward = db.prepare(`
    SELECT cr.*, r.name as reward_name, r.icon as reward_icon, r.dollar_value,
           c.name as customer_name, c.phone as customer_phone
    FROM customer_rewards cr
    JOIN rewards r ON cr.reward_id = r.id
    JOIN customers c ON cr.customer_id = c.id
    WHERE cr.redemption_code = ?
  `).get(code);

  if (!customerReward) {
    return res.status(404).json({
      success: false,
      error: { code: 'INVALID_CODE', message: 'Invalid redemption code' }
    });
  }

  if (customerReward.status === 'redeemed') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'ALREADY_REDEEMED',
        message: `This reward was already redeemed on ${new Date(customerReward.redeemed_at).toLocaleDateString()}`
      }
    });
  }

  // Mark as redeemed
  db.prepare(`
    UPDATE customer_rewards
    SET status = 'redeemed',
        redeemed_at = CURRENT_TIMESTAMP,
        redeemed_location_id = ?
    WHERE id = ?
  `).run(locationId, customerReward.id);

  console.log(`[STAFF] Reward redeemed: ${customerReward.reward_name} for ${customerReward.customer_name}`);

  res.json({
    success: true,
    data: {
      reward: {
        id: customerReward.reward_id,
        name: customerReward.reward_name,
        icon: customerReward.reward_icon,
        dollar_value: customerReward.dollar_value
      },
      customer: {
        name: customerReward.customer_name || 'Customer',
        phone: customerReward.customer_phone
      }
    }
  });
});

// Helper function to check and trigger milestone rules (duplicated from transactions for staff context)
function checkMilestones(customerId, businessId, enrollmentId) {
  const triggered = [];

  const rules = db.prepare(`
    SELECT * FROM rules
    WHERE business_id = ? AND is_active = 1
  `).all(businessId);

  for (const rule of rules) {
    if (!rule.is_repeatable) {
      const existingTrigger = db.prepare(`
        SELECT id FROM customer_rule_triggers
        WHERE customer_id = ? AND rule_id = ?
      `).get(customerId, rule.id);

      if (existingTrigger) continue;
    }

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

    const conditions = JSON.parse(rule.conditions);
    const result = evaluateConditions(conditions, customerId, businessId);

    if (result) {
      const triggerId = generateId('trigger');
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
        const rewardId = rule.award_value;
        const reward = db.prepare('SELECT * FROM rewards WHERE id = ?').get(rewardId);

        if (reward) {
          const customerRewardId = generateId('cr');
          const redemptionCode = `RED_${generateId('')}`;
          db.prepare(`
            INSERT INTO customer_rewards (id, customer_id, reward_id, redemption_code)
            VALUES (?, ?, ?, ?)
          `).run(customerRewardId, customerId, rewardId, redemptionCode);

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

      db.prepare(`
        INSERT INTO customer_rule_triggers (id, customer_id, rule_id, award_given)
        VALUES (?, ?, ?, ?)
      `).run(triggerId, customerId, rule.id, awardGiven);
    }
  }

  return triggered;
}

function evaluateConditions(conditions, customerId, businessId) {
  if (!conditions.operator) {
    return evaluateSingleCondition(conditions, customerId, businessId);
  }

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

function evaluateSingleCondition(condition, customerId, businessId) {
  if (condition.type === 'time_window') {
    return true;
  }

  if (condition.type === 'day_of_week') {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    return condition.days.includes(today);
  }

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
