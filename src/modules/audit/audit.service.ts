import { AuditLog } from "./audit.model";
import logger from "../../core/logger";

export interface CreateAuditLogParams {
  userId: string;
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

/**
 * Create an audit log entry.
 * Never throws — silently logs on failure so the main flow is never disrupted.
 */
const createAuditLog = async (params: CreateAuditLogParams): Promise<void> => {
  try {
    await AuditLog.create(params);
  } catch (err) {
    logger.error("[AuditLog] Failed to create audit entry:", err);
  }
};

const getAll = async (query: any) => {
  const {
    page = 1,
    limit = 50,
    userId,
    action,
    resource,
    startDate,
    endDate,
  } = query;

  const filter: any = {};
  if (userId) filter.userId = userId;
  if (action) filter.action = action.toUpperCase();
  if (resource) filter.resource = resource;
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [logs, total] = await Promise.all([
    AuditLog.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    AuditLog.countDocuments(filter),
  ]);

  return {
    data: logs,
    meta: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
    },
  };
};

export const auditService = { createAuditLog, getAll };
