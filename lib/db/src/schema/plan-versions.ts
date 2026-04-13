import { pgTable, text, serial, integer, timestamp, unique, index } from "drizzle-orm/pg-core";
import { plansTable } from "./plans";

export const planVersionsTable = pgTable("plan_versions", {
  id: serial("id").primaryKey(),
  planId: integer("plan_id")
    .notNull()
    .references(() => plansTable.id, { onDelete: "cascade" }),
  versionNumber: integer("version_number").notNull(),
  name: text("name").notNull(),
  documentJson: text("document_json").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  unique("plan_versions_plan_id_version_number_unique").on(table.planId, table.versionNumber),
  index("idx_plan_versions_plan_id").on(table.planId),
]);

export type PlanVersion = typeof planVersionsTable.$inferSelect;
export type InsertPlanVersion = typeof planVersionsTable.$inferInsert;
