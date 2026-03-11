import cron from "node-cron";
import logger from "../core/logger";
import { Inventory } from "../modules/inventory/inventory.model";
import { User } from "../modules/user/user.model";
import { emailService } from "../core/email";
import { Sale } from "../modules/sale/sale.model";
import { Purchase } from "../modules/purchase/purchase.model";

/**
 * Initialize all background/scheduled jobs.
 */
const initJobs = () => {
  // --- Low stock alert check: Every day at 8 AM ---
  cron.schedule("0 8 * * *", async () => {
    logger.info("[CRON] Running low stock check...");
    try {
      const lowStockItems = await Inventory.aggregate([
        {
          $lookup: {
            from: "products",
            localField: "product",
            foreignField: "_id",
            as: "product",
          },
        },
        { $unwind: "$product" },
        {
          $match: {
            $expr: { $lte: ["$quantity", "$product.reorderLevel"] },
            "product.isActive": true,
          },
        },
      ]);

      if (lowStockItems.length > 0) {
        // Notify all admins and managers
        const adminsManagers = await User.find({
          role: { $in: ["admin", "manager"] },
          isActive: true,
        }).select("email");

        const products = lowStockItems.map((item: any) => ({
          name: item.product.name,
          sku: item.product.sku,
          quantity: item.quantity,
          reorderLevel: item.product.reorderLevel,
        }));

        for (const user of adminsManagers) {
          try {
            await emailService.sendLowStockAlert(user.email, products);
          } catch (err) {
            logger.warn(`Failed to send low stock alert to ${user.email}`);
          }
        }

        logger.info(
          `[CRON] Low stock alert sent for ${lowStockItems.length} products`,
        );
      } else {
        logger.info("[CRON] No low stock items found");
      }
    } catch (error) {
      logger.error("[CRON] Low stock check failed:", error);
    }
  });

  // --- Clean up expired tokens: Every day at midnight ---
  cron.schedule("0 0 * * *", async () => {
    logger.info("[CRON] Cleaning up expired tokens...");
    try {
      const now = new Date();

      // Clean expired password reset tokens
      await User.updateMany({ passwordResetExpires: { $lt: now } } as any, {
        $unset: {
          passwordResetToken: 1,
          passwordResetExpires: 1,
        },
      });

      // Clean expired email verification tokens
      await User.updateMany({ emailVerificationExpires: { $lt: now } } as any, {
        $unset: {
          emailVerificationToken: 1,
          emailVerificationExpires: 1,
        },
      });

      // Unlock locked accounts whose lock time has passed
      await User.updateMany({ lockUntil: { $lt: now } } as any, {
        $set: { loginAttempts: 0 },
        $unset: { lockUntil: 1 },
      });

      logger.info("[CRON] Token cleanup completed");
    } catch (error) {
      logger.error("[CRON] Token cleanup failed:", error);
    }
  });

  // --- Daily sales summary: Every day at 11 PM ---
  cron.schedule("0 23 * * *", async () => {
    logger.info("[CRON] Generating daily sales summary...");
    try {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);

      const [salesSummary, purchaseSummary] = await Promise.all([
        Sale.aggregate([
          {
            $match: {
              createdAt: { $gte: todayStart, $lte: todayEnd },
              status: "completed",
            },
          },
          {
            $group: {
              _id: null,
              totalSales: { $sum: "$totalAmount" },
              count: { $sum: 1 },
            },
          },
        ]),
        Purchase.aggregate([
          {
            $match: {
              createdAt: { $gte: todayStart, $lte: todayEnd },
              status: "received",
            },
          },
          {
            $group: {
              _id: null,
              totalPurchases: { $sum: "$totalAmount" },
              count: { $sum: 1 },
            },
          },
        ]),
      ]);

      logger.info(
        `[CRON] Daily summary — Sales: ${salesSummary[0]?.count || 0} (${salesSummary[0]?.totalSales || 0}), Purchases: ${purchaseSummary[0]?.count || 0} (${purchaseSummary[0]?.totalPurchases || 0})`,
      );
    } catch (error) {
      logger.error("[CRON] Daily summary generation failed:", error);
    }
  });

  // --- Auto-cancel stale pending purchases older than 7 days: Weekly on Sunday ---
  cron.schedule("0 2 * * 0", async () => {
    logger.info("[CRON] Cancelling stale pending purchases...");
    try {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const result = await Purchase.updateMany(
        {
          status: "pending",
          createdAt: { $lt: sevenDaysAgo },
        },
        { status: "cancelled" },
      );
      logger.info(
        `[CRON] Cancelled ${(result as any).modifiedCount || 0} stale purchases`,
      );
    } catch (error) {
      logger.error("[CRON] Stale purchase cancellation failed:", error);
    }
  });

  logger.info("Background jobs initialized");
};

export default initJobs;
