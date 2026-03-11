import { Schema, model, Document } from "mongoose";

export interface ISupplier extends Document {
  name: string;
  email?: string;
  phone: string;
  address?: string;
  company?: string;
  isActive: boolean;
}

const supplierSchema = new Schema<ISupplier>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    company: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const Supplier = model<ISupplier>("Supplier", supplierSchema);
