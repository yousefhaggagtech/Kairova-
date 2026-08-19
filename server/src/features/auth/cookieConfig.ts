import type { CookieOptions } from "express";

import { env } from "../../config/env.js";

export function accessTokenCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: env.cookieSecure,
    sameSite: env.cookieSameSite,
    path: "/",
    maxAge: 15 * 60 * 1000,
  };
}

export function refreshTokenCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: env.cookieSecure,
    sameSite: env.cookieSameSite,
    path: "/api/auth",
    maxAge: 14 * 24 * 60 * 60 * 1000,
  };
}

export function clearCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: env.cookieSecure,
    sameSite: env.cookieSameSite,
    path: "/api/auth",
  };
}
