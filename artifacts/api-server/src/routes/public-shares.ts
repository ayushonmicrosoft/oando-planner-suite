import { Router, type IRouter } from "express";
import { eq, and, desc } from "drizzle-orm";
import { db, plansTable, planSharesTable, planCommentsTable } from "@workspace/db";
import { asyncHandler } from "../middlewares/async-handler";
import { z } from "zod";

const router: IRouter = Router();

const AddCommentBody = z.object({
  x: z.number().finite().min(0).max(10000),
  y: z.number().finite().min(0).max(10000),
  message: z.string().trim().min(1).max(2000),
  authorName: z.string().trim().min(1).max(200),
});

const ApproveShareBody = z.object({
  status: z.enum(["approved", "changes_requested"]),
  note: z.string().trim().max(2000).nullish(),
});

function parseStringParam(raw: string | string[]): string {
  return Array.isArray(raw) ? raw[0] : raw;
}

function isShareValid(share: typeof planSharesTable.$inferSelect): boolean {
  if (!share.isActive) return false;
  if (share.expiresAt && share.expiresAt < new Date()) return false;
  return true;
}

router.get(
  "/share/:token",
  asyncHandler(async (req, res) => {
    const token = parseStringParam(req.params.token);

    const [share] = await db
      .select()
      .from(planSharesTable)
      .where(eq(planSharesTable.shareToken, token));

    if (!share || !isShareValid(share)) {
      res.status(404).json({ error: "Share link not found or expired", status: 404 });
      return;
    }

    const [plan] = await db
      .select()
      .from(plansTable)
      .where(eq(plansTable.id, share.planId));

    if (!plan) {
      res.status(404).json({ error: "Plan not found", status: 404 });
      return;
    }

    const comments = await db
      .select()
      .from(planCommentsTable)
      .where(eq(planCommentsTable.shareId, share.id))
      .orderBy(desc(planCommentsTable.createdAt));

    res.json({
      share: {
        id: share.id,
        status: share.status,
        statusNote: share.statusNote,
        clientName: share.clientName,
        createdAt: share.createdAt.toISOString(),
        expiresAt: share.expiresAt?.toISOString() ?? null,
      },
      plan: {
        id: plan.id,
        name: plan.name,
        plannerType: plan.plannerType,
        roomWidthCm: plan.roomWidthCm,
        roomDepthCm: plan.roomDepthCm,
        documentJson: plan.documentJson,
      },
      comments: comments.map((c) => ({
        id: c.id,
        x: c.x,
        y: c.y,
        message: c.message,
        authorName: c.authorName,
        createdAt: c.createdAt.toISOString(),
      })),
    });
  }),
);

router.post(
  "/share/:token/comments",
  asyncHandler(async (req, res) => {
    const token = parseStringParam(req.params.token);

    const [share] = await db
      .select()
      .from(planSharesTable)
      .where(eq(planSharesTable.shareToken, token));

    if (!share || !isShareValid(share)) {
      res.status(404).json({ error: "Share link not found or expired", status: 404 });
      return;
    }

    const parsed = AddCommentBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid comment data: " + parsed.error.message, status: 400 });
      return;
    }

    const [comment] = await db
      .insert(planCommentsTable)
      .values({
        shareId: share.id,
        planId: share.planId,
        x: parsed.data.x,
        y: parsed.data.y,
        message: parsed.data.message,
        authorName: parsed.data.authorName,
      })
      .returning();

    res.status(201).json({
      id: comment.id,
      x: comment.x,
      y: comment.y,
      message: comment.message,
      authorName: comment.authorName,
      createdAt: comment.createdAt.toISOString(),
    });
  }),
);

router.post(
  "/share/:token/approve",
  asyncHandler(async (req, res) => {
    const token = parseStringParam(req.params.token);

    const [share] = await db
      .select()
      .from(planSharesTable)
      .where(eq(planSharesTable.shareToken, token));

    if (!share || !isShareValid(share)) {
      res.status(404).json({ error: "Share link not found or expired", status: 404 });
      return;
    }

    const parsed = ApproveShareBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid approval data: " + parsed.error.message, status: 400 });
      return;
    }

    const [updated] = await db
      .update(planSharesTable)
      .set({ status: parsed.data.status, statusNote: parsed.data.note || null })
      .where(eq(planSharesTable.id, share.id))
      .returning();

    res.json({
      id: updated.id,
      status: updated.status,
      statusNote: updated.statusNote,
      updatedAt: updated.updatedAt.toISOString(),
    });
  }),
);

export default router;
