import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import config from "../config";
import { BadRequestError } from "../core/errors";

// Ensure upload directory exists
const uploadDir = path.join(process.cwd(), config.upload.uploadDir);
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Disk storage configuration
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = crypto.randomBytes(16).toString("hex");
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

// File filter
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

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.upload.maxFileSize,
  },
});

// Memory storage (for cloud uploads)
const memoryStorage = multer.memoryStorage();

export const uploadToMemory = multer({
  storage: memoryStorage,
  fileFilter,
  limits: {
    fileSize: config.upload.maxFileSize,
  },
});

// Helper to delete a file
export const deleteFile = (filePath: string): void => {
  const fullPath = path.isAbsolute(filePath)
    ? filePath
    : path.join(uploadDir, filePath);

  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
  }
};

// Helper to get file URL
export const getFileUrl = (filename: string): string => {
  return `/${config.upload.uploadDir}/${filename}`;
};
