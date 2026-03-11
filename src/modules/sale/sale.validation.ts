import { z } from "zod";

const saleItemSchema = z.object({
  product: z.string().min(1, "Product ID is required"),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
  unitPrice: z.number().min(0, "Unit price must be >= 0"),
});

export const createSaleSchema = z.object({
  body: z.object({
    items: z.array(saleItemSchema).min(1, "At least one item is required"),
    customer: z.string().optional(),
    customerName: z.string().optional(),
    customerPhone: z.string().optional(),
    reference: z.string().optional(),
    notes: z.string().optional(),
  }),
});

export const returnSaleSchema = z.object({
  params: z.object({ id: z.string() }),
});
