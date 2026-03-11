import { z } from "zod";

export const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Product name is required"),
    sku: z.string().min(1, "SKU is required"),
    description: z.string().optional(),
    category: z.string().min(1, "Category is required"),
    supplier: z.string().min(1, "Supplier is required"),
    buyPrice: z.number().min(0, "Buy price must be >= 0"),
    sellPrice: z.number().min(0, "Sell price must be >= 0"),
    unit: z.string().optional(),
    reorderLevel: z.number().min(0).optional(),
  }),
});

export const updateProductSchema = z.object({
  params: z.object({ id: z.string() }),
  body: z.object({
    name: z.string().min(1).optional(),
    sku: z.string().min(1).optional(),
    description: z.string().optional(),
    category: z.string().optional(),
    supplier: z.string().optional(),
    buyPrice: z.number().min(0).optional(),
    sellPrice: z.number().min(0).optional(),
    unit: z.string().optional(),
    reorderLevel: z.number().min(0).optional(),
    isActive: z.boolean().optional(),
  }),
});
