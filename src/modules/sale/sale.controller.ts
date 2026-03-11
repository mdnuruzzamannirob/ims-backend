import { Request, Response } from "express";
import catchAsync from "../../core/catchAsync";
import { sendResponse } from "../../core/apiResponse";
import { saleService } from "./sale.service";

const create = catchAsync(async (req: Request, res: Response) => {
  const sale = await saleService.create(req.body, req.user!.userId);
  sendResponse(res, { statusCode: 201, message: "Sale created", data: sale });
});

const getAll = catchAsync(async (req: Request, res: Response) => {
  const { sales, meta } = await saleService.getAll(req.query as any);
  sendResponse(res, { message: "Sales fetched", data: sales, meta });
});

const getById = catchAsync(async (req: Request, res: Response) => {
  const sale = await saleService.getById(req.params.id as string);
  sendResponse(res, { message: "Sale fetched", data: sale });
});

const returnSale = catchAsync(async (req: Request, res: Response) => {
  const sale = await saleService.returnSale(req.params.id as string);
  sendResponse(res, { message: "Sale returned", data: sale });
});

export const saleController = { create, getAll, getById, returnSale };
