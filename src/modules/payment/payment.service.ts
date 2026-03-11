import Stripe from "stripe";
import { Payment } from "./payment.model";
import config from "../../config";
import { BadRequestError, NotFoundError } from "../../core/errors";
import logger from "../../core/logger";

let stripe: Stripe | null = null;
if (config.payment.stripeSecretKey) {
  stripe = new Stripe(config.payment.stripeSecretKey);
}

const create = async (data: Record<string, any>, userId: string) => {
  const payment = await Payment.create({
    ...data,
    status: data.method === "cash" ? "completed" : "pending",
    paidAt: data.method === "cash" ? new Date() : undefined,
    createdBy: userId,
  });

  logger.info(`Payment created: ${payment._id}, method: ${data.method}`);
  return payment;
};

const createStripePaymentIntent = async (
  data: {
    amount: number;
    currency?: string;
    description?: string;
    referenceModel?: string;
    referenceId?: string;
  },
  userId: string,
) => {
  if (!stripe) throw new BadRequestError("Stripe is not configured");

  const paymentIntent = await stripe.paymentIntents.create({
    amount: data.amount,
    currency: data.currency || config.payment.currency,
    metadata: {
      userId,
      referenceModel: data.referenceModel || "",
      referenceId: data.referenceId || "",
    },
  });

  // Create a pending payment record
  const payment = await Payment.create({
    type: "sale",
    amount: data.amount,
    currency: data.currency || config.payment.currency,
    method: "stripe",
    status: "pending",
    stripePaymentIntentId: paymentIntent.id,
    description: data.description,
    referenceModel: data.referenceModel,
    referenceId: data.referenceId,
    createdBy: userId,
  });

  logger.info(`Stripe PaymentIntent created: ${paymentIntent.id}`);

  return {
    clientSecret: paymentIntent.client_secret,
    paymentId: payment._id,
  };
};

const handleStripeWebhook = async (payload: Buffer, signature: string) => {
  if (!stripe) throw new BadRequestError("Stripe is not configured");

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      payload,
      signature,
      config.payment.stripeWebhookSecret,
    );
  } catch {
    throw new BadRequestError("Invalid webhook signature");
  }

  switch (event.type) {
    case "payment_intent.succeeded": {
      const pi = event.data.object as Stripe.PaymentIntent;
      await Payment.findOneAndUpdate({ stripePaymentIntentId: pi.id } as any, {
        status: "completed",
        paidAt: new Date(),
        stripeChargeId: pi.latest_charge as string,
      });
      logger.info(`Stripe payment succeeded: ${pi.id}`);
      break;
    }
    case "payment_intent.payment_failed": {
      const pi = event.data.object as Stripe.PaymentIntent;
      await Payment.findOneAndUpdate({ stripePaymentIntentId: pi.id } as any, {
        status: "failed",
      });
      logger.warn(`Stripe payment failed: ${pi.id}`);
      break;
    }
    case "charge.refunded": {
      const charge = event.data.object as Stripe.Charge;
      await Payment.findOneAndUpdate({ stripeChargeId: charge.id } as any, {
        status: "refunded",
      });
      logger.info(`Stripe refund processed: ${charge.id}`);
      break;
    }
  }

  return { received: true };
};

const getAll = async (query: {
  type?: string;
  status?: string;
  method?: string;
  startDate?: string;
  endDate?: string;
  page?: string;
  limit?: string;
}) => {
  const filter: Record<string, unknown> = {};
  if (query.type) filter.type = query.type;
  if (query.status) filter.status = query.status;
  if (query.method) filter.method = query.method;
  if (query.startDate || query.endDate) {
    filter.createdAt = {};
    if (query.startDate)
      (filter.createdAt as any).$gte = new Date(query.startDate);
    if (query.endDate) (filter.createdAt as any).$lte = new Date(query.endDate);
  }

  const page = parseInt(query.page || "1", 10);
  const limit = parseInt(query.limit || "20", 10);
  const skip = (page - 1) * limit;

  const [payments, total] = await Promise.all([
    Payment.find(filter)
      .populate("referenceId")
      .populate("createdBy", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Payment.countDocuments(filter),
  ]);

  return {
    payments,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

const getById = async (id: string) => {
  const payment = await Payment.findById(id)
    .populate("referenceId")
    .populate("createdBy", "name email");
  if (!payment) throw new NotFoundError("Payment");
  return payment;
};

const updateStatus = async (
  id: string,
  data: { status: string; transactionId?: string; notes?: string },
) => {
  const payment = await Payment.findById(id);
  if (!payment) throw new NotFoundError("Payment");

  if (payment.status === "completed" && data.status !== "refunded") {
    throw new BadRequestError("Completed payments can only be refunded");
  }

  const updateData: Record<string, any> = { status: data.status };
  if (data.transactionId) updateData.transactionId = data.transactionId;
  if (data.notes) updateData.notes = data.notes;
  if (data.status === "completed") updateData.paidAt = new Date();

  const updated = await Payment.findByIdAndUpdate(id, updateData, {
    new: true,
  });
  logger.info(`Payment ${id} status updated to ${data.status}`);
  return updated;
};

const getSummary = async (startDate?: string, endDate?: string) => {
  const match: Record<string, any> = {};
  if (startDate || endDate) {
    match.createdAt = {};
    if (startDate) match.createdAt.$gte = new Date(startDate);
    if (endDate) match.createdAt.$lte = new Date(endDate);
  }

  const summary = await Payment.aggregate([
    { $match: match },
    {
      $group: {
        _id: { type: "$type", status: "$status" },
        total: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.type": 1, "_id.status": 1 } },
  ]);

  return summary;
};

export const paymentService = {
  create,
  createStripePaymentIntent,
  handleStripeWebhook,
  getAll,
  getById,
  updateStatus,
  getSummary,
};
