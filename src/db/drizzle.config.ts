import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const sqlHost = process.env.SQL_HOST || '127.0.0.1';
const sqlPort = parseInt(process.env.SQL_PORT || '3306', 10);
const sqlDbName = process.env.SQL_DB_NAME || 'db_jeres_studio';
const user = process.env.SQL_USER || 'root';
const password = process.env.SQL_PASSWORD || '';

console.log(`Drizzle Kit using MySQL config: host=${sqlHost}:${sqlPort}, user=${user}, database=${sqlDbName}`);

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle', // Output directory for migrations
  dialect: 'mysql',
  dbCredentials: {
    host: sqlHost,
    port: sqlPort,
    user: user,
    password: password,
    database: sqlDbName,
  },
  verbose: true,
});
