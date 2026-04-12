import { Router, type IRouter } from "express";
import { eq, desc, and, inArray } from "drizzle-orm";
import { db, plansTable, quotesTable, catalogItemsTable } from "@workspace/db";
import { CreateQuoteBody } from "@workspace/api-zod";
import { asyncHandler } from "../middlewares/async-handler";

const router: IRouter = Router();

interface PlacedItem {
  catalogId: string;
  name: string;
  category: string;
  widthCm: number;
  depthCm: number;
  heightCm: number;
  price?: number | null;
}

interface BoquItem {
  catalogId: string;
  name: string;
  category: string;
  quantity: number;
  widthCm: number;
  depthCm: number;
  heightCm: number;
  unitPrice: number;
  totalPrice: number;
}

function parseIdParam(raw: string | string[]): number | null {
  const str = Array.isArray(raw) ? raw[0] : raw;
  const id = parseInt(str, 10);
  return isNaN(id) || id <= 0 ? null : id;
}

function roundMoney(val: number): number {
  return Math.round(val * 100) / 100;
}

interface BlueprintBoqEntry {
  itemId: string;
  count: number;
}

interface CatalogRecord {
  id: string;
  name: string;
  category: string;
  price: number | null;
  widthCm: number;
  depthCm: number;
  heightCm: number;
}

async function fetchCatalogByIds(ids: string[]): Promise<Map<string, CatalogRecord>> {
  const map = new Map<string, CatalogRecord>();
  if (ids.length === 0) return map;
  const rows = await db
    .select({
      id: catalogItemsTable.id,
      name: catalogItemsTable.name,
      category: catalogItemsTable.category,
      price: catalogItemsTable.price,
      widthCm: catalogItemsTable.widthCm,
      depthCm: catalogItemsTable.depthCm,
      heightCm: catalogItemsTable.heightCm,
    })
    .from(catalogItemsTable)
    .where(inArray(catalogItemsTable.id, ids));
  for (const r of rows) map.set(r.id, r);
  return map;
}

async function extractBoqFromCanvasItems(items: PlacedItem[]): Promise<BoquItem[]> {
  const catalogIds = [...new Set(items.map((i) => i.catalogId).filter(Boolean))];
  const catalogMap = await fetchCatalogByIds(catalogIds);

  const grouped = new Map<string, { item: PlacedItem; count: number }>();
  for (const item of items) {
    const key = item.catalogId || item.name;
    const existing = grouped.get(key);
    if (existing) {
      existing.count++;
    } else {
      grouped.set(key, { item, count: 1 });
    }
  }

  const boqItems: BoquItem[] = [];
  for (const [, { item, count }] of grouped) {
    const cat = item.catalogId ? catalogMap.get(item.catalogId) : null;
    const unitPrice = cat?.price ?? 0;
    boqItems.push({
      catalogId: item.catalogId || "",
      name: cat?.name ?? item.name,
      category: cat?.category ?? (item.category || "Uncategorized"),
      quantity: count,
      widthCm: cat?.widthCm ?? item.widthCm ?? 0,
      depthCm: cat?.depthCm ?? item.depthCm ?? 0,
      heightCm: cat?.heightCm ?? item.heightCm ?? 0,
      unitPrice: roundMoney(unitPrice),
      totalPrice: roundMoney(unitPrice * count),
    });
  }
  return boqItems;
}

async function extractBoqFromBlueprintBoq(boq: BlueprintBoqEntry[]): Promise<BoquItem[]> {
  const catalogIds = boq.map((e) => e.itemId).filter(Boolean);
  const catalogMap = await fetchCatalogByIds(catalogIds);

  const boqItems: BoquItem[] = [];
  for (const entry of boq) {
    const cat = catalogMap.get(entry.itemId);
    if (!cat) continue;
    const unitPrice = cat.price ?? 0;
    boqItems.push({
      catalogId: entry.itemId,
      name: cat.name,
      category: cat.category,
      quantity: entry.count,
      widthCm: cat.widthCm,
      depthCm: cat.depthCm,
      heightCm: cat.heightCm,
      unitPrice: roundMoney(unitPrice),
      totalPrice: roundMoney(unitPrice * entry.count),
    });
  }
  return boqItems;
}

