import { pgTable, text, serial, integer, numeric, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { plansTable } from "./plans";

export const quotesTable = pgTable("quotes", {
  id: serial("id").primaryKey(),
  planId: integer("plan_id").notNull().references(() => plansTable.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull(),
  clientName: text("client_name").notNull().default(""),
  clientCompany: text("client_company").notNull().default(""),
  clientEmail: text("client_email").notNull().default(""),
  projectName: text("project_name").notNull().default(""),
  itemsJson: text("items_json").notNull().default("[]"),
  subtotal: numeric("subtotal", { precision: 12, scale: 2 }).notNull().default("0"),
  gst: numeric("gst", { precision: 12, scale: 2 }).notNull().default("0"),
  total: numeric("total", { precision: 12, scale: 2 }).notNull().default("0"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertQuoteSchema = createInsertSchema(quotesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertQuote = z.infer<typeof insertQuoteSchema>;
export type Quote = typeof quotesTable.$inferSelect;
