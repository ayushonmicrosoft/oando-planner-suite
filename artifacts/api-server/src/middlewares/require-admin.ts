import type { Request, Response, NextFunction } from "express";
import { eq } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import { ApiHttpError } from "./error-handler";

export async function requireAdmin(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.userId;

    if (!userId) {
      next(new ApiHttpError(401, "Unauthorized"));
      return;
    }

    const [user] = await db.select({ role: usersTable.role }).from(usersTable).where(eq(usersTable.id, userId)).limit(1);

    if (!user || user.role !== "admin") {
      next(new ApiHttpError(403, "Forbidden: admin access required"));
      return;
    }

    next();
  } catch (err) {
    next(err);
  }
}
