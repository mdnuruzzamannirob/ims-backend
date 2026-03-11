import { Router } from "express";
import { productController } from "./product.controller";
import validate from "../../middlewares/validate";
import { createProductSchema, updateProductSchema } from "./product.validation";
import auth from "../../middlewares/auth";

const router = Router();

router.use(auth());

router.post("/", validate(createProductSchema), productController.create);
router.get("/", productController.getAll);
router.get("/:id", productController.getById);
router.patch("/:id", validate(updateProductSchema), productController.update);
router.delete("/:id", auth("admin", "manager"), productController.remove);

export const productRoutes = router;
