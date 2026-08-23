import "dotenv/config";

import AppError from "../utils/AppError.js";

type CookieSameSite = "lax" | "strict" | "none";

const booleanStrings = ["true", "false"] as const;
const sameSiteValues = ["lax", "strict", "none"] as const;

const errors: string[] = [];

const getRequired = (key: string): string => {
  const value = process.env[key];

  if (!value) {
    errors.push(`${key} is required`);
    return "";
  }

  return value;
};

const validateSecret = (key: string): string => {
  const value = getRequired(key);

  if (!value) return value;

  if (value.length < 32) {
    errors.push(`${key} must be at least 32 characters`);
  }

  if (value.startsWith("replace-with-strong-secret")) {
    errors.push(`${key} must be replaced with a strong random secret`);
  }

  return value;
};

const validateMongoUri = (key: string): string => {
  const value = getRequired(key);

  if (value && !/^mongodb(\+srv)?:\/\//.test(value)) {
    errors.push(`${key} must be a valid MongoDB connection string`);
  }

  return value;
};

const validateUrl = (key: string): string => {
  const value = getRequired(key);

  if (!value) return value;

  try {
    new URL(value);
  } catch {
    errors.push(`${key} must be a valid URL`);
  }

  return value;
};

const validateBooleanString = (key: string): boolean => {
  const rawValue = getRequired(key);

  if (!rawValue) return false;

  const value = rawValue.toLowerCase();

  if (!booleanStrings.includes(value as (typeof booleanStrings)[number])) {
    errors.push(`${key} must be either "true" or "false"`);
    return false;
  }

  return value === "true";
};

const validateSameSite = (key: string): CookieSameSite => {
  const rawValue = getRequired(key);

  if (!rawValue) return "lax";

  const value = rawValue.toLowerCase();

  if (!sameSiteValues.includes(value as CookieSameSite)) {
    errors.push(`${key} must be one of: lax, strict, none`);
    return "lax";
  }

  return value as CookieSameSite;
};

const validatePort = (key: string): number => {
  const value = getRequired(key);

  if (!value) return 4000;

  const port = Number(value);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    errors.push(`${key} must be an integer between 1 and 65535`);
    return 4000;
  }

  return port;
};

const jwtAccessSecret = validateSecret("JWT_ACCESS_SECRET");
const jwtRefreshSecret = validateSecret("JWT_REFRESH_SECRET");
const mongodbUri = validateMongoUri("MONGODB_URI");
const clientUrl = validateUrl("CLIENT_URL");
const cookieSecure = validateBooleanString("COOKIE_SECURE");
const cookieSameSite = validateSameSite("COOKIE_SAME_SITE");
const nodeEnv = getRequired("NODE_ENV");
const port = validatePort("PORT");
const adminEmail = process.env.ADMIN_EMAIL || "admin@kairova.com";
const adminPassword = process.env.ADMIN_PASSWORD || "Kairova@Admin2026";
const adminName = process.env.ADMIN_NAME || "Kairova Admin";
const adminPhone = process.env.ADMIN_PHONE || "01000000000";
const cloudinaryCloudName = process.env.CLOUDINARY_CLOUD_NAME || "";
const cloudinaryApiKey = process.env.CLOUDINARY_API_KEY || "";
const cloudinaryApiSecret = process.env.CLOUDINARY_API_SECRET || "";
const cloudinaryUploadPreset =
  process.env.CLOUDINARY_UPLOAD_PRESET || "kairova_products";

if (
  jwtAccessSecret &&
  jwtRefreshSecret &&
  jwtAccessSecret === jwtRefreshSecret
) {
  errors.push("JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be different");
}

if (errors.length > 0) {
  throw new AppError(
    `Invalid environment configuration: ${errors.join("; ")}`,
    500,
  );
}

export const env = {
  jwtAccessSecret,
  jwtRefreshSecret,
  mongodbUri,
  clientUrl,
  cookieSecure,
  cookieSameSite,
  nodeEnv,
  port,
  adminEmail,
  adminPassword,
  adminName,
  adminPhone,
  cloudinaryCloudName,
  cloudinaryApiKey,
  cloudinaryApiSecret,
  cloudinaryUploadPreset,
} as const;
