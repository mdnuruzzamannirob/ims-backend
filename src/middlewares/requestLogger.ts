import { Request, Response, NextFunction } from "express";
import logger from "../core/logger";

const requestLogger = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  logger.info(`${req.method} ${req.originalUrl}`, {
    ip: req.ip,
    userAgent: req.get("user-agent"),
  });
  next();
};

export default requestLogger;
