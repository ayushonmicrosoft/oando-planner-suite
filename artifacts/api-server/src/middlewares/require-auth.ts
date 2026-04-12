import type { Request, Response, NextFunction } from "express";
import { createSupabaseClient } from "../lib/supabase";

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    res.status(401).json({ error: "Unauthorized", status: 401 });
    return;
  }

  const supabase = createSupabaseClient(token);
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    res.status(401).json({ error: "Unauthorized", status: 401 });
    return;
  }

  (req as any).userId = user.id;
  (req as any).user = user;
  next();
}
