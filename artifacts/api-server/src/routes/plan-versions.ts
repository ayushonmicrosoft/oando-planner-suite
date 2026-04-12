import { Router, type IRouter } from "express";
import { eq, desc, and, sql } from "drizzle-orm";
import { db, plansTable, planVersionsTable } from "@workspace/db";
import { asyncHandler } from "../middlewares/async-handler";

const router: IRouter = Router();

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
    const userId = (req as any).userId as string;
    const planId = parseIdParam(req.params.id);
    if (!planId) {
      res.status(400).json({ error: "Invalid plan id", status: 400 });
      return;
    }

    const [plan] = await db
      .select()
      .from(plansTable)
      .where(and(eq(plansTable.id, planId), eq(plansTable.userId, userId)));

    if (!plan) {
      res.status(404).json({ error: "Plan not found", status: 404 });
      return;
    }

    const name = typeof req.body?.name === "string" && req.body.name.trim()
      ? req.body.name.trim()
      : `Version`;

    const documentJson = typeof req.body?.documentJson === "string" && req.body.documentJson.trim()
      ? req.body.documentJson
      : plan.documentJson;

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
        thumbnailUrl: req.body?.thumbnailUrl || null,
      })
      .returning();

    res.status(201).json(serializeVersion(version));
  }),
);

router.get(
  "/plans/:id/versions",
  asyncHandler(async (req, res) => {
    const userId = (req as any).userId as string;
    const planId = parseIdParam(req.params.id);
    if (!planId) {
      res.status(400).json({ error: "Invalid plan id", status: 400 });
      return;
    }

    const [plan] = await db
      .select({ id: plansTable.id })
      .from(plansTable)
      .where(and(eq(plansTable.id, planId), eq(plansTable.userId, userId)));

    if (!plan) {
      res.status(404).json({ error: "Plan not found", status: 404 });
      return;
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
    const userId = (req as any).userId as string;
    const planId = parseIdParam(req.params.id);
    const versionId = parseIdParam(req.params.versionId);
    if (!planId || !versionId) {
      res.status(400).json({ error: "Invalid id", status: 400 });
      return;
    }

    const [plan] = await db
      .select({ id: plansTable.id })
      .from(plansTable)
      .where(and(eq(plansTable.id, planId), eq(plansTable.userId, userId)));

    if (!plan) {
      res.status(404).json({ error: "Plan not found", status: 404 });
      return;
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
      res.status(404).json({ error: "Version not found", status: 404 });
      return;
    }

    res.json(serializeVersion(version));
  }),
);

router.post(
  "/plans/:id/versions/:versionId/restore",
  asyncHandler(async (req, res) => {
    const userId = (req as any).userId as string;
    const planId = parseIdParam(req.params.id);
    const versionId = parseIdParam(req.params.versionId);
    if (!planId || !versionId) {
      res.status(400).json({ error: "Invalid id", status: 400 });
      return;
    }

    const [plan] = await db
      .select()
      .from(plansTable)
      .where(and(eq(plansTable.id, planId), eq(plansTable.userId, userId)));

    if (!plan) {
      res.status(404).json({ error: "Plan not found", status: 404 });
      return;
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
      res.status(404).json({ error: "Version not found", status: 404 });
      return;
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
