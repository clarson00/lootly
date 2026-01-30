const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { db, schema, generateId } = require('../db');
const { eq, and, desc, sql, or } = require('drizzle-orm');
const { generateToken, authenticateStaff } = require('../middleware/auth');

const { businesses, locations, staff, customers, enrollments, visits, earningRules, rules, ruleTriggers, rewards, customerRewards, qrCodes } = schema;

// POST /api/staff/login - Staff authentication
router.post('/login', async (req, res) => {
  const { location_id, pin } = req.body;

  if (!location_id || !pin) {
    return res.status(400).json({
      success: false,
      error: { code: 'MISSING_FIELDS', message: 'location_id and pin are required' }
    });
  }

  try {
    // Get location
    const [location] = await db.select({
      id: locations.id,
      name: locations.name,
      icon: locations.icon,
      addressLine1: locations.addressLine1,
      businessId: locations.businessId,
      isActive: locations.isActive
    })
    .from(locations)
    .where(eq(locations.id, location_id));

    if (!location || !location.isActive) {
      return res.status(404).json({
        success: false,
        error: { code: 'LOCATION_NOT_FOUND', message: 'Location not found' }
      });
    }

    // Get business
    const [business] = await db.select({ id: businesses.id, name: businesses.name })
      .from(businesses).where(eq(businesses.id, location.businessId));

    // Find staff member for this location
    const [staffMember] = await db.select().from(staff)
      .where(and(eq(staff.locationId, location_id), eq(staff.isActive, true)));

    if (!staffMember) {
      return res.status(404).json({
        success: false,
        error: { code: 'NO_STAFF', message: 'No staff configured for this location' }
      });
    }

    // Verify PIN
    const isValidPin = bcrypt.compareSync(pin, staffMember.pinHash);

    if (!isValidPin) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_PIN', message: 'Invalid PIN' }
      });
    }

    // Generate token
    const token = generateToken({
      type: 'staff',
      staff_id: staffMember.id,
      location_id: location.id,
      business_id: location.businessId
    }, '12h');

    console.log(`[STAFF] Staff logged in: ${staffMember.id} at ${location.name}`);

    res.json({
      success: true,
      data: {
        token,
        staff: {
          id: staffMember.id,
          name: staffMember.name
        },
        location: {
          id: location.id,
          name: location.name,
          icon: location.icon,
          address: location.addressLine1
        },
        business: {
          id: location.businessId,
          name: business?.name
        }
      }
    });
  } catch (error) {
    console.error('Error staff login:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to login' }
    });
  }
});

