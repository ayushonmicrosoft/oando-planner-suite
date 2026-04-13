import { pgTable, text, serial, real, integer, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { relations } from "drizzle-orm";

export const tierEnum = pgEnum("tier", ["economy", "medium", "premium"]);

export const seriesTable = pgTable("series", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  tier: tierEnum("tier").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const catalogItemsTable = pgTable("catalog_items", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  subCategory: text("sub_category"),
  widthCm: real("width_cm").notNull(),
  depthCm: real("depth_cm").notNull(),
  heightCm: real("height_cm").notNull(),
  color: text("color"),
  description: text("description"),
  imageUrl: text("image_url"),
  shape: text("shape"),
  seatCount: integer("seat_count"),
  price: real("price"),
  seriesId: text("series_id").references(() => seriesTable.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const seriesRelations = relations(seriesTable, ({ many }) => ({
  items: many(catalogItemsTable),
}));

export const catalogItemRelations = relations(catalogItemsTable, ({ one }) => ({
  series: one(seriesTable, {
    fields: [catalogItemsTable.seriesId],
    references: [seriesTable.id],
  }),
}));

export const insertSeriesSchema = createInsertSchema(seriesTable).omit({ createdAt: true });
export type InsertSeries = z.infer<typeof insertSeriesSchema>;
export type Series = typeof seriesTable.$inferSelect;

export const insertCatalogItemSchema = createInsertSchema(catalogItemsTable).omit({ createdAt: true });
export type InsertCatalogItem = z.infer<typeof insertCatalogItemSchema>;
export type CatalogItem = typeof catalogItemsTable.$inferSelect;
