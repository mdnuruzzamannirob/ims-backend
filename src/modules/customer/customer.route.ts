import { Router } from "express";
import { customerController } from "./customer.controller";
import auth, { requirePermission } from "../../middlewares/auth";
import validate from "../../middlewares/validate";
import {
  createCustomerSchema,
  updateCustomerSchema,
} from "./customer.validation";

const router = Router();

router.use(auth());

router.post(
  "/",
  requirePermission("customer", "create"),
  validate(createCustomerSchema),
  customerController.create,
);

router.get(
  "/",
  requirePermission("customer", "read"),
  customerController.getAll,
);

router.get(
  "/:id",
  requirePermission("customer", "read"),
  customerController.getById,
);

router.get(
  "/:id/sales",
  requirePermission("customer", "read"),
  customerController.getSalesHistory,
);

router.get(
  "/:id/stats",
  requirePermission("customer", "read"),
  customerController.getStats,
);

router.patch(
  "/:id",
  requirePermission("customer", "update"),
  validate(updateCustomerSchema),
  customerController.update,
);

router.delete(
  "/:id",
  requirePermission("customer", "delete"),
  customerController.remove,
);

export const customerRoutes = router;
