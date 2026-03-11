import { Router } from "express";
import { purchaseController } from "./purchase.controller";
import validate from "../../middlewares/validate";
import {
  createPurchaseSchema,
  updatePurchaseStatusSchema,
} from "./purchase.validation";
import auth, { requirePermission } from "../../middlewares/auth";

const router = Router();

router.use(auth());

router.post(
  "/",
  requirePermission("purchase", "create"),
  validate(createPurchaseSchema),
  purchaseController.create,
);
router.get(
  "/",
  requirePermission("purchase", "read"),
  purchaseController.getAll,
);
router.get(
  "/:id",
  requirePermission("purchase", "read"),
  purchaseController.getById,
);
router.patch(
  "/:id/status",
  requirePermission("purchase", "update"),
  validate(updatePurchaseStatusSchema),
  purchaseController.updateStatus,
);

export const purchaseRoutes = router;
