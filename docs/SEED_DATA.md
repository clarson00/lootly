# Lootly Seed Data - Pilot Customer

> **Pilot Customer:** Freddie Guerrera  
> **Business:** Freddie's Restaurant Group  
> **Locations:** 4 restaurants in Pennsylvania

## Business

```javascript
const business = {
  id: 'biz_freddies',
  name: "Freddie's Restaurant Group",
  owner_name: 'Freddie Guerrera',
  subscription_tier: 'pro',
  settings: {
    points_name: 'points',
    currency: 'USD'
  }
};
```

## Locations

```javascript
const locations = [
  {
    id: 'loc_honeybrook',
    business_id: 'biz_freddies',
    name: 'Honey Brook Pizza',
    icon: '🍕',
    address: 'Honey Brook, PA',
    is_active: true
  },
  {
    id: 'loc_lacocina',
    business_id: 'biz_freddies',
    name: 'La Cocina',
    icon: '🌮',
    address: 'PA',
    is_active: true
  },
  {
    id: 'loc_elrancho',
    business_id: 'biz_freddies',
    name: 'El Rancho Mexican Restaurant',
    icon: '🌯',
    address: 'PA',
    is_active: true
  },
  {
    id: 'loc_antonios',
    business_id: 'biz_freddies',
    name: "Antonio's Italian Restaurant",
    icon: '🍝',
    address: 'PA',
    is_active: true
  }
];
```

## Location Group

```javascript
const locationGroups = [
  {
    id: 'grp_all_freddies',
    business_id: 'biz_freddies',
    name: 'All Locations',
    location_ids: ['loc_honeybrook', 'loc_lacocina', 'loc_elrancho', 'loc_antonios']
  }
];
```

## Rules

```javascript
const rules = [
  // Base earning rule: 1 point per dollar
  {
    id: 'rule_base_earning',
    business_id: 'biz_freddies',
    name: 'Base Points',
    description: 'Earn 1 point for every $1 spent',
    conditions: {
      operator: 'AND',
      items: [
        { subject: 'location', scope: 'any', action: 'spend', comparison: '>=', value: 1 }
      ]
    },
    award_type: 'points_per_dollar',
    award_value: '1',
    is_active: true,
    is_repeatable: true
  },
  
  // Grand Tour milestone: Visit all 4 locations
  {
    id: 'rule_grand_tour',
    business_id: 'biz_freddies',
    name: 'Grand Tour',
    description: 'Visit all 4 of Freddie\'s restaurants to unlock a special reward!',
    conditions: {
      operator: 'AND',
      items: [
        { subject: 'location', scope: 'loc_honeybrook', action: 'visit', comparison: '>=', value: 1 },
        { subject: 'location', scope: 'loc_lacocina', action: 'visit', comparison: '>=', value: 1 },
        { subject: 'location', scope: 'loc_elrancho', action: 'visit', comparison: '>=', value: 1 },
        { subject: 'location', scope: 'loc_antonios', action: 'visit', comparison: '>=', value: 1 }
      ]
    },
    award_type: 'reward',
    award_value: 'reward_grand_tour',
    is_active: true,
    is_repeatable: false
  },
  
  // Weekend Warrior: Visit 2+ locations in 7 days
  {
    id: 'rule_weekend_warrior',
    business_id: 'biz_freddies',
    name: 'Weekend Warrior',
    description: 'Visit 2 or more locations within 7 days for bonus points!',
    conditions: {
      operator: 'AND',
      items: [
        { subject: 'location', scope: 'grp_all_freddies', action: 'visit_unique', comparison: '>=', value: 2 },
        { type: 'time_window', unit: 'days', value: 7 }
      ]
    },
    award_type: 'points',
    award_value: '50',
    is_active: true,
    is_repeatable: true,
    cooldown_days: 7
  }
];
```

## Rewards

