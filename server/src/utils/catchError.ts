import type {
  NextFunction,
  Request,
  RequestHandler,
  Response,
} from "express";

type AsyncRequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<unknown>;

export const catchError = (fn: AsyncRequestHandler): RequestHandler => {
  return (req, res, next) => {
    fn(req, res, next).catch((error: unknown) => next(error));
  };
};
