import cookieParser from "cookie-parser";
import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import request, { type Response as SupertestResponse } from "supertest";
import { Types } from "mongoose";

import globalErrorHandler from "../../middleware/globalErrorHandler.js";
import { validate } from "../../middleware/validate.js";
import User, { type IUser } from "../../models/User.js";
import {
  getMeController,
  loginController,
  logoutController,
  refreshController,
  registerController,
} from "./controller.js";
import { signRefreshToken, verifyAccessToken } from "./tokenService.js";
import { loginSchema, registerSchema } from "./validation.js";

const validRegisterInput = {
  name: "Yousef Haggag",
  email: "yousef@example.com",
  password: "password123",
  phone: "+201001234567",
};

const createTestApp = () => {
  const app = express();

  app.use(cookieParser());
  app.use(express.json());

  app.post(
    "/api/auth/register",
    validate(registerSchema),
    registerController,
  );
  app.post("/api/auth/login", validate(loginSchema), loginController);
  app.post("/api/auth/refresh", refreshController);
  app.post("/api/auth/logout", logoutController);
  app.get(
    "/api/auth/me",
    async (req: Request, _res: Response, next: NextFunction) => {
      try {
        const userId = req.header("x-user-id");

        if (userId) {
          const user = await User.findById(userId);

          if (user) {
            req.user = {
              id: user._id.toString(),
              role: user.role,
            };
          }
        }

        next();
      } catch (error) {
        next(error);
      }
    },
    getMeController,
  );
  app.use(globalErrorHandler);

  return app;
};

const app = createTestApp();

const getSetCookies = (response: SupertestResponse): string[] => {
  const header = response.headers["set-cookie"];

  if (!header) return [];

  return Array.isArray(header) ? header : [String(header)];
};

const getCookie = (response: SupertestResponse, name: string): string => {
  const cookie = getSetCookies(response).find((value) =>
    value.startsWith(`${name}=`),
  );

  if (!cookie) {
    throw new Error(`Missing ${name} cookie`);
  }

  return cookie;
};

const getCookiePair = (response: SupertestResponse, name: string): string => {
  return getCookie(response, name).split(";")[0] ?? "";
};

const registerUser = async (
  overrides: Partial<typeof validRegisterInput> = {},
) => {
  return request(app)
    .post("/api/auth/register")
    .send({ ...validRegisterInput, ...overrides })
    .expect(201);
};

const createUser = async (
  overrides: Partial<typeof validRegisterInput> = {},
): Promise<IUser> => {
  return User.create({
    ...validRegisterInput,
    ...overrides,
  });
};

