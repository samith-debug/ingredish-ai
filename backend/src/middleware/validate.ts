import type { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";

/**
 * Factory: returns an Express middleware that validates req.body
 * against the given Zod schema. On failure it replies 400.
 */
export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors = (result.error as ZodError).errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      }));
      res.status(400).json({ ok: false, error: "validation_error", errors });
      return;
    }
    // Overwrite body with the parsed (typed) value
    req.body = result.data;
    next();
  };
}
