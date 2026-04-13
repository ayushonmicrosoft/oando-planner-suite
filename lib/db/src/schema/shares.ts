import { pgTable, text, serial, integer, real, timestamp, boolean, index } from "drizzle-orm/pg-core";
import { plansTable } from "./plans";

export const planSharesTable = pgTable("plan_shares", {
  id: serial("id").primaryKey(),
  planId: integer("plan_id").notNull().references(() => plansTable.id, { onDelete: "cascade" }),
  shareToken: text("share_token").notNull().unique(),
  clientName: text("client_name"),
  status: text("status").notNull().default("pending"),
  statusNote: text("status_note"),
  isActive: boolean("is_active").notNull().default(true),
  viewedAt: timestamp("viewed_at", { withTimezone: true }),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
}, (table) => [
  index("idx_plan_shares_plan_id").on(table.planId),
]);

export const planCommentsTable = pgTable("plan_comments", {
  id: serial("id").primaryKey(),
  shareId: integer("share_id").notNull().references(() => planSharesTable.id, { onDelete: "cascade" }),
  planId: integer("plan_id").notNull().references(() => plansTable.id, { onDelete: "cascade" }),
  x: real("x").notNull(),
  y: real("y").notNull(),
  itemName: text("item_name"),
  message: text("message").notNull(),
  authorName: text("author_name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("idx_plan_comments_share_id").on(table.shareId),
  index("idx_plan_comments_plan_id").on(table.planId),
]);

export type PlanShare = typeof planSharesTable.$inferSelect;
export type PlanComment = typeof planCommentsTable.$inferSelect;
