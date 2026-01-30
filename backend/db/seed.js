require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const bcrypt = require('bcryptjs');
const { db, initializeDatabase, generateId, saveDatabase } = require('./database');

async function seed() {
  console.log('Seeding database...');

  // Initialize schema first
  await initializeDatabase();

  // Clear existing data
  db.exec(`
    DELETE FROM customer_rule_triggers;
    DELETE FROM customer_rewards;
    DELETE FROM visits;
    DELETE FROM staff;
    DELETE FROM rules;
    DELETE FROM rewards;
    DELETE FROM earning_rules;
    DELETE FROM location_group_members;
    DELETE FROM location_groups;
    DELETE FROM enrollments;
    DELETE FROM customers;
    DELETE FROM locations;
    DELETE FROM businesses;
  `);

  // Insert business
  const business = {
    id: 'biz_pilot',
    name: "Tony's Restaurant Group",
    logo_url: null,
    primary_color: '#f59e0b'
  };

  db.prepare(`
    INSERT INTO businesses (id, name, logo_url, primary_color)
    VALUES (?, ?, ?, ?)
  `).run(business.id, business.name, business.logo_url, business.primary_color);

  console.log('Created business:', business.name);

  // Insert locations
  const locations = [
    { id: 'loc_1', business_id: 'biz_pilot', name: "Tony's Pizza", icon: '🍕', address: '123 Main St' },
    { id: 'loc_2', business_id: 'biz_pilot', name: 'Casa Verde', icon: '🌮', address: '456 Oak Ave' },
    { id: 'loc_3', business_id: 'biz_pilot', name: 'Bella Italia', icon: '🍝', address: '789 Elm St' },
    { id: 'loc_4', business_id: 'biz_pilot', name: 'Dragon Wok', icon: '🥡', address: '321 Pine Rd' }
  ];

  for (const loc of locations) {
    db.prepare(`
      INSERT INTO locations (id, business_id, name, icon, address, qr_code)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(loc.id, loc.business_id, loc.name, loc.icon, loc.address, `lootly:location:${loc.id}`);
    console.log('Created location:', loc.name);
  }

  // Create "All Locations" group
  const allLocationsGroup = {
    id: 'grp_all',
    business_id: 'biz_pilot',
    name: 'All Locations'
  };

  db.prepare(`
    INSERT INTO location_groups (id, business_id, name)
    VALUES (?, ?, ?)
  `).run(allLocationsGroup.id, allLocationsGroup.business_id, allLocationsGroup.name);

  // Add all locations to the group
  for (const loc of locations) {
    db.prepare(`
      INSERT INTO location_group_members (group_id, location_id)
      VALUES (?, ?)
    `).run(allLocationsGroup.id, loc.id);
  }

  console.log('Created location group:', allLocationsGroup.name);

  // Create earning rule: 1 point per dollar
  const earningRule = {
    id: 'rule_standard',
    business_id: 'biz_pilot',
    name: 'Standard Earning',
    type: 'spend',
    points_per_dollar: 1,
    location_group_id: 'grp_all'
  };

  db.prepare(`
    INSERT INTO earning_rules (id, business_id, name, type, points_per_dollar, location_group_id)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(earningRule.id, earningRule.business_id, earningRule.name, earningRule.type, earningRule.points_per_dollar, earningRule.location_group_id);

  console.log('Created earning rule:', earningRule.name);

  // Create rewards
  const rewards = [
    {
      id: 'reward_1',
      business_id: 'biz_pilot',
      name: 'Free Pizza',
      description: "One free personal pizza at Tony's Pizza",
      icon: '🍕',
      points_cost: 100,
      dollar_value: 15,
      reward_type: 'free_item',
      is_milestone: 0
    },
    {
      id: 'reward_2',
      business_id: 'biz_pilot',
      name: 'Free Nachos',
      description: 'Free loaded nachos at Casa Verde',
      icon: '🌮',
      points_cost: 100,
      dollar_value: 12,
      reward_type: 'free_item',
      is_milestone: 0
    },
    {
      id: 'reward_3',
      business_id: 'biz_pilot',
      name: 'Free Pasta',
      description: 'Free pasta dish at Bella Italia',
      icon: '🍝',
      points_cost: 100,
      dollar_value: 14,
      reward_type: 'free_item',
      is_milestone: 0
    },
    {
      id: 'reward_4',
      business_id: 'biz_pilot',
      name: 'Free Combo',
      description: 'Free combo meal at Dragon Wok',
      icon: '🥡',
      points_cost: 100,
      dollar_value: 13,
      reward_type: 'free_item',
      is_milestone: 0
    },
    {
      id: 'reward_grand_tour',
      business_id: 'biz_pilot',
      name: '$50 Off Grand Tour',
      description: 'Visit all 4 locations to unlock! $50 off your next order anywhere.',
      icon: '🏆',
      points_cost: 0,
      dollar_value: 50,
      reward_type: 'milestone',
      is_milestone: 1,
      milestone_bonus_multiplier: 2.0
    }
  ];

  for (const reward of rewards) {
    db.prepare(`
      INSERT INTO rewards (id, business_id, name, description, icon, points_cost, dollar_value, reward_type, is_milestone, milestone_bonus_multiplier)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      reward.id,
      reward.business_id,
      reward.name,
      reward.description,
      reward.icon,
      reward.points_cost,
      reward.dollar_value,
      reward.reward_type,
      reward.is_milestone,
      reward.milestone_bonus_multiplier || null
    );
    console.log('Created reward:', reward.name);
  }

  // Create Grand Tour rule
  const grandTourRule = {
    id: 'rule_grand_tour',
    business_id: 'biz_pilot',
    name: 'Grand Tour',
    description: 'Visit all 4 locations to unlock epic rewards!',
    conditions: JSON.stringify({
      operator: 'AND',
      items: [
        { subject: 'location', scope: 'specific', location_id: 'loc_1', action: 'visit', comparison: '>=', value: 1 },
        { subject: 'location', scope: 'specific', location_id: 'loc_2', action: 'visit', comparison: '>=', value: 1 },
        { subject: 'location', scope: 'specific', location_id: 'loc_3', action: 'visit', comparison: '>=', value: 1 },
        { subject: 'location', scope: 'specific', location_id: 'loc_4', action: 'visit', comparison: '>=', value: 1 }
      ]
    }),
    award_type: 'reward',
    award_value: 'reward_grand_tour',
    is_repeatable: 0
  };

  db.prepare(`
    INSERT INTO rules (id, business_id, name, description, conditions, award_type, award_value, is_repeatable)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    grandTourRule.id,
    grandTourRule.business_id,
    grandTourRule.name,
    grandTourRule.description,
    grandTourRule.conditions,
    grandTourRule.award_type,
    grandTourRule.award_value,
    grandTourRule.is_repeatable
  );

  console.log('Created rule:', grandTourRule.name);

  // Create staff for each location (PIN: 1234)
  const pinHash = bcrypt.hashSync('1234', 10);

  for (const loc of locations) {
    const staffId = `staff_${loc.id}`;
    db.prepare(`
      INSERT INTO staff (id, location_id, name, pin_hash)
      VALUES (?, ?, ?, ?)
    `).run(staffId, loc.id, `${loc.name} Staff`, pinHash);
    console.log('Created staff for:', loc.name);
  }

  // Create a test customer
  const testCustomer = {
    id: 'cust_test',
    phone: '+15551234567',
    name: 'Test Customer',
    email: 'test@example.com',
    qr_code: 'lootly:customer:cust_test'
  };

  db.prepare(`
    INSERT INTO customers (id, phone, name, email, qr_code)
    VALUES (?, ?, ?, ?, ?)
  `).run(testCustomer.id, testCustomer.phone, testCustomer.name, testCustomer.email, testCustomer.qr_code);

  console.log('Created test customer:', testCustomer.phone);

  // Enroll test customer in pilot business
  const testEnrollment = {
    id: 'enroll_test',
    customer_id: 'cust_test',
    business_id: 'biz_pilot',
    points_balance: 50,
    total_points_earned: 50,
    total_spend: 50
  };

  db.prepare(`
    INSERT INTO enrollments (id, customer_id, business_id, points_balance, total_points_earned, total_spend)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    testEnrollment.id,
    testEnrollment.customer_id,
    testEnrollment.business_id,
    testEnrollment.points_balance,
    testEnrollment.total_points_earned,
    testEnrollment.total_spend
  );

  console.log('Enrolled test customer in business');

  // Save database to disk
  saveDatabase();

  console.log('\n✅ Database seeded successfully!');
  console.log('\nTest credentials:');
  console.log('  Customer phone: +15551234567 (code: 1234)');
  console.log('  Staff PIN: 1234 (any location)');

  process.exit(0);
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