// GET /api/staff/customer/:qr_code - Look up customer by QR code
router.get('/customer/:qr_code', authenticateStaff, async (req, res) => {
  const { qr_code } = req.params;
  const businessId = req.staff.business_id;

  try {
    // Parse QR code - format: lootly:customer:cust_xxx
    let customerId;
    if (qr_code.startsWith('lootly:customer:')) {
      customerId = qr_code.replace('lootly:customer:', '');
    } else {
      customerId = qr_code;
    }

    // Find customer by ID or QR code
    let [customer] = await db.select().from(customers).where(eq(customers.id, customerId));

    if (!customer) {
      // Try finding by QR code value
      const [qr] = await db.select().from(qrCodes).where(eq(qrCodes.code, qr_code));
      if (qr) {
        [customer] = await db.select().from(customers).where(eq(customers.id, qr.customerId));
      }
    }

    if (!customer) {
      return res.status(404).json({
        success: false,
        error: { code: 'CUSTOMER_NOT_FOUND', message: 'Customer not found' }
      });
    }

    // Get enrollment for this business
    let [enrollment] = await db.select().from(enrollments)
      .where(and(eq(enrollments.customerId, customer.id), eq(enrollments.businessId, businessId)));

    // Auto-enroll if not enrolled
    if (!enrollment) {
      const enrollmentId = generateId('enroll');
      await db.insert(enrollments).values({
        id: enrollmentId,
        customerId: customer.id,
        businessId: businessId
      });
      [enrollment] = await db.select().from(enrollments).where(eq(enrollments.id, enrollmentId));
    }

    // Get pending rewards (unlocked but not redeemed)
    const pendingRewards = await db.select({
      id: customerRewards.id,
      rewardId: customerRewards.rewardId,
      status: customerRewards.status,
      redemptionCode: customerRewards.redemptionCode,
      earnedAt: customerRewards.earnedAt,
      rewardName: rewards.name,
      rewardDescription: rewards.description,
      rewardIcon: rewards.icon,
      valueAmount: rewards.valueAmount,
      rewardType: rewards.rewardType
    })
    .from(customerRewards)
    .innerJoin(rewards, eq(customerRewards.rewardId, rewards.id))
    .where(and(
      eq(customerRewards.enrollmentId, enrollment.id),
      eq(rewards.businessId, businessId),
      eq(customerRewards.status, 'available')
    ));

    // Get visit history at this business
    const recentVisits = await db.select({
      id: visits.id,
      locationId: visits.locationId,
      spendAmount: visits.spendAmount,
      pointsEarned: visits.pointsEarned,
      createdAt: visits.createdAt,
      locationName: locations.name,
      locationIcon: locations.icon
    })
    .from(visits)
    .innerJoin(locations, eq(visits.locationId, locations.id))
    .where(and(eq(visits.customerId, customer.id), eq(locations.businessId, businessId)))
    .orderBy(desc(visits.createdAt))
    .limit(5);

    res.json({
      success: true,
      data: {
        customer: {
          id: customer.id,
          name: customer.name,
          phone: customer.phone
        },
        enrollment: {
          points_balance: enrollment.pointsBalance,
          total_points_earned: enrollment.lifetimePoints,
          total_spend: enrollment.lifetimeSpend,
          points_multiplier: enrollment.pointsMultiplier
        },
        pending_rewards: pendingRewards.map(r => ({
          id: r.id,
          reward_id: r.rewardId,
          name: r.rewardName,
          description: r.rewardDescription,
          icon: r.rewardIcon,
          dollar_value: r.valueAmount,
          reward_type: r.rewardType,
          redemption_code: r.redemptionCode
        })),
        recent_visits: recentVisits.map(v => ({
          id: v.id,
          location_id: v.locationId,
          location_name: v.locationName,
          location_icon: v.locationIcon,
          spend_amount: v.spendAmount,
          points_earned: v.pointsEarned,
          created_at: v.createdAt
        }))
      }
    });
  } catch (error) {
    console.error('Error looking up customer:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to look up customer' }
    });
  }
});

// POST /api/staff/record-visit - Record a customer visit
router.post('/record-visit', authenticateStaff, async (req, res) => {
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

  try {
    // Parse customer QR code
    let customerId;
    if (customer_qr.startsWith('lootly:customer:')) {
      customerId = customer_qr.replace('lootly:customer:', '');
    } else {
      customerId = customer_qr;
    }

    // Find customer
    let [customer] = await db.select().from(customers).where(eq(customers.id, customerId));

    if (!customer) {
      const [qr] = await db.select().from(qrCodes).where(eq(qrCodes.code, customer_qr));
      if (qr) {
        [customer] = await db.select().from(customers).where(eq(customers.id, qr.customerId));
      }
    }

    if (!customer) {
      return res.status(404).json({
        success: false,
        error: { code: 'CUSTOMER_NOT_FOUND', message: 'Customer not found' }
      });
    }

    // Get or create enrollment
    let [enrollment] = await db.select().from(enrollments)
      .where(and(eq(enrollments.customerId, customer.id), eq(enrollments.businessId, businessId)));

    if (!enrollment) {
      const enrollmentId = generateId('enroll');
      await db.insert(enrollments).values({
        id: enrollmentId,
        customerId: customer.id,
        businessId: businessId
      });
      [enrollment] = await db.select().from(enrollments).where(eq(enrollments.id, enrollmentId));
    }

    // Calculate points based on earning rules
    const earnRules = await db.select().from(earningRules)
      .where(and(eq(earningRules.businessId, businessId), eq(earningRules.isActive, true)));

    let pointsEarned = 0;
    const amount = parseFloat(spend_amount) || 0;

    for (const rule of earnRules) {
      if (rule.type === 'spend' && amount > 0) {
        pointsEarned += Math.floor(amount * (rule.pointsPerDollar || 0));
      } else if (rule.type === 'visit') {
        pointsEarned += rule.pointsPerVisit || 0;
      }
    }

    // Apply multiplier
    pointsEarned = Math.floor(pointsEarned * (enrollment.pointsMultiplier || 1));

    // Record visit
    const visitId = generateId('visit');
    await db.insert(visits).values({
      id: visitId,
      customerId: customer.id,
      locationId: locationId,
      spendAmount: amount,
      pointsEarned: pointsEarned,
      staffId: staffId
    });

    // Update enrollment
    await db.update(enrollments)
      .set({
        pointsBalance: sql`${enrollments.pointsBalance} + ${pointsEarned}`,
        lifetimePoints: sql`${enrollments.lifetimePoints} + ${pointsEarned}`,
        lifetimeSpend: sql`${enrollments.lifetimeSpend} + ${Math.round(amount * 100)}`,
        visitCount: sql`${enrollments.visitCount} + 1`,
        lastVisitAt: new Date()
      })
      .where(eq(enrollments.id, enrollment.id));

    // Check for milestone rules
    const milestonesUnlocked = await checkMilestones(customer.id, businessId, enrollment.id);

    // Get updated balance
    const [updatedEnrollment] = await db.select().from(enrollments).where(eq(enrollments.id, enrollment.id));

    // Get location info
    const [location] = await db.select({ name: locations.name, icon: locations.icon })
      .from(locations).where(eq(locations.id, locationId));

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
        customer_new_balance: updatedEnrollment.pointsBalance,
        customer_multiplier: updatedEnrollment.pointsMultiplier,
        milestones_unlocked: milestonesUnlocked
      }
    });
  } catch (error) {
    console.error('Error recording visit:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to record visit' }
    });
  }
});

