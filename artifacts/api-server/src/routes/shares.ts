import { Router, type IRouter } from "express";
import { eq, and, desc } from "drizzle-orm";
import { db, plansTable, planSharesTable, planCommentsTable } from "@workspace/db";
import { asyncHandler } from "../middlewares/async-handler";
import { ApiHttpError } from "../middlewares/error-handler";
import crypto from "crypto";
import { z } from "zod";

const router: IRouter = Router();

const CreateShareBody = z.object({
  clientName: z.string().trim().max(200).nullish(),
  expiresInDays: z.number().positive().int().max(365).nullish(),
});

function parseIdParam(raw: string | string[]): number | null {
  const str = Array.isArray(raw) ? raw[0] : raw;
  const id = parseInt(str, 10);
  return isNaN(id) || id <= 0 ? null : id;
}

function generateToken(): string {
  return crypto.randomBytes(24).toString("base64url");
}

function serializeShare(s: typeof planSharesTable.$inferSelect) {
  return {
    ...s,
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
    viewedAt: s.viewedAt?.toISOString() ?? null,
    expiresAt: s.expiresAt?.toISOString() ?? null,
  };
}

function serializeComment(c: typeof planCommentsTable.$inferSelect) {
  return {
    ...c,
    createdAt: c.createdAt.toISOString(),
    itemName: c.itemName ?? null,
  };
}

router.post(
  "/plans/:id/share",
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

    const parsed = CreateShareBody.safeParse(req.body ?? {});
    if (!parsed.success) {
      throw new ApiHttpError(400, "Invalid share data: " + parsed.error.message);
    }

    let expiresAt: Date | null = null;
    if (parsed.data.expiresInDays) {
      expiresAt = new Date(Date.now() + parsed.data.expiresInDays * 86400000);
    }

    const shareToken = generateToken();

    const [share] = await db
      .insert(planSharesTable)
      .values({
        planId,
        shareToken,
        clientName: parsed.data.clientName || null,
        expiresAt,
      })
      .returning();

    res.status(201).json(serializeShare(share));
  }),
);

router.get(
  "/plans/:id/shares",
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

    const shares = await db
      .select()
      .from(planSharesTable)
      .where(eq(planSharesTable.planId, planId))
      .orderBy(desc(planSharesTable.createdAt));

    const comments = await db
      .select()
      .from(planCommentsTable)
      .where(eq(planCommentsTable.planId, planId))
      .orderBy(desc(planCommentsTable.createdAt));

    res.json({
      shares: shares.map(serializeShare),
      comments: comments.map(serializeComment),
    });
  }),
);

router.delete(
  "/plans/:id/shares/:shareId",
  asyncHandler(async (req, res) => {
    const userId = req.userId;
    const planId = parseIdParam(req.params.id);
    const shareId = parseIdParam(req.params.shareId);
    if (!planId || !shareId) {
      throw new ApiHttpError(400, "Invalid id");
    }

    const [plan] = await db
      .select()
      .from(plansTable)
      .where(and(eq(plansTable.id, planId), eq(plansTable.userId, userId)));

    if (!plan) {
      throw new ApiHttpError(404, "Plan not found");
    }

    const [deleted] = await db
      .update(planSharesTable)
      .set({ isActive: false })
      .where(and(eq(planSharesTable.id, shareId), eq(planSharesTable.planId, planId)))
      .returning();

    if (!deleted) {
      throw new ApiHttpError(404, "Share not found");
    }

    res.json(serializeShare(deleted));
  }),
);

export default router;
