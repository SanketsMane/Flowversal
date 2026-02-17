// Author: Sanket
// Drizzle ORM schema for Neon PostgreSQL authentication tables

import { boolean, index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

/**
 * Users table - stores authentication credentials
 * Replaces Supabase Auth users
 */
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  fullName: text('full_name'),
  emailVerified: boolean('email_verified').default(false).notNull(),
  role: text('role').default('user').notNull(),
  
  // Onboarding fields - Author: Sanket
  onboardingCompleted: boolean('onboarding_completed').default(false).notNull(),
  organizationName: text('organization_name'),
  organizationSize: text('organization_size'),
  referralSource: text('referral_source'),
  automationExperience: text('automation_experience'),
  automationGoal: text('automation_goal'),
  techStack: text('tech_stack').array(), // Stores technologies as array
  
  // Metadata
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  emailIdx: index('email_idx').on(table.email),
}));

/**
 * Sessions table - stores active JWT sessions
 * Used for session management and revocation
 */
export const sessions = pgTable('sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  
  // Optional: track device/IP for security
  userAgent: text('user_agent'),
  ipAddress: text('ip_address'),
}, (table) => ({
  userIdIdx: index('user_id_idx').on(table.userId),
  tokenIdx: index('token_idx').on(table.token),
  expiresAtIdx: index('expires_at_idx').on(table.expiresAt),
}));

/**
 * Verification tokens - for email verification and password reset
 */
export const verificationTokens = pgTable('verification_tokens', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  token: text('token').notNull().unique(),
  type: text('type').notNull(), // 'email_verification' | 'password_reset'
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  usedAt: timestamp('used_at'), // null if not used yet
}, (table) => ({
  tokenIdx: index('verification_token_idx').on(table.token),
  userIdTypeIdx: index('user_id_type_idx').on(table.userId, table.type),
}));

// Type exports for TypeScript
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
export type VerificationToken = typeof verificationTokens.$inferSelect;
export type NewVerificationToken = typeof verificationTokens.$inferInsert;
