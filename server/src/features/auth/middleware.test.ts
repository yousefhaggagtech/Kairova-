import type { NextFunction, Request, Response, RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { Types } from "mongoose";

import { env } from "../../config/env.js";
import User from "../../models/User.js";
import type { Role } from "../../types/roles.js";
import AppError from "../../utils/AppError.js";
import { protect, restrictTo } from "./middleware.js";
import { signAccessToken } from "./tokenService.js";

const createUser = (role: Role = "customer") => {
  return {
    _id: new Types.ObjectId(),
    role,
  };
};

const runMiddleware = (
  handler: RequestHandler,
  req: Partial<Request>,
): Promise<unknown> => {
  return new Promise((resolve) => {
    handler(req as Request, {} as Response, ((error?: unknown) => {
      resolve(error);
    }) as NextFunction);
  });
};

describe("auth middleware", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("protect calls next() with valid token", async () => {
    const user = createUser();
    const token = signAccessToken(user._id.toString(), user.role);
    jest.spyOn(User, "findById").mockResolvedValue(user as never);
    const req = {
      cookies: { accessToken: token },
    } as Partial<Request>;

    const error = await runMiddleware(protect, req);

    expect(error).toBeUndefined();
    expect(req.user).toEqual({
      id: user._id.toString(),
      role: "customer",
    });
  });

  it("protect calls next(401) with missing token", async () => {
    const error = await runMiddleware(protect, { cookies: {} });

    expect(error).toBeInstanceOf(AppError);
    expect(error).toMatchObject({
      statusCode: 401,
      message: "You are not logged in",
    });
  });

  it("protect calls next(401) with invalid token", async () => {
    const error = await runMiddleware(protect, {
      cookies: { accessToken: "invalid-token" },
    });

    expect(error).toBeInstanceOf(AppError);
    expect(error).toMatchObject({
      statusCode: 401,
      message: "Invalid or expired access token",
    });
  });

  it("protect calls next(401) with expired token", async () => {
    const user = createUser();
    const token = jwt.sign(
      { id: user._id.toString(), role: user.role },
      env.jwtAccessSecret,
      { expiresIn: "-1s" },
    );

    const error = await runMiddleware(protect, {
      cookies: { accessToken: token },
    });

    expect(error).toBeInstanceOf(AppError);
    expect(error).toMatchObject({
      statusCode: 401,
      message: "Invalid or expired access token",
    });
  });

  it("protect calls next(401) when user no longer exists", async () => {
    const user = createUser();
    const token = signAccessToken(user._id.toString(), user.role);
    jest.spyOn(User, "findById").mockResolvedValue(null);

    const error = await runMiddleware(protect, {
      cookies: { accessToken: token },
    });

    expect(error).toBeInstanceOf(AppError);
    expect(error).toMatchObject({
      statusCode: 401,
      message: "User no longer exists",
    });
  });

  it("restrictTo allows admin role", async () => {
    const error = await runMiddleware(restrictTo("admin"), {
      user: { id: "admin-id", role: "admin" },
    });

    expect(error).toBeUndefined();
  });

  it("restrictTo rejects customer role", async () => {
    const error = await runMiddleware(restrictTo("admin"), {
      user: { id: "customer-id", role: "customer" },
    });

    expect(error).toBeInstanceOf(AppError);
    expect(error).toMatchObject({
      statusCode: 403,
      message: "You do not have permission to perform this action",
    });
  });

  it("restrictTo calls next(401) when no user", async () => {
    const error = await runMiddleware(restrictTo("admin"), {});

    expect(error).toBeInstanceOf(AppError);
    expect(error).toMatchObject({
      statusCode: 401,
      message: "Authentication required",
    });
  });
});
