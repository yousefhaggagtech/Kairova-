import jwt from "jsonwebtoken";

import { env } from "../../config/env.js";

export function signAccessToken(userId: string, role: string): string {
  return jwt.sign({ id: userId, role }, env.jwtAccessSecret, {
    expiresIn: "15m",
  });
}

export function signRefreshToken(userId: string): string {
  return jwt.sign({ id: userId }, env.jwtRefreshSecret, {
    expiresIn: "14d",
  });
}

export function verifyAccessToken(token: string): { id: string; role: string } {
  return jwt.verify(token, env.jwtAccessSecret) as {
    id: string;
    role: string;
  };
}

export function verifyRefreshToken(token: string): { id: string } {
  return jwt.verify(token, env.jwtRefreshSecret) as { id: string };
}
