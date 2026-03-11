import { Router } from "express";
import { saleController } from "./sale.controller";
import validate from "../../middlewares/validate";
import { createSaleSchema } from "./sale.validation";
import auth, { requirePermission } from "../../middlewares/auth";

const router = Router();

router.use(auth());

router.post(
  "/",
  requirePermission("sale", "create"),
  validate(createSaleSchema),
  saleController.create,
);
router.get("/", requirePermission("sale", "read"), saleController.getAll);
router.get("/:id", requirePermission("sale", "read"), saleController.getById);
router.patch(
  "/:id/return",
  requirePermission("sale", "update"),
  saleController.returnSale,
);

export const saleRoutes = router;
