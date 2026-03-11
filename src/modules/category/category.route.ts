import { Router } from "express";
import { categoryController } from "./category.controller";
import validate from "../../middlewares/validate";
import {
  createCategorySchema,
  updateCategorySchema,
} from "./category.validation";
import auth, { requirePermission } from "../../middlewares/auth";

const router = Router();

router.use(auth());

router.post(
  "/",
  requirePermission("category", "create"),
  validate(createCategorySchema),
  categoryController.create,
);
router.get(
  "/",
  requirePermission("category", "read"),
  categoryController.getAll,
);
router.get(
  "/:id",
  requirePermission("category", "read"),
  categoryController.getById,
);
router.patch(
  "/:id",
  requirePermission("category", "update"),
  validate(updateCategorySchema),
  categoryController.update,
);
router.delete(
  "/:id",
  requirePermission("category", "delete"),
  categoryController.remove,
);

export const categoryRoutes = router;
