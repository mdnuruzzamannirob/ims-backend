import { Request, Response } from "express";
import catchAsync from "../../core/catchAsync";
import { reportService } from "./report.service";
import { sendResponse } from "../../core/apiResponse";

const getDashboardStats = catchAsync(async (_req: Request, res: Response) => {
  const result = await reportService.getDashboardStats();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Dashboard stats retrieved successfully",
    data: result,
  });
});

const getSalesReport = catchAsync(async (req: Request, res: Response) => {
  const result = await reportService.getSalesReport(req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Sales report retrieved successfully",
    data: result,
  });
});

const getPurchaseReport = catchAsync(async (req: Request, res: Response) => {
  const result = await reportService.getPurchaseReport(req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Purchase report retrieved successfully",
    data: result,
  });
});

const getInventoryReport = catchAsync(async (_req: Request, res: Response) => {
  const result = await reportService.getInventoryReport();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Inventory report retrieved successfully",
    data: result,
  });
});

const getProfitLossReport = catchAsync(async (req: Request, res: Response) => {
  const result = await reportService.getProfitLossReport(req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Profit/Loss report retrieved successfully",
    data: result,
  });
});

const getTopProducts = catchAsync(async (req: Request, res: Response) => {
  const result = await reportService.getTopProducts(req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Top products retrieved successfully",
    data: result,
  });
});

export const reportController = {
  getDashboardStats,
  getSalesReport,
  getPurchaseReport,
  getInventoryReport,
  getProfitLossReport,
  getTopProducts,
};
