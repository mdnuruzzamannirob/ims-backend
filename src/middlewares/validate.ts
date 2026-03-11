import { Request, Response, NextFunction } from "express";
import { z } from "zod";

const validate =
  (schema: z.ZodType) =>
  (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const messages = error.issues.map((e: z.core.$ZodIssue) => ({
          path: e.path.join("."),
          message: e.message,
        }));
        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: messages,
        });
        return;
      }
      next(error);
    }
  };

export default validate;
