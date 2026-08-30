"use client";

import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";

import type { ApiResponse } from "@/domain/entities/api";
import apiClient from "@/infrastructure/http/apiClient";

interface UploadSignature {
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

interface UploadResult {
  url: string;
  publicId: string;
  width?: number;
  height?: number;
  format?: string;
  bytes?: number;
}

interface CloudinaryUploadResponse {
  secure_url?: string;
  public_id?: string;
  width?: number;
  height?: number;
  format?: string;
  bytes?: number;
  error?: {
    message?: string;
  };
}

const signedUploadParamKeys = [
  "folder",
  "upload_preset",
  "timestamp",
  "transformation",
  "format",
] as const;

type SignedUploadParamKey = (typeof signedUploadParamKeys)[number];

function getSignedUploadParams(
  signatureData: UploadSignature,
): Record<SignedUploadParamKey, string | number | undefined> {
  return {
    folder: signatureData.folder,
    upload_preset: signatureData.uploadPreset,
    timestamp: signatureData.timestamp,
    transformation: signatureData.transformation,
    format: signatureData.format,
  };
}

export function useImageUpload(signUrl = "/api/admin/uploads/sign") {
  const t = useTranslations("uploads");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback(async (file: File): Promise<UploadResult | null> => {
    setUploading(true);
    setError(null);

    try {
      if (!file.type.startsWith("image/")) {
        throw new Error(t("fileMustBeImage"));
      }

      if (file.size > 5 * 1024 * 1024) {
        throw new Error(t("fileMustBeUnder5MB"));
      }

      const sigResponse = await apiClient.get<ApiResponse<UploadSignature>>(
        signUrl,
      );
      const signatureData = sigResponse.data.data;

      if (!signatureData) {
        throw new Error(t("emptySignature"));
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", signatureData.apiKey);
      formData.append("signature", signatureData.signature);

      const signedUploadParams = getSignedUploadParams(signatureData);

      signedUploadParamKeys.forEach((key) => {
        const value = signedUploadParams[key];

        if (value !== undefined && value !== "") {
          formData.append(key, String(value));
        }
      });

      const cloudinaryResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${encodeURIComponent(
          signatureData.cloudName,
        )}/image/upload`,
        { method: "POST", body: formData },
      );
      const data =
        (await cloudinaryResponse
          .json()
          .catch(() => ({}))) as CloudinaryUploadResponse;

      if (!cloudinaryResponse.ok) {
        throw new Error(data.error?.message || t("cloudinaryUploadFailed"));
      }

      if (!data.secure_url || !data.public_id) {
        throw new Error(t("missingImageData"));
      }

      const longestUploadedEdge = Math.max(data.width ?? 0, data.height ?? 0);

      if (
        signatureData.maxImageDimension &&
        longestUploadedEdge > signatureData.maxImageDimension
      ) {
        throw new Error(t("exceededConfiguredDimensions"));
      }

      return {
        url: data.secure_url,
        publicId: data.public_id,
        width: data.width,
        height: data.height,
        format: data.format,
        bytes: data.bytes,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : t("uploadFailed");
      setError(message);
      return null;
    } finally {
      setUploading(false);
    }
  }, [signUrl, t]);

  return { upload, uploading, error };
}
