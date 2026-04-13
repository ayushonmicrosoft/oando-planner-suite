import type { Request, Response, NextFunction } from "express";
import { config } from "../lib/config";

const STATIC_ADMIN = {
  id: "admin-001",
  name: "Admin",
  email: config.adminEmails[0] || "admin@example.com",
  role: "admin",
};

export async function requireAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  req.userId = STATIC_ADMIN.id;
  req.user = STATIC_ADMIN;
  next();
}
