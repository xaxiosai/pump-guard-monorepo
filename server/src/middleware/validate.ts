import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";
import { sendError } from "~/utils/response";

export const validateBody = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error: any) {
      const message = error.errors?.[0]?.message || "Validation failed";
      return sendError(res, message, 400);
    }
  };
};

export const validateQuery = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.query);
      next();
    } catch (error: any) {
      const message = error.errors?.[0]?.message || "Validation failed";
      return sendError(res, message, 400);
    }
  };
};

export const validateParams = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.params);
      next();
    } catch (error: any) {
      const message = error.errors?.[0]?.message || "Validation failed";
      return sendError(res, message, 400);
    }
  };
};
