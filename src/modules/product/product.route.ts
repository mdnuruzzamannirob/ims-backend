import { Router } from "express";
import { productController } from "./product.controller";
import validate from "../../middlewares/validate";
import { createProductSchema, updateProductSchema } from "./product.validation";
import auth, { requirePermission } from "../../middlewares/auth";

const router = Router();

router.use(auth());

router.post(
  "/",
  requirePermission("product", "create"),
  validate(createProductSchema),
  productController.create,
);
router.get("/", requirePermission("product", "read"), productController.getAll);
router.get(
  "/:id",
  requirePermission("product", "read"),
  productController.getById,
);
router.patch(
  "/:id",
  requirePermission("product", "update"),
  validate(updateProductSchema),
  productController.update,
);
router.delete(
  "/:id",
  requirePermission("product", "delete"),
  productController.remove,
);

export const productRoutes = router;
