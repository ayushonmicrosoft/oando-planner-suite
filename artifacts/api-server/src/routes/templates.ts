import { Router, type IRouter } from "express";
import { eq, sql } from "drizzle-orm";
import { db, templatesTable, plansTable } from "@workspace/db";
import { asyncHandler } from "../middlewares/async-handler";
import { requireAdmin } from "../middlewares/require-admin";

const router: IRouter = Router();

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

    const planName = req.body?.name || `${template.name} Plan`;

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
    const { name, description, category, roomWidthCm, roomDepthCm, layoutJson, furnitureCount, thumbnailSvg } = req.body;

    const updates: Record<string, unknown> = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (category !== undefined) updates.category = category;
    if (roomWidthCm !== undefined) updates.roomWidthCm = Number(roomWidthCm);
    if (roomDepthCm !== undefined) updates.roomDepthCm = Number(roomDepthCm);
    if (layoutJson !== undefined) updates.layoutJson = layoutJson;
    if (furnitureCount !== undefined) updates.furnitureCount = Number(furnitureCount);
    if (thumbnailSvg !== undefined) updates.thumbnailSvg = thumbnailSvg;

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
