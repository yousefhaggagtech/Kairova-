"use client";

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
}

interface UploadResult {
  url: string;
  publicId: string;
}

interface CloudinaryUploadResponse {
  secure_url?: string;
  public_id?: string;
  error?: {
    message?: string;
  };
}

export function useImageUpload(signUrl = "/api/admin/uploads/sign") {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback(async (file: File): Promise<UploadResult | null> => {
    setUploading(true);
    setError(null);

    try {
      if (!file.type.startsWith("image/")) {
        throw new Error("File must be an image");
      }

      if (file.size > 5 * 1024 * 1024) {
        throw new Error("File must be under 5MB");
      }

      const sigResponse = await apiClient.get<ApiResponse<UploadSignature>>(
        signUrl,
      );
      const signatureData = sigResponse.data.data;

      if (!signatureData) {
        throw new Error("Upload signature response was empty");
      }

      const {
        signature,
        timestamp,
        cloudName,
        apiKey,
        uploadPreset,
        folder,
      } = signatureData;

      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", apiKey);
      formData.append("timestamp", String(timestamp));
      formData.append("signature", signature);
      formData.append("upload_preset", uploadPreset);
      formData.append("folder", folder);

      const cloudinaryResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${encodeURIComponent(
          cloudName,
        )}/image/upload`,
        { method: "POST", body: formData },
      );
      const data =
        (await cloudinaryResponse
          .json()
          .catch(() => ({}))) as CloudinaryUploadResponse;

      if (!cloudinaryResponse.ok) {
        throw new Error(data.error?.message || "Cloudinary upload failed");
      }

      if (!data.secure_url || !data.public_id) {
        throw new Error("Cloudinary upload response missing image data");
      }

      return {
        url: data.secure_url,
        publicId: data.public_id,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed";
      setError(message);
      return null;
    } finally {
      setUploading(false);
    }
  }, [signUrl]);

  return { upload, uploading, error };
}
