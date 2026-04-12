import { Router, type IRouter } from "express";
import { ilike, eq, and, sql, count } from "drizzle-orm";
import { db, catalogItemsTable } from "@workspace/db";
import {
  ListCatalogItemsQueryParams,
  GetCatalogItemParams,
} from "@workspace/api-zod";
import { asyncHandler } from "../middlewares/async-handler";

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

export default router;
