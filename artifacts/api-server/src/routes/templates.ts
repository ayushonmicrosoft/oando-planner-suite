import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, templatesTable, plansTable } from "@workspace/db";
import { asyncHandler } from "../middlewares/async-handler";

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

    const [plan] = await db
      .insert(plansTable)
      .values({
        name: planName,
        plannerType: "canvas",
        roomWidthCm: template.roomWidthCm,
        roomDepthCm: template.roomDepthCm,
        documentJson,
      })
      .returning();

    res.status(201).json({
      ...plan,
      createdAt: plan.createdAt.toISOString(),
      updatedAt: plan.updatedAt.toISOString(),
    });
  })
);

export default router;
