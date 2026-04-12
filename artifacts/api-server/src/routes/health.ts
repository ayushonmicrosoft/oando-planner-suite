import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { sql } from "drizzle-orm";

const router: IRouter = Router();

router.get("/healthz", async (_req, res) => {
  const checks: Record<string, { status: string; latencyMs?: number; error?: string }> = {};

  const dbStart = Date.now();
  try {
    await db.execute(sql`SELECT 1`);
    checks.database = { status: "up", latencyMs: Date.now() - dbStart };
  } catch (err) {
    checks.database = {
      status: "down",
      latencyMs: Date.now() - dbStart,
      error: "Database connection failed",
    };
  }

  const allUp = Object.values(checks).every((c) => c.status === "up");

  res.status(allUp ? 200 : 503).json({
    status: allUp ? "healthy" : "degraded",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    checks,
  });
});

export default router;
