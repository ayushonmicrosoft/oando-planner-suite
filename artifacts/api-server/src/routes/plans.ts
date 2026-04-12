import { Router, type IRouter } from "express";
import { eq, desc, sql, and } from "drizzle-orm";
import { db, plansTable } from "@workspace/db";
import {
  CreatePlanBody,
  UpdatePlanBody,
  DuplicatePlanBody,
  ListPlansQueryParams,
} from "@workspace/api-zod";
import { asyncHandler } from "../middlewares/async-handler";

const router: IRouter = Router();

function serializePlan(p: typeof plansTable.$inferSelect) {
  return {
    ...p,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  };
}

function countItems(documentJson: string): number {
  try {
    const doc = JSON.parse(documentJson);
    return Array.isArray(doc?.items) ? doc.items.length : 0;
  } catch {
    return 0;
  }
}

function validateJson(jsonStr: string): boolean {
  try {
    JSON.parse(jsonStr);
    return true;
  } catch {
    return false;
  }
}

function parseIdParam(raw: string | string[]): number | null {
  const str = Array.isArray(raw) ? raw[0] : raw;
  const id = parseInt(str, 10);
  return isNaN(id) || id <= 0 ? null : id;
}

router.get(
  "/plans/stats",
  asyncHandler(async (req, res) => {
    const userId = (req as any).userId as string;

    const [stats] = await db
      .select({
        totalPlans: sql<number>`count(*)::int`,
        canvas2dPlans: sql<number>`count(*) filter (where ${plansTable.plannerType} = 'canvas')::int`,
        blueprintPlans: sql<number>`count(*) filter (where ${plansTable.plannerType} = 'blueprint')::int`,
      })
      .from(plansTable)
      .where(eq(plansTable.userId, userId));

    const [recent] = await db
      .select({ name: plansTable.name })
      .from(plansTable)
      .where(eq(plansTable.userId, userId))
      .orderBy(desc(plansTable.updatedAt))
      .limit(1);

    res.json({
      totalPlans: stats?.totalPlans ?? 0,
      canvas2dPlans: stats?.canvas2dPlans ?? 0,
      blueprintPlans: stats?.blueprintPlans ?? 0,
      recentPlan: recent?.name ?? null,
    });
  }),
);

router.get(
  "/plans",
  asyncHandler(async (req, res) => {
    const userId = (req as any).userId as string;
    const qp = ListPlansQueryParams.safeParse(req.query);
    if (!qp.success) {
      res.status(400).json({ error: "Invalid query parameters", status: 400 });
      return;
    }
    const limit = Math.min(Math.max(qp.data.limit ?? 50, 1), 200);
    const offset = Math.max(qp.data.offset ?? 0, 0);

    const plans = await db
      .select()
      .from(plansTable)
      .where(eq(plansTable.userId, userId))
      .orderBy(desc(plansTable.updatedAt))
      .limit(limit)
      .offset(offset);

    const summaries = plans.map((p) => ({
      id: p.id,
      name: p.name,
      plannerType: p.plannerType,
      roomWidthCm: p.roomWidthCm,
      roomDepthCm: p.roomDepthCm,
      itemCount: countItems(p.documentJson),
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    }));

    res.json(summaries);
  }),
);

router.post(
  "/plans",
  asyncHandler(async (req, res) => {
    const userId = (req as any).userId as string;
    const parsed = CreatePlanBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid plan data: " + parsed.error.message, status: 400 });
      return;
    }

    const { name, plannerType, roomWidthCm, roomDepthCm, documentJson } = parsed.data;

    if (!validateJson(documentJson)) {
      res.status(400).json({ error: "documentJson must be valid JSON", status: 400 });
      return;
    }

    if (roomWidthCm <= 0 || roomDepthCm <= 0) {
      res.status(400).json({ error: "Room dimensions must be positive", status: 400 });
      return;
    }

    const [plan] = await db
      .insert(plansTable)
      .values({
        name: name.trim(),
        plannerType,
        roomWidthCm,
        roomDepthCm,
        documentJson,
        userId,
      })
      .returning();

    res.status(201).json(serializePlan(plan));
  }),
);

