import type { Request, Response, NextFunction } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../lib/auth";

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session || !session.user) {
      res.status(401).json({ error: "Unauthorized", status: 401 });
      return;
    }

    (req as any).userId = session.user.id;
    (req as any).user = session.user;
    next();
  } catch {
    res.status(401).json({ error: "Unauthorized", status: 401 });
  }
}
