import { Response } from "express";

interface ApiResponseOptions<T> {
  statusCode?: number;
  success?: boolean;
  message: string;
  data?: T;
  meta?: Record<string, unknown>;
}

export const sendResponse = <T>(
  res: Response,
  {
    statusCode = 200,
    success = true,
    message,
    data,
    meta,
  }: ApiResponseOptions<T>,
): void => {
  res.status(statusCode).json({
    success,
    message,
    data: data ?? null,
    meta: meta ?? undefined,
  });
};
