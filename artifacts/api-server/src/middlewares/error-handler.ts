import type { Request, Response, NextFunction } from "express";
import { logger } from "../lib/logger";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  let status = 500;
  let message = "Internal server error";

  if (err instanceof ApiHttpError) {
    status = err.status;
    message = err.message;
  } else if (err instanceof SyntaxError && "body" in err) {
    status = 400;
    message = "Malformed JSON in request body";
  } else if (
    err instanceof Error &&
    "status" in err &&
    typeof (err as any).status === "number"
  ) {
    status = (err as any).status;
    message = status < 500 ? err.message : "Internal server error";
  } else if (
    err instanceof Error &&
    "statusCode" in err &&
    typeof (err as any).statusCode === "number"
  ) {
    status = (err as any).statusCode;
    message = status < 500 ? err.message : "Internal server error";
  }

  if (status >= 500) {
    logger.error({ err }, "Unhandled server error");
  }

  res.status(status).json({
    error: message,
    status,
  });
}

export class ApiHttpError extends Error {
  readonly status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}
