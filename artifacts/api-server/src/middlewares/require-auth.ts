import type { Request, Response, NextFunction } from "express";

const STATIC_ADMIN = {
  id: "admin-001",
  name: "Admin",
  email: process.env.ADMIN_EMAILS?.split(",")[0]?.trim() || "admin@example.com",
  role: "admin",
};

export async function requireAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  req.userId = STATIC_ADMIN.id;
  req.user = STATIC_ADMIN;
  next();
}
