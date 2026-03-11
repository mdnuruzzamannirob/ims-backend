import { Schema, model, Document, Types } from "mongoose";

export interface IInventory extends Document {
  product: Types.ObjectId;
  quantity: number;
  location?: string;
}

const inventorySchema = new Schema<IInventory>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      unique: true,
    },
    quantity: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    location: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const Inventory = model<IInventory>("Inventory", inventorySchema);
