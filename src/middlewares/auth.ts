import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import config from "../config";
import { ForbiddenError, UnauthorizedError } from "../core/errors";
import { User } from "../modules/user/user.model";
import {
  hasPermission,
  type Role,
  type Resource,
  type Action,
} from "../core/permissions";

export interface JwtPayload {
  userId: string;
  role: string;
}

// Extend Express.Request with user property using module augmentation
declare module "express" {
  interface Request {
    user?: JwtPayload;
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
        .select("_id role isActive")
        .lean();
      if (!user) {
        throw new UnauthorizedError("User no longer exists");
      }

      if (!(user as any).isActive) {
        throw new UnauthorizedError("Account is deactivated");
      }

      if (requiredRoles.length && !requiredRoles.includes(decoded.role)) {
        throw new ForbiddenError("Insufficient permissions");
      }

      req.user = decoded;
      next();
    } catch (error) {
      if (
        error instanceof UnauthorizedError ||
        error instanceof ForbiddenError
      ) {
        next(error);
        return;
      }
      next(new UnauthorizedError("Invalid or expired token"));
    }
  };
};

/**
 * Permission-based access control middleware.
 * Checks if the user's role has the required permission on a resource.
 */
export const requirePermission = (resource: Resource, action: Action) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new UnauthorizedError("Not authenticated"));
      return;
    }

    if (!hasPermission(req.user.role as Role, resource, action)) {
      next(
        new ForbiddenError(
          `You don't have permission to ${action} ${resource}`,
        ),
      );
      return;
    }

    next();
  };
};

export default auth;
