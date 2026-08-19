import type { Request, Response } from "express";

import User, { type IUser } from "../../models/User.js";
import AppError from "../../utils/AppError.js";
import { catchError } from "../../utils/catchError.js";
import {
  accessTokenCookieOptions,
  clearCookieOptions,
  refreshTokenCookieOptions,
} from "./cookieConfig.js";
import { type LoginInput, type RegisterInput } from "./validation.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "./tokenService.js";

const getRefreshTokenFromCookie = (req: Request): string | undefined => {
  return (req.cookies as Record<string, string | undefined> | undefined)
    ?.refreshToken;
};

const toAuthUser = (user: IUser) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  role: user.role,
});

const toCurrentUser = (user: IUser) => ({
  ...toAuthUser(user),
  phone: user.phone,
});

async function setAuthCookies(
  res: Response,
  user: IUser,
  accessToken: string,
  refreshToken: string,
): Promise<void> {
  res.cookie("accessToken", accessToken, accessTokenCookieOptions());
  res.cookie("refreshToken", refreshToken, refreshTokenCookieOptions());

  user.refreshTokenHash = user.hashRefreshToken(refreshToken);
  await user.save({ validateBeforeSave: false });
}

const clearAuthCookies = (res: Response): void => {
  res.clearCookie("accessToken", {
    ...clearCookieOptions(),
    path: "/",
  });
  res.clearCookie("refreshToken", clearCookieOptions());
};

const getRefreshPayload = (token: string): { id: string } => {
  try {
    return verifyRefreshToken(token);
  } catch {
    throw new AppError("Invalid refresh token", 403);
  }
};

export const registerController = catchError(
  async (req: Request, res: Response) => {
    const input = req.body as RegisterInput;
    const existingUser = await User.findOne({ email: input.email });

    if (existingUser) {
      throw new AppError("Email already exists", 409);
    }

    const user = await User.create(input);
    const accessToken = signAccessToken(user._id.toString(), user.role);
    const refreshToken = signRefreshToken(user._id.toString());

    await setAuthCookies(res, user, accessToken, refreshToken);

    res.status(201).json({
      user: toAuthUser(user),
    });
  },
);

export const loginController = catchError(
  async (req: Request, res: Response) => {
    const input = req.body as LoginInput;
    const user = await User.findOne({ email: input.email }).select(
      "+password +refreshTokenHash",
    );

    if (!user || !(await user.comparePassword(input.password))) {
      throw new AppError("Invalid credentials", 401);
    }

    const accessToken = signAccessToken(user._id.toString(), user.role);
    const refreshToken = signRefreshToken(user._id.toString());

    await setAuthCookies(res, user, accessToken, refreshToken);

    res.status(200).json({
      user: toAuthUser(user),
    });
  },
);

export const refreshController = catchError(
  async (req: Request, res: Response) => {
    const refreshToken = getRefreshTokenFromCookie(req);

    if (!refreshToken) {
      throw new AppError("Refresh token required", 401);
    }

    const payload = getRefreshPayload(refreshToken);
    const user = await User.findById(payload.id).select("+refreshTokenHash");

    if (!user || !(await user.compareRefreshToken(refreshToken))) {
      throw new AppError("Invalid refresh token", 403);
    }

    const accessToken = signAccessToken(user._id.toString(), user.role);

    res.cookie("accessToken", accessToken, accessTokenCookieOptions());
    res.status(200).json({ status: "success" });
  },
);

export const logoutController = catchError(
  async (req: Request, res: Response) => {
    const refreshToken = getRefreshTokenFromCookie(req);

    clearAuthCookies(res);

    if (refreshToken) {
      try {
        const payload = verifyRefreshToken(refreshToken);
        const user = await User.findById(payload.id).select(
          "+refreshTokenHash",
        );

        if (user) {
          user.refreshTokenHash = null;
          await user.save({ validateBeforeSave: false });
        }
      } catch {
        // Logout should be idempotent even when the refresh token is stale.
      }
    }

    res.status(204).send();
  },
);

export const getMeController = catchError(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError("Authentication required", 401);
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      throw new AppError("User no longer exists", 401);
    }

    res.status(200).json({
      user: toCurrentUser(user),
    });
  },
);
