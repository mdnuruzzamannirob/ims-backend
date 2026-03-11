import { Customer } from "./customer.model";
import { Sale } from "../sale/sale.model";
import { NotFoundError } from "../../core/errors";

const create = async (data: any, userId: string) => {
  const customer = await Customer.create({ ...data, createdBy: userId });
  return customer;
};

const getAll = async (query: any) => {
  const {
    page = 1,
    limit = 10,
    search,
    isActive,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = query;

  const filter: any = {};
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { company: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } },
    ];
  }
  if (isActive !== undefined) {
    filter.isActive = isActive === "true";
  }

  const skip = (Number(page) - 1) * Number(limit);
  const sort: any = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

  const [customers, total] = await Promise.all([
    Customer.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(Number(limit))
      .populate("createdBy", "name email"),
    Customer.countDocuments(filter),
  ]);

  return {
    data: customers,
    meta: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
    },
  };
};

const getById = async (id: string) => {
  const customer = await Customer.findById(id).populate(
    "createdBy",
    "name email",
  );
  if (!customer) throw new NotFoundError("Customer not found");
  return customer;
};

const update = async (id: string, data: any) => {
  const customer = await Customer.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
  if (!customer) throw new NotFoundError("Customer not found");
  return customer;
};

const remove = async (id: string) => {
  const customer = await Customer.findByIdAndDelete(id);
  if (!customer) throw new NotFoundError("Customer not found");
  return customer;
};

const getSalesHistory = async (customerId: string, query: any) => {
  const { page = 1, limit = 10 } = query;
  const skip = (Number(page) - 1) * Number(limit);

  // Match sales by customer name from the customer record
  const customer = await Customer.findById(customerId);
  if (!customer) throw new NotFoundError("Customer not found");

  const filter: any = { customerName: customer.name };

  const [sales, total] = await Promise.all([
    Sale.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate("items.product", "name sku"),
    Sale.countDocuments(filter),
  ]);

  return {
    data: sales,
    meta: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
    },
  };
};

const getStats = async (customerId: string) => {
  const customer = await Customer.findById(customerId);
  if (!customer) throw new NotFoundError("Customer not found");

  const salesStats = await Sale.aggregate([
    { $match: { customerName: customer.name, status: "completed" } },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalSpent: { $sum: "$totalAmount" },
        avgOrderValue: { $avg: "$totalAmount" },
        lastPurchase: { $max: "$createdAt" },
      },
    },
  ]);

  return {
    customer,
    stats: salesStats[0] || {
      totalOrders: 0,
      totalSpent: 0,
      avgOrderValue: 0,
      lastPurchase: null,
    },
  };
};

export const customerService = {
  create,
  getAll,
  getById,
  update,
  remove,
  getSalesHistory,
  getStats,
};
