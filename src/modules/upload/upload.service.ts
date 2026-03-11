import { FileUpload } from "./upload.model";
import { NotFoundError } from "../../core/errors";
import { deleteCloudinaryFile } from "../../core/upload";

// multer-storage-cloudinary attaches extra fields to req.file
interface CloudinaryFile extends Express.Multer.File {
  path: string;       // secure_url
  filename: string;   // public_id
}

const saveFile = async (
  file: Express.Multer.File,
  userId: string,
  relatedTo?: { model: string; id: string },
) => {
  const cf = file as CloudinaryFile;
  const fileRecord = await FileUpload.create({
    originalName: cf.originalname,
    fileName: cf.filename,         // Cloudinary public_id
    mimeType: cf.mimetype,
    size: cf.size,
    secureUrl: cf.path,            // Cloudinary secure_url
    url: cf.path,
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

  // Delete from Cloudinary
  await deleteCloudinaryFile(file.fileName);
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
