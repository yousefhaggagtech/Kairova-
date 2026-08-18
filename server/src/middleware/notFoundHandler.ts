import type { NextFunction, Request, Response } from "express";

import AppError from "../utils/AppError.js";

const notFoundHandler = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
};

export default notFoundHandler;
