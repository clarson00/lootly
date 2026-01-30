const express = require('express');
const router = express.Router();
const QRCode = require('qrcode');
const { db, schema, generateId } = require('../db');
const { eq, and, desc, sql } = require('drizzle-orm');
const { authenticateCustomer } = require('../middleware/auth');

const { enrollments, rewards, customerRewards, customers } = schema;

// GET /api/rewards - List rewards (requires auth)
router.get('/', authenticateCustomer, async (req, res) => {
  const { business_id } = req.query;
  const customerId = req.customer.id;

  if (!business_id) {
    return res.status(400).json({
      success: false,
      error: { code: 'MISSING_BUSINESS', message: 'business_id query parameter is required' }
    });
  }

  try {
    // Get enrollment to check points balance
    const [enrollment] = await db.select().from(enrollments)
      .where(and(eq(enrollments.customerId, customerId), eq(enrollments.businessId, business_id)));

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_ENROLLED', message: 'Not enrolled in this program' }
      });
    }

    // Get all active rewards for this business
    const allRewards = await db.select().from(rewards)
      .where(and(eq(rewards.businessId, business_id), eq(rewards.isActive, true)))
      .orderBy(rewards.pointsRequired);

    // Get customer's unlocked/redeemed rewards
    const custRewards = await db.select({
      id: customerRewards.id,
      rewardId: customerRewards.rewardId,
      status: customerRewards.status,
      redemptionCode: customerRewards.redemptionCode,
      earnedAt: customerRewards.earnedAt,
      redeemedAt: customerRewards.redeemedAt,
      rewardName: rewards.name,
      rewardDescription: rewards.description,
      rewardIcon: rewards.icon,
      pointsRequired: rewards.pointsRequired,
      valueAmount: rewards.valueAmount,
      rewardType: rewards.rewardType
    })
    .from(customerRewards)
    .innerJoin(rewards, eq(customerRewards.rewardId, rewards.id))
    .where(and(eq(customerRewards.enrollmentId, enrollment.id), eq(rewards.businessId, business_id)));

    const unlockedRewardIds = new Set(custRewards.map(cr => cr.rewardId));

    // Categorize rewards
    const availableRewards = []; // Can afford and not yet unlocked
    const lockedRewards = [];    // Can't afford yet
    const unlockedRewards = [];  // Already unlocked

    for (const reward of allRewards) {
      // Skip milestone rewards from regular lists - they're unlocked via rules
      if (reward.rewardType === 'milestone') {
        const unlocked = custRewards.find(cr => cr.rewardId === reward.id);
        if (unlocked) {
          unlockedRewards.push({
            id: reward.id,
            name: reward.name,
            description: reward.description,
            icon: reward.icon,
            points_cost: reward.pointsRequired,
            dollar_value: reward.valueAmount,
            reward_type: reward.rewardType,
            is_milestone: true,
            customer_reward_id: unlocked.id,
            status: unlocked.status,
            redemption_code: unlocked.redemptionCode,
            unlocked_at: unlocked.earnedAt,
            redeemed_at: unlocked.redeemedAt
          });
        }
        continue;
      }

      if (unlockedRewardIds.has(reward.id)) {
        const unlocked = custRewards.find(cr => cr.rewardId === reward.id);
        unlockedRewards.push({
          id: reward.id,
          name: reward.name,
          description: reward.description,
          icon: reward.icon,
          points_cost: reward.pointsRequired,
          dollar_value: reward.valueAmount,
          reward_type: reward.rewardType,
          customer_reward_id: unlocked.id,
          status: unlocked.status,
          redemption_code: unlocked.redemptionCode,
          unlocked_at: unlocked.earnedAt,
          redeemed_at: unlocked.redeemedAt
        });
      } else if (enrollment.pointsBalance >= reward.pointsRequired) {
        availableRewards.push({
          id: reward.id,
          name: reward.name,
          description: reward.description,
          icon: reward.icon,
          points_cost: reward.pointsRequired,
          dollar_value: reward.valueAmount,
          reward_type: reward.rewardType,
          can_afford: true
        });
      } else {
        lockedRewards.push({
          id: reward.id,
          name: reward.name,
          description: reward.description,
          icon: reward.icon,
          points_cost: reward.pointsRequired,
          dollar_value: reward.valueAmount,
          reward_type: reward.rewardType,
          can_afford: false,
          points_needed: reward.pointsRequired - enrollment.pointsBalance
        });
      }
    }

    res.json({
      success: true,
      data: {
        points_balance: enrollment.pointsBalance,
        available_rewards: availableRewards,
        locked_rewards: lockedRewards,
        unlocked_rewards: unlockedRewards.filter(r => r.status === 'available'),
        redeemed_rewards: unlockedRewards.filter(r => r.status === 'redeemed')
      }
    });
  } catch (error) {
    console.error('Error fetching rewards:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to fetch rewards' }
    });
  }
});

