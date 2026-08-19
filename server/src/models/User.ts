import crypto from "node:crypto";

import bcrypt from "bcryptjs";
import { Schema, model, Document, type Model } from "mongoose";

export interface IAddress {
  label: string;
  street: string;
  city: string;
  governorate: string;
  phone: string;
  isDefault: boolean;
}

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: "customer" | "admin";
  phone: string;
  addresses: IAddress[];
  refreshTokenHash: string | null;
  createdAt: Date;
  updatedAt: Date;

  comparePassword(candidate: string): Promise<boolean>;
  compareRefreshToken(candidate: string): Promise<boolean>;
  hashRefreshToken(token: string): string;
}

type UserModel = Model<IUser>;

const addressSchema = new Schema<IAddress>(
  {
    label: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    governorate: { type: String, required: true },
    phone: { type: String, required: true },
    isDefault: { type: Boolean, default: false },
  },
  { _id: false },
);

const userSchema = new Schema<IUser, UserModel>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },
    role: {
      type: String,
      enum: ["customer", "admin"],
      default: "customer",
      required: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    addresses: [addressSchema],
    refreshTokenHash: {
      type: String,
      default: null,
      select: false,
    },
  },
  { timestamps: true },
);

userSchema.pre("save", async function hashPassword() {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = async function comparePassword(
  candidate: string,
) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.hashRefreshToken = function hashRefreshToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
};

userSchema.methods.compareRefreshToken = async function compareRefreshToken(
  candidate: string,
) {
  if (!this.refreshTokenHash) return false;

  const hash = this.hashRefreshToken(candidate);

  if (hash.length !== this.refreshTokenHash.length) return false;

  return crypto.timingSafeEqual(
    Buffer.from(hash),
    Buffer.from(this.refreshTokenHash),
  );
};

export const User = model<IUser, UserModel>("User", userSchema);

export default User;