// POST /api/staff/redeem - Process reward redemption
router.post('/redeem', authenticateStaff, async (req, res) => {
  const { redemption_code } = req.body;
  const locationId = req.staff.location_id;
  const staffId = req.staff.id;

  if (!redemption_code) {
    return res.status(400).json({
      success: false,
      error: { code: 'MISSING_CODE', message: 'redemption_code is required' }
    });
  }

  try {
    // Parse redemption code if it's a QR code format
    let code = redemption_code;
    if (redemption_code.startsWith('lootly:redeem:')) {
      code = redemption_code.replace('lootly:redeem:', '');
    }

    // Find the customer reward
    const [custReward] = await db.select({
      id: customerRewards.id,
      enrollmentId: customerRewards.enrollmentId,
      rewardId: customerRewards.rewardId,
      status: customerRewards.status,
      redemptionCode: customerRewards.redemptionCode,
      redeemedAt: customerRewards.redeemedAt,
      rewardName: rewards.name,
      rewardIcon: rewards.icon,
      valueAmount: rewards.valueAmount
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
          message: `This reward was already redeemed on ${new Date(custReward.redeemedAt).toLocaleDateString()}`
        }
      });
    }

    // Get customer info
    const [enrollment] = await db.select().from(enrollments).where(eq(enrollments.id, custReward.enrollmentId));
    const [customer] = enrollment ? await db.select().from(customers).where(eq(customers.id, enrollment.customerId)) : [];

    // Mark as redeemed
    await db.update(customerRewards)
      .set({
        status: 'redeemed',
        redeemedAt: new Date(),
        redeemedLocationId: locationId,
        redeemedStaffId: staffId
      })
      .where(eq(customerRewards.id, custReward.id));

    console.log(`[STAFF] Reward redeemed: ${custReward.rewardName} for ${customer?.name || 'Customer'}`);

    res.json({
      success: true,
      data: {
        reward: {
          id: custReward.rewardId,
          name: custReward.rewardName,
          icon: custReward.rewardIcon,
          dollar_value: custReward.valueAmount
        },
        customer: {
          name: customer?.name || 'Customer',
          phone: customer?.phone
        }
      }
    });
  } catch (error) {
    console.error('Error redeeming reward:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to redeem reward' }
    });
  }
});

