import type { NextFunction, Request, Response } from "express";

import AppError from "../../utils/AppError.js";
import { validate } from "../../middleware/validate.js";
import {
  loginSchema,
  registerSchema,
  updateProfileSchema,
} from "./validation.js";

const validRegisterInput = {
  name: "Yousef Haggag",
  email: "YOUSEF@example.COM",
  password: "password123",
  phone: "+201001234567",
};

describe("auth validation schemas", () => {
  it("registerSchema accepts valid input", () => {
    const result = registerSchema.parse(validRegisterInput);

    expect(result).toEqual({
      ...validRegisterInput,
      email: "yousef@example.com",
    });
  });

  it("registerSchema rejects missing name", () => {
    const { name, ...input } = validRegisterInput;
    void name;

    expect(() => registerSchema.parse(input)).toThrow();
  });

  it("registerSchema rejects invalid email", () => {
    expect(() =>
      registerSchema.parse({
        ...validRegisterInput,
        email: "not-an-email",
      }),
    ).toThrow("Invalid email address");
  });

  it("registerSchema rejects short password", () => {
    expect(() =>
      registerSchema.parse({
        ...validRegisterInput,
        password: "short",
      }),
    ).toThrow("Password must be at least 8 characters");
  });

  it("registerSchema rejects invalid phone", () => {
    expect(() =>
      registerSchema.parse({
        ...validRegisterInput,
        phone: "12345",
      }),
    ).toThrow("Phone must be 10-15 digits, optional + prefix");
  });

  it("loginSchema accepts valid input", () => {
    const result = loginSchema.parse({
      email: "YOUSEF@example.COM",
      password: "password123",
    });

    expect(result).toEqual({
      email: "yousef@example.com",
      password: "password123",
    });
  });

  it("loginSchema rejects missing email", () => {
    expect(() => loginSchema.parse({ password: "password123" })).toThrow();
  });

  it("updateProfileSchema accepts partial updates", () => {
    const result = updateProfileSchema.parse({
      name: "New Name",
      addresses: [
        {
          label: "home",
          street: "123 Nile Street",
          city: "Cairo",
          governorate: "Cairo",
          phone: "+201001234567",
        },
      ],
    });

    expect(result).toEqual({
      name: "New Name",
      addresses: [
        {
          label: "home",
          street: "123 Nile Street",
          city: "Cairo",
          governorate: "Cairo",
          phone: "+201001234567",
          isDefault: false,
        },
      ],
    });
  });

  it("updateProfileSchema rejects unknown fields", () => {
    expect(() =>
      updateProfileSchema.parse({
        name: "New Name",
        role: "admin",
      }),
    ).toThrow();
  });
});

describe("validate middleware", () => {
  const createMockResponse = (): Response => ({}) as Response;

  it("assigns validated body and calls next with no error", () => {
    const req = {
      body: validRegisterInput,
    } as Request;
    const res = createMockResponse();
    const next = jest.fn() as NextFunction;

    validate(registerSchema)(req, res, next);

    expect(req.body.email).toBe("yousef@example.com");
    expect(next).toHaveBeenCalledWith();
  });

  it("passes clear 400 AppError messages for Zod failures", () => {
    const req = {
      body: {
        ...validRegisterInput,
        email: "not-an-email",
        phone: "12345",
      },
    } as Request;
    const res = createMockResponse();
    const next = jest.fn() as NextFunction;

    validate(registerSchema)(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    const error = (next as jest.Mock).mock.calls[0]?.[0];

    expect(error).toBeInstanceOf(AppError);
    expect(error).toMatchObject({
      statusCode: 400,
      message:
        "Invalid email address, Phone must be 10-15 digits, optional + prefix",
    });
  });
});
