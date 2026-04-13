import { Router, type IRouter } from "express";
import { ilike, eq, and, sql, count } from "drizzle-orm";
import { db, catalogItemsTable, seriesTable } from "@workspace/db";
import {
  ListCatalogItemsQueryParams,
  GetCatalogItemParams,
} from "@workspace/api-zod";
import { asyncHandler } from "../middlewares/async-handler";
import { requireAuth } from "../middlewares/require-auth";
import { requireAdmin } from "../middlewares/require-admin";
import { ApiHttpError } from "../middlewares/error-handler";
import { randomUUID } from "crypto";
import { z } from "zod";

const router: IRouter = Router();

const IdParams = z.object({ id: z.string().min(1) });

const CreateCatalogItemBody = z.object({
  name: z.string().trim().min(1).max(500),
  category: z.string().trim().min(1).max(200),
  subCategory: z.string().trim().max(200).nullish(),
  widthCm: z.number().positive().max(100000),
  depthCm: z.number().positive().max(100000),
  heightCm: z.number().positive().max(100000),
  color: z.string().trim().max(50).nullish(),
  description: z.string().trim().max(5000).nullish(),
  imageUrl: z.string().url().max(2000).nullish(),
  modelUrl: z.string().url().max(2000).nullish(),
  shape: z.string().trim().max(50).nullish(),
  seatCount: z.number().int().min(0).max(10000).nullish(),
  price: z.number().min(0).max(100000000).nullish(),
  seriesId: z.string().trim().max(200).nullish(),
});

const UpdateCatalogItemBody = z.object({
  name: z.string().trim().min(1).max(500).optional(),
  category: z.string().trim().min(1).max(200).optional(),
  subCategory: z.string().trim().max(200).nullish(),
  widthCm: z.number().positive().max(100000).optional(),
  depthCm: z.number().positive().max(100000).optional(),
  heightCm: z.number().positive().max(100000).optional(),
  color: z.string().trim().max(50).nullish(),
  description: z.string().trim().max(5000).nullish(),
  imageUrl: z.string().url().max(2000).nullish(),
  modelUrl: z.string().url().max(2000).nullish(),
  shape: z.string().trim().max(50).nullish(),
  seatCount: z.number().int().min(0).max(10000).nullish(),
  price: z.number().min(0).max(100000000).nullish(),
  seriesId: z.string().trim().max(200).nullish(),
});

const CreateSeriesBody = z.object({
  name: z.string().trim().min(1).max(500),
  tier: z.enum(["economy", "medium", "premium"]),
  description: z.string().trim().max(5000).nullish(),
  imageUrl: z.string().url().max(2000).nullish(),
});

const UpdateSeriesBody = z.object({
  name: z.string().trim().min(1).max(500).optional(),
  tier: z.enum(["economy", "medium", "premium"]).optional(),
  description: z.string().trim().max(5000).nullish(),
  imageUrl: z.string().url().max(2000).nullish(),
});

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
  "/catalog/series",
  asyncHandler(async (_req, res) => {
    const allSeries = await db
      .select()
      .from(seriesTable)
      .orderBy(seriesTable.tier);

    const items = await db
      .select()
      .from(catalogItemsTable)
      .orderBy(catalogItemsTable.category, catalogItemsTable.name);

    const result = allSeries.map((s) => ({
      ...s,
      items: items.filter((i) => i.seriesId === s.id),
    }));

    res.json(result);
  }),
);

router.get(
  "/catalog/series/:id",
  asyncHandler(async (req, res) => {
    const { id } = IdParams.parse(req.params);

    const [series] = await db
      .select()
      .from(seriesTable)
      .where(eq(seriesTable.id, String(id)));

    if (!series) {
      throw new ApiHttpError(404, "Series not found");
    }

    const items = await db
      .select()
      .from(catalogItemsTable)
      .where(eq(catalogItemsTable.seriesId, String(id)))
      .orderBy(catalogItemsTable.category, catalogItemsTable.name);

    res.json({ ...series, items });
  }),
);

router.get(
  "/catalog",
  asyncHandler(async (req, res) => {
    const query = ListCatalogItemsQueryParams.safeParse(req.query);
    if (!query.success) {
      throw new ApiHttpError(400, "Invalid query parameters");
    }

    const conditions = [];
    if (query.data.category) {
      conditions.push(eq(catalogItemsTable.category, query.data.category));
    }
    if (query.data.subCategory) {
      conditions.push(eq(catalogItemsTable.subCategory, query.data.subCategory));
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
      throw new ApiHttpError(400, "Invalid catalog item id");
    }

    const [item] = await db
      .select()
      .from(catalogItemsTable)
      .where(eq(catalogItemsTable.id, params.data.id));

    if (!item) {
      throw new ApiHttpError(404, "Catalog item not found");
    }

    res.json(item);
  }),
);

