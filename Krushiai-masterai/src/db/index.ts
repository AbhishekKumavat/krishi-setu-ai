import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

// Fallback to a fake URL if DATABASE_URL is not set so Next.js doesn't crash on boot in development
const sql = neon(process.env.DATABASE_URL || "postgres://fakeuser:fakepassword@fakehost.neon.tech/fakedb?sslmode=require");
export const db = drizzle(sql, { schema });
