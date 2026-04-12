import { pgTable, text, serial, real, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const catalogItemsTable = pgTable("catalog_items", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  widthCm: real("width_cm").notNull(),
  depthCm: real("depth_cm").notNull(),
  heightCm: real("height_cm").notNull(),
  color: text("color"),
  description: text("description"),
  imageUrl: text("image_url"),
  shape: text("shape"),
  seatCount: integer("seat_count"),
  price: real("price"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertCatalogItemSchema = createInsertSchema(catalogItemsTable).omit({ createdAt: true });
export type InsertCatalogItem = z.infer<typeof insertCatalogItemSchema>;
export type CatalogItem = typeof catalogItemsTable.$inferSelect;
