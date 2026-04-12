import { Router, type IRouter } from "express";
import healthRouter from "./health";
import catalogRouter from "./catalog";
import plansRouter from "./plans";
import aiRouter from "./ai";
import templatesRouter from "./templates";
import { requireAuth } from "../middlewares/require-auth";

const router: IRouter = Router();

router.use(healthRouter);
router.use(catalogRouter);

router.use(requireAuth);
router.use(plansRouter);
router.use(aiRouter);
router.use(templatesRouter);

export default router;