async function extractBoqFromPlan(documentJson: string): Promise<BoquItem[]> {
  let doc: any;
  try {
    doc = JSON.parse(documentJson);
  } catch {
    return [];
  }

  let boqItems: BoquItem[] = [];

  if (Array.isArray(doc?.boq) && doc.boq.length > 0) {
    boqItems = await extractBoqFromBlueprintBoq(doc.boq);
  } else if (Array.isArray(doc?.items) && doc.items.length > 0) {
    boqItems = await extractBoqFromCanvasItems(doc.items);
  }

  boqItems.sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));
  return boqItems;
}

function serializeQuote(q: typeof quotesTable.$inferSelect) {
  return {
    ...q,
    subtotal: Number(q.subtotal),
    gst: Number(q.gst),
    total: Number(q.total),
    createdAt: q.createdAt.toISOString(),
    updatedAt: q.updatedAt.toISOString(),
  };
}

router.get(
  "/plans/:id/quote/preview",
  asyncHandler(async (req, res) => {
    const userId = (req as any).userId as string;
    const id = parseIdParam(req.params.id);
    if (!id) {
      res.status(400).json({ error: "Invalid plan id", status: 400 });
      return;
    }

    const [plan] = await db
      .select()
      .from(plansTable)
      .where(and(eq(plansTable.id, id), eq(plansTable.userId, userId)));

    if (!plan) {
      res.status(404).json({ error: "Plan not found", status: 404 });
      return;
    }

    const items = await extractBoqFromPlan(plan.documentJson);
    const subtotal = items.reduce((sum, i) => sum + i.totalPrice, 0);
    const gst = Math.round(subtotal * 0.18 * 100) / 100;
    const total = Math.round((subtotal + gst) * 100) / 100;

    res.json({
      planId: plan.id,
      planName: plan.name,
      items,
      subtotal,
      gst,
      total,
    });
  }),
);

router.post(
  "/plans/:id/quote",
  asyncHandler(async (req, res) => {
    const userId = (req as any).userId as string;
    const id = parseIdParam(req.params.id);
    if (!id) {
      res.status(400).json({ error: "Invalid plan id", status: 400 });
      return;
    }

    const parsed = CreateQuoteBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid quote data: " + parsed.error.message, status: 400 });
      return;
    }

    const [plan] = await db
      .select()
      .from(plansTable)
      .where(and(eq(plansTable.id, id), eq(plansTable.userId, userId)));

    if (!plan) {
      res.status(404).json({ error: "Plan not found", status: 404 });
      return;
    }

    const items = await extractBoqFromPlan(plan.documentJson);
    const subtotal = items.reduce((sum, i) => sum + i.totalPrice, 0);
    const gst = Math.round(subtotal * 0.18 * 100) / 100;
    const total = Math.round((subtotal + gst) * 100) / 100;

    const [quote] = await db
      .insert(quotesTable)
      .values({
        planId: id,
        userId,
        clientName: parsed.data.clientName,
        clientCompany: parsed.data.clientCompany,
        clientEmail: parsed.data.clientEmail || "",
        projectName: parsed.data.projectName,
        itemsJson: JSON.stringify(items),
        subtotal: String(subtotal),
        gst: String(gst),
        total: String(total),
      })
      .returning();

    res.status(201).json(serializeQuote(quote));
  }),
);

router.get(
  "/quotes/:id",
  asyncHandler(async (req, res) => {
    const userId = (req as any).userId as string;
    const id = parseIdParam(req.params.id);
    if (!id) {
      res.status(400).json({ error: "Invalid quote id", status: 400 });
      return;
    }

    const [quote] = await db
      .select()
      .from(quotesTable)
      .where(and(eq(quotesTable.id, id), eq(quotesTable.userId, userId)));

    if (!quote) {
      res.status(404).json({ error: "Quote not found", status: 404 });
      return;
    }

    res.json(serializeQuote(quote));
  }),
);

router.get(
  "/quotes",
  asyncHandler(async (req, res) => {
    const userId = (req as any).userId as string;

    const quotes = await db
      .select({
        id: quotesTable.id,
        planId: quotesTable.planId,
        clientName: quotesTable.clientName,
        clientCompany: quotesTable.clientCompany,
        projectName: quotesTable.projectName,
        total: quotesTable.total,
        createdAt: quotesTable.createdAt,
      })
      .from(quotesTable)
      .where(eq(quotesTable.userId, userId))
      .orderBy(desc(quotesTable.createdAt));

    res.json(
      quotes.map((q) => ({
        ...q,
        total: Number(q.total),
        createdAt: q.createdAt.toISOString(),
      })),
    );
  }),
);

export default router;
