import { pgTable, varchar, text, boolean, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums for type safety (기존 DB에 맞게 수정)
export const userTypeEnum = pgEnum('UserType', ['GUEST', 'AUTHENTICATED']);

export const inquiryTypeEnum = pgEnum('InquiryType', ['URL_VERIFICATION', 'GENERAL_INQUIRY']);

export const inquiryStatusEnum = pgEnum('InquiryStatus', [
  'PENDING',
  'PROCESSING',
  'RESOLVED',
  'CLOSED',
]);

// Users table (기존 Supabase 구조와 정확히 매칭)
export const users = pgTable('users', {
  id: varchar('id').primaryKey(), // cuid2 형태의 기존 ID 사용
  email: varchar('email', { length: 255 }).notNull(),
  authProvider: varchar('auth_provider', { length: 50 }),
  authId: varchar('auth_id', { length: 255 }),
  userType: userTypeEnum('user_type'),
  name: varchar('name', { length: 255 }),
  phone: varchar('phone', { length: 50 }),
  companyName: varchar('company_name', { length: 255 }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull(),
});

// Inquiries table (실제 Supabase 구조와 정확히 매칭)
export const inquiries = pgTable('inquiries', {
  id: varchar('id').primaryKey(), // cuid2 형태의 기존 ID 사용
  userId: varchar('user_id')
    .references(() => users.id)
    .notNull(),
  inquiryType: inquiryTypeEnum('inquiry_type').notNull(),
  url: varchar('url', { length: 500 }),
  companyName: varchar('company_name', { length: 255 }),
  inquiryMessage: text('inquiry_message'),
  status: inquiryStatusEnum('status').default('PENDING').notNull(),
  results: text('results'), // JSON 형태로 저장
  createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull(),
  processedAt: timestamp('processed_at', { withTimezone: true }),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  inquiries: many(inquiries),
}));

export const inquiriesRelations = relations(inquiries, ({ one }) => ({
  user: one(users, {
    fields: [inquiries.userId],
    references: [users.id],
  }),
}));

// Export types for TypeScript (실제 스키마 기반)
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Inquiry = typeof inquiries.$inferSelect;
export type NewInquiry = typeof inquiries.$inferInsert;

// Join type for user-inquiry data (실제 필드명 기반)
export type UserInquiryJoin = {
  user_id: string;
  user_name: string;
  user_email: string;
  user_company_name: string | null;
  user_registered_at: Date;
  inquiry_id: string;
  inquiry_type: string;
  inquiry_url: string | null;
  inquiry_company_name: string | null;
  inquiry_message: string | null;
  inquiry_status: string;
  inquiry_results: string | null;
  inquiry_created_at: Date;
  inquiry_updated_at: Date;
  inquiry_processed_at: Date | null;
  total_inquiries: number;
  pending_inquiries: number;
};
