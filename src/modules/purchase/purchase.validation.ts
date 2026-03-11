import { z } from "zod";

const purchaseItemSchema = z.object({
  product: z.string().min(1, "Product ID is required"),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
  unitPrice: z.number().min(0, "Unit price must be >= 0"),
});

export const createPurchaseSchema = z.object({
  body: z.object({
    supplier: z.string().min(1, "Supplier is required"),
    items: z.array(purchaseItemSchema).min(1, "At least one item is required"),
    reference: z.string().optional(),
    notes: z.string().optional(),
  }),
});

export const updatePurchaseStatusSchema = z.object({
  params: z.object({ id: z.string() }),
  body: z.object({
    status: z.enum(["received", "cancelled"]),
  }),
});
