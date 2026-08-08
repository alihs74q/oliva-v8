import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import adminAuthRouter from "./adminAuth.js";
import adminContentRouter from "./adminContent.js";
import adminMediaRouter from "./adminMedia.js";
import publicContentRouter from "./publicContent.js";

const router: IRouter = Router();

// Public routes first — must be registered before adminContentRouter,
// whose blanket requireAdminAuth middleware would otherwise intercept them.
router.use(healthRouter);
router.use(publicContentRouter);

// Admin routes (auth checked per-router)
router.use(adminAuthRouter);
router.use(adminContentRouter);
router.use(adminMediaRouter);

export default router;
