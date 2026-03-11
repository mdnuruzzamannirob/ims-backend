import { Request, Response } from "express";
import catchAsync from "../../core/catchAsync";
import { sendResponse } from "../../core/apiResponse";
import { auditService } from "./audit.service";

const getAll = catchAsync(async (req: Request, res: Response) => {
  const result = await auditService.getAll(req.query);
  sendResponse(res, {
    message: "Audit logs retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

export const auditController = { getAll };
