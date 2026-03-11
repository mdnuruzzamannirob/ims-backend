import { Router } from "express";
import { supplierController } from "./supplier.controller";
import validate from "../../middlewares/validate";
import {
  createSupplierSchema,
  updateSupplierSchema,
} from "./supplier.validation";
import auth, { requirePermission } from "../../middlewares/auth";

const router = Router();

router.use(auth());

router.post(
  "/",
  requirePermission("supplier", "create"),
  validate(createSupplierSchema),
  supplierController.create,
);
router.get(
  "/",
  requirePermission("supplier", "read"),
  supplierController.getAll,
);
router.get(
  "/:id",
  requirePermission("supplier", "read"),
  supplierController.getById,
);
router.patch(
  "/:id",
  requirePermission("supplier", "update"),
  validate(updateSupplierSchema),
  supplierController.update,
);
router.delete(
  "/:id",
  requirePermission("supplier", "delete"),
  supplierController.remove,
);

export const supplierRoutes = router;
