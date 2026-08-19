import type { NextFunction, Request, Response } from "express";

import User from "../../models/User.js";
import type { Role } from "../../types/roles.js";
import AppError from "../../utils/AppError.js";
import { catchError } from "../../utils/catchError.js";
import { verifyAccessToken } from "./tokenService.js";

export const protect = catchError(async (req, _res, next) => {
  const token = req.cookies?.accessToken;

  if (!token) {
    next(new AppError("You are not logged in", 401));
    return;
  }

  let decoded: { id: string; role: string };

  try {
    decoded = verifyAccessToken(token);
  } catch {
    next(new AppError("Invalid or expired access token", 401));
    return;
  }

  const user = await User.findById(decoded.id);

  if (!user) {
    next(new AppError("User no longer exists", 401));
    return;
  }

  req.user = {
    id: user._id.toString(),
    role: user.role,
  };

  next();
});

export const restrictTo = (...allowedRoles: Role[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AppError("Authentication required", 401));
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      next(
        new AppError(
          "You do not have permission to perform this action",
          403,
        ),
      );
      return;
    }

    next();
  };
};
