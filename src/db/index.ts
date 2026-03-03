import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { retailers } from './schema';

// Database connection
const connectionString = process.env.NEON_DATABASE_URL || '';

if (!connectionString) {
  console.warn('NEON_DATABASE_URL is not set. Database functionality will not work.');
}

// Only create database connection if connectionString is available
let db;
if (connectionString) {
  try {
    const pool = new Pool({ connectionString });
    db = drizzle(pool);
  } catch (error) {
    console.error('Failed to create database connection:', error);
    
    // Create a mock database object for simplified mode
    db = {
      select: () => ({
        from: () => ({
          where: () => ({
            limit: () => Promise.resolve([])
          }),
          limit: () => Promise.resolve([])
        })
      }),
      insert: () => ({
        values: () => ({
          returning: () => Promise.resolve([])
        })
      }),
      update: () => ({
        set: () => ({
          where: () => Promise.resolve([])
        })
      })
    };
    console.log('Using mock database in simplified mode');
  }
} else {
  // Create a mock database object for simplified mode
  db = {
    select: () => ({
      from: () => ({
        where: () => ({
          limit: () => Promise.resolve([])
        }),
        limit: () => Promise.resolve([])
      })
    }),
    insert: () => ({
      values: () => ({
        returning: () => Promise.resolve([])
      })
    }),
    update: () => ({
      set: () => ({
        where: () => Promise.resolve([])
      })
    })
  };
  console.log('Using mock database in simplified mode');
}

export { db };

// Export the schema for convenience
export { retailers };