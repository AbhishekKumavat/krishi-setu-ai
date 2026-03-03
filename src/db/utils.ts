import { db } from '.';
import { retailers } from './schema';
import { eq } from 'drizzle-orm';

// Initialize database tables if they don't exist
export async function initializeDb() {
  try {
    // Skip database initialization in simplified mode
    // Test connection by trying to select from the table
    // await db.select().from(retailers).limit(1);
    // console.log('Database connection successful');
    console.log('Database initialization skipped in simplified mode');
  } catch (error) {
    console.error('Database connection failed:', error);
    console.warn('Database functionality may not work properly');
  }
}

// Helper function to generate a unique retailer ID
export function generateRetailerId(): string {
  return `retailer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}