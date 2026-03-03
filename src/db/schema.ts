import { pgTable, serial, varchar, integer, jsonb, timestamp, boolean, uuid } from 'drizzle-orm/pg-core';

// Handle potential import errors for simplified mode
try {
  // Schema definitions remain the same
} catch (error) {
  console.log('Drizzle schema loaded in simplified mode');
}

export const retailers = pgTable('retailers', {
  id: serial('id').primaryKey(),
  retailerId: varchar('retailer_id', { length: 50 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  image: varchar('image', { length: 500 }), // URL to the image
  location: varchar('location', { length: 500 }).notNull(),
  mapsLink: varchar('maps_link', { length: 500 }),
  iframeLink: varchar('iframe_link', { length: 500 }),
  rating: integer('rating').default(0),
  reviewsCount: integer('reviews_count').default(0),
  contact: varchar('contact', { length: 20 }),
  verified: boolean('verified').default(false),
  stock: jsonb('stock'), // Store stock as JSON
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Users table for authentication
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  username: varchar('username', { length: 255 }).notNull(),
  displayName: varchar('display_name', { length: 255 }).notNull(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  photoURL: varchar('photo_url', { length: 500 }),
  role: varchar('role', { length: 50 }).default('user'),
  region: varchar('region', { length: 500 }).default(''),
  isVerified: boolean('is_verified').default(false),
  followers: jsonb('followers').$defaultFn(() => []),
  following: jsonb('following').$defaultFn(() => []),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export type Retailer = typeof retailers.$inferSelect;
export type NewRetailer = typeof retailers.$inferInsert;

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export const communityChatMessages = pgTable('community_chat_messages', {
  id: serial('id').primaryKey(),
  communityId: varchar('community_id', { length: 255 }).notNull(),
  senderId: varchar('sender_id', { length: 255 }).notNull(),
  senderName: varchar('sender_name', { length: 255 }).notNull(),
  senderPhotoUrl: varchar('sender_photo_url', { length: 500 }),
  text: varchar('text', { length: 2000 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});