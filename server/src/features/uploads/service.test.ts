import { v2 as cloudinary } from "cloudinary";

import { env } from "../../config/env.js";
import { deleteImage, generateUploadSignature } from "./service.js";

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
      const result = generateUploadSignature();

      expect(result).toMatchObject({
        cloudName: env.cloudinaryCloudName,
        apiKey: env.cloudinaryApiKey,
        uploadPreset: env.cloudinaryUploadPreset,
        folder: "kairova/products",
      });
      expect(result.signature).toEqual(expect.any(String));
      expect(result.signature.length).toBeGreaterThan(0);
      expect(result.timestamp).toEqual(expect.any(Number));
      expect(result.timestamp).toBeGreaterThan(0);
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
