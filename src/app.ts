import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import mongoSanitize from "express-mongo-sanitize";
import hpp from "hpp";
import rateLimit from "express-rate-limit";
import config from "./config";
import routes from "./routes";
import globalErrorHandler from "./middlewares/globalErrorHandler";
import notFound from "./middlewares/notFound";
import requestLogger from "./middlewares/requestLogger";

const app = express();

// Security headers
app.use(helmet());

// CORS — restrict to frontend URL in production
app.use(
  cors({
    origin: config.env === "production" ? config.frontendUrl : true,
    credentials: true,
  }),
);

// Rate limiting on sensitive auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message:
      "Too many requests from this IP, please try again after 15 minutes",
  },
});
app.use("/api/v1/auth/login", authLimiter);
app.use("/api/v1/auth/register", authLimiter);
app.use("/api/v1/auth/forgot-password", authLimiter);

// Body parsing — save raw body BEFORE json parsing (needed for Stripe webhook)
app.use(
  express.json({
    limit: "10mb",
    verify: (req: any, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);
app.use(express.urlencoded({ extended: true }));

// Response compression
app.use(compression());

// NoSQL injection sanitization (strips $ and . from user input keys)
app.use(mongoSanitize());

// HTTP Parameter Pollution protection
app.use(hpp());

// HTTP request logging
app.use(morgan("dev"));
app.use(requestLogger);

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// API routes
app.use("/api/v1", routes);

// 404 handler
app.use(notFound);

// Global error handler
app.use(globalErrorHandler);

export default app;
