import { Router } from "express";
import { userRoutes } from "../modules/user/user.route";
import { categoryRoutes } from "../modules/category/category.route";
import { supplierRoutes } from "../modules/supplier/supplier.route";
import { productRoutes } from "../modules/product/product.route";
import { inventoryRoutes } from "../modules/inventory/inventory.route";
import { purchaseRoutes } from "../modules/purchase/purchase.route";
import { saleRoutes } from "../modules/sale/sale.route";

const router = Router();

router.use("/auth", userRoutes);
router.use("/categories", categoryRoutes);
router.use("/suppliers", supplierRoutes);
router.use("/products", productRoutes);
router.use("/inventory", inventoryRoutes);
router.use("/purchases", purchaseRoutes);
router.use("/sales", saleRoutes);

export default router;
