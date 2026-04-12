import type { Request, Response, NextFunction } from "express";

export async function requireAdmin(_req: Request, _res: Response, next: NextFunction): Promise<void> {
  next();
}
