import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const userRoles = ["user", "admin"] as const;
export type UserRole = (typeof userRoles)[number];

export const planTiers = ["free", "pro"] as const;
export type PlanTier = (typeof planTiers)[number];

export const subscriptionStatuses = ["active", "cancelled", "past_due", "expired", "pending"] as const;
export type SubscriptionStatus = (typeof subscriptionStatuses)[number];

export const usersTable = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  displayName: text("display_name"),
  avatarUrl: text("avatar_url"),
  role: text("role", { enum: userRoles }).notNull().default("user"),
  planTier: text("plan_tier", { enum: planTiers }).notNull().default("free"),
  razorpayCustomerId: text("razorpay_customer_id"),
  razorpaySubscriptionId: text("razorpay_subscription_id"),
  subscriptionStatus: text("subscription_status", { enum: subscriptionStatuses }),
  currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({ createdAt: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;
