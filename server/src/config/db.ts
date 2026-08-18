import mongoose from "mongoose";

import AppError from "../utils/AppError.js";

const getMongoHosts = (uri: string): string => {
  const protocolEnd = uri.indexOf("://");
  const authorityStart = protocolEnd === -1 ? 0 : protocolEnd + 3;
  const authorityEndCandidates = [
    uri.indexOf("/", authorityStart),
    uri.indexOf("?", authorityStart),
    uri.indexOf("#", authorityStart),
  ].filter((index) => index !== -1);
  const authorityEnd =
    authorityEndCandidates.length > 0
      ? Math.min(...authorityEndCandidates)
      : uri.length;
  const authority = uri.slice(authorityStart, authorityEnd);
  const credentialsEnd = authority.lastIndexOf("@");
  const hosts =
    credentialsEnd === -1 ? authority : authority.slice(credentialsEnd + 1);

  return hosts ? "connected" : "unknown host";
};

export default async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new AppError("MONGODB_URI is not set", 500);
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      dbName: "kairova",
    });

    console.log(`MongoDB connected: ${getMongoHosts(uri)}`);

    return mongoose.connection;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    throw new AppError(`MongoDB connection failed: ${message}`, 500);
  }
}
