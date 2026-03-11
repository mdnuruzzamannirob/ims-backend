import { z } from "zod";

export const createPaymentSchema = z.object({
  body: z.object({
    type: z.enum(["purchase", "sale", "expense", "refund"]),
    referenceModel: z.enum(["Purchase", "Sale"]).optional(),
    referenceId: z.string().optional(),
    amount: z.number().min(0, "Amount must be >= 0"),
    currency: z.string().optional(),
    method: z.enum([
      "cash",
      "card",
      "bank_transfer",
      "mobile_payment",
      "stripe",
    ]),
    transactionId: z.string().optional(),
    paidBy: z.string().optional(),
    paidTo: z.string().optional(),
    description: z.string().optional(),
    notes: z.string().optional(),
  }),
});

export const createStripePaymentSchema = z.object({
  body: z.object({
    amount: z.number().min(50, "Amount must be at least 50 cents"),
    currency: z.string().optional(),
    description: z.string().optional(),
    referenceModel: z.enum(["Purchase", "Sale"]).optional(),
    referenceId: z.string().optional(),
  }),
});

export const updatePaymentStatusSchema = z.object({
  params: z.object({ id: z.string() }),
  body: z.object({
    status: z.enum(["completed", "failed", "refunded"]),
    transactionId: z.string().optional(),
    notes: z.string().optional(),
  }),
});
