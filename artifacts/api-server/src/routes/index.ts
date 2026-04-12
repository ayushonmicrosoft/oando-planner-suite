import { Router, type IRouter } from "express";
import healthRouter from "./health";
import catalogRouter from "./catalog";
import plansRouter from "./plans";
import aiRouter from "./ai";
import templatesRouter from "./templates";
import usersRouter from "./users";
import clientsRouter from "./clients";
import projectsRouter from "./projects";
import quotesRouter from "./quotes";
import { requireAuth } from "../middlewares/require-auth";

const router: IRouter = Router();

router.use(healthRouter);
router.use(catalogRouter);

router.use(requireAuth);
router.use(usersRouter);
router.use(plansRouter);
router.use(quotesRouter);
router.use(aiRouter);
router.use(templatesRouter);
router.use(clientsRouter);
router.use(projectsRouter);

export default router;
