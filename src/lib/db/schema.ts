import { pgTable, uuid, varchar, text, boolean, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums for type safety
export const inquiryTypeEnum = pgEnum('inquiry_type', [
  'technical',
  'general',
  'pricing',
  'feature_request',
  'bug_report'
]);

export const inquiryStatusEnum = pgEnum('inquiry_status', [
  'pending',
  'processing', 
  'resolved',
  'closed'
]);

export const inquiryPriorityEnum = pgEnum('inquiry_priority', [
  'low',
  'medium',
  'high',
  'urgent'
]);

// Users table (기존 Supabase 구조 기반)
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  companyName: varchar('company_name', { length: 255 }),
  phone: varchar('phone', { length: 50 }),
  registrationSource: varchar('registration_source', { length: 100 }),
  isVerified: boolean('is_verified').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  lastLoginAt: timestamp('last_login_at')
});

// Inquiries table (기존 Supabase 구조 기반)
export const inquiries = pgTable('inquiries', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  type: inquiryTypeEnum('type').notNull(),
  title: varchar('title', { length: 500 }).notNull(),
  content: text('content').notNull(),
  status: inquiryStatusEnum('status').default('pending').notNull(),
  priority: inquiryPriorityEnum('priority').default('medium').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  resolvedAt: timestamp('resolved_at')
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  inquiries: many(inquiries)
}));

export const inquiriesRelations = relations(inquiries, ({ one }) => ({
  user: one(users, {
    fields: [inquiries.userId],
    references: [users.id]
  })
}));

// Export types for TypeScript
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Inquiry = typeof inquiries.$inferSelect;
export type NewInquiry = typeof inquiries.$inferInsert;

// Join type for user-inquiry data
export type UserInquiryJoin = {
  user_id: string;
  user_name: string;
  user_email: string;
  company_name: string | null;
  user_registered_at: Date;
  last_login_at: Date | null;
  inquiry_id: string;
  inquiry_type: string;
  inquiry_title: string;
  inquiry_status: string;
  priority: string;
  inquiry_created_at: Date;
  inquiry_updated_at: Date;
  total_inquiries: number;
  resolved_inquiries: number;
};