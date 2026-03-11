import { Schema, model, Document, Types } from "mongoose";

export interface IFileUpload extends Document {
  originalName: string;
  fileName: string; // Cloudinary public_id
  mimeType: string;
  size: number;
  secureUrl: string; // Cloudinary https URL
  url: string; // alias kept for backwards compat
  format?: string;
  width?: number;
  height?: number;
  uploadedBy: Types.ObjectId;
  relatedTo?: {
    model: string;
    id: Types.ObjectId;
  };
}

const fileUploadSchema = new Schema<IFileUpload>(
  {
    originalName: { type: String, required: true },
    fileName: { type: String, required: true }, // Cloudinary public_id
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    secureUrl: { type: String, required: true },
    url: { type: String, required: true },
    format: { type: String },
    width: { type: Number },
    height: { type: Number },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    relatedTo: {
      model: { type: String },
      id: { type: Schema.Types.ObjectId },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const FileUpload = model<IFileUpload>("FileUpload", fileUploadSchema);
