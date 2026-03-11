import { Purchase } from "./purchase.model";
import { Inventory } from "../inventory/inventory.model";
import { BadRequestError, NotFoundError } from "../../core/errors";
import logger from "../../core/logger";

const create = async (data: Record<string, any>, userId: string) => {
  const items = data.items.map((item: any) => ({
    ...item,
    total: item.quantity * item.unitPrice,
  }));
  const totalAmount = items.reduce(
    (sum: number, item: any) => sum + item.total,
    0,
  );

  const purchase = await Purchase.create({
    ...data,
    items,
    totalAmount,
    createdBy: userId,
  });

  logger.info(`Purchase created: ${purchase._id} by user ${userId}`);
  return purchase;
};

const getAll = async (query: {
  status?: string;
  supplier?: string;
  page?: string;
  limit?: string;
}) => {
  const filter: Record<string, unknown> = {};
  if (query.status) filter.status = query.status;
  if (query.supplier) filter.supplier = query.supplier;

  const page = parseInt(query.page || "1", 10);
  const limit = parseInt(query.limit || "20", 10);
  const skip = (page - 1) * limit;

  const [purchases, total] = await Promise.all([
    Purchase.find(filter)
      .populate("supplier", "name company")
      .populate("items.product", "name sku")
      .populate("createdBy", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Purchase.countDocuments(filter),
  ]);

  return {
    purchases,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

const getById = async (id: string) => {
  const purchase = await Purchase.findById(id)
    .populate("supplier", "name company phone email")
    .populate("items.product", "name sku")
    .populate("createdBy", "name email");
  if (!purchase) throw new NotFoundError("Purchase");
  return purchase;
};

const updateStatus = async (id: string, status: "received" | "cancelled") => {
  const purchase = await Purchase.findById(id);
  if (!purchase) throw new NotFoundError("Purchase");

  if (purchase.status !== "pending") {
    throw new BadRequestError(`Cannot change status from '${purchase.status}'`);
  }

  // When receiving, update inventory
  if (status === "received") {
    for (const item of purchase.items) {
      await Inventory.findOneAndUpdate(
        { product: item.product },
        { $inc: { quantity: item.quantity } },
        { upsert: true, new: true },
      );
    }
    logger.info(`Purchase ${id} received — inventory updated`);
  }

  purchase.status = status;
  await purchase.save();

  return purchase;
};

export const purchaseService = { create, getAll, getById, updateStatus };
