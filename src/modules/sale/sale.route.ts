import { Router } from "express";
import { saleController } from "./sale.controller";
import validate from "../../middlewares/validate";
import { createSaleSchema } from "./sale.validation";
import auth from "../../middlewares/auth";

const router = Router();

router.use(auth());

router.post("/", validate(createSaleSchema), saleController.create);
router.get("/", saleController.getAll);
router.get("/:id", saleController.getById);
router.patch(
  "/:id/return",
  auth("admin", "manager"),
  saleController.returnSale,
);

export const saleRoutes = router;
