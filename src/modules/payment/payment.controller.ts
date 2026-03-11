import { Request, Response } from "express";
import catchAsync from "../../core/catchAsync";
import { sendResponse } from "../../core/apiResponse";
import { paymentService } from "./payment.service";

const create = catchAsync(async (req: Request, res: Response) => {
  const payment = await paymentService.create(req.body, req.user!.userId);
  sendResponse(res, {
    statusCode: 201,
    message: "Payment created",
    data: payment,
  });
});

const createStripePaymentIntent = catchAsync(
  async (req: Request, res: Response) => {
    const result = await paymentService.createStripePaymentIntent(
      req.body,
      req.user!.userId,
    );
    sendResponse(res, {
      statusCode: 201,
      message: "Payment intent created",
      data: result,
    });
  },
);

const stripeWebhook = catchAsync(async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"] as string;
  const rawBody = (req as any).rawBody as Buffer | undefined;
  if (!rawBody) {
    res.status(400).json({ success: false, message: "Raw body unavailable" });
    return;
  }
  const result = await paymentService.handleStripeWebhook(rawBody, sig);
  sendResponse(res, { message: "Webhook received", data: result });
});

const getAll = catchAsync(async (req: Request, res: Response) => {
  const { payments, meta } = await paymentService.getAll(req.query as any);
  sendResponse(res, { message: "Payments fetched", data: payments, meta });
});

const getById = catchAsync(async (req: Request, res: Response) => {
  const payment = await paymentService.getById(req.params.id as string);
  sendResponse(res, { message: "Payment fetched", data: payment });
});

const updateStatus = catchAsync(async (req: Request, res: Response) => {
  const payment = await paymentService.updateStatus(
    req.params.id as string,
    req.body,
  );
  sendResponse(res, { message: "Payment status updated", data: payment });
});

const getSummary = catchAsync(async (req: Request, res: Response) => {
  const summary = await paymentService.getSummary(
    req.query.startDate as string,
    req.query.endDate as string,
  );
  sendResponse(res, { message: "Payment summary", data: summary });
});

export const paymentController = {
  create,
  createStripePaymentIntent,
  stripeWebhook,
  getAll,
  getById,
  updateStatus,
  getSummary,
};
