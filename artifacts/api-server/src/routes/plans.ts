import { Router, type IRouter } from "express";
import { eq, desc, sql, and } from "drizzle-orm";
import { db, plansTable, projectsTable } from "@workspace/db";
import {
  CreatePlanBody,
  UpdatePlanBody,
  DuplicatePlanBody,
  ListPlansQueryParams,
} from "@workspace/api-zod";
import { asyncHandler } from "../middlewares/async-handler";
import { ApiHttpError } from "../middlewares/error-handler";

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
    const userId = req.userId;

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
    const userId = req.userId;
    const qp = ListPlansQueryParams.safeParse(req.query);
    if (!qp.success) {
      throw new ApiHttpError(400, "Invalid query parameters");
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
      projectId: p.projectId,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    }));

    res.json(summaries);
  }),
);

router.post(
  "/plans",
  asyncHandler(async (req, res) => {
    const userId = req.userId;
    const parsed = CreatePlanBody.safeParse(req.body);
    if (!parsed.success) {
      throw new ApiHttpError(400, "Invalid plan data: " + parsed.error.message);
    }

    const { name, plannerType, roomWidthCm, roomDepthCm, documentJson, projectId } = parsed.data;

    if (!validateJson(documentJson)) {
      throw new ApiHttpError(400, "documentJson must be valid JSON");
    }

    if (roomWidthCm <= 0 || roomDepthCm <= 0) {
      throw new ApiHttpError(400, "Room dimensions must be positive");
    }

    if (projectId) {
      const [proj] = await db
        .select()
        .from(projectsTable)
        .where(and(eq(projectsTable.id, projectId), eq(projectsTable.userId, userId)));
      if (!proj) {
        throw new ApiHttpError(400, "Project not found");
      }
    }

    const [plan] = await db
      .insert(plansTable)
      .values({
        name: name.trim(),
        plannerType,
        roomWidthCm,
        roomDepthCm,
        documentJson,
        projectId: projectId || null,
        userId,
      })
      .returning();

    res.status(201).json(serializePlan(plan));
  }),
);

router.get(
  "/plans/:id",
  asyncHandler(async (req, res) => {
    const userId = req.userId;
    const id = parseIdParam(req.params.id);
    if (!id) {
      throw new ApiHttpError(400, "Invalid plan id");
    }

    const [plan] = await db
      .select()
      .from(plansTable)
      .where(and(eq(plansTable.id, id), eq(plansTable.userId, userId)));

    if (!plan) {
      throw new ApiHttpError(404, "Plan not found");
    }

    res.json(serializePlan(plan));
  }),
);

router.patch(
  "/plans/:id",
  asyncHandler(async (req, res) => {
    const userId = req.userId;
    const id = parseIdParam(req.params.id);
    if (!id) {
      throw new ApiHttpError(400, "Invalid plan id");
    }

    const [existing] = await db
      .select()
      .from(plansTable)
      .where(and(eq(plansTable.id, id), eq(plansTable.userId, userId)));

    if (!existing) {
      throw new ApiHttpError(404, "Plan not found");
    }

    const parsed = UpdatePlanBody.safeParse(req.body);
    if (!parsed.success) {
      throw new ApiHttpError(400, "Invalid update data: " + parsed.error.message);
    }

    const updates: Partial<typeof plansTable.$inferInsert> = {};
    if (parsed.data.name != null) updates.name = parsed.data.name.trim();
    if (parsed.data.roomWidthCm != null) {
      if (parsed.data.roomWidthCm <= 0) {
        throw new ApiHttpError(400, "Room width must be positive");
      }
      updates.roomWidthCm = parsed.data.roomWidthCm;
    }
    if (parsed.data.roomDepthCm != null) {
      if (parsed.data.roomDepthCm <= 0) {
        throw new ApiHttpError(400, "Room depth must be positive");
      }
      updates.roomDepthCm = parsed.data.roomDepthCm;
    }
    if (parsed.data.documentJson != null) {
      if (!validateJson(parsed.data.documentJson)) {
        throw new ApiHttpError(400, "documentJson must be valid JSON");
      }
      updates.documentJson = parsed.data.documentJson;
    }
    if (parsed.data.projectId !== undefined) {
      if (parsed.data.projectId != null) {
        const [proj] = await db
          .select()
          .from(projectsTable)
          .where(and(eq(projectsTable.id, parsed.data.projectId), eq(projectsTable.userId, userId)));
        if (!proj) {
          throw new ApiHttpError(400, "Project not found");
        }
      }
      updates.projectId = parsed.data.projectId;
    }

    if (Object.keys(updates).length === 0) {
      throw new ApiHttpError(400, "No valid fields to update");
    }

    const [plan] = await db
      .update(plansTable)
      .set(updates)
      .where(eq(plansTable.id, id))
      .returning();

    if (!plan) {
      throw new ApiHttpError(404, "Plan not found");
    }

    res.json(serializePlan(plan));
  }),
);

router.delete(
  "/plans/:id",
  asyncHandler(async (req, res) => {
    const userId = req.userId;
    const id = parseIdParam(req.params.id);
    if (!id) {
      throw new ApiHttpError(400, "Invalid plan id");
    }

    const [deleted] = await db
      .delete(plansTable)
      .where(and(eq(plansTable.id, id), eq(plansTable.userId, userId)))
      .returning();

    if (!deleted) {
      throw new ApiHttpError(404, "Plan not found");
    }

    res.sendStatus(204);
  }),
);

router.post(
  "/plans/:id/duplicate",
  asyncHandler(async (req, res) => {
    const userId = req.userId;
    const id = parseIdParam(req.params.id);
    if (!id) {
      throw new ApiHttpError(400, "Invalid plan id");
    }

    const [source] = await db
      .select()
      .from(plansTable)
      .where(and(eq(plansTable.id, id), eq(plansTable.userId, userId)));

    if (!source) {
      throw new ApiHttpError(404, "Plan not found");
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
