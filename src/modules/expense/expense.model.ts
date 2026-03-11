import { Schema, model, Document, Types } from "mongoose";

export type ExpenseCategory =
  | "rent"
  | "utilities"
  | "salary"
  | "maintenance"
  | "marketing"
  | "transport"
  | "office_supplies"
  | "taxes"
  | "other";

export interface IExpense extends Document {
  title: string;
  category: ExpenseCategory;
  amount: number;
  date: Date;
  description?: string;
  receiptId?: Types.ObjectId;
  status: "pending" | "approved" | "rejected";
  approvedBy?: Types.ObjectId;
  approvedAt?: Date;
  rejectedBy?: Types.ObjectId;
  rejectedReason?: string;
  createdBy: Types.ObjectId;
}

const expenseSchema = new Schema<IExpense>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: [
        "rent",
        "utilities",
        "salary",
        "maintenance",
        "marketing",
        "transport",
        "office_supplies",
        "taxes",
        "other",
      ],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    description: {
      type: String,
      trim: true,
    },
    receiptId: {
      type: Schema.Types.ObjectId,
      ref: "FileUpload",
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    approvedAt: {
      type: Date,
    },
    rejectedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    rejectedReason: {
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

expenseSchema.index({ category: 1, status: 1 });
expenseSchema.index({ date: -1 });
expenseSchema.index({ createdBy: 1 });

export const Expense = model<IExpense>("Expense", expenseSchema);
