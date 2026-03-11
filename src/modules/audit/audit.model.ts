import { Schema, model, Document, Types } from "mongoose";

export interface IAuditLog extends Document {
  userId: Types.ObjectId;
  userName: string;
  userEmail: string;
  action: string;
  resource: string;
  resourceId?: string;
  description: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    userEmail: {
      type: String,
      required: true,
    },
    // Action type: LOGIN, LOGOUT, CREATE, UPDATE, DELETE, APPROVE, REJECT, EXPORT
    action: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    // Resource name: User, Product, Sale, Purchase, Expense, etc.
    resource: {
      type: String,
      required: true,
      trim: true,
    },
    resourceId: {
      type: String,
    },
    description: {
      type: String,
      required: true,
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false,
  },
);

auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ resource: 1, action: 1 });
auditLogSchema.index({ createdAt: -1 });

export const AuditLog = model<IAuditLog>("AuditLog", auditLogSchema);
