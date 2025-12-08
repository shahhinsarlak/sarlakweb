/**
 * Database Connection Utility
 *
 * Manages PostgreSQL connection pool for AWS RDS.
 * Uses connection pooling for efficient request handling.
 */

import { Pool } from 'pg';

// Connection pool singleton
let pool = null;

/**
 * Get or create the database connection pool
 * @returns {Pool} PostgreSQL connection pool
 */
export function getPool() {
  if (!pool) {
    const config = {
      host: process.env.DATABASE_HOST,
      port: parseInt(process.env.DATABASE_PORT || '5432', 10),
      database: process.env.DATABASE_NAME,
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      // Connection pool settings
      max: 20,                    // Maximum connections in pool
      idleTimeoutMillis: 30000,   // Close idle connections after 30s
      connectionTimeoutMillis: 10000, // Timeout for new connections
      // SSL required for AWS RDS
      ssl: process.env.NODE_ENV === 'production' ? {
        rejectUnauthorized: false  // AWS RDS uses self-signed certs
      } : false
    };

    // Validate required config
    if (!config.host || !config.database || !config.user || !config.password) {
      throw new Error(
        'Database configuration missing. Check DATABASE_HOST, DATABASE_NAME, DATABASE_USER, DATABASE_PASSWORD environment variables.'
      );
    }

    pool = new Pool(config);

    // Handle pool errors
    pool.on('error', (err) => {
      console.error('[DB] Unexpected error on idle client:', err);
    });

    // Log connection in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[DB] Connection pool created for:', config.host);
    }
  }

  return pool;
}

/**
 * Execute a query with automatic connection handling
 * @param {string} text - SQL query text
 * @param {Array} params - Query parameters
 * @returns {Promise<Object>} Query result
 */
export async function query(text, params) {
  const pool = getPool();
  const start = Date.now();

  try {
    const result = await pool.query(text, params);

    // Log slow queries in development
    const duration = Date.now() - start;
    if (process.env.NODE_ENV === 'development' && duration > 100) {
      console.log('[DB] Slow query:', { text, duration: `${duration}ms`, rows: result.rowCount });
    }

    return result;
  } catch (error) {
    console.error('[DB] Query error:', { text, error: error.message });
    throw error;
  }
}

/**
 * Get a client from the pool for transactions
 * Remember to release the client when done!
 * @returns {Promise<Object>} Pool client
 */
export async function getClient() {
  const pool = getPool();
  const client = await pool.connect();

  // Track client acquisition for debugging
  const originalRelease = client.release.bind(client);
  let released = false;

  client.release = () => {
    if (released) {
      console.warn('[DB] Client released multiple times');
      return;
    }
    released = true;
    return originalRelease();
  };

  return client;
}

/**
 * Execute multiple queries in a transaction
 * @param {Function} callback - Async function receiving client
 * @returns {Promise<any>} Result of callback
 */
export async function transaction(callback) {
  const client = await getClient();

  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Check database connection health
 * @returns {Promise<boolean>} True if connected
 */
export async function checkConnection() {
  try {
    const result = await query('SELECT NOW() as current_time');
    return !!result.rows[0];
  } catch (error) {
    console.error('[DB] Connection check failed:', error.message);
    return false;
  }
}

/**
 * Close all pool connections (for graceful shutdown)
 */
export async function closePool() {
  if (pool) {
    await pool.end();
    pool = null;
    console.log('[DB] Connection pool closed');
  }
}

export default {
  query,
  getClient,
  getPool,
  transaction,
  checkConnection,
  closePool
};