```javascript
const rewards = [
  // Points-based rewards
  {
    id: 'reward_free_drink',
    business_id: 'biz_freddies',
    name: 'Free Drink',
    description: 'Any fountain drink or coffee',
    icon: '🥤',
    points_required: 50,
    reward_type: 'points_redemption',
    valid_locations: ['loc_honeybrook', 'loc_lacocina', 'loc_elrancho', 'loc_antonios'],
    is_active: true
  },
  {
    id: 'reward_free_appetizer',
    business_id: 'biz_freddies',
    name: 'Free Appetizer',
    description: 'Any appetizer up to $10 value',
    icon: '🥟',
    points_required: 100,
    reward_type: 'points_redemption',
    valid_locations: ['loc_honeybrook', 'loc_lacocina', 'loc_elrancho', 'loc_antonios'],
    is_active: true
  },
  {
    id: 'reward_10_off',
    business_id: 'biz_freddies',
    name: '$10 Off',
    description: '$10 off any order of $25 or more',
    icon: '💵',
    points_required: 200,
    reward_type: 'points_redemption',
    valid_locations: ['loc_honeybrook', 'loc_lacocina', 'loc_elrancho', 'loc_antonios'],
    is_active: true
  },
  
  // Milestone reward (unlocked by Grand Tour rule)
  {
    id: 'reward_grand_tour',
    business_id: 'biz_freddies',
    name: 'Grand Tour Champion',
    description: '$25 off + Double points for 30 days!',
    icon: '🏆',
    points_required: 0,  // Unlocked by rule, not points
    reward_type: 'milestone',
    effects: {
      discount_amount: 25,
      points_multiplier: 2.0,
      multiplier_duration_days: 30
    },
    valid_locations: ['loc_honeybrook', 'loc_lacocina', 'loc_elrancho', 'loc_antonios'],
    is_active: true
  }
];
```

## Staff

```javascript
const staff = [
  // Honey Brook Pizza
  {
    id: 'staff_hb_1',
    location_id: 'loc_honeybrook',
    name: 'Manager',
    pin: '1234',
    role: 'manager'
  },
  
  // La Cocina
  {
    id: 'staff_lc_1',
    location_id: 'loc_lacocina',
    name: 'Manager',
    pin: '1234',
    role: 'manager'
  },
  
  // El Rancho
  {
    id: 'staff_er_1',
    location_id: 'loc_elrancho',
    name: 'Manager',
    pin: '1234',
    role: 'manager'
  },
  
  // Antonio's
  {
    id: 'staff_ant_1',
    location_id: 'loc_antonios',
    name: 'Manager',
    pin: '1234',
    role: 'manager'
  }
];
```

## Test Customer (for development)

```javascript
const testCustomer = {
  id: 'cust_test_001',
  phone: '+15555551234',
  name: 'Test Customer',
  email: 'test@example.com'
};

const testEnrollment = {
  id: 'enroll_test_001',
  customer_id: 'cust_test_001',
  business_id: 'biz_freddies',
  points_balance: 150,
  points_multiplier: 1.0,
  tier: 'member'
};
```

## Summary

| Entity | Count | Notes |
|--------|-------|-------|
| Business | 1 | Freddie's Restaurant Group |
| Locations | 4 | Pizza, 2 Mexican, 1 Italian |
| Location Groups | 1 | All Locations |
| Rules | 3 | Base earning, Grand Tour, Weekend Warrior |
| Rewards | 4 | 3 points-based + 1 milestone |
| Staff | 4 | 1 manager per location (PIN: 1234) |
| Test Customer | 1 | For development testing |

## Location Icons Quick Reference

| Location | Icon |
|----------|------|
| Honey Brook Pizza | 🍕 |
| La Cocina | 🌮 |
| El Rancho Mexican Restaurant | 🌯 |
| Antonio's Italian Restaurant | 🍝 |

---

*This file is used by `backend/db/seed.js` to populate the database for development and pilot testing.*
