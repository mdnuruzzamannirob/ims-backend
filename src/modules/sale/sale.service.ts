import { Sale } from "./sale.model";
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

  // Check and deduct inventory
  for (const item of items) {
    const inventory = await Inventory.findOne({ product: item.product });
    if (!inventory || inventory.quantity < item.quantity) {
      throw new BadRequestError(
        `Insufficient stock for product ${item.product}. Available: ${inventory?.quantity ?? 0}`,
      );
    }
  }

  // Deduct stock
  for (const item of items) {
    await Inventory.findOneAndUpdate(
      { product: item.product },
      { $inc: { quantity: -item.quantity } },
    );
  }

  const sale = await Sale.create({
    ...data,
    items,
    totalAmount,
    createdBy: userId,
  });

  logger.info(
    `Sale created: ${sale._id} by user ${userId}, total: ${totalAmount}`,
  );
  return sale;
};

const getAll = async (query: {
  status?: string;
  page?: string;
  limit?: string;
  startDate?: string;
  endDate?: string;
}) => {
  const filter: Record<string, unknown> = {};
  if (query.status) filter.status = query.status;
  if (query.startDate || query.endDate) {
    filter.createdAt = {};
    if (query.startDate)
      (filter.createdAt as any).$gte = new Date(query.startDate);
    if (query.endDate) (filter.createdAt as any).$lte = new Date(query.endDate);
  }

  const page = parseInt(query.page || "1", 10);
  const limit = parseInt(query.limit || "20", 10);
  const skip = (page - 1) * limit;

  const [sales, total] = await Promise.all([
    Sale.find(filter)
      .populate("items.product", "name sku")
      .populate("createdBy", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Sale.countDocuments(filter),
  ]);

  return {
    sales,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

const getById = async (id: string) => {
  const sale = await Sale.findById(id)
    .populate("items.product", "name sku")
    .populate("createdBy", "name email");
  if (!sale) throw new NotFoundError("Sale");
  return sale;
};

const returnSale = async (id: string) => {
  const sale = await Sale.findById(id);
  if (!sale) throw new NotFoundError("Sale");
  if (sale.status === "returned") {
    throw new BadRequestError("Sale is already returned");
  }

  // Restore inventory
  for (const item of sale.items) {
    await Inventory.findOneAndUpdate(
      { product: item.product },
      { $inc: { quantity: item.quantity } },
      { upsert: true },
    );
  }

  sale.status = "returned";
  await sale.save();

  logger.info(`Sale ${id} returned — inventory restored`);
  return sale;
};

export const saleService = { create, getAll, getById, returnSale };
