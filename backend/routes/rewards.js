const express = require('express');
const router = express.Router();
const QRCode = require('qrcode');
const { db, generateId } = require('../db/database');
const { authenticateCustomer } = require('../middleware/auth');

// GET /api/rewards - List rewards (requires auth)
router.get('/', authenticateCustomer, (req, res) => {
  const { business_id } = req.query;
  const customerId = req.customer.id;

  if (!business_id) {
    return res.status(400).json({
      success: false,
      error: { code: 'MISSING_BUSINESS', message: 'business_id query parameter is required' }
    });
  }

  // Get enrollment to check points balance
  const enrollment = db.prepare(`
    SELECT * FROM enrollments
    WHERE customer_id = ? AND business_id = ?
  `).get(customerId, business_id);

  if (!enrollment) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_ENROLLED', message: 'Not enrolled in this program' }
    });
  }

  // Get all active rewards for this business
  const allRewards = db.prepare(`
    SELECT * FROM rewards
    WHERE business_id = ? AND is_active = 1
    ORDER BY points_cost ASC
  `).all(business_id);

  // Get customer's unlocked/redeemed rewards
  const customerRewards = db.prepare(`
    SELECT cr.*, r.name, r.description, r.icon, r.points_cost, r.dollar_value, r.reward_type
    FROM customer_rewards cr
    JOIN rewards r ON cr.reward_id = r.id
    WHERE cr.customer_id = ? AND r.business_id = ?
  `).all(customerId, business_id);

  const unlockedRewardIds = new Set(customerRewards.map(cr => cr.reward_id));

  // Categorize rewards
  const availableRewards = []; // Can afford and not yet unlocked
  const lockedRewards = [];    // Can't afford yet
  const unlockedRewards = [];  // Already unlocked

  for (const reward of allRewards) {
    // Skip milestone rewards from regular lists - they're unlocked via rules
    if (reward.is_milestone) {
      const unlocked = customerRewards.find(cr => cr.reward_id === reward.id);
      if (unlocked) {
        unlockedRewards.push({
          ...reward,
          customer_reward_id: unlocked.id,
          status: unlocked.status,
          redemption_code: unlocked.redemption_code,
          unlocked_at: unlocked.unlocked_at,
          redeemed_at: unlocked.redeemed_at
        });
      }
      continue;
    }

    if (unlockedRewardIds.has(reward.id)) {
      const unlocked = customerRewards.find(cr => cr.reward_id === reward.id);
      unlockedRewards.push({
        ...reward,
        customer_reward_id: unlocked.id,
        status: unlocked.status,
        redemption_code: unlocked.redemption_code,
        unlocked_at: unlocked.unlocked_at,
        redeemed_at: unlocked.redeemed_at
      });
    } else if (enrollment.points_balance >= reward.points_cost) {
      availableRewards.push({
        ...reward,
        can_afford: true
      });
    } else {
      lockedRewards.push({
        ...reward,
        can_afford: false,
        points_needed: reward.points_cost - enrollment.points_balance
      });
    }
  }

  res.json({
    success: true,
    data: {
      points_balance: enrollment.points_balance,
      available_rewards: availableRewards,
      locked_rewards: lockedRewards,
      unlocked_rewards: unlockedRewards.filter(r => r.status === 'unlocked'),
      redeemed_rewards: unlockedRewards.filter(r => r.status === 'redeemed')
    }
  });
});

