import { z } from "zod/v4";

export const createCustomerSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required").max(100),
    email: z.email("Invalid email").optional(),
    phone: z.string().max(20).optional(),
    company: z.string().max(100).optional(),
    address: z
      .object({
        street: z.string().max(200).optional(),
        city: z.string().max(100).optional(),
        state: z.string().max(100).optional(),
        postalCode: z.string().max(20).optional(),
        country: z.string().max(100).optional(),
      })
      .optional(),
    creditLimit: z.number().min(0).optional(),
    notes: z.string().max(500).optional(),
  }),
});

export const updateCustomerSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100).optional(),
    email: z.email("Invalid email").optional(),
    phone: z.string().max(20).optional(),
    company: z.string().max(100).optional(),
    address: z
      .object({
        street: z.string().max(200).optional(),
        city: z.string().max(100).optional(),
        state: z.string().max(100).optional(),
        postalCode: z.string().max(20).optional(),
        country: z.string().max(100).optional(),
      })
      .optional(),
    creditLimit: z.number().min(0).optional(),
    balance: z.number().optional(),
    isActive: z.boolean().optional(),
    notes: z.string().max(500).optional(),
  }),
});
