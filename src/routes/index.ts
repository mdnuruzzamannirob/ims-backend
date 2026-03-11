import { Router } from "express";
import { userRoutes } from "../modules/user/user.route";
import { categoryRoutes } from "../modules/category/category.route";
import { supplierRoutes } from "../modules/supplier/supplier.route";
import { productRoutes } from "../modules/product/product.route";
import { inventoryRoutes } from "../modules/inventory/inventory.route";
import { purchaseRoutes } from "../modules/purchase/purchase.route";
import { saleRoutes } from "../modules/sale/sale.route";
import { uploadRoutes } from "../modules/upload/upload.route";
import { paymentRoutes } from "../modules/payment/payment.route";
import { customerRoutes } from "../modules/customer/customer.route";
import { reportRoutes } from "../modules/report/report.route";

const router = Router();

router.use("/auth", userRoutes);
router.use("/categories", categoryRoutes);
router.use("/suppliers", supplierRoutes);
router.use("/products", productRoutes);
router.use("/inventory", inventoryRoutes);
router.use("/purchases", purchaseRoutes);
router.use("/sales", saleRoutes);
router.use("/uploads", uploadRoutes);
router.use("/payments", paymentRoutes);
router.use("/customers", customerRoutes);
router.use("/reports", reportRoutes);

export default router;