// Helper function to check and trigger milestone rules
async function checkMilestones(customerId, businessId, enrollmentId) {
  const triggered = [];

  try {
    const rulesList = await db.select().from(rules)
      .where(and(eq(rules.businessId, businessId), eq(rules.isActive, true)));

    for (const rule of rulesList) {
      if (!rule.isRepeatable) {
        const [existingTrigger] = await db.select({ id: ruleTriggers.id })
          .from(ruleTriggers)
          .where(and(eq(ruleTriggers.ruleId, rule.id), eq(ruleTriggers.enrollmentId, enrollmentId)));

        if (existingTrigger) continue;
      }

      if (rule.cooldownDays) {
        const [lastTrigger] = await db.select({ triggeredAt: ruleTriggers.triggeredAt })
          .from(ruleTriggers)
          .where(and(eq(ruleTriggers.ruleId, rule.id), eq(ruleTriggers.enrollmentId, enrollmentId)))
          .orderBy(desc(ruleTriggers.triggeredAt))
          .limit(1);

        if (lastTrigger) {
          const cooldownEnd = new Date(lastTrigger.triggeredAt);
          cooldownEnd.setDate(cooldownEnd.getDate() + rule.cooldownDays);
          if (new Date() < cooldownEnd) continue;
        }
      }

      const conditions = typeof rule.conditions === 'string' ? JSON.parse(rule.conditions) : rule.conditions;
      const result = await evaluateConditions(conditions, customerId, businessId);

      if (result) {
        const triggerId = generateId('trigger');

        if (rule.awardType === 'points') {
          const points = parseInt(rule.awardValue);
          await db.update(enrollments)
            .set({
              pointsBalance: sql`${enrollments.pointsBalance} + ${points}`,
              lifetimePoints: sql`${enrollments.lifetimePoints} + ${points}`
            })
            .where(eq(enrollments.id, enrollmentId));
        } else if (rule.awardType === 'reward') {
          const rewardId = rule.awardValue;
          const [reward] = await db.select().from(rewards).where(eq(rewards.id, rewardId));

          if (reward) {
            const customerRewardId = generateId('cr');
            const redemptionCode = `RED_${generateId('')}`;
            await db.insert(customerRewards).values({
              id: customerRewardId,
              enrollmentId: enrollmentId,
              rewardId: rewardId,
              sourceType: 'rule_unlock',
              sourceId: rule.id,
              redemptionCode: redemptionCode
            });

            triggered.push({
              rule_id: rule.id,
              rule_name: rule.name,
              award_type: 'reward',
              reward_id: rewardId,
              reward_name: reward.name,
              reward_icon: reward.icon,
              reward_value: reward.valueAmount
            });
          }
        } else if (rule.awardType === 'multiplier') {
          const multiplier = parseFloat(rule.awardValue);
          await db.update(enrollments)
            .set({ pointsMultiplier: multiplier })
            .where(eq(enrollments.id, enrollmentId));
        }

        await db.insert(ruleTriggers).values({
          id: triggerId,
          ruleId: rule.id,
          enrollmentId: enrollmentId
        });
      }
    }
  } catch (error) {
    console.error('Error checking milestones:', error);
  }

  return triggered;
}

async function evaluateConditions(conditions, customerId, businessId) {
  if (!conditions.operator) {
    return await evaluateSingleCondition(conditions, customerId, businessId);
  }

  const results = await Promise.all(
    conditions.items.map(item => evaluateConditions(item, customerId, businessId))
  );

  if (conditions.operator === 'AND') {
    return results.every(r => r === true);
  } else if (conditions.operator === 'OR') {
    return results.some(r => r === true);
  }

  return false;
}

async function evaluateSingleCondition(condition, customerId, businessId) {
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
        const [result] = await db.select({
          count: sql`count(distinct ${visits.locationId})::int`
        })
        .from(visits)
        .where(and(eq(visits.customerId, customerId), eq(visits.locationId, condition.location_id)));
        count = result?.count || 0;
      } else {
        const [result] = await db.select({
          count: sql`count(distinct ${visits.locationId})::int`
        })
        .from(visits)
        .innerJoin(locations, eq(visits.locationId, locations.id))
        .where(and(eq(visits.customerId, customerId), eq(locations.businessId, businessId)));
        count = result?.count || 0;
      }

      return compare(count, condition.comparison, condition.value);
    } else if (condition.action === 'spend') {
      let total;
      if (condition.scope === 'specific') {
        const [result] = await db.select({
          total: sql`coalesce(sum(${visits.spendAmount}), 0)`
        })
        .from(visits)
        .where(and(eq(visits.customerId, customerId), eq(visits.locationId, condition.location_id)));
        total = parseFloat(result?.total) || 0;
      } else {
        const [result] = await db.select({
          total: sql`coalesce(sum(${visits.spendAmount}), 0)`
        })
        .from(visits)
        .innerJoin(locations, eq(visits.locationId, locations.id))
        .where(and(eq(visits.customerId, customerId), eq(locations.businessId, businessId)));
        total = parseFloat(result?.total) || 0;
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
