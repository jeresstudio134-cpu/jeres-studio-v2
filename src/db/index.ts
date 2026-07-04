import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';
import * as schema from './schema.ts';

// Function to create a new connection pool.
export const createPool = () => {
  return new Pool({
    connectionString: process.env.DATABASE_URL || '',
  });
};

// Create a pool instance.
const pool = createPool();

// Initialize Drizzle with the pool and schema.
export const db = drizzle(pool, { schema });
