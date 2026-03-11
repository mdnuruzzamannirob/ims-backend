import { Router } from "express";
import { purchaseController } from "./purchase.controller";
import validate from "../../middlewares/validate";
import {
  createPurchaseSchema,
  updatePurchaseStatusSchema,
} from "./purchase.validation";
import auth from "../../middlewares/auth";

const router = Router();

router.use(auth());

router.post("/", validate(createPurchaseSchema), purchaseController.create);
router.get("/", purchaseController.getAll);
router.get("/:id", purchaseController.getById);
router.patch(
  "/:id/status",
  auth("admin", "manager"),
  validate(updatePurchaseStatusSchema),
  purchaseController.updateStatus,
);

export const purchaseRoutes = router;
