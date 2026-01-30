const { drizzle } = require('drizzle-orm/node-postgres');
const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const schema = require('./schema');

// Validate DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.error('ERROR: DATABASE_URL environment variable is required');
  console.error('Example: postgres://user:password@localhost:5432/lootly');
  process.exit(1);
}

// Create connection pool
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Create Drizzle instance with schema
const db = drizzle(pool, { schema });

// Generate prefixed ID using nanoid
function generateId(prefix) {
  return `${prefix}_${nanoid(16)}`;
}

// Helper to close pool on shutdown
async function closePool() {
  await pool.end();
}

process.on('SIGINT', async () => {
  await closePool();
  process.exit();
});

process.on('SIGTERM', async () => {
  await closePool();
  process.exit();
});

module.exports = {
  db,
  pool,
  schema,
  generateId,
  closePool,
};
