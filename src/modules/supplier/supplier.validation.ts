import { z } from "zod";

export const createSupplierSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Supplier name is required"),
    email: z.string().email().optional(),
    phone: z.string().min(1, "Phone is required"),
    address: z.string().optional(),
    company: z.string().optional(),
  }),
});

export const updateSupplierSchema = z.object({
  params: z.object({ id: z.string() }),
  body: z.object({
    name: z.string().min(1).optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    company: z.string().optional(),
    isActive: z.boolean().optional(),
  }),
});
