-- Lootly Database Schema

-- Businesses (tenants)
CREATE TABLE IF NOT EXISTS businesses (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#f59e0b',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Locations within a business
CREATE TABLE IF NOT EXISTS locations (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  name TEXT NOT NULL,
  address TEXT,
  icon TEXT,
  qr_code TEXT UNIQUE,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Location groups (for scoping rules)
CREATE TABLE IF NOT EXISTS location_groups (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  name TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Junction table for location groups
CREATE TABLE IF NOT EXISTS location_group_members (
  group_id TEXT NOT NULL REFERENCES location_groups(id),
  location_id TEXT NOT NULL REFERENCES locations(id),
  PRIMARY KEY (group_id, location_id)
);

-- Customers
CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  phone TEXT UNIQUE NOT NULL,
  name TEXT,
  email TEXT,
  qr_code TEXT UNIQUE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Customer enrollment in business loyalty programs
CREATE TABLE IF NOT EXISTS enrollments (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL REFERENCES customers(id),
  business_id TEXT NOT NULL REFERENCES businesses(id),
  points_balance INTEGER DEFAULT 0,
  total_points_earned INTEGER DEFAULT 0,
  total_spend REAL DEFAULT 0,
  points_multiplier REAL DEFAULT 1.0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(customer_id, business_id)
);

-- Track visits to specific locations
CREATE TABLE IF NOT EXISTS visits (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL REFERENCES customers(id),
  location_id TEXT NOT NULL REFERENCES locations(id),
  spend_amount REAL,
  points_earned INTEGER,
  staff_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Earning rules
CREATE TABLE IF NOT EXISTS earning_rules (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  points_per_visit INTEGER,
  points_per_dollar REAL,
  product_name TEXT,
  bonus_points INTEGER,
  location_group_id TEXT REFERENCES location_groups(id),
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Rewards
CREATE TABLE IF NOT EXISTS rewards (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  points_cost INTEGER NOT NULL,
  dollar_value REAL,
  reward_type TEXT NOT NULL,
  earning_location_group_id TEXT REFERENCES location_groups(id),
  redemption_location_group_id TEXT REFERENCES location_groups(id),
  is_milestone INTEGER DEFAULT 0,
  milestone_bonus_multiplier REAL,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Customer rewards (unlocked/redeemed)
CREATE TABLE IF NOT EXISTS customer_rewards (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL REFERENCES customers(id),
  reward_id TEXT NOT NULL REFERENCES rewards(id),
  status TEXT NOT NULL DEFAULT 'unlocked',
  unlocked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  redeemed_at DATETIME,
  redeemed_location_id TEXT REFERENCES locations(id),
  redemption_code TEXT UNIQUE
);

-- Staff users
CREATE TABLE IF NOT EXISTS staff (
  id TEXT PRIMARY KEY,
  location_id TEXT NOT NULL REFERENCES locations(id),
  name TEXT NOT NULL,
  pin_hash TEXT NOT NULL,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Rules table for composable rules engine
CREATE TABLE IF NOT EXISTS rules (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  name TEXT NOT NULL,
  description TEXT,
  conditions TEXT NOT NULL,
  award_type TEXT NOT NULL,
  award_value TEXT NOT NULL,
  is_active INTEGER DEFAULT 1,
  is_repeatable INTEGER DEFAULT 0,
  cooldown_days INTEGER,
  start_date DATETIME,
  end_date DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Track which rules customers have triggered
CREATE TABLE IF NOT EXISTS customer_rule_triggers (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL REFERENCES customers(id),
  rule_id TEXT NOT NULL REFERENCES rules(id),
  triggered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  award_given TEXT
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_locations_business ON locations(business_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_customer ON enrollments(customer_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_business ON enrollments(business_id);
CREATE INDEX IF NOT EXISTS idx_visits_customer ON visits(customer_id);
CREATE INDEX IF NOT EXISTS idx_visits_location ON visits(location_id);
CREATE INDEX IF NOT EXISTS idx_customer_rewards_customer ON customer_rewards(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_rewards_status ON customer_rewards(status);
CREATE INDEX IF NOT EXISTS idx_staff_location ON staff(location_id);
