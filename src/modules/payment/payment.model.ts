import { Schema, model, Document, Types } from "mongoose";

export interface IPayment extends Document {
  type: "purchase" | "sale" | "expense" | "refund";
  referenceModel: "Purchase" | "Sale";
  referenceId?: Types.ObjectId;
  amount: number;
  currency: string;
  method: "cash" | "card" | "bank_transfer" | "mobile_payment" | "stripe";
  status: "pending" | "completed" | "failed" | "refunded";
  stripePaymentIntentId?: string;
  stripeChargeId?: string;
  transactionId?: string;
  paidBy?: string;
  paidTo?: string;
  description?: string;
  notes?: string;
  paidAt?: Date;
  createdBy: Types.ObjectId;
}

const paymentSchema = new Schema<IPayment>(
  {
    type: {
      type: String,
      enum: ["purchase", "sale", "expense", "refund"],
      required: true,
    },
    referenceModel: {
      type: String,
      enum: ["Purchase", "Sale"],
    },
    referenceId: {
      type: Schema.Types.ObjectId,
      refPath: "referenceModel",
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: "usd",
      lowercase: true,
    },
    method: {
      type: String,
      enum: ["cash", "card", "bank_transfer", "mobile_payment", "stripe"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
    },
    stripePaymentIntentId: {
      type: String,
      select: false,
    },
    stripeChargeId: {
      type: String,
      select: false,
    },
    transactionId: {
      type: String,
      trim: true,
    },
    paidBy: {
      type: String,
      trim: true,
    },
    paidTo: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    paidAt: {
      type: Date,
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

paymentSchema.index({ type: 1, status: 1 });
paymentSchema.index({ referenceModel: 1, referenceId: 1 });

export const Payment = model<IPayment>("Payment", paymentSchema);
