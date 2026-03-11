import { Request, Response } from "express";
import catchAsync from "../../core/catchAsync";
import { customerService } from "./customer.service";
import { sendResponse } from "../../core/apiResponse";

const create = catchAsync(async (req: Request, res: Response) => {
  const result = await customerService.create(req.body, (req as any).user.id);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Customer created successfully",
    data: result,
  });
});

const getAll = catchAsync(async (req: Request, res: Response) => {
  const result = await customerService.getAll(req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Customers retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

const getById = catchAsync(async (req: Request, res: Response) => {
  const result = await customerService.getById(req.params.id as string);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Customer retrieved successfully",
    data: result,
  });
});

const update = catchAsync(async (req: Request, res: Response) => {
  const result = await customerService.update(
    req.params.id as string,
    req.body,
  );
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Customer updated successfully",
    data: result,
  });
});

const remove = catchAsync(async (req: Request, res: Response) => {
  await customerService.remove(req.params.id as string);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Customer deleted successfully",
    data: null,
  });
});

const getSalesHistory = catchAsync(async (req: Request, res: Response) => {
  const result = await customerService.getSalesHistory(
    req.params.id as string,
    req.query,
  );
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Customer sales history retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

const getStats = catchAsync(async (req: Request, res: Response) => {
  const result = await customerService.getStats(req.params.id as string);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Customer stats retrieved successfully",
    data: result,
  });
});

export const customerController = {
  create,
  getAll,
  getById,
  update,
  remove,
  getSalesHistory,
  getStats,
};
