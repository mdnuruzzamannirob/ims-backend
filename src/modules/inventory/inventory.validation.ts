import { z } from "zod";

export const adjustStockSchema = z.object({
  params: z.object({ productId: z.string() }),
  body: z.object({
    quantity: z.number().int("Quantity must be an integer"),
    reason: z.string().min(1, "Reason is required"),
  }),
});
