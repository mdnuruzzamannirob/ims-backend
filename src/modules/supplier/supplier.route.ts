import { Router } from "express";
import { supplierController } from "./supplier.controller";
import validate from "../../middlewares/validate";
import {
  createSupplierSchema,
  updateSupplierSchema,
} from "./supplier.validation";
import auth from "../../middlewares/auth";

const router = Router();

router.use(auth());

router.post("/", validate(createSupplierSchema), supplierController.create);
router.get("/", supplierController.getAll);
router.get("/:id", supplierController.getById);
router.patch("/:id", validate(updateSupplierSchema), supplierController.update);
router.delete("/:id", auth("admin", "manager"), supplierController.remove);

export const supplierRoutes = router;
