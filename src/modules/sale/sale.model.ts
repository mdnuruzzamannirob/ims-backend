import { Schema, model, Document, Types } from "mongoose";

export interface ISaleItem {
  product: Types.ObjectId;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface ISale extends Document {
  items: ISaleItem[];
  totalAmount: number;
  customerName?: string;
  customerPhone?: string;
  status: "completed" | "returned";
  reference?: string;
  notes?: string;
  createdBy: Types.ObjectId;
}

const saleItemSchema = new Schema<ISaleItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const saleSchema = new Schema<ISale>(
  {
    items: {
      type: [saleItemSchema],
      required: true,
      validate: [
        (v: ISaleItem[]) => v.length > 0,
        "At least one item is required",
      ],
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    customerName: {
      type: String,
      trim: true,
    },
    customerPhone: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["completed", "returned"],
      default: "completed",
    },
    reference: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const Sale = model<ISale>("Sale", saleSchema);
