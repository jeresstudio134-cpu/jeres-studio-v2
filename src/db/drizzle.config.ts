import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const databaseUrl = process.env.DATABASE_URL || '';

console.log(`Drizzle Kit using PostgreSQL config with DATABASE_URL`);

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle', // Output directory for migrations
  dialect: 'postgresql',
  dbCredentials: {
    url: databaseUrl,
  },
  verbose: true,
});
