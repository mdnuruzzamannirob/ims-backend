import { Router } from "express";
import { inventoryController } from "./inventory.controller";
import validate from "../../middlewares/validate";
import { adjustStockSchema } from "./inventory.validation";
import auth from "../../middlewares/auth";

const router = Router();

router.use(auth());

router.get("/", inventoryController.getAll);
router.get("/low-stock", inventoryController.getLowStockAlerts);
router.get("/:productId", inventoryController.getByProductId);
router.patch(
  "/:productId/adjust",
  validate(adjustStockSchema),
  inventoryController.adjustStock,
);

export const inventoryRoutes = router;
