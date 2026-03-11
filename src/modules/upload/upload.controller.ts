import { Request, Response } from "express";
import catchAsync from "../../core/catchAsync";
import { sendResponse } from "../../core/apiResponse";
import { uploadService } from "./upload.service";
import { BadRequestError } from "../../core/errors";

const uploadSingle = catchAsync(async (req: Request, res: Response) => {
  if (!req.file) throw new BadRequestError("No file uploaded");
  const file = await uploadService.saveFile(
    req.file,
    req.user!.userId,
    req.body.relatedModel && req.body.relatedId
      ? { model: req.body.relatedModel, id: req.body.relatedId }
      : undefined,
  );
  sendResponse(res, { statusCode: 201, message: "File uploaded", data: file });
});

const uploadMultiple = catchAsync(async (req: Request, res: Response) => {
  const files = req.files as Express.Multer.File[];
  if (!files || files.length === 0)
    throw new BadRequestError("No files uploaded");

  const records = await uploadService.saveMultipleFiles(
    files,
    req.user!.userId,
    req.body.relatedModel && req.body.relatedId
      ? { model: req.body.relatedModel, id: req.body.relatedId }
      : undefined,
  );
  sendResponse(res, {
    statusCode: 201,
    message: "Files uploaded",
    data: records,
  });
});

const getById = catchAsync(async (req: Request, res: Response) => {
  const file = await uploadService.getById(req.params.id as string);
  sendResponse(res, { message: "File fetched", data: file });
});

const getByRelation = catchAsync(async (req: Request, res: Response) => {
  const files = await uploadService.getByRelation(
    req.params.model as string,
    req.params.modelId as string,
  );
  sendResponse(res, { message: "Files fetched", data: files });
});

const remove = catchAsync(async (req: Request, res: Response) => {
  await uploadService.remove(req.params.id as string);
  sendResponse(res, { message: "File deleted" });
});

export const uploadController = {
  uploadSingle,
  uploadMultiple,
  getById,
  getByRelation,
  remove,
};