router.get(
  "/plans/:id",
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

    res.json(serializePlan(plan));
  }),
);

router.patch(
  "/plans/:id",
  asyncHandler(async (req, res) => {
    const userId = (req as any).userId as string;
    const id = parseIdParam(req.params.id);
    if (!id) {
      res.status(400).json({ error: "Invalid plan id", status: 400 });
      return;
    }

    const [existing] = await db
      .select()
      .from(plansTable)
      .where(and(eq(plansTable.id, id), eq(plansTable.userId, userId)));

    if (!existing) {
      res.status(404).json({ error: "Plan not found", status: 404 });
      return;
    }

    const parsed = UpdatePlanBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid update data: " + parsed.error.message, status: 400 });
      return;
    }

    const updates: Partial<typeof plansTable.$inferInsert> = {};
    if (parsed.data.name != null) updates.name = parsed.data.name.trim();
    if (parsed.data.roomWidthCm != null) {
      if (parsed.data.roomWidthCm <= 0) {
        res.status(400).json({ error: "Room width must be positive", status: 400 });
        return;
      }
      updates.roomWidthCm = parsed.data.roomWidthCm;
    }
    if (parsed.data.roomDepthCm != null) {
      if (parsed.data.roomDepthCm <= 0) {
        res.status(400).json({ error: "Room depth must be positive", status: 400 });
        return;
      }
      updates.roomDepthCm = parsed.data.roomDepthCm;
    }
    if (parsed.data.documentJson != null) {
      if (!validateJson(parsed.data.documentJson)) {
        res.status(400).json({ error: "documentJson must be valid JSON", status: 400 });
        return;
      }
      updates.documentJson = parsed.data.documentJson;
    }

    if (Object.keys(updates).length === 0) {
      res.status(400).json({ error: "No valid fields to update", status: 400 });
      return;
    }

    const [plan] = await db
      .update(plansTable)
      .set(updates)
      .where(eq(plansTable.id, id))
      .returning();

    if (!plan) {
      res.status(404).json({ error: "Plan not found", status: 404 });
      return;
    }

    res.json(serializePlan(plan));
  }),
);

router.delete(
  "/plans/:id",
  asyncHandler(async (req, res) => {
    const userId = (req as any).userId as string;
    const id = parseIdParam(req.params.id);
    if (!id) {
      res.status(400).json({ error: "Invalid plan id", status: 400 });
      return;
    }

    const [deleted] = await db
      .delete(plansTable)
      .where(and(eq(plansTable.id, id), eq(plansTable.userId, userId)))
      .returning();

    if (!deleted) {
      res.status(404).json({ error: "Plan not found", status: 404 });
      return;
    }

    res.sendStatus(204);
  }),
);

router.post(
  "/plans/:id/duplicate",
  asyncHandler(async (req, res) => {
    const userId = (req as any).userId as string;
    const id = parseIdParam(req.params.id);
    if (!id) {
      res.status(400).json({ error: "Invalid plan id", status: 400 });
      return;
    }

    const [source] = await db
      .select()
      .from(plansTable)
      .where(and(eq(plansTable.id, id), eq(plansTable.userId, userId)));

    if (!source) {
      res.status(404).json({ error: "Plan not found", status: 404 });
      return;
    }

    const bodyParsed = DuplicatePlanBody.safeParse(req.body ?? {});
    const newName = bodyParsed.success && bodyParsed.data.name
      ? bodyParsed.data.name.trim()
      : `${source.name} (Copy)`;

    const [duplicate] = await db
      .insert(plansTable)
      .values({
        name: newName,
        plannerType: source.plannerType,
        roomWidthCm: source.roomWidthCm,
        roomDepthCm: source.roomDepthCm,
        documentJson: source.documentJson,
        userId,
      })
      .returning();

    res.status(201).json(serializePlan(duplicate));
  }),
);

export default router;
