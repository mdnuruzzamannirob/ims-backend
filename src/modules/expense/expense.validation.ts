import { z } from "zod";

const expenseCategories = [
  "rent",
  "utilities",
  "salary",
  "maintenance",
  "marketing",
  "transport",
  "office_supplies",
  "taxes",
  "other",
] as const;

export const createExpenseSchema = z.object({
  body: z.object({
    title: z.string().min(2, "Title must be at least 2 characters").max(200),
    category: z.enum(expenseCategories, {
      error: "Invalid expense category",
    }),
    amount: z.number().min(0, "Amount must be >= 0"),
    date: z.string().optional(),
    description: z.string().max(500).optional(),
    receiptId: z.string().optional(),
  }),
});

export const updateExpenseSchema = z.object({
  body: z.object({
    title: z.string().min(2).max(200).optional(),
    category: z.enum(expenseCategories).optional(),
    amount: z.number().min(0).optional(),
    date: z.string().optional(),
    description: z.string().max(500).optional(),
    receiptId: z.string().optional(),
  }),
});

export const rejectExpenseSchema = z.object({
  body: z.object({
    reason: z.string().min(1, "Rejection reason is required").max(500),
  }),
});
