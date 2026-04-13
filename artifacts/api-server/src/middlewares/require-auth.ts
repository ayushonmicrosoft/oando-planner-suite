import type { Request, Response, NextFunction } from "express";

const STATIC_ADMIN = {
  id: "admin-001",
  name: "Admin",
  email: "ayush@oando.co.in",
  role: "admin",
};

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  (req as any).userId = STATIC_ADMIN.id;
  (req as any).user = STATIC_ADMIN;
  next();
}