describe("auth controllers", () => {
  it("register creates user and sets cookies", async () => {
    const response = await registerUser();
    const user = await User.findOne({ email: validRegisterInput.email }).select(
      "+password +refreshTokenHash",
    );
    const accessTokenCookie = getCookie(response, "accessToken");
    const refreshTokenCookie = getCookie(response, "refreshToken");

    expect(response.body).toEqual({
      user: {
        id: user?._id.toString(),
        name: validRegisterInput.name,
        email: validRegisterInput.email,
        role: "customer",
      },
    });
    expect(user).not.toBeNull();
    expect(user?.password).not.toBe(validRegisterInput.password);
    expect(user?.refreshTokenHash).toHaveLength(64);
    expect(accessTokenCookie).toContain("HttpOnly");
    expect(accessTokenCookie).toContain("Path=/");
    expect(refreshTokenCookie).toContain("HttpOnly");
    expect(refreshTokenCookie).toContain("Path=/api/auth");
  });

  it("register normalizes email before saving and responding", async () => {
    const response = await registerUser({
      email: "YOUSEF@example.COM",
    });
    const user = await User.findOne({ email: validRegisterInput.email });

    expect(user).not.toBeNull();
    expect(response.body.user.email).toBe(validRegisterInput.email);
  });

  it("register does not include password or refresh token hash in response", async () => {
    const response = await registerUser();

    expect(response.body.user.password).toBeUndefined();
    expect(response.body.user.refreshTokenHash).toBeUndefined();
  });

  it("register rejects duplicate email with 409", async () => {
    await registerUser();

    const response = await request(app)
      .post("/api/auth/register")
      .send(validRegisterInput)
      .expect(409);

    expect(response.body).toEqual({
      status: "fail",
      message: "Email already exists",
    });
  });

  it("login succeeds with valid credentials", async () => {
    const user = await createUser();

    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: validRegisterInput.email,
        password: validRegisterInput.password,
      })
      .expect(200);

    expect(response.body).toEqual({
      user: {
        id: user._id.toString(),
        name: validRegisterInput.name,
        email: validRegisterInput.email,
        role: "customer",
      },
    });
    expect(getCookie(response, "accessToken")).toContain("HttpOnly");
    expect(getCookie(response, "refreshToken")).toContain("Path=/api/auth");
  });

  it("login stores a refresh token hash", async () => {
    await createUser();

    await request(app)
      .post("/api/auth/login")
      .send({
        email: validRegisterInput.email,
        password: validRegisterInput.password,
      })
      .expect(200);

    const user = await User.findOne({ email: validRegisterInput.email }).select(
      "+refreshTokenHash",
    );

    expect(user?.refreshTokenHash).toHaveLength(64);
  });

  it("login rejects invalid password with 401", async () => {
    await createUser();

    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: validRegisterInput.email,
        password: "wrong-password",
      })
      .expect(401);

    expect(response.body).toEqual({
      status: "fail",
      message: "Invalid credentials",
    });
  });

  it("login rejects non-existent user with 401", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "missing@example.com",
        password: "password123",
      })
      .expect(401);

    expect(response.body).toEqual({
      status: "fail",
      message: "Invalid credentials",
    });
  });

  it("refresh issues new access token", async () => {
    const registerResponse = await registerUser();
    const refreshCookie = getCookiePair(registerResponse, "refreshToken");
    const user = await User.findOne({ email: validRegisterInput.email });

    const response = await request(app)
      .post("/api/auth/refresh")
      .set("Cookie", refreshCookie)
      .expect(200);
    const accessToken = getCookiePair(response, "accessToken").replace(
      "accessToken=",
      "",
    );
    const payload = verifyAccessToken(accessToken);

    expect(response.body).toEqual({ status: "success" });
    expect(payload).toMatchObject({
      id: user?._id.toString(),
      role: "customer",
    });
    expect(
      getSetCookies(response).some((cookie) =>
        cookie.startsWith("refreshToken="),
      ),
    ).toBe(false);
  });

  it("refresh rejects missing token with 401", async () => {
    const response = await request(app)
      .post("/api/auth/refresh")
      .expect(401);

    expect(response.body).toEqual({
      status: "fail",
      message: "Refresh token required",
    });
  });

  it("refresh rejects invalid token with 403", async () => {
    const response = await request(app)
      .post("/api/auth/refresh")
      .set("Cookie", "refreshToken=invalid-token")
      .expect(403);

    expect(response.body).toEqual({
      status: "fail",
      message: "Invalid refresh token",
    });
  });

  it("refresh rejects valid JWTs that do not match stored hash", async () => {
    const user = await createUser();
    const refreshToken = signRefreshToken(user._id.toString());

    const response = await request(app)
      .post("/api/auth/refresh")
      .set("Cookie", `refreshToken=${refreshToken}`)
      .expect(403);

    expect(response.body).toEqual({
      status: "fail",
      message: "Invalid refresh token",
    });
  });

  it("refresh rejects tokens for missing users", async () => {
    const refreshToken = signRefreshToken(new Types.ObjectId().toString());

    const response = await request(app)
      .post("/api/auth/refresh")
      .set("Cookie", `refreshToken=${refreshToken}`)
      .expect(403);

    expect(response.body).toEqual({
      status: "fail",
      message: "Invalid refresh token",
    });
  });

  it("logout clears cookies and clears refreshTokenHash", async () => {
    const registerResponse = await registerUser();
    const refreshCookie = getCookiePair(registerResponse, "refreshToken");

    const response = await request(app)
      .post("/api/auth/logout")
      .set("Cookie", refreshCookie)
      .expect(204);
    const user = await User.findOne({ email: validRegisterInput.email }).select(
      "+refreshTokenHash",
    );
    const cookies = getSetCookies(response);

    expect(user?.refreshTokenHash).toBeNull();
    expect(cookies.some((cookie) => cookie.startsWith("accessToken=;"))).toBe(
      true,
    );
    expect(cookies.some((cookie) => cookie.includes("Path=/;"))).toBe(true);
    expect(cookies.some((cookie) => cookie.startsWith("refreshToken=;"))).toBe(
      true,
    );
    expect(cookies.some((cookie) => cookie.includes("Path=/api/auth"))).toBe(
      true,
    );
  });

  it("logout still clears cookies for invalid refresh tokens", async () => {
    const response = await request(app)
      .post("/api/auth/logout")
      .set("Cookie", "refreshToken=invalid-token")
      .expect(204);
    const cookies = getSetCookies(response);

    expect(cookies.some((cookie) => cookie.startsWith("accessToken=;"))).toBe(
      true,
    );
    expect(cookies.some((cookie) => cookie.startsWith("refreshToken=;"))).toBe(
      true,
    );
  });

  it("logout succeeds without a refresh token", async () => {
    await request(app).post("/api/auth/logout").expect(204);
  });

  it("getMe returns current user", async () => {
    const user = await createUser();

    const response = await request(app)
      .get("/api/auth/me")
      .set("x-user-id", user._id.toString())
      .expect(200);

    expect(response.body).toEqual({
      user: {
        id: user._id.toString(),
        name: validRegisterInput.name,
        email: validRegisterInput.email,
        role: "customer",
        phone: validRegisterInput.phone,
      },
    });
  });

  it("getMe rejects missing authenticated user", async () => {
    const response = await request(app).get("/api/auth/me").expect(401);

    expect(response.body).toEqual({
      status: "fail",
      message: "Authentication required",
    });
  });
});
