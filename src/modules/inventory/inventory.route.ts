import { Router } from "express";
import { inventoryController } from "./inventory.controller";
import validate from "../../middlewares/validate";
import { adjustStockSchema } from "./inventory.validation";
import auth, { requirePermission } from "../../middlewares/auth";

const router = Router();

router.use(auth());

router.get(
  "/",
  requirePermission("inventory", "read"),
  inventoryController.getAll,
);
router.get(
  "/low-stock",
  requirePermission("inventory", "read"),
  inventoryController.getLowStockAlerts,
);
router.get(
  "/:productId",
  requirePermission("inventory", "read"),
  inventoryController.getByProductId,
);
router.patch(
  "/:productId/adjust",
  requirePermission("inventory", "update"),
  validate(adjustStockSchema),
  inventoryController.adjustStock,
);

export const inventoryRoutes = router;
