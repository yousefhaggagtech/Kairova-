import { v2 as cloudinary } from "cloudinary";

import { env } from "../../config/env.js";
import {
  PRODUCT_IMAGE_BASE_FORMAT,
  PRODUCT_IMAGE_MAX_EDGE,
  PRODUCT_IMAGE_UPLOAD_TRANSFORMATION,
  deleteImage,
  generateUploadSignature,
} from "./service.js";

type MutableCloudinaryEnv = {
  cloudinaryCloudName: string;
  cloudinaryApiKey: string;
  cloudinaryApiSecret: string;
  cloudinaryUploadPreset: string;
};

const mutableEnv = env as unknown as MutableCloudinaryEnv;
const originalCloudinaryEnv: MutableCloudinaryEnv = {
  cloudinaryCloudName: env.cloudinaryCloudName,
  cloudinaryApiKey: env.cloudinaryApiKey,
  cloudinaryApiSecret: env.cloudinaryApiSecret,
  cloudinaryUploadPreset: env.cloudinaryUploadPreset,
};

const setTestCloudinaryEnv = (): void => {
  mutableEnv.cloudinaryCloudName = "test-cloud";
  mutableEnv.cloudinaryApiKey = "test-api-key";
  mutableEnv.cloudinaryApiSecret = "test-api-secret";
  mutableEnv.cloudinaryUploadPreset = "test-upload-preset";
};

describe("uploads service", () => {
  beforeEach(() => {
    setTestCloudinaryEnv();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    Object.assign(mutableEnv, originalCloudinaryEnv);
  });

  describe("generateUploadSignature", () => {
    it("returns the required signature fields", () => {
      const signSpy = jest.spyOn(cloudinary.utils, "api_sign_request");
      const result = generateUploadSignature();

      expect(result).toMatchObject({
        cloudName: env.cloudinaryCloudName,
        apiKey: env.cloudinaryApiKey,
        uploadPreset: env.cloudinaryUploadPreset,
        folder: "kairova/products",
        transformation: PRODUCT_IMAGE_UPLOAD_TRANSFORMATION,
        format: PRODUCT_IMAGE_BASE_FORMAT,
        maxImageDimension: PRODUCT_IMAGE_MAX_EDGE,
      });
      expect(result.signature).toEqual(expect.any(String));
      expect(result.signature.length).toBeGreaterThan(0);
      expect(result.timestamp).toEqual(expect.any(Number));
      expect(result.timestamp).toBeGreaterThan(0);
      expect(signSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          folder: "kairova/products",
          upload_preset: env.cloudinaryUploadPreset,
          transformation: PRODUCT_IMAGE_UPLOAD_TRANSFORMATION,
          format: PRODUCT_IMAGE_BASE_FORMAT,
        }),
        env.cloudinaryApiSecret,
      );
    });

    it("does not apply product image optimization to non-product folders", () => {
      const signSpy = jest.spyOn(cloudinary.utils, "api_sign_request");
      const result = generateUploadSignature("kairova/payment-proofs");

      expect(result).toMatchObject({
        folder: "kairova/payment-proofs",
      });
      expect(result.transformation).toBeUndefined();
      expect(result.format).toBeUndefined();
      expect(result.maxImageDimension).toBeUndefined();
      expect(signSpy).toHaveBeenCalledWith(
        expect.not.objectContaining({
          transformation: expect.any(String),
          format: expect.any(String),
        }),
        env.cloudinaryApiSecret,
      );
    });
  });

  describe("deleteImage", () => {
    it("returns error on invalid publicId without throwing", async () => {
      const destroySpy = jest.spyOn(cloudinary.uploader, "destroy");

      await expect(deleteImage("")).resolves.toEqual({ result: "error" });
      expect(destroySpy).not.toHaveBeenCalled();
    });

    it("handles Cloudinary errors gracefully", async () => {
      const destroySpy = jest
        .spyOn(cloudinary.uploader, "destroy")
        .mockRejectedValue(new Error("delete failed"));
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => undefined);

      await expect(deleteImage("products/missing")).resolves.toEqual({
        result: "error",
      });
      expect(destroySpy).toHaveBeenCalledWith("products/missing");
      expect(consoleSpy).toHaveBeenCalled();
    });
  });
});
