import { v2 as cloudinary } from "cloudinary";

import { env } from "../../config/env.js";

cloudinary.config({
  cloud_name: env.cloudinaryCloudName,
  api_key: env.cloudinaryApiKey,
  api_secret: env.cloudinaryApiSecret,
  secure: true,
});

interface UploadSignatureResponse {
  signature: string;
  timestamp: number;
  cloudName: string;
  apiKey: string;
  uploadPreset: string;
  folder: string;
}

const hasCloudinaryCredentials = (): boolean =>
  Boolean(
    env.cloudinaryCloudName &&
      env.cloudinaryApiKey &&
      env.cloudinaryApiSecret,
  );

export function generateUploadSignature(
  folder = "kairova/products",
): UploadSignatureResponse {
  const timestamp = Math.round(Date.now() / 1000);
  const paramsToSign = {
    folder,
    timestamp,
    upload_preset: env.cloudinaryUploadPreset,
  };

  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    env.cloudinaryApiSecret,
  );

  return {
    signature,
    timestamp,
    cloudName: env.cloudinaryCloudName,
    apiKey: env.cloudinaryApiKey,
    uploadPreset: env.cloudinaryUploadPreset,
    folder,
  };
}

export async function deleteImage(
  publicId: string,
): Promise<{ result: string }> {
  if (!publicId || !hasCloudinaryCredentials()) {
    return { result: "error" };
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return { result: String(result.result ?? "error") };
  } catch (err) {
    console.error("Cloudinary delete failed:", err);
    return { result: "error" };
  }
}
