import { Request, Response } from "express";
import catchAsync from "../../core/catchAsync";
import { sendResponse } from "../../core/apiResponse";
import { categoryService } from "./category.service";

const create = catchAsync(async (req: Request, res: Response) => {
  const category = await categoryService.create(req.body);
  sendResponse(res, {
    statusCode: 201,
    message: "Category created",
    data: category,
  });
});

const getAll = catchAsync(async (req: Request, res: Response) => {
  const categories = await categoryService.getAll(req.query as any);
  sendResponse(res, { message: "Categories fetched", data: categories });
});

const getById = catchAsync(async (req: Request, res: Response) => {
  const category = await categoryService.getById(req.params.id as string);
  sendResponse(res, { message: "Category fetched", data: category });
});

const update = catchAsync(async (req: Request, res: Response) => {
  const category = await categoryService.update(
    req.params.id as string,
    req.body,
  );
  sendResponse(res, { message: "Category updated", data: category });
});

const remove = catchAsync(async (req: Request, res: Response) => {
  await categoryService.remove(req.params.id as string);
  sendResponse(res, { message: "Category deleted" });
});

export const categoryController = { create, getAll, getById, update, remove };
