import { Request, Response } from "express";
import catchAsync from "../../core/catchAsync";
import { sendResponse } from "../../core/apiResponse";
import { supplierService } from "./supplier.service";

const create = catchAsync(async (req: Request, res: Response) => {
  const supplier = await supplierService.create(req.body);
  sendResponse(res, {
    statusCode: 201,
    message: "Supplier created",
    data: supplier,
  });
});

const getAll = catchAsync(async (req: Request, res: Response) => {
  const suppliers = await supplierService.getAll(req.query as any);
  sendResponse(res, { message: "Suppliers fetched", data: suppliers });
});

const getById = catchAsync(async (req: Request, res: Response) => {
  const supplier = await supplierService.getById(req.params.id as string);
  sendResponse(res, { message: "Supplier fetched", data: supplier });
});

const update = catchAsync(async (req: Request, res: Response) => {
  const supplier = await supplierService.update(
    req.params.id as string,
    req.body,
  );
  sendResponse(res, { message: "Supplier updated", data: supplier });
});

const remove = catchAsync(async (req: Request, res: Response) => {
  await supplierService.remove(req.params.id as string);
  sendResponse(res, { message: "Supplier deleted" });
});

export const supplierController = { create, getAll, getById, update, remove };
