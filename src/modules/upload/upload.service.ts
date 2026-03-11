import { FileUpload } from "./upload.model";
import { NotFoundError } from "../../core/errors";
import { deleteFile, getFileUrl } from "../../core/upload";

const saveFile = async (
  file: Express.Multer.File,
  userId: string,
  relatedTo?: { model: string; id: string },
) => {
  const fileRecord = await FileUpload.create({
    originalName: file.originalname,
    fileName: file.filename,
    mimeType: file.mimetype,
    size: file.size,
    path: file.path,
    url: getFileUrl(file.filename),
    uploadedBy: userId,
    relatedTo,
  });
  return fileRecord;
};

const saveMultipleFiles = async (
  files: Express.Multer.File[],
  userId: string,
  relatedTo?: { model: string; id: string },
) => {
  const records = await Promise.all(
    files.map((file) => saveFile(file, userId, relatedTo)),
  );
  return records;
};

const getById = async (id: string) => {
  const file = await FileUpload.findById(id).populate("uploadedBy", "name");
  if (!file) throw new NotFoundError("File");
  return file;
};

const getByRelation = async (modelName: string, modelId: string) => {
  return FileUpload.find({
    "relatedTo.model": modelName,
    "relatedTo.id": modelId,
  }).sort({ createdAt: -1 });
};

const remove = async (id: string) => {
  const file = await FileUpload.findById(id);
  if (!file) throw new NotFoundError("File");

  deleteFile(file.fileName);
  await FileUpload.findByIdAndDelete(id);
  return file;
};

export const uploadService = {
  saveFile,
  saveMultipleFiles,
  getById,
  getByRelation,
  remove,
};
