import { pgTable, text, integer, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const templatesTable = pgTable("templates", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  roomWidthCm: real("room_width_cm").notNull(),
  roomDepthCm: real("room_depth_cm").notNull(),
  layoutJson: text("layout_json").notNull(),
  furnitureCount: integer("furniture_count").notNull().default(0),
  usageCount: integer("usage_count").notNull().default(0),
  thumbnailSvg: text("thumbnail_svg"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertTemplateSchema = createInsertSchema(templatesTable).omit({ createdAt: true });
export type InsertTemplate = z.infer<typeof insertTemplateSchema>;
export type Template = typeof templatesTable.$inferSelect;
