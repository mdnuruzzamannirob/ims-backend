import { Request, Response } from "express";
import catchAsync from "../../core/catchAsync";
import { sendResponse } from "../../core/apiResponse";
import { inventoryService } from "./inventory.service";

const getAll = catchAsync(async (req: Request, res: Response) => {
  const { items, meta } = await inventoryService.getAll(req.query as any);
  sendResponse(res, { message: "Inventory fetched", data: items, meta });
});

const getByProductId = catchAsync(async (req: Request, res: Response) => {
  const inventory = await inventoryService.getByProductId(
    req.params.productId as string,
  );
  sendResponse(res, { message: "Inventory record fetched", data: inventory });
});

const adjustStock = catchAsync(async (req: Request, res: Response) => {
  const inventory = await inventoryService.adjustStock(
    req.params.productId as string,
    req.body,
  );
  sendResponse(res, { message: "Stock adjusted", data: inventory });
});

const getLowStockAlerts = catchAsync(async (_req: Request, res: Response) => {
  const alerts = await inventoryService.getLowStockAlerts();
  sendResponse(res, { message: "Low stock alerts", data: alerts });
});

export const inventoryController = {
  getAll,
  getByProductId,
  adjustStock,
  getLowStockAlerts,
};
