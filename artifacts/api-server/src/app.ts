import express, { type Express, type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import rateLimit from "express-rate-limit";
import { toNodeHandler } from "better-auth/node";
import router from "./routes";
import { logger } from "./lib/logger";
import { auth } from "./lib/auth";
import { seedDatabase } from "./lib/seed";
import { errorHandler } from "./middlewares/error-handler";

const app: Express = express();
app.set("trust proxy", 1);

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later" },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many authentication attempts, please try again later" },
});

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

app.use(cors({ credentials: true, origin: true }));

app.use("/api/auth", authLimiter);
app.all("/api/auth/{*splat}", toNodeHandler(auth));

app.use("/api/webhooks/razorpay", express.json({
  limit: "2mb",
  verify: (req: any, _res, buf) => {
    req.rawBody = buf.toString();
  },
}));
app.use("/api/admin/upload", express.json({ limit: "30mb" }));
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

app.use((_req: Request, res: Response, next: NextFunction) => {
  res.set(
    "Content-Security-Policy",
    "default-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' https://*.afcindia.co.in https://*.supabase.co data:; font-src 'self'; connect-src 'self' https://*.supabase.co; script-src 'self'; frame-ancestors 'none'"
  );
  res.set("X-Content-Type-Options", "nosniff");
  res.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  next();
});

app.use("/api", (_req: Request, res: Response, next: NextFunction) => {
  res.set("Cache-Control", "no-store");
  res.set("Pragma", "no-cache");
  next();
}, apiLimiter, router);

app.use(errorHandler);

seedDatabase().catch((err) => logger.error({ err }, "Seed failed"));

export default app;
