import nodemailer from "nodemailer";
import config from "../config";
import logger from "./logger";

const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  secure: config.email.secure,
  auth: {
    user: config.email.user,
    pass: config.email.pass,
  },
});

const sendMail = async (options: {
  to: string;
  subject: string;
  html: string;
}) => {
  const mailOptions = {
    from: config.email.from,
    to: options.to,
    subject: options.subject,
    html: options.html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    logger.info(`Email sent: ${info.messageId} to ${options.to}`);
    return info;
  } catch (error) {
    logger.error("Email send failed:", error);
    throw error;
  }
};

const sendVerificationEmail = async (
  email: string,
  token: string,
) => {
  const verifyUrl = `${config.frontendUrl}/verify-email/${token}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Email Verification</h2>
      <p>Thank you for registering. Please click the link below to verify your email address:</p>
      <a href="${verifyUrl}" style="display: inline-block; padding: 12px 24px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px; margin: 16px 0;">
        Verify Email
      </a>
      <p style="color: #666; font-size: 14px;">Or copy and paste this link: ${verifyUrl}</p>
      <p style="color: #666; font-size: 12px;">This link will expire in 24 hours.</p>
    </div>
  `;
  return sendMail({ to: email, subject: "Verify your email - IMS", html });
};

const sendPasswordResetEmail = async (
  email: string,
  token: string,
) => {
  const resetUrl = `${config.frontendUrl}/reset-password/${token}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Password Reset</h2>
      <p>You requested a password reset. Click the link below to reset your password:</p>
      <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #2196F3; color: white; text-decoration: none; border-radius: 4px; margin: 16px 0;">
        Reset Password
      </a>
      <p style="color: #666; font-size: 14px;">Or copy and paste this link: ${resetUrl}</p>
      <p style="color: #666; font-size: 12px;">This link will expire in 10 minutes. If you didn't request this, please ignore this email.</p>
    </div>
  `;
  return sendMail({
    to: email,
    subject: "Password Reset - IMS",
    html,
  });
};

const sendLowStockAlert = async (
  email: string,
  products: Array<{ name: string; sku: string; quantity: number; reorderLevel: number }>,
) => {
  const rows = products
    .map(
      (p) =>
        `<tr><td style="padding:8px;border:1px solid #ddd;">${p.name}</td><td style="padding:8px;border:1px solid #ddd;">${p.sku}</td><td style="padding:8px;border:1px solid #ddd;color:red;">${p.quantity}</td><td style="padding:8px;border:1px solid #ddd;">${p.reorderLevel}</td></tr>`,
    )
    .join("");

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #e53935;">Low Stock Alert</h2>
      <p>The following products are below their reorder level:</p>
      <table style="width:100%;border-collapse:collapse;">
        <thead>
          <tr style="background:#f5f5f5;">
            <th style="padding:8px;border:1px solid #ddd;text-align:left;">Product</th>
            <th style="padding:8px;border:1px solid #ddd;text-align:left;">SKU</th>
            <th style="padding:8px;border:1px solid #ddd;text-align:left;">Current Qty</th>
            <th style="padding:8px;border:1px solid #ddd;text-align:left;">Reorder Level</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <p style="color: #666; font-size: 12px; margin-top: 16px;">This is an automated alert from IMS.</p>
    </div>
  `;
  return sendMail({
    to: email,
    subject: "Low Stock Alert - IMS",
    html,
  });
};

const sendPaymentReceipt = async (
  email: string,
  data: { receiptNumber: string; amount: number; currency: string; paidAt: string; description: string },
) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Payment Receipt</h2>
      <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 16px 0;">
        <p><strong>Receipt #:</strong> ${data.receiptNumber}</p>
        <p><strong>Amount:</strong> ${data.currency.toUpperCase()} ${(data.amount / 100).toFixed(2)}</p>
        <p><strong>Date:</strong> ${data.paidAt}</p>
        <p><strong>Description:</strong> ${data.description}</p>
      </div>
      <p style="color: #666; font-size: 12px;">Thank you for your payment.</p>
    </div>
  `;
  return sendMail({
    to: email,
    subject: `Payment Receipt #${data.receiptNumber} - IMS`,
    html,
  });
};

export const emailService = {
  sendMail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendLowStockAlert,
  sendPaymentReceipt,
};
