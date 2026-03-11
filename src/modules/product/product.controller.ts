import { Request, Response } from "express";
import catchAsync from "../../core/catchAsync";
import { sendResponse } from "../../core/apiResponse";
import { productService } from "./product.service";

// multer-storage-cloudinary puts secure_url in file.path
const extractImageFields = (file?: Express.Multer.File) =>
  file ? { imageUrl: (file as any).path, imagePublicId: file.filename } : {};

const create = catchAsync(async (req: Request, res: Response) => {
  const product = await productService.create({
    ...req.body,
    ...extractImageFields(req.file),
  });
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
  const product = await productService.update(req.params.id as string, {
    ...req.body,
    ...extractImageFields(req.file),
  });
  sendResponse(res, { message: "Product updated", data: product });
});

const remove = catchAsync(async (req: Request, res: Response) => {
  await productService.remove(req.params.id as string);
  sendResponse(res, { message: "Product deleted" });
});

export const productController = { create, getAll, getById, update, remove };