// POST /api/rewards/:id/unlock - Unlock a reward with points
router.post('/:id/unlock', authenticateCustomer, async (req, res) => {
  const { id } = req.params;
  const customerId = req.customer.id;

  try {
    // Get reward
    const [reward] = await db.select().from(rewards)
      .where(and(eq(rewards.id, id), eq(rewards.isActive, true)));

    if (!reward) {
      return res.status(404).json({
        success: false,
        error: { code: 'REWARD_NOT_FOUND', message: 'Reward not found' }
      });
    }

    // Don't allow unlocking milestone rewards via points
    if (reward.rewardType === 'milestone') {
      return res.status(400).json({
        success: false,
        error: { code: 'MILESTONE_REWARD', message: 'This reward is unlocked by completing a milestone' }
      });
    }

    // Get enrollment
    const [enrollment] = await db.select().from(enrollments)
      .where(and(eq(enrollments.customerId, customerId), eq(enrollments.businessId, reward.businessId)));

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_ENROLLED', message: 'Not enrolled in this program' }
      });
    }

    // Check points balance
    if (enrollment.pointsBalance < reward.pointsRequired) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INSUFFICIENT_POINTS',
          message: `Need ${reward.pointsRequired - enrollment.pointsBalance} more points`
        }
      });
    }

    // Check if already unlocked and not redeemed
    const [existingUnlocked] = await db.select().from(customerRewards)
      .where(and(
        eq(customerRewards.enrollmentId, enrollment.id),
        eq(customerRewards.rewardId, id),
        eq(customerRewards.status, 'available')
      ));

    if (existingUnlocked) {
      return res.status(400).json({
        success: false,
        error: { code: 'ALREADY_UNLOCKED', message: 'This reward is already unlocked' }
      });
    }

    // Deduct points
    await db.update(enrollments)
      .set({ pointsBalance: sql`${enrollments.pointsBalance} - ${reward.pointsRequired}` })
      .where(eq(enrollments.id, enrollment.id));

    // Create customer_reward
    const customerRewardId = generateId('cr');
    const redemptionCode = `RED_${generateId('')}`;

    await db.insert(customerRewards).values({
      id: customerRewardId,
      enrollmentId: enrollment.id,
      rewardId: id,
      sourceType: 'points_redemption',
      pointsSpent: reward.pointsRequired,
      redemptionCode: redemptionCode
    });

    // Get updated balance
    const [updatedEnrollment] = await db.select({ pointsBalance: enrollments.pointsBalance })
      .from(enrollments).where(eq(enrollments.id, enrollment.id));

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
          dollar_value: reward.valueAmount,
          redemption_code: redemptionCode,
          qr_data_url: qrDataUrl,
          status: 'available'
        },
        new_balance: updatedEnrollment.pointsBalance
      }
    });
  } catch (error) {
    console.error('Error unlocking reward:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to unlock reward' }
    });
  }
});

