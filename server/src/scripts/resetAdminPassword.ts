import mongoose from "mongoose";

import { connectDB } from "../config/db.js";
import { env } from "../config/env.js";
import User from "../models/User.js";

const getNewPassword = (): string => {
  const password = process.env.RESET_ADMIN_PASSWORD ?? process.argv[2];

  if (!password) {
    throw new Error(
      "Provide the new password with RESET_ADMIN_PASSWORD or as the first argument.",
    );
  }

  if (password.length < 8) {
    throw new Error("Admin password must be at least 8 characters.");
  }

  return password;
};

async function resetAdminPassword(): Promise<number> {
  try {
    const password = getNewPassword();

    await connectDB();

    const admin = await User.findOne({
      email: env.adminEmail,
      role: "admin",
    }).select("+password +refreshTokenHash");

    if (!admin) {
      console.error(`No admin user found for ${env.adminEmail}.`);
      return 1;
    }

    admin.password = password;
    admin.refreshTokenHash = null;

    await admin.save({ validateBeforeSave: false });

    console.log(`Admin password reset successfully for ${admin.email}.`);
    console.log("Existing refresh sessions were revoked.");

    return 0;
  } catch (err) {
    console.error("Failed to reset admin password:", err);
    return 1;
  } finally {
    await mongoose.disconnect();
  }
}

const exitCode = await resetAdminPassword();
process.exit(exitCode);
