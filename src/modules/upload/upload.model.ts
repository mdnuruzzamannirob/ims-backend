import { Schema, model, Document, Types } from "mongoose";

export interface IFileUpload extends Document {
  originalName: string;
  fileName: string;
  mimeType: string;
  size: number;
  path: string;
  url: string;
  uploadedBy: Types.ObjectId;
  relatedTo?: {
    model: string;
    id: Types.ObjectId;
  };
}

const fileUploadSchema = new Schema<IFileUpload>(
  {
    originalName: {
      type: String,
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    path: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
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
