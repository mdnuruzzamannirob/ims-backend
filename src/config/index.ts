import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

const config = {
  env: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT || "5000", 10),
  mongodbUri:
    process.env.MONGODB_URI || "mongodb://localhost:27017/ims-backend",
  jwt: {
    secret: process.env.JWT_SECRET || "default-secret-change-me",
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
    refreshSecret:
      process.env.JWT_REFRESH_SECRET || "default-refresh-secret-change-me",
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
    passwordResetExpiresIn: process.env.JWT_PASSWORD_RESET_EXPIRES_IN || "10m",
  },
  email: {
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: parseInt(process.env.EMAIL_PORT || "587", 10),
    secure: process.env.EMAIL_SECURE === "true",
    user: process.env.EMAIL_USER || "",
    pass: process.env.EMAIL_PASS || "",
    from: process.env.EMAIL_FROM || "IMS System <noreply@ims.com>",
  },
  upload: {
    maxFileSize: parseInt(
      process.env.UPLOAD_MAX_FILE_SIZE || String(5 * 1024 * 1024),
      10,
    ), // 5MB
    uploadDir: process.env.UPLOAD_DIR || "uploads",
    allowedMimeTypes: (
      process.env.UPLOAD_ALLOWED_TYPES ||
      "image/jpeg,image/png,image/webp,application/pdf"
    ).split(","),
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
    apiKey: process.env.CLOUDINARY_API_KEY || "",
    apiSecret: process.env.CLOUDINARY_API_SECRET || "",
  },
  payment: {
    stripeSecretKey: process.env.STRIPE_SECRET_KEY || "",
    stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || "",
    currency: process.env.PAYMENT_CURRENCY || "usd",
  },
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
  log: {
    level: process.env.LOG_LEVEL || "info",
  },
} as const;

export default config;
