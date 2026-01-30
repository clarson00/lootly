/**
 * Migration: Add pending_award_choices table
 *
 * Adds support for OR-based award choices where customers
 * can pick which location/group to claim their rewards at.
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Pool } = require('pg');

async function migrate() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  const client = await pool.connect();

  try {
    console.log('Starting migration: pending_award_choices table...');

    await client.query('BEGIN');

    // Create pending_award_choices table
    await client.query(`
      CREATE TABLE IF NOT EXISTS pending_award_choices (
        id TEXT PRIMARY KEY,
        customer_id TEXT NOT NULL REFERENCES customers(id),
        business_id TEXT NOT NULL REFERENCES businesses(id),
        rule_id TEXT NOT NULL REFERENCES rules(id),
        rule_trigger_id TEXT REFERENCES rule_triggers(id),

        award_options JSONB NOT NULL,

        status TEXT DEFAULT 'pending',

        claimed_group_index INTEGER,
        claimed_location_id TEXT REFERENCES locations(id),
        claimed_at TIMESTAMP,
        awards_given JSONB,

        created_at TIMESTAMP DEFAULT NOW(),
        expires_at TIMESTAMP
      )
    `);

    console.log('Created pending_award_choices table');

    // Create indexes
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_pending_awards_customer
      ON pending_award_choices(customer_id)
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_pending_awards_business
      ON pending_award_choices(business_id)
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_pending_awards_status
      ON pending_award_choices(status)
    `);

    console.log('Created indexes');

    await client.query('COMMIT');

    console.log('✅ Migration completed successfully!');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
