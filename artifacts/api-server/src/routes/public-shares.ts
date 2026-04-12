import { Router, type IRouter } from "express";
import { eq, and, desc } from "drizzle-orm";
import { db, plansTable, planSharesTable, planCommentsTable } from "@workspace/db";
import { asyncHandler } from "../middlewares/async-handler";

const router: IRouter = Router();

function isShareValid(share: typeof planSharesTable.$inferSelect): boolean {
  if (!share.isActive) return false;
  if (share.expiresAt && share.expiresAt < new Date()) return false;
  return true;
}

router.get(
  "/share/:token",
  asyncHandler(async (req, res) => {
    const { token } = req.params;

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
    const { token } = req.params;

    const [share] = await db
      .select()
      .from(planSharesTable)
      .where(eq(planSharesTable.shareToken, token));

    if (!share || !isShareValid(share)) {
      res.status(404).json({ error: "Share link not found or expired", status: 404 });
      return;
    }

    const { x, y, message, authorName } = req.body || {};

    if (typeof x !== "number" || typeof y !== "number" || !isFinite(x) || !isFinite(y)) {
      res.status(400).json({ error: "x and y must be finite numbers", status: 400 });
      return;
    }
    if (x < 0 || x > 10000 || y < 0 || y > 10000) {
      res.status(400).json({ error: "x and y must be between 0 and 10000", status: 400 });
      return;
    }
    if (!message || typeof message !== "string" || !message.trim()) {
      res.status(400).json({ error: "message is required", status: 400 });
      return;
    }
    if (message.trim().length > 2000) {
      res.status(400).json({ error: "message must be 2000 characters or less", status: 400 });
      return;
    }
    if (!authorName || typeof authorName !== "string" || !authorName.trim()) {
      res.status(400).json({ error: "authorName is required", status: 400 });
      return;
    }
    if (authorName.trim().length > 200) {
      res.status(400).json({ error: "authorName must be 200 characters or less", status: 400 });
      return;
    }

    const [comment] = await db
      .insert(planCommentsTable)
      .values({
        shareId: share.id,
        planId: share.planId,
        x,
        y,
        message: message.trim(),
        authorName: authorName.trim(),
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
    const { token } = req.params;

    const [share] = await db
      .select()
      .from(planSharesTable)
      .where(eq(planSharesTable.shareToken, token));

    if (!share || !isShareValid(share)) {
      res.status(404).json({ error: "Share link not found or expired", status: 404 });
      return;
    }

    const { status, note } = req.body || {};

    if (status !== "approved" && status !== "changes_requested") {
      res.status(400).json({ error: "status must be 'approved' or 'changes_requested'", status: 400 });
      return;
    }

    if (note !== undefined && note !== null && typeof note !== "string") {
      res.status(400).json({ error: "note must be a string", status: 400 });
      return;
    }
    if (typeof note === "string" && note.length > 2000) {
      res.status(400).json({ error: "note must be 2000 characters or less", status: 400 });
      return;
    }

    const [updated] = await db
      .update(planSharesTable)
      .set({ status, statusNote: note || null })
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
