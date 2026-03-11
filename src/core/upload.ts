import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import config from "../config";
import { BadRequestError } from "../core/errors";

// Configure Cloudinary SDK
cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
});

export { cloudinary };

// Derive Cloudinary resource_type from mime type
const getResourceType = (
  mimetype: string,
): "image" | "video" | "raw" | "auto" => {
  if (mimetype.startsWith("image/")) return "image";
  if (mimetype.startsWith("video/")) return "video";
  return "raw";
};

// Cloudinary storage — one multer instance with folder routing via params
const buildCloudinaryStorage = (folder: string) =>
  new CloudinaryStorage({
    cloudinary,
    params: (_req: any, file: Express.Multer.File) => ({
      folder: `ims/${folder}`,
      resource_type: getResourceType(file.mimetype),
      allowed_formats: ["jpg", "jpeg", "png", "webp", "pdf"],
      transformation: file.mimetype.startsWith("image/")
        ? [{ quality: "auto", fetch_format: "auto" }]
        : undefined,
    }),
  });

// File filter — rejects disallowed mime types before hitting network
const fileFilter = (
  _req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  if (config.upload.allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new BadRequestError(
        `File type ${file.mimetype} is not allowed. Allowed types: ${config.upload.allowedMimeTypes.join(", ")}`,
      ) as any,
    );
  }
};

const multerOptions = (folder: string) => ({
  storage: buildCloudinaryStorage(folder),
  fileFilter,
  limits: { fileSize: config.upload.maxFileSize },
});

// General-purpose uploader (stored in ims/general)
export const upload = multer(multerOptions("general"));

// Folder-specific uploaders
export const uploadReceipt = multer(multerOptions("receipts"));
export const uploadProductImage = multer(multerOptions("products"));
export const uploadAvatar = multer(multerOptions("avatars"));

// Delete a file from Cloudinary by its public_id
export const deleteCloudinaryFile = async (publicId: string): Promise<void> => {
  await cloudinary.uploader.destroy(publicId);
};
