import { Request, Response } from "express";
import catchAsync from "../../core/catchAsync";
import { sendResponse } from "../../core/apiResponse";
import { productService } from "./product.service";

const create = catchAsync(async (req: Request, res: Response) => {
  const product = await productService.create(req.body);
  sendResponse(res, {
    statusCode: 201,
    message: "Product created",
    data: product,
  });
});

const getAll = catchAsync(async (req: Request, res: Response) => {
  const { products, meta } = await productService.getAll(req.query as any);
  sendResponse(res, { message: "Products fetched", data: products, meta });
});

const getById = catchAsync(async (req: Request, res: Response) => {
  const product = await productService.getById(req.params.id as string);
  sendResponse(res, { message: "Product fetched", data: product });
});

const update = catchAsync(async (req: Request, res: Response) => {
  const product = await productService.update(
    req.params.id as string,
    req.body,
  );
  sendResponse(res, { message: "Product updated", data: product });
});

const remove = catchAsync(async (req: Request, res: Response) => {
  await productService.remove(req.params.id as string);
  sendResponse(res, { message: "Product deleted" });
});

export const productController = { create, getAll, getById, update, remove };
