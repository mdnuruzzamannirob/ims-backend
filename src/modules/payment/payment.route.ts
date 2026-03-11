import { Router, raw } from "express";
import { paymentController } from "./payment.controller";
import validate from "../../middlewares/validate";
import {
  createPaymentSchema,
  createStripePaymentSchema,
  updatePaymentStatusSchema,
} from "./payment.validation";
import auth, { requirePermission } from "../../middlewares/auth";

const router = Router();

// Stripe webhook (needs raw body — no auth)
router.post(
  "/stripe/webhook",
  raw({ type: "application/json" }),
  paymentController.stripeWebhook,
);

// Protected routes
router.use(auth());

router.post("/", validate(createPaymentSchema), paymentController.create);
router.post(
  "/stripe/create-intent",
  validate(createStripePaymentSchema),
  paymentController.createStripePaymentIntent,
);
router.get("/", paymentController.getAll);
router.get(
  "/summary",
  requirePermission("payment", "manage"),
  paymentController.getSummary,
);
router.get("/:id", paymentController.getById);
router.patch(
  "/:id/status",
  requirePermission("payment", "update"),
  validate(updatePaymentStatusSchema),
  paymentController.updateStatus,
);

export const paymentRoutes = router;
