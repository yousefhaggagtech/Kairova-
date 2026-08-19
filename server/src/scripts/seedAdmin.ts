import mongoose from "mongoose";

import "../config/env.js";
import { connectDB } from "../config/db.js";
import { env } from "../config/env.js";
import User from "../models/User.js";

async function seedAdmin(): Promise<number> {
  try {
    await connectDB();

    const existing = await User.findOne({
      email: env.adminEmail,
      role: "admin",
    });

    if (existing) {
      console.log(`Admin already exists: ${existing.email}, skipping`);
      return 0;
    }

    const admin = await User.create({
      name: env.adminName,
      email: env.adminEmail,
      password: env.adminPassword,
      phone: env.adminPhone,
      role: "admin",
    });

    console.log("Admin created successfully:");
    console.log(`  Email: ${admin.email}`);
    console.log(`  Name: ${admin.name}`);
    console.log(`  ID: ${admin._id}`);
    console.log(
      "\n  Default password is set in env. Change it after first login in production.",
    );

    return 0;
  } catch (err) {
    console.error("Failed to seed admin:", err);
    return 1;
  } finally {
    await mongoose.disconnect();
  }
}

const exitCode = await seedAdmin();
process.exit(exitCode);
