import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn('WARNING: DATABASE_URL is not set in the environment. Database operations may fail.');
}

export const pool = new Pool({
  connectionString,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Handle unexpected errors on idle clients
pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client:', err);
});

/**
 * Execute a query helper function
 * @param text SQL query text
 * @param params Query parameters
 */
export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.debug(`Executed query: ${text.replace(/\s+/g, ' ').substring(0, 80)}... in ${duration}ms (rows: ${res.rowCount})`);
    return res;
  } catch (error) {
    console.error('Database query execution error:', error);
    throw error;
  }
};
