import type { Request, Response, NextFunction } from "express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

export async function requireAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
  const userId = (req as any).userId;

  if (!userId) {
    res.status(401).json({ error: "Unauthorized", status: 401 });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);

  if (!user || user.role !== "admin") {
    res.status(403).json({ error: "Forbidden: admin access required", status: 403 });
    return;
  }

  next();
}
