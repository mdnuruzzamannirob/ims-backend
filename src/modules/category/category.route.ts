import { Router } from "express";
import { categoryController } from "./category.controller";
import validate from "../../middlewares/validate";
import {
  createCategorySchema,
  updateCategorySchema,
} from "./category.validation";
import auth from "../../middlewares/auth";

const router = Router();

router.use(auth());

router.post("/", validate(createCategorySchema), categoryController.create);
router.get("/", categoryController.getAll);
router.get("/:id", categoryController.getById);
router.patch("/:id", validate(updateCategorySchema), categoryController.update);
router.delete("/:id", auth("admin", "manager"), categoryController.remove);

export const categoryRoutes = router;
