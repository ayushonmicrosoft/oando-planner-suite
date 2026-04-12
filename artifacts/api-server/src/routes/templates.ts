import { Router, type IRouter } from "express";
import { eq, sql } from "drizzle-orm";
import { db, templatesTable, plansTable } from "@workspace/db";
import { asyncHandler } from "../middlewares/async-handler";
import { requireAdmin } from "../middlewares/require-admin";
import { z } from "zod";

const router: IRouter = Router();

const UseTemplateBody = z.object({
  name: z.string().trim().min(1).max(200).optional(),
});

const UpdateTemplateBody = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().max(2000).optional(),
  category: z.string().trim().min(1).max(100).optional(),
  roomWidthCm: z.number().positive().max(100000).optional(),
  roomDepthCm: z.number().positive().max(100000).optional(),
  layoutJson: z.string().min(1).max(10_000_000).optional(),
  furnitureCount: z.number().int().min(0).max(10000).optional(),
  thumbnailSvg: z.string().max(1_000_000).optional(),
});

router.get(
  "/templates",
  asyncHandler(async (req, res) => {
    const category = req.query.category as string | undefined;

    let query = db.select().from(templatesTable);
    if (category) {
      query = query.where(eq(templatesTable.category, category)) as typeof query;
    }

    const templates = await query.orderBy(templatesTable.name);
    res.json(
      templates.map((t) => ({
        ...t,
        createdAt: t.createdAt.toISOString(),
      }))
    );
  })
);

router.get(
  "/templates/:id",
  asyncHandler(async (req, res) => {
    const id = String(req.params.id);
    if (!id) {
      res.status(400).json({ error: "Invalid template id", status: 400 });
      return;
    }

    const [template] = await db
      .select()
      .from(templatesTable)
      .where(eq(templatesTable.id, id));

    if (!template) {
      res.status(404).json({ error: "Template not found", status: 404 });
      return;
    }

    res.json({
      ...template,
      createdAt: template.createdAt.toISOString(),
    });
  })
);

router.post(
  "/templates/:id/use",
  asyncHandler(async (req, res) => {
    const id = String(req.params.id);
    if (!id) {
      res.status(400).json({ error: "Invalid template id", status: 400 });
      return;
    }

    const [template] = await db
      .select()
      .from(templatesTable)
      .where(eq(templatesTable.id, id));

    if (!template) {
      res.status(404).json({ error: "Template not found", status: 404 });
      return;
    }

    let layoutData: { items?: unknown[] };
    try {
      layoutData = JSON.parse(template.layoutJson);
    } catch {
      res.status(500).json({ error: "Template layout data is corrupted", status: 500 });
      return;
    }
    const documentJson = JSON.stringify({
      roomWidthCm: template.roomWidthCm,
      roomDepthCm: template.roomDepthCm,
      items: layoutData.items || [],
    });

    const parsed = UseTemplateBody.safeParse(req.body ?? {});
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid request body: " + parsed.error.message, status: 400 });
      return;
    }

    const planName = parsed.data?.name || `${template.name} Plan`;

    const [[plan]] = await Promise.all([
      db
        .insert(plansTable)
        .values({
          name: planName,
          plannerType: "canvas",
          roomWidthCm: template.roomWidthCm,
          roomDepthCm: template.roomDepthCm,
          documentJson,
        })
        .returning(),
      db
        .update(templatesTable)
        .set({ usageCount: sql`${templatesTable.usageCount} + 1` })
        .where(eq(templatesTable.id, id)),
    ]);

    res.status(201).json({
      ...plan,
      createdAt: plan.createdAt.toISOString(),
      updatedAt: plan.updatedAt.toISOString(),
    });
  })
);

router.patch(
  "/admin/templates/:id",
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const parsed = UpdateTemplateBody.safeParse(req.body ?? {});
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid update data: " + parsed.error.message, status: 400 });
      return;
    }

    const updates: Record<string, unknown> = {};
    const data = parsed.data;
    if (data.name !== undefined) updates.name = data.name;
    if (data.description !== undefined) updates.description = data.description;
    if (data.category !== undefined) updates.category = data.category;
    if (data.roomWidthCm !== undefined) updates.roomWidthCm = data.roomWidthCm;
    if (data.roomDepthCm !== undefined) updates.roomDepthCm = data.roomDepthCm;
    if (data.layoutJson !== undefined) updates.layoutJson = data.layoutJson;
    if (data.furnitureCount !== undefined) updates.furnitureCount = data.furnitureCount;
    if (data.thumbnailSvg !== undefined) updates.thumbnailSvg = data.thumbnailSvg;

    if (Object.keys(updates).length === 0) {
      res.status(400).json({ error: "No fields to update", status: 400 });
      return;
    }

    const [updated] = await db
      .update(templatesTable)
      .set(updates)
      .where(eq(templatesTable.id, String(id)))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Template not found", status: 404 });
      return;
    }

    res.json({
      ...updated,
      createdAt: updated.createdAt.toISOString(),
    });
  })
);

router.delete(
  "/admin/templates/:id",
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const [deleted] = await db
      .delete(templatesTable)
      .where(eq(templatesTable.id, String(id)))
      .returning();

    if (!deleted) {
      res.status(404).json({ error: "Template not found", status: 404 });
      return;
    }

    res.status(204).send();
  })
);

export default router;
