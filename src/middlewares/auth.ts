import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import config from "../config";
import { UnauthorizedError } from "../core/errors";
import { User } from "../modules/user/user.model";

export interface JwtPayload {
  userId: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

const auth = (...requiredRoles: string[]) => {
  return async (
    req: Request,
    _res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new UnauthorizedError("No token provided");
      }

      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;

      // Verify user still exists
      const user = await User.findById(decoded.userId)
        .select("_id role")
        .lean();
      if (!user) {
        throw new UnauthorizedError("User no longer exists");
      }

      if (requiredRoles.length && !requiredRoles.includes(decoded.role)) {
        throw new UnauthorizedError("Insufficient permissions");
      }

      req.user = decoded;
      next();
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        next(error);
        return;
      }
      next(new UnauthorizedError("Invalid or expired token"));
    }
  };
};

export default auth;
