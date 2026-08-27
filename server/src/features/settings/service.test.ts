import express from "express";
import request from "supertest";

import globalErrorHandler from "../../middleware/globalErrorHandler.js";
import Settings from "../../models/Settings.js";
import { getPublicSettingsController } from "./publicController.js";
import { getSettings, updateSettings } from "./service.js";

const createTestApp = () => {
  const testApp = express();

  testApp.use(express.json());
  testApp.get("/api/settings", getPublicSettingsController);
  testApp.use(globalErrorHandler);

  return testApp;
};

const app = createTestApp();

describe("settings service", () => {
  it("getSettings creates default if none exists", async () => {
    const settings = await getSettings();

    expect(settings.depositPercentage).toBe(50);
    expect(settings.walletNumber).toBe("");
    expect(settings.vodafoneCashNumber).toBe("");
    expect(settings.whatsappNumber).toBe("");
  });

  it("getSettings returns same instance on second call", async () => {
    const firstSettings = await getSettings();
    firstSettings.walletNumber = "01000000000";
    await firstSettings.save();

    const secondSettings = await getSettings();

    expect(secondSettings._id.toString()).toBe(firstSettings._id.toString());
    expect(secondSettings.walletNumber).toBe("01000000000");
  });

  it("updateSettings modifies business config fields", async () => {
    const settings = await updateSettings({
      depositPercentage: 40,
      walletNumber: "01000000000",
      whatsappNumber: "201234567890",
    });

    expect(settings.depositPercentage).toBe(40);
    expect(settings.walletNumber).toBe("01000000000");
    expect(settings.whatsappNumber).toBe("201234567890");
  });

  it("updateSettings does not modify J&T fields even if passed", async () => {
    const existingSettings = await Settings.create({
      depositPercentage: 50,
      walletNumber: "01000000000",
      vodafoneCashNumber: "01000000001",
      whatsappNumber: "201000000000",
      jtApiUrl: "https://jt.example.com",
      jtUsername: "jt-user",
      jtApiKey: "jt-secret",
    });

    await updateSettings({
      depositPercentage: 35,
      walletNumber: "01111111111",
      whatsappNumber: "201111111111",
      jtApiUrl: "https://malicious.example.com",
      jtUsername: "malicious-user",
      jtApiKey: "malicious-secret",
    } as unknown as Parameters<typeof updateSettings>[0]);

    const storedSettings = await Settings.findById(existingSettings._id);

    expect(storedSettings?.depositPercentage).toBe(35);
    expect(storedSettings?.walletNumber).toBe("01111111111");
    expect(storedSettings?.whatsappNumber).toBe("201111111111");
    expect(storedSettings?.jtApiUrl).toBe("https://jt.example.com");
    expect(storedSettings?.jtUsername).toBe("jt-user");
    expect(storedSettings?.jtApiKey).toBe("jt-secret");
  });

  it("getPublicSettingsController returns only public fields", async () => {
    await Settings.create({
      depositPercentage: 45,
      walletNumber: "01000000000",
      vodafoneCashNumber: "01000000001",
      whatsappNumber: "201234567890",
      jtApiUrl: "https://jt.example.com",
      jtUsername: "jt-user",
      jtApiKey: "jt-secret",
    });

    const response = await request(app).get("/api/settings").expect(200);

    expect(response.body.data.settings).toEqual({
      depositPercentage: 45,
      walletNumber: "01000000000",
      vodafoneCashNumber: "01000000001",
      whatsappNumber: "201234567890",
    });
    expect(response.body.data.settings).not.toHaveProperty("jtApiUrl");
    expect(response.body.data.settings).not.toHaveProperty("jtUsername");
    expect(response.body.data.settings).not.toHaveProperty("jtApiKey");
  });
});
