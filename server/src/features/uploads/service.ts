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
  transformation?: string;
  format?: string;
  maxImageDimension?: number;
}

interface UploadSignatureOptions {
  folder?: string;
  optimizeProductImage?: boolean;
}

const PRODUCT_IMAGE_FOLDER = "kairova/products";
export const PRODUCT_IMAGE_MAX_EDGE = 1500;
export const PRODUCT_IMAGE_BASE_FORMAT = "webp";
export const PRODUCT_IMAGE_UPLOAD_TRANSFORMATION = [
  "c_limit",
  `w_${PRODUCT_IMAGE_MAX_EDGE}`,
  `h_${PRODUCT_IMAGE_MAX_EDGE}`,
  "q_auto:good",
].join(",");

const hasCloudinaryCredentials = (): boolean =>
  Boolean(
    env.cloudinaryCloudName &&
      env.cloudinaryApiKey &&
      env.cloudinaryApiSecret,
  );

export function generateUploadSignature(
  folderOrOptions: string | UploadSignatureOptions = {},
): UploadSignatureResponse {
  const options =
    typeof folderOrOptions === "string"
      ? { folder: folderOrOptions }
      : folderOrOptions;
  const folder = options.folder ?? PRODUCT_IMAGE_FOLDER;
  const shouldOptimizeProductImage =
    options.optimizeProductImage ?? folder === PRODUCT_IMAGE_FOLDER;
  const timestamp = Math.round(Date.now() / 1000);
  const paramsToSign: Record<string, string | number> = {
    folder,
    timestamp,
    upload_preset: env.cloudinaryUploadPreset,
  };

  if (shouldOptimizeProductImage) {
    paramsToSign.transformation = PRODUCT_IMAGE_UPLOAD_TRANSFORMATION;
    paramsToSign.format = PRODUCT_IMAGE_BASE_FORMAT;
  }

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
    ...(shouldOptimizeProductImage
      ? {
          transformation: PRODUCT_IMAGE_UPLOAD_TRANSFORMATION,
          format: PRODUCT_IMAGE_BASE_FORMAT,
          maxImageDimension: PRODUCT_IMAGE_MAX_EDGE,
        }
      : {}),
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
