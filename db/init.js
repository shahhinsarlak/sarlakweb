/**
 * Database Initialization Script
 *
 * Run this script to create the database schema on your AWS RDS instance.
 *
 * Usage:
 *   node db/init.js
 *
 * Make sure your .env.local file is configured with database credentials.
 */

import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const { Pool } = pg;

// Get directory path for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables (Next.js style)
async function loadEnv() {
  const dotenv = await import('dotenv');

  // Try loading .env.local first (Next.js convention), then .env
  dotenv.config({ path: join(__dirname, '../.env.local') });
  dotenv.config({ path: join(__dirname, '../.env') });
}

async function initDatabase() {
  await loadEnv();

  // Validate environment
  const required = ['DATABASE_HOST', 'DATABASE_NAME', 'DATABASE_USER', 'DATABASE_PASSWORD'];
  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    console.error('Missing required environment variables:', missing.join(', '));
    console.error('\nCreate a .env.local file with your AWS RDS credentials.');
    console.error('See .env.example for the required format.');
    process.exit(1);
  }

  // Create pool
  const pool = new Pool({
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
    database: process.env.DATABASE_NAME,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  console.log('Connecting to database...');
  console.log(`  Host: ${process.env.DATABASE_HOST}`);
  console.log(`  Database: ${process.env.DATABASE_NAME}`);
  console.log(`  User: ${process.env.DATABASE_USER}`);
  console.log('');

  try {
    // Test connection
    const testResult = await pool.query('SELECT NOW() as current_time');
    console.log('Connected successfully at:', testResult.rows[0].current_time);
    console.log('');

    // Read schema file
    const schemaPath = join(__dirname, 'schema.sql');
    const schema = readFileSync(schemaPath, 'utf8');

    console.log('Executing schema...');

    // Execute schema
    await pool.query(schema);

    console.log('Schema executed successfully!');
    console.log('');

    // Verify tables were created
    const tablesResult = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);

    console.log('Created tables:');
    tablesResult.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });

    console.log('');
    console.log('Database initialization complete!');

  } catch (error) {
    console.error('Database initialization failed:', error.message);

    if (error.code === 'ENOTFOUND') {
      console.error('\nCould not connect to the database host.');
      console.error('Check that your DATABASE_HOST is correct and the RDS instance is running.');
    } else if (error.code === '28P01') {
      console.error('\nAuthentication failed.');
      console.error('Check your DATABASE_USER and DATABASE_PASSWORD.');
    } else if (error.code === '3D000') {
      console.error('\nDatabase does not exist.');
      console.error(`Create the database "${process.env.DATABASE_NAME}" in your RDS instance first.`);
    }

    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run initialization
initDatabase();
