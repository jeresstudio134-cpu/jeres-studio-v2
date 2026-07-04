import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './schema.ts';

// Function to create a new connection pool.
export const createPool = () => {
  return mysql.createPool({
    host: process.env.SQL_HOST || '127.0.0.1',
    port: parseInt(process.env.SQL_PORT || '3306', 10),
    user: process.env.SQL_USER || 'root',
    password: process.env.SQL_PASSWORD || '',
    database: process.env.SQL_DB_NAME || 'db_jeres_studio',
    connectionLimit: 10,
    waitForConnections: true,
  });
};

// Create a pool instance.
const pool = createPool();

// Initialize Drizzle with the pool and schema.
export const db = drizzle(pool, { schema, mode: 'default' });

