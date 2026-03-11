import { Schema, model, Document, Types } from "mongoose";

export interface IProduct extends Document {
  name: string;
  sku: string;
  description?: string;
  category: Types.ObjectId;
  supplier: Types.ObjectId;
  buyPrice: number;
  sellPrice: number;
  unit: string;
  reorderLevel: number;
  isActive: boolean;
  imageUrl?: string;
  imagePublicId?: string;
}

const productSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    sku: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    supplier: {
      type: Schema.Types.ObjectId,
      ref: "Supplier",
      required: true,
    },
    buyPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    sellPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    unit: {
      type: String,
      default: "pcs",
      trim: true,
    },
    reorderLevel: {
      type: Number,
      default: 10,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    imageUrl: { type: String },
    imagePublicId: { type: String },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const Product = model<IProduct>("Product", productSchema);
