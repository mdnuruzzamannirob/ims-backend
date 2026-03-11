import { Router } from "express";
import { auditController } from "./audit.controller";
import auth, { requirePermission } from "../../middlewares/auth";

const router = Router();

router.use(auth());

router.get("/", requirePermission("audit", "read"), auditController.getAll);

export const auditRoutes = router;
