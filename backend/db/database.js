const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');

const dbPath = process.env.DATABASE_PATH || './db/lootly.db';
const dbDir = path.dirname(dbPath);

// Ensure db directory exists
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

let SQL;
let database;

// Wrapper class to mimic better-sqlite3 API
class PreparedStatement {
  constructor(db, sql) {
    this.db = db;
    this.sql = sql;
  }

  run(...params) {
    this.db.run(this.sql, params);
    return { changes: this.db.getRowsModified() };
  }

  get(...params) {
    const stmt = this.db.prepare(this.sql);
    stmt.bind(params);
    if (stmt.step()) {
      const row = stmt.getAsObject();
      stmt.free();
      return row;
    }
    stmt.free();
    return undefined;
  }

  all(...params) {
    const results = [];
    const stmt = this.db.prepare(this.sql);
    stmt.bind(params);
    while (stmt.step()) {
      results.push(stmt.getAsObject());
    }
    stmt.free();
    return results;
  }
}

// Database wrapper
const db = {
  prepare(sql) {
    return new PreparedStatement(database, sql);
  },
  exec(sql) {
    database.run(sql);
  },
  pragma(pragma) {
    database.run(`PRAGMA ${pragma}`);
  }
};

// Save database to disk
function saveDatabase() {
  if (database) {
    const data = database.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  }
}

// Auto-save periodically
setInterval(saveDatabase, 5000);

// Save on exit
process.on('exit', saveDatabase);
process.on('SIGINT', () => {
  saveDatabase();
  process.exit();
});

// Initialize database
async function initializeDatabase() {
  SQL = await initSqlJs();

  // Load existing database or create new one
  if (fs.existsSync(dbPath)) {
    const fileBuffer = fs.readFileSync(dbPath);
    database = new SQL.Database(fileBuffer);
    console.log('Database loaded from disk');
  } else {
    database = new SQL.Database();
    console.log('New database created');
  }

  // Enable foreign keys
  database.run('PRAGMA foreign_keys = ON');

  // Run schema
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');
  database.run(schema);

  console.log('Database initialized');
  saveDatabase();
}

// Generate prefixed ID
function generateId(prefix) {
  return `${prefix}${Date.now().toString(36)}${Math.random().toString(36).substr(2, 9)}`;
}

module.exports = {
  db,
  initializeDatabase,
  generateId,
  saveDatabase
};
