import { Expense } from "./expense.model";
import { BadRequestError, NotFoundError } from "../../core/errors";

const create = async (data: any, userId: string) => {
  const expense = await Expense.create({
    ...data,
    date: data.date ? new Date(data.date) : new Date(),
    createdBy: userId,
  });
  return expense;
};

const getAll = async (query: any) => {
  const {
    page = 1,
    limit = 20,
    category,
    status,
    startDate,
    endDate,
    createdBy,
  } = query;

  const filter: any = {};
  if (category) filter.category = category;
  if (status) filter.status = status;
  if (createdBy) filter.createdBy = createdBy;
  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [expenses, total] = await Promise.all([
    Expense.find(filter)
      .sort({ date: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate("createdBy", "name email")
      .populate("approvedBy", "name")
      .populate("rejectedBy", "name")
      .populate("receiptId", "url originalName"),
    Expense.countDocuments(filter),
  ]);

  return {
    data: expenses,
    meta: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
    },
  };
};

const getById = async (id: string) => {
  const expense = await Expense.findById(id)
    .populate("createdBy", "name email")
    .populate("approvedBy", "name")
    .populate("rejectedBy", "name")
    .populate("receiptId", "url originalName");
  if (!expense) throw new NotFoundError("Expense not found");
  return expense;
};

const update = async (id: string, data: any, userId: string) => {
  const expense = await Expense.findById(id);
  if (!expense) throw new NotFoundError("Expense not found");

  if (expense.status !== "pending" || expense.createdBy.toString() !== userId) {
    throw new BadRequestError("Only the creator can update a pending expense");
  }

  Object.assign(expense, data);
  if (data.date) expense.date = new Date(data.date);
  await expense.save();
  return expense;
};

const approve = async (id: string, userId: string) => {
  const expense = await Expense.findById(id);
  if (!expense) throw new NotFoundError("Expense not found");
  if (expense.status !== "pending") {
    throw new BadRequestError("Only pending expenses can be approved");
  }

  expense.status = "approved";
  expense.approvedBy = userId as any;
  expense.approvedAt = new Date();
  await expense.save();

  return expense.populate("approvedBy", "name");
};

const reject = async (id: string, userId: string, reason: string) => {
  const expense = await Expense.findById(id);
  if (!expense) throw new NotFoundError("Expense not found");
  if (expense.status !== "pending") {
    throw new BadRequestError("Only pending expenses can be rejected");
  }

  expense.status = "rejected";
  expense.rejectedBy = userId as any;
  expense.rejectedReason = reason;
  await expense.save();

  return expense.populate("rejectedBy", "name");
};

const remove = async (id: string) => {
  const expense = await Expense.findById(id);
  if (!expense) throw new NotFoundError("Expense not found");
  if (expense.status === "approved") {
    throw new BadRequestError("Cannot delete an approved expense");
  }
  await Expense.findByIdAndDelete(id);
  return expense;
};

const getSummary = async (query: any) => {
  const filter: any = {};
  if (query.startDate || query.endDate) {
    filter.date = {};
    if (query.startDate) filter.date.$gte = new Date(query.startDate);
    if (query.endDate) filter.date.$lte = new Date(query.endDate);
  }

  const [byCategory, byStatus, monthly] = await Promise.all([
    Expense.aggregate([
      { $match: { ...filter, status: "approved" } },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]),
    Expense.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$status",
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]),
    Expense.aggregate([
      { $match: { ...filter, status: "approved" } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$date" } },
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ]);

  const totalApproved = byCategory.reduce(
    (sum: number, c: any) => sum + c.total,
    0,
  );

  return { byCategory, byStatus, monthly, totalApproved };
};

export const expenseService = {
  create,
  getAll,
  getById,
  update,
  approve,
  reject,
  remove,
  getSummary,
};
