import { Router } from "express";
import { reportController } from "./report.controller";
import auth, { requirePermission } from "../../middlewares/auth";

const router = Router();

router.use(auth());

router.get(
  "/dashboard",
  requirePermission("dashboard", "read"),
  reportController.getDashboardStats,
);

router.get(
  "/sales",
  requirePermission("report", "read"),
  reportController.getSalesReport,
);

router.get(
  "/purchases",
  requirePermission("report", "read"),
  reportController.getPurchaseReport,
);

router.get(
  "/inventory",
  requirePermission("report", "read"),
  reportController.getInventoryReport,
);

router.get(
  "/profit-loss",
  requirePermission("report", "read"),
  reportController.getProfitLossReport,
);

router.get(
  "/top-products",
  requirePermission("report", "read"),
  reportController.getTopProducts,
);

export const reportRoutes = router;
