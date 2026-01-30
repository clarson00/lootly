/**
 * Migration: Rules Engine Schema
 *
 * This script adds the rules engine tables for Phase 1:
 * - rulesets (Voyages)
 * - Updates to rules table
 * - rule_triggers updates
 * - ruleset_progress
 * - customer_tags
 *
 * Run with: node db/migrate-rules-engine.js
 */

require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function migrate() {
  const client = await pool.connect();

  try {
    console.log('Starting rules engine migration...\n');

    await client.query('BEGIN');

    // 1. Create rulesets table
    console.log('1. Creating rulesets table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS rulesets (
        id TEXT PRIMARY KEY,
        business_id TEXT NOT NULL REFERENCES businesses(id),

        -- Identity
        name TEXT NOT NULL,
        description TEXT,

        -- Gamification Theme
        theme TEXT DEFAULT 'voyage',
        display_name TEXT,
        tagline TEXT,
        narrative_intro TEXT,
        narrative_complete TEXT,

        -- Visual
        icon TEXT,
        color TEXT,
        badge_image_url TEXT,
        background_image_url TEXT,

        -- Chain Configuration
        chain_type TEXT DEFAULT 'parallel',
        time_limit_value INTEGER,
        time_limit_unit TEXT,

        -- Customer Visibility
        is_visible_to_customer BOOLEAN DEFAULT TRUE,
        show_progress BOOLEAN DEFAULT TRUE,
        show_locked_steps BOOLEAN DEFAULT TRUE,

        -- Status
        is_active BOOLEAN DEFAULT FALSE,
        priority INTEGER DEFAULT 0,

        -- Scheduling
        starts_at TIMESTAMP WITH TIME ZONE,
        ends_at TIMESTAMP WITH TIME ZONE,

        -- Metadata
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE
      );

      CREATE INDEX IF NOT EXISTS idx_rulesets_business ON rulesets(business_id);
    `);
    console.log('   ✓ rulesets table created\n');

    // 2. Update rules table with new columns
    console.log('2. Updating rules table...');

    // Add ruleset_id column
    await client.query(`
      ALTER TABLE rules
      ADD COLUMN IF NOT EXISTS ruleset_id TEXT REFERENCES rulesets(id);
    `);

    // Add customer-facing columns
    await client.query(`
      ALTER TABLE rules
      ADD COLUMN IF NOT EXISTS display_name TEXT,
      ADD COLUMN IF NOT EXISTS display_description TEXT,
      ADD COLUMN IF NOT EXISTS hint TEXT,
      ADD COLUMN IF NOT EXISTS icon TEXT;
    `);

    // Add awards array column
    await client.query(`
      ALTER TABLE rules
      ADD COLUMN IF NOT EXISTS awards JSONB DEFAULT '[]'::jsonb;
    `);

    // Add chaining columns
    await client.query(`
      ALTER TABLE rules
      ADD COLUMN IF NOT EXISTS sequence_order INTEGER,
      ADD COLUMN IF NOT EXISTS depends_on_rule_ids JSONB;
    `);

    // Add feature gating column
    await client.query(`
      ALTER TABLE rules
      ADD COLUMN IF NOT EXISTS required_feature TEXT;
    `);

    // Rename columns to match new schema (if they exist with old names)
    // max_triggers -> max_triggers_per_customer
    const maxTriggersExists = await client.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'rules' AND column_name = 'max_triggers';
    `);
    if (maxTriggersExists.rows.length > 0) {
      await client.query(`
        ALTER TABLE rules RENAME COLUMN max_triggers TO max_triggers_per_customer;
      `);
    } else {
      await client.query(`
        ALTER TABLE rules
        ADD COLUMN IF NOT EXISTS max_triggers_per_customer INTEGER;
      `);
    }

    // Rename start_date/end_date to starts_at/ends_at
    const startDateExists = await client.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'rules' AND column_name = 'start_date';
    `);
    if (startDateExists.rows.length > 0) {
      await client.query(`
        ALTER TABLE rules RENAME COLUMN start_date TO starts_at;
      `);
    } else {
      await client.query(`
        ALTER TABLE rules
        ADD COLUMN IF NOT EXISTS starts_at TIMESTAMP WITH TIME ZONE;
      `);
    }

    const endDateExists = await client.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'rules' AND column_name = 'end_date';
    `);
    if (endDateExists.rows.length > 0) {
      await client.query(`
        ALTER TABLE rules RENAME COLUMN end_date TO ends_at;
      `);
    } else {
      await client.query(`
        ALTER TABLE rules
        ADD COLUMN IF NOT EXISTS ends_at TIMESTAMP WITH TIME ZONE;
      `);
    }

    // Create index on ruleset_id
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_rules_ruleset ON rules(ruleset_id);
    `);

    console.log('   ✓ rules table updated\n');

    // 3. Update rule_triggers table
    console.log('3. Updating rule_triggers table...');

    await client.query(`
      ALTER TABLE rule_triggers
      ADD COLUMN IF NOT EXISTS ruleset_id TEXT REFERENCES rulesets(id),
      ADD COLUMN IF NOT EXISTS customer_id TEXT REFERENCES customers(id),
      ADD COLUMN IF NOT EXISTS business_id TEXT REFERENCES businesses(id),
      ADD COLUMN IF NOT EXISTS trigger_transaction_id TEXT REFERENCES transactions(id),
      ADD COLUMN IF NOT EXISTS trigger_type TEXT,
      ADD COLUMN IF NOT EXISTS awards_given JSONB DEFAULT '[]'::jsonb,
      ADD COLUMN IF NOT EXISTS points_awarded INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS reward_id_unlocked TEXT REFERENCES rewards(id),
      ADD COLUMN IF NOT EXISTS condition_snapshot JSONB,
      ADD COLUMN IF NOT EXISTS evaluation_context JSONB;
    `);

    // Backfill trigger_type for existing records
    await client.query(`
      UPDATE rule_triggers
      SET trigger_type = 'transaction'
      WHERE trigger_type IS NULL;
    `);

    // Make trigger_type NOT NULL after backfill
    await client.query(`
      ALTER TABLE rule_triggers
      ALTER COLUMN trigger_type SET NOT NULL;
    `);

    // Backfill awards_given for existing records
    await client.query(`
      UPDATE rule_triggers
      SET awards_given = '[]'::jsonb
      WHERE awards_given IS NULL;
    `);

    // Make awards_given NOT NULL
    await client.query(`
      ALTER TABLE rule_triggers
      ALTER COLUMN awards_given SET NOT NULL;
    `);

    // Create indexes
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_rule_triggers_rule ON rule_triggers(rule_id);
      CREATE INDEX IF NOT EXISTS idx_rule_triggers_customer ON rule_triggers(customer_id);
      CREATE INDEX IF NOT EXISTS idx_rule_triggers_business ON rule_triggers(business_id);
    `);

    console.log('   ✓ rule_triggers table updated\n');

    // 4. Create ruleset_progress table
    console.log('4. Creating ruleset_progress table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS ruleset_progress (
        id TEXT PRIMARY KEY,
        ruleset_id TEXT NOT NULL REFERENCES rulesets(id),
        customer_id TEXT NOT NULL REFERENCES customers(id),
        business_id TEXT NOT NULL REFERENCES businesses(id),

        -- Progress State
        status TEXT DEFAULT 'not_started',

        -- Tracking
        started_at TIMESTAMP WITH TIME ZONE,
        completed_at TIMESTAMP WITH TIME ZONE,
        expires_at TIMESTAMP WITH TIME ZONE,

        -- Progress Data
        completed_rule_ids JSONB DEFAULT '[]'::jsonb,
        current_step INTEGER DEFAULT 0,

        -- Stats
        total_points_earned INTEGER DEFAULT 0,
        total_rewards_unlocked INTEGER DEFAULT 0,

        -- Metadata
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE,

        UNIQUE(ruleset_id, customer_id)
      );

      CREATE INDEX IF NOT EXISTS idx_ruleset_progress_ruleset ON ruleset_progress(ruleset_id);
      CREATE INDEX IF NOT EXISTS idx_ruleset_progress_customer ON ruleset_progress(customer_id);
      CREATE INDEX IF NOT EXISTS idx_ruleset_progress_business ON ruleset_progress(business_id);
    `);
    console.log('   ✓ ruleset_progress table created\n');

    // 5. Create customer_tags table
    console.log('5. Creating customer_tags table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS customer_tags (
        id TEXT PRIMARY KEY,
        customer_id TEXT NOT NULL REFERENCES customers(id),
        business_id TEXT NOT NULL REFERENCES businesses(id),

        tag TEXT NOT NULL,

        -- Source
        source_type TEXT NOT NULL,
        source_rule_id TEXT REFERENCES rules(id),

        -- Metadata
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        expires_at TIMESTAMP WITH TIME ZONE,

        UNIQUE(customer_id, business_id, tag)
      );

      CREATE INDEX IF NOT EXISTS idx_customer_tags_customer ON customer_tags(customer_id);
      CREATE INDEX IF NOT EXISTS idx_customer_tags_business ON customer_tags(business_id);
      CREATE INDEX IF NOT EXISTS idx_customer_tags_tag ON customer_tags(tag);
    `);
    console.log('   ✓ customer_tags table created\n');

    await client.query('COMMIT');

    console.log('============================================');
    console.log('Migration completed successfully!');
    console.log('============================================');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch(err => {
  console.error(err);
  process.exit(1);
});
