import { Request, Response } from "express";
import catchAsync from "../../core/catchAsync";
import { sendResponse } from "../../core/apiResponse";
import { expenseService } from "./expense.service";

const create = catchAsync(async (req: Request, res: Response) => {
  const result = await expenseService.create(req.body, req.user!.userId);
  sendResponse(res, {
    statusCode: 201,
    message: "Expense created successfully",
    data: result,
  });
});

const getAll = catchAsync(async (req: Request, res: Response) => {
  const result = await expenseService.getAll(req.query);
  sendResponse(res, {
    message: "Expenses retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

const getById = catchAsync(async (req: Request, res: Response) => {
  const result = await expenseService.getById(req.params.id as string);
  sendResponse(res, {
    message: "Expense retrieved successfully",
    data: result,
  });
});

const update = catchAsync(async (req: Request, res: Response) => {
  const result = await expenseService.update(
    req.params.id as string,
    req.body,
    req.user!.userId,
  );
  sendResponse(res, { message: "Expense updated successfully", data: result });
});

const approve = catchAsync(async (req: Request, res: Response) => {
  const result = await expenseService.approve(
    req.params.id as string,
    req.user!.userId,
  );
  sendResponse(res, { message: "Expense approved", data: result });
});

const reject = catchAsync(async (req: Request, res: Response) => {
  const result = await expenseService.reject(
    req.params.id as string,
    req.user!.userId,
    req.body.reason,
  );
  sendResponse(res, { message: "Expense rejected", data: result });
});

const remove = catchAsync(async (req: Request, res: Response) => {
  await expenseService.remove(req.params.id as string);
  sendResponse(res, { message: "Expense deleted", data: null });
});

const getSummary = catchAsync(async (req: Request, res: Response) => {
  const result = await expenseService.getSummary(req.query);
  sendResponse(res, {
    message: "Expense summary retrieved successfully",
    data: result,
  });
});

export const expenseController = {
  create,
  getAll,
  getById,
  update,
  approve,
  reject,
  remove,
  getSummary,
};
