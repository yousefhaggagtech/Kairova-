import type { NextFunction, Request, Response } from "express";
import { ZodError, type ZodSchema } from "zod";

import AppError from "../utils/AppError.js";

export const validate = (schema: ZodSchema) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const validated = schema.parse(req.body);
      req.body = validated;
      next();
    } catch (err: unknown) {
      if (err instanceof ZodError) {
        const message = err.issues.map((issue) => issue.message).join(", ");
        next(new AppError(message, 400));
        return;
      }

      next(err);
    }
  };
};