// GET /api/rewards/:id - Get reward details
router.get('/:id', authenticateCustomer, async (req, res) => {
  const { id } = req.params;
  const customerId = req.customer.id;

  try {
    const [reward] = await db.select().from(rewards).where(eq(rewards.id, id));

    if (!reward) {
      return res.status(404).json({
        success: false,
        error: { code: 'REWARD_NOT_FOUND', message: 'Reward not found' }
      });
    }

    // Get enrollment for points info
    const [enrollment] = await db.select().from(enrollments)
      .where(and(eq(enrollments.customerId, customerId), eq(enrollments.businessId, reward.businessId)));

    // Check if customer has this reward
    const [customerReward] = enrollment ? await db.select().from(customerRewards)
      .where(and(eq(customerRewards.enrollmentId, enrollment.id), eq(customerRewards.rewardId, id)))
      .orderBy(desc(customerRewards.earnedAt))
      .limit(1) : [];

    let qrDataUrl = null;
    if (customerReward && customerReward.status === 'available') {
      const qrData = `lootly:redeem:${customerReward.redemptionCode}`;
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
          points_cost: reward.pointsRequired,
          dollar_value: reward.valueAmount,
          reward_type: reward.rewardType,
          is_milestone: reward.rewardType === 'milestone'
        },
        customer_status: customerReward ? {
          customer_reward_id: customerReward.id,
          status: customerReward.status,
          redemption_code: customerReward.status === 'available' ? customerReward.redemptionCode : null,
          qr_data_url: qrDataUrl,
          unlocked_at: customerReward.earnedAt,
          redeemed_at: customerReward.redeemedAt
        } : null,
        points_balance: enrollment?.pointsBalance || 0,
        can_afford: enrollment ? enrollment.pointsBalance >= reward.pointsRequired : false,
        points_needed: enrollment ? Math.max(0, reward.pointsRequired - enrollment.pointsBalance) : reward.pointsRequired
      }
    });
  } catch (error) {
    console.error('Error fetching reward:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to fetch reward' }
    });
  }
});

// GET /api/rewards/redemption/:code - Verify redemption code (public for staff)
router.get('/redemption/:code', async (req, res) => {
  const { code } = req.params;

  try {
    const [custReward] = await db.select({
      id: customerRewards.id,
      rewardId: customerRewards.rewardId,
      enrollmentId: customerRewards.enrollmentId,
      status: customerRewards.status,
      redemptionCode: customerRewards.redemptionCode,
      earnedAt: customerRewards.earnedAt,
      redeemedAt: customerRewards.redeemedAt,
      rewardName: rewards.name,
      rewardDescription: rewards.description,
      rewardIcon: rewards.icon,
      valueAmount: rewards.valueAmount,
      rewardType: rewards.rewardType
    })
    .from(customerRewards)
    .innerJoin(rewards, eq(customerRewards.rewardId, rewards.id))
    .where(eq(customerRewards.redemptionCode, code));

    if (!custReward) {
      return res.status(404).json({
        success: false,
        error: { code: 'INVALID_CODE', message: 'Invalid redemption code' }
      });
    }

    if (custReward.status === 'redeemed') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'ALREADY_REDEEMED',
          message: `This reward was redeemed on ${new Date(custReward.redeemedAt).toLocaleDateString()}`
        }
      });
    }

    // Get customer info via enrollment
    const [enrollment] = await db.select().from(enrollments).where(eq(enrollments.id, custReward.enrollmentId));
    const [customer] = enrollment ? await db.select().from(customers).where(eq(customers.id, enrollment.customerId)) : [];

    res.json({
      success: true,
      data: {
        reward: {
          id: custReward.rewardId,
          name: custReward.rewardName,
          description: custReward.rewardDescription,
          icon: custReward.rewardIcon,
          dollar_value: custReward.valueAmount,
          reward_type: custReward.rewardType
        },
        customer: {
          name: customer?.name || 'Customer',
          phone: customer?.phone
        },
        status: custReward.status,
        unlocked_at: custReward.earnedAt
      }
    });
  } catch (error) {
    console.error('Error verifying redemption code:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to verify redemption code' }
    });
  }
});

module.exports = router;
