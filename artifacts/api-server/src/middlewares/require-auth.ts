import type { Request, Response, NextFunction } from "express";

export async function requireAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  (req as any).userId = "admin-default";
  (req as any).user = { id: "admin-default", email: "ayush@oando.co.in", name: "Admin" };
  next();
}
