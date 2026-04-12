import { Router, type IRouter } from "express";
import { ilike, eq, and, sql, count } from "drizzle-orm";
import { db, catalogItemsTable } from "@workspace/db";
import {
  ListCatalogItemsQueryParams,
  GetCatalogItemParams,
} from "@workspace/api-zod";
import { asyncHandler } from "../middlewares/async-handler";
import { requireAuth } from "../middlewares/require-auth";
import { requireAdmin } from "../middlewares/require-admin";
import { randomUUID } from "crypto";

const router: IRouter = Router();

router.get(
  "/catalog/categories",
  asyncHandler(async (_req, res) => {
    const categories = await db
      .select({
        name: catalogItemsTable.category,
        count: count(),
      })
      .from(catalogItemsTable)
      .groupBy(catalogItemsTable.category)
      .orderBy(catalogItemsTable.category);

    res.json(categories);
  }),
);

router.get(
  "/catalog",
  asyncHandler(async (req, res) => {
    const query = ListCatalogItemsQueryParams.safeParse(req.query);
    if (!query.success) {
      res.status(400).json({ error: "Invalid query parameters", status: 400 });
      return;
    }

    const conditions = [];
    if (query.data.category) {
      conditions.push(eq(catalogItemsTable.category, query.data.category));
    }
    if (query.data.search) {
      conditions.push(ilike(catalogItemsTable.name, `%${query.data.search}%`));
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;
    const rows = await db
      .select()
      .from(catalogItemsTable)
      .where(where)
      .orderBy(catalogItemsTable.category, catalogItemsTable.name);

    res.json(rows);
  }),
);

router.get(
  "/catalog/:id",
  asyncHandler(async (req, res) => {
    const params = GetCatalogItemParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: "Invalid catalog item id", status: 400 });
      return;
    }

    const [item] = await db
      .select()
      .from(catalogItemsTable)
      .where(eq(catalogItemsTable.id, params.data.id));

    if (!item) {
      res.status(404).json({ error: "Catalog item not found", status: 404 });
      return;
    }

    res.json(item);
  }),
);

router.post(
  "/admin/catalog",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { name, category, widthCm, depthCm, heightCm, color, description, imageUrl, shape, seatCount, price } = req.body;

    if (!name || !category || widthCm == null || depthCm == null || heightCm == null) {
      res.status(400).json({ error: "name, category, widthCm, depthCm, and heightCm are required", status: 400 });
      return;
    }

    const id = `item-${randomUUID().slice(0, 8)}`;

    const [item] = await db
      .insert(catalogItemsTable)
      .values({
        id,
        name,
        category,
        widthCm: Number(widthCm),
        depthCm: Number(depthCm),
        heightCm: Number(heightCm),
        color: color ?? null,
        description: description ?? null,
        imageUrl: imageUrl ?? null,
        shape: shape ?? null,
        seatCount: seatCount != null ? Number(seatCount) : null,
        price: price != null ? Number(price) : null,
      })
      .returning();

    res.status(201).json(item);
  }),
);

router.patch(
  "/admin/catalog/:id",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, category, widthCm, depthCm, heightCm, color, description, imageUrl, shape, seatCount, price } = req.body;

    const updates: Record<string, unknown> = {};
    if (name !== undefined) updates.name = name;
    if (category !== undefined) updates.category = category;
    if (widthCm !== undefined) updates.widthCm = Number(widthCm);
    if (depthCm !== undefined) updates.depthCm = Number(depthCm);
    if (heightCm !== undefined) updates.heightCm = Number(heightCm);
    if (color !== undefined) updates.color = color;
    if (description !== undefined) updates.description = description;
    if (imageUrl !== undefined) updates.imageUrl = imageUrl;
    if (shape !== undefined) updates.shape = shape;
    if (seatCount !== undefined) updates.seatCount = seatCount != null ? Number(seatCount) : null;
    if (price !== undefined) updates.price = price != null ? Number(price) : null;

    if (Object.keys(updates).length === 0) {
      res.status(400).json({ error: "No fields to update", status: 400 });
      return;
    }

    const [updated] = await db
      .update(catalogItemsTable)
      .set(updates)
      .where(eq(catalogItemsTable.id, String(id)))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Catalog item not found", status: 404 });
      return;
    }

    res.json(updated);
  }),
);

router.delete(
  "/admin/catalog/:id",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const [deleted] = await db
      .delete(catalogItemsTable)
      .where(eq(catalogItemsTable.id, String(id)))
      .returning();

    if (!deleted) {
      res.status(404).json({ error: "Catalog item not found", status: 404 });
      return;
    }

    res.status(204).send();
  }),
);

export default router;
