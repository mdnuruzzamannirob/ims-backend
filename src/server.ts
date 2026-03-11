import app from "./app";
import config from "./config";
import connectDB from "./core/database";
import logger from "./core/logger";
import initJobs from "./jobs";

const startServer = async () => {
  await connectDB();

  // Initialize background cron jobs
  initJobs();

  app.listen(config.port, () => {
    logger.info(`Server running on port ${config.port} in ${config.env} mode`);
  });
};

// Handle unhandled rejections
process.on("unhandledRejection", (reason: Error) => {
  logger.error("Unhandled Rejection:", reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on("uncaughtException", (error: Error) => {
  logger.error("Uncaught Exception:", error);
  process.exit(1);
});

startServer();
