import { Schema, model, Document, Types } from "mongoose";

export interface IPurchaseItem {
  product: Types.ObjectId;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface IPurchase extends Document {
  supplier: Types.ObjectId;
  items: IPurchaseItem[];
  totalAmount: number;
  status: "pending" | "received" | "cancelled";
  reference?: string;
  notes?: string;
  createdBy: Types.ObjectId;
}

const purchaseItemSchema = new Schema<IPurchaseItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const purchaseSchema = new Schema<IPurchase>(
  {
    supplier: {
      type: Schema.Types.ObjectId,
      ref: "Supplier",
      required: true,
    },
    items: {
      type: [purchaseItemSchema],
      required: true,
      validate: [
        (v: IPurchaseItem[]) => v.length > 0,
        "At least one item is required",
      ],
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["pending", "received", "cancelled"],
      default: "pending",
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

export const Purchase = model<IPurchase>("Purchase", purchaseSchema);
