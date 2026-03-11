import { Request, Response } from "express";
import catchAsync from "../../core/catchAsync";
import { sendResponse } from "../../core/apiResponse";
import { purchaseService } from "./purchase.service";

const create = catchAsync(async (req: Request, res: Response) => {
  const purchase = await purchaseService.create(req.body, req.user!.userId);
  sendResponse(res, {
    statusCode: 201,
    message: "Purchase created",
    data: purchase,
  });
});

const getAll = catchAsync(async (req: Request, res: Response) => {
  const { purchases, meta } = await purchaseService.getAll(req.query as any);
  sendResponse(res, { message: "Purchases fetched", data: purchases, meta });
});

const getById = catchAsync(async (req: Request, res: Response) => {
  const purchase = await purchaseService.getById(req.params.id as string);
  sendResponse(res, { message: "Purchase fetched", data: purchase });
});

const updateStatus = catchAsync(async (req: Request, res: Response) => {
  const purchase = await purchaseService.updateStatus(
    req.params.id as string,
    req.body.status,
  );
  sendResponse(res, { message: "Purchase status updated", data: purchase });
});

export const purchaseController = { create, getAll, getById, updateStatus };
