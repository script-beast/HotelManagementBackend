import { Response, Request, NextFunction } from "express";
import { Schema } from "zod";

import catchAsync from "../utils/catchAsync.utils";
import ExpressResponse from "../libs/express/response.libs";

const validate = (schema: Schema) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await schema.safeParseAsync(req.body);
    if (result.success) {
      req.body = result.data;
      next();
    } else {
      ExpressResponse.badRequest(res, result.error.errors[0].message);
    }
  });

export default validate;