// POST /api/rewards/:id/unlock - Unlock a reward with points
router.post('/:id/unlock', authenticateCustomer, async (req, res) => {
  const { id } = req.params;
  const customerId = req.customer.id;

  // Get reward
  const reward = db.prepare('SELECT * FROM rewards WHERE id = ? AND is_active = 1').get(id);

  if (!reward) {
    return res.status(404).json({
      success: false,
      error: { code: 'REWARD_NOT_FOUND', message: 'Reward not found' }
    });
  }

  // Don't allow unlocking milestone rewards via points
  if (reward.is_milestone) {
    return res.status(400).json({
      success: false,
      error: { code: 'MILESTONE_REWARD', message: 'This reward is unlocked by completing a milestone' }
    });
  }

  // Get enrollment
  const enrollment = db.prepare(`
    SELECT * FROM enrollments
    WHERE customer_id = ? AND business_id = ?
  `).get(customerId, reward.business_id);

  if (!enrollment) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_ENROLLED', message: 'Not enrolled in this program' }
    });
  }

  // Check points balance
  if (enrollment.points_balance < reward.points_cost) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INSUFFICIENT_POINTS',
        message: `Need ${reward.points_cost - enrollment.points_balance} more points`
      }
    });
  }

  // Check if already unlocked and not redeemed
  const existingUnlocked = db.prepare(`
    SELECT * FROM customer_rewards
    WHERE customer_id = ? AND reward_id = ? AND status = 'unlocked'
  `).get(customerId, id);

  if (existingUnlocked) {
    return res.status(400).json({
      success: false,
      error: { code: 'ALREADY_UNLOCKED', message: 'This reward is already unlocked' }
    });
  }

  // Deduct points and create customer_reward
  db.prepare(`
    UPDATE enrollments
    SET points_balance = points_balance - ?
    WHERE id = ?
  `).run(reward.points_cost, enrollment.id);

  const customerRewardId = generateId('cr');
  const redemptionCode = `RED_${generateId('')}`;

  db.prepare(`
    INSERT INTO customer_rewards (id, customer_id, reward_id, redemption_code)
    VALUES (?, ?, ?, ?)
  `).run(customerRewardId, customerId, id, redemptionCode);

  // Get updated balance
  const updatedEnrollment = db.prepare('SELECT points_balance FROM enrollments WHERE id = ?').get(enrollment.id);

  // Generate redemption QR code
  const qrData = `lootly:redeem:${redemptionCode}`;
  const qrDataUrl = await QRCode.toDataURL(qrData, {
    width: 300,
    margin: 2
  });

  res.json({
    success: true,
    data: {
      customer_reward: {
        id: customerRewardId,
        reward_id: id,
        reward_name: reward.name,
        reward_icon: reward.icon,
        dollar_value: reward.dollar_value,
        redemption_code: redemptionCode,
        qr_data_url: qrDataUrl,
        status: 'unlocked'
      },
      new_balance: updatedEnrollment.points_balance
    }
  });
});

// GET /api/rewards/:id - Get reward details
router.get('/:id', authenticateCustomer, async (req, res) => {
  const { id } = req.params;
  const customerId = req.customer.id;

  const reward = db.prepare('SELECT * FROM rewards WHERE id = ?').get(id);

  if (!reward) {
    return res.status(404).json({
      success: false,
      error: { code: 'REWARD_NOT_FOUND', message: 'Reward not found' }
    });
  }

  // Check if customer has this reward
  const customerReward = db.prepare(`
    SELECT * FROM customer_rewards
    WHERE customer_id = ? AND reward_id = ?
    ORDER BY unlocked_at DESC
    LIMIT 1
  `).get(customerId, id);

  // Get enrollment for points info
  const enrollment = db.prepare(`
    SELECT * FROM enrollments
    WHERE customer_id = ? AND business_id = ?
  `).get(customerId, reward.business_id);

  let qrDataUrl = null;
  if (customerReward && customerReward.status === 'unlocked') {
    const qrData = `lootly:redeem:${customerReward.redemption_code}`;
    qrDataUrl = await QRCode.toDataURL(qrData, {
      width: 300,
      margin: 2
    });
  }

  res.json({
    success: true,
    data: {
      reward: {
        id: reward.id,
        name: reward.name,
        description: reward.description,
        icon: reward.icon,
        points_cost: reward.points_cost,
        dollar_value: reward.dollar_value,
        reward_type: reward.reward_type,
        is_milestone: reward.is_milestone
      },
      customer_status: customerReward ? {
        customer_reward_id: customerReward.id,
        status: customerReward.status,
        redemption_code: customerReward.status === 'unlocked' ? customerReward.redemption_code : null,
        qr_data_url: qrDataUrl,
        unlocked_at: customerReward.unlocked_at,
        redeemed_at: customerReward.redeemed_at
      } : null,
      points_balance: enrollment?.points_balance || 0,
      can_afford: enrollment ? enrollment.points_balance >= reward.points_cost : false,
      points_needed: enrollment ? Math.max(0, reward.points_cost - enrollment.points_balance) : reward.points_cost
    }
  });
});

// GET /api/rewards/redemption/:code - Verify redemption code (public for staff)
router.get('/redemption/:code', (req, res) => {
  const { code } = req.params;

  const customerReward = db.prepare(`
    SELECT cr.*, r.name as reward_name, r.description as reward_description,
           r.icon as reward_icon, r.dollar_value, r.reward_type,
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
        message: `This reward was redeemed on ${new Date(customerReward.redeemed_at).toLocaleDateString()}`
      }
    });
  }

  res.json({
    success: true,
    data: {
      reward: {
        id: customerReward.reward_id,
        name: customerReward.reward_name,
        description: customerReward.reward_description,
        icon: customerReward.reward_icon,
        dollar_value: customerReward.dollar_value,
        reward_type: customerReward.reward_type
      },
      customer: {
        name: customerReward.customer_name || 'Customer',
        phone: customerReward.customer_phone
      },
      status: customerReward.status,
      unlocked_at: customerReward.unlocked_at
    }
  });
});

module.exports = router;
