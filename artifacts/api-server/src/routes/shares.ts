import { Router, type IRouter } from "express";
import { eq, and, desc } from "drizzle-orm";
import { db, plansTable, planSharesTable, planCommentsTable } from "@workspace/db";
import { asyncHandler } from "../middlewares/async-handler";
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
    expiresAt: s.expiresAt?.toISOString() ?? null,
  };
}

function serializeComment(c: typeof planCommentsTable.$inferSelect) {
  return {
    ...c,
    createdAt: c.createdAt.toISOString(),
  };
}

router.post(
  "/plans/:id/share",
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

    const parsed = CreateShareBody.safeParse(req.body ?? {});
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid share data: " + parsed.error.message, status: 400 });
      return;
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
    const userId = (req as any).userId as string;
    const planId = parseIdParam(req.params.id);
    const shareId = parseIdParam(req.params.shareId);
    if (!planId || !shareId) {
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

    const [deleted] = await db
      .update(planSharesTable)
      .set({ isActive: false })
      .where(and(eq(planSharesTable.id, shareId), eq(planSharesTable.planId, planId)))
      .returning();

    if (!deleted) {
      res.status(404).json({ error: "Share not found", status: 404 });
      return;
    }

    res.json(serializeShare(deleted));
  }),
);

export default router;
