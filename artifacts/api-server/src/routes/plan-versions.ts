import { Router, type IRouter } from "express";
import { eq, desc, and, sql } from "drizzle-orm";
import { db, plansTable, planVersionsTable } from "@workspace/db";
import { asyncHandler } from "../middlewares/async-handler";
import { ApiHttpError } from "../middlewares/error-handler";
import { z } from "zod";

const router: IRouter = Router();

const CreatePlanVersionBody = z.object({
  name: z.string().trim().min(1).max(500).optional(),
  documentJson: z.string().min(1).max(10_000_000).optional(),
  thumbnailUrl: z.string().url().max(2000).nullish(),
});

function serializeVersion(v: typeof planVersionsTable.$inferSelect) {
  return {
    ...v,
    createdAt: v.createdAt.toISOString(),
  };
}

function parseIdParam(raw: string | string[]): number | null {
  const str = Array.isArray(raw) ? raw[0] : raw;
  const id = parseInt(str, 10);
  return isNaN(id) || id <= 0 ? null : id;
}

router.post(
  "/plans/:id/versions",
  asyncHandler(async (req, res) => {
    const userId = req.userId;
    const planId = parseIdParam(req.params.id);
    if (!planId) {
      throw new ApiHttpError(400, "Invalid plan id");
    }

    const [plan] = await db
      .select()
      .from(plansTable)
      .where(and(eq(plansTable.id, planId), eq(plansTable.userId, userId)));

    if (!plan) {
      throw new ApiHttpError(404, "Plan not found");
    }

    const parsed = CreatePlanVersionBody.safeParse(req.body ?? {});
    if (!parsed.success) {
      throw new ApiHttpError(400, "Invalid version data: " + parsed.error.message);
    }

    const name = parsed.data.name?.trim() || "Version";
    const documentJson = parsed.data.documentJson?.trim() || plan.documentJson;

    const [maxVersion] = await db
      .select({ max: sql<number>`coalesce(max(${planVersionsTable.versionNumber}), 0)` })
      .from(planVersionsTable)
      .where(eq(planVersionsTable.planId, planId));

    const nextVersion = (maxVersion?.max ?? 0) + 1;

    const finalName = name === "Version" ? `Version ${nextVersion}` : name;

    const [version] = await db
      .insert(planVersionsTable)
      .values({
        planId,
        versionNumber: nextVersion,
        name: finalName,
        documentJson,
        thumbnailUrl: parsed.data.thumbnailUrl ?? null,
      })
      .returning();

    res.status(201).json(serializeVersion(version));
  }),
);

router.get(
  "/plans/:id/versions",
  asyncHandler(async (req, res) => {
    const userId = req.userId;
    const planId = parseIdParam(req.params.id);
    if (!planId) {
      throw new ApiHttpError(400, "Invalid plan id");
    }

    const [plan] = await db
      .select({ id: plansTable.id })
      .from(plansTable)
      .where(and(eq(plansTable.id, planId), eq(plansTable.userId, userId)));

    if (!plan) {
      throw new ApiHttpError(404, "Plan not found");
    }

    const versions = await db
      .select()
      .from(planVersionsTable)
      .where(eq(planVersionsTable.planId, planId))
      .orderBy(desc(planVersionsTable.versionNumber));

    res.json(versions.map(serializeVersion));
  }),
);

router.get(
  "/plans/:id/versions/:versionId",
  asyncHandler(async (req, res) => {
    const userId = req.userId;
    const planId = parseIdParam(req.params.id);
    const versionId = parseIdParam(req.params.versionId);
    if (!planId || !versionId) {
      throw new ApiHttpError(400, "Invalid id");
    }

    const [plan] = await db
      .select({ id: plansTable.id })
      .from(plansTable)
      .where(and(eq(plansTable.id, planId), eq(plansTable.userId, userId)));

    if (!plan) {
      throw new ApiHttpError(404, "Plan not found");
    }

    const [version] = await db
      .select()
      .from(planVersionsTable)
      .where(
        and(
          eq(planVersionsTable.id, versionId),
          eq(planVersionsTable.planId, planId),
        ),
      );

    if (!version) {
      throw new ApiHttpError(404, "Version not found");
    }

    res.json(serializeVersion(version));
  }),
);

router.post(
  "/plans/:id/versions/:versionId/restore",
  asyncHandler(async (req, res) => {
    const userId = req.userId;
    const planId = parseIdParam(req.params.id);
    const versionId = parseIdParam(req.params.versionId);
    if (!planId || !versionId) {
      throw new ApiHttpError(400, "Invalid id");
    }

    const [plan] = await db
      .select()
      .from(plansTable)
      .where(and(eq(plansTable.id, planId), eq(plansTable.userId, userId)));

    if (!plan) {
      throw new ApiHttpError(404, "Plan not found");
    }

    const [version] = await db
      .select()
      .from(planVersionsTable)
      .where(
        and(
          eq(planVersionsTable.id, versionId),
          eq(planVersionsTable.planId, planId),
        ),
      );

    if (!version) {
      throw new ApiHttpError(404, "Version not found");
    }

    const [maxVersion] = await db
      .select({ max: sql<number>`coalesce(max(${planVersionsTable.versionNumber}), 0)` })
      .from(planVersionsTable)
      .where(eq(planVersionsTable.planId, planId));

    const nextVersion = (maxVersion?.max ?? 0) + 1;
    await db
      .insert(planVersionsTable)
      .values({
        planId,
        versionNumber: nextVersion,
        name: `Before restore to v${version.versionNumber}`,
        documentJson: plan.documentJson,
      });

    const [updated] = await db
      .update(plansTable)
      .set({ documentJson: version.documentJson })
      .where(eq(plansTable.id, planId))
      .returning();

    res.json({
      ...updated,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    });
  }),
);

export default router;