router.post(
  "/admin/catalog",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const parsed = CreateCatalogItemBody.safeParse(req.body);
    if (!parsed.success) {
      throw new ApiHttpError(400, "Invalid catalog item data: " + parsed.error.message);
    }

    const id = `item-${randomUUID().slice(0, 8)}`;

    const [item] = await db
      .insert(catalogItemsTable)
      .values({
        id,
        name: parsed.data.name,
        category: parsed.data.category,
        subCategory: parsed.data.subCategory ?? null,
        widthCm: parsed.data.widthCm,
        depthCm: parsed.data.depthCm,
        heightCm: parsed.data.heightCm,
        color: parsed.data.color ?? null,
        description: parsed.data.description ?? null,
        imageUrl: parsed.data.imageUrl ?? null,
        modelUrl: parsed.data.modelUrl ?? null,
        shape: parsed.data.shape ?? null,
        seatCount: parsed.data.seatCount ?? null,
        price: parsed.data.price ?? null,
        seriesId: parsed.data.seriesId ?? null,
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
    const { id } = IdParams.parse(req.params);

    const parsed = UpdateCatalogItemBody.safeParse(req.body);
    if (!parsed.success) {
      throw new ApiHttpError(400, "Invalid update data: " + parsed.error.message);
    }

    const updates: Record<string, unknown> = {};
    const data = parsed.data;
    if (data.name !== undefined) updates.name = data.name;
    if (data.category !== undefined) updates.category = data.category;
    if (data.subCategory !== undefined) updates.subCategory = data.subCategory ?? null;
    if (data.widthCm !== undefined) updates.widthCm = data.widthCm;
    if (data.depthCm !== undefined) updates.depthCm = data.depthCm;
    if (data.heightCm !== undefined) updates.heightCm = data.heightCm;
    if (data.color !== undefined) updates.color = data.color ?? null;
    if (data.description !== undefined) updates.description = data.description ?? null;
    if (data.imageUrl !== undefined) updates.imageUrl = data.imageUrl ?? null;
    if (data.modelUrl !== undefined) updates.modelUrl = data.modelUrl ?? null;
    if (data.shape !== undefined) updates.shape = data.shape ?? null;
    if (data.seatCount !== undefined) updates.seatCount = data.seatCount ?? null;
    if (data.price !== undefined) updates.price = data.price ?? null;
    if (data.seriesId !== undefined) updates.seriesId = data.seriesId ?? null;

    if (Object.keys(updates).length === 0) {
      throw new ApiHttpError(400, "No fields to update");
    }

    const [updated] = await db
      .update(catalogItemsTable)
      .set(updates)
      .where(eq(catalogItemsTable.id, String(id)))
      .returning();

    if (!updated) {
      throw new ApiHttpError(404, "Catalog item not found");
    }

    res.json(updated);
  }),
);

router.delete(
  "/admin/catalog/:id",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { id } = IdParams.parse(req.params);

    const [deleted] = await db
      .delete(catalogItemsTable)
      .where(eq(catalogItemsTable.id, String(id)))
      .returning();

    if (!deleted) {
      throw new ApiHttpError(404, "Catalog item not found");
    }

    res.status(204).send();
  }),
);

router.post(
  "/admin/series",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const parsed = CreateSeriesBody.safeParse(req.body);
    if (!parsed.success) {
      throw new ApiHttpError(400, "Invalid series data: " + parsed.error.message);
    }

    const id = `series-${randomUUID().slice(0, 8)}`;

    const [series] = await db
      .insert(seriesTable)
      .values({
        id,
        name: parsed.data.name,
        tier: parsed.data.tier,
        description: parsed.data.description ?? null,
        imageUrl: parsed.data.imageUrl ?? null,
      })
      .returning();

    res.status(201).json(series);
  }),
);

router.patch(
  "/admin/series/:id",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { id } = IdParams.parse(req.params);

    const parsed = UpdateSeriesBody.safeParse(req.body);
    if (!parsed.success) {
      throw new ApiHttpError(400, "Invalid update data: " + parsed.error.message);
    }

    const updates: Record<string, unknown> = {};
    const data = parsed.data;
    if (data.name !== undefined) updates.name = data.name;
    if (data.tier !== undefined) updates.tier = data.tier;
    if (data.description !== undefined) updates.description = data.description ?? null;
    if (data.imageUrl !== undefined) updates.imageUrl = data.imageUrl ?? null;

    if (Object.keys(updates).length === 0) {
      throw new ApiHttpError(400, "No fields to update");
    }

    const [updated] = await db
      .update(seriesTable)
      .set(updates)
      .where(eq(seriesTable.id, String(id)))
      .returning();

    if (!updated) {
      throw new ApiHttpError(404, "Series not found");
    }

    res.json(updated);
  }),
);

router.delete(
  "/admin/series/:id",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { id } = IdParams.parse(req.params);

    await db
      .update(catalogItemsTable)
      .set({ seriesId: null })
      .where(eq(catalogItemsTable.seriesId, String(id)));

    const [deleted] = await db
      .delete(seriesTable)
      .where(eq(seriesTable.id, String(id)))
      .returning();

    if (!deleted) {
      throw new ApiHttpError(404, "Series not found");
    }

    res.status(204).send();
  }),
);

export default router;
