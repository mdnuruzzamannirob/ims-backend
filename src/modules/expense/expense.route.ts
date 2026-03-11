import { Router } from "express";
import { expenseController } from "./expense.controller";
import auth, { requirePermission } from "../../middlewares/auth";
import validate from "../../middlewares/validate";
import {
  createExpenseSchema,
  updateExpenseSchema,
  rejectExpenseSchema,
} from "./expense.validation";

const router = Router();

router.use(auth());

router.post(
  "/",
  requirePermission("expense", "create"),
  validate(createExpenseSchema),
  expenseController.create,
);

router.get("/", requirePermission("expense", "read"), expenseController.getAll);

router.get(
  "/summary",
  requirePermission("expense", "read"),
  expenseController.getSummary,
);

router.get(
  "/:id",
  requirePermission("expense", "read"),
  expenseController.getById,
);

router.patch(
  "/:id",
  requirePermission("expense", "update"),
  validate(updateExpenseSchema),
  expenseController.update,
);

router.patch(
  "/:id/approve",
  requirePermission("expense", "manage"),
  expenseController.approve,
);

router.patch(
  "/:id/reject",
  requirePermission("expense", "manage"),
  validate(rejectExpenseSchema),
  expenseController.reject,
);

router.delete(
  "/:id",
  requirePermission("expense", "delete"),
  expenseController.remove,
);

export const expenseRoutes = router;
