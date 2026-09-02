const mongoose = require("mongoose");
const { existsSync, readFileSync } = require("node:fs");
const { tmpdir } = require("node:os");
const { join } = require("node:path");

const mongoUriFile = join(tmpdir(), "kairova-jest-mongodb-uri");

jest.setTimeout(300_000);

process.env.NODE_ENV ??= "test";
process.env.PORT ??= "4000";
process.env.CLIENT_URL ??= "http://localhost:3000";
process.env.JWT_ACCESS_SECRET ??=
  "test-access-secret-that-is-at-least-thirty-two-chars";
process.env.JWT_REFRESH_SECRET ??=
  "test-refresh-secret-that-is-at-least-thirty-two-chars";
process.env.COOKIE_SECURE ??= "false";
process.env.COOKIE_SAME_SITE ??= "lax";
process.env.MONGODB_URI ??= "mongodb://127.0.0.1:27017/kairova-test";

const getMongoUri = () => {
  if (existsSync(mongoUriFile)) {
    return readFileSync(mongoUriFile, "utf8").trim();
  }

  return process.env.MONGODB_URI;
};

const getMongoDbName = () => {
  return `kairova-test-${process.env.JEST_WORKER_ID ?? "1"}`;
};

const needsMongo = () => {
  const testPath = expect.getState().testPath ?? "";

  return (
    testPath.includes("features/auth/controller.test") ||
    testPath.includes("features\\auth\\controller.test") ||
    testPath.includes("features/products/service.test") ||
    testPath.includes("features\\products\\service.test") ||
    testPath.includes("scripts/seedFeaturedProducts.test") ||
    testPath.includes("scripts\\seedFeaturedProducts.test") ||
    testPath.includes("features/orders/controller.test") ||
    testPath.includes("features\\orders\\controller.test") ||
    testPath.includes("features/orders/service.test") ||
    testPath.includes("features\\orders\\service.test") ||
    testPath.includes("features/settings/service.test") ||
    testPath.includes("features\\settings\\service.test") ||
    testPath.includes("models/Order.test") ||
    testPath.includes("models\\Order.test")
  );
};

beforeAll(async () => {
  if (!needsMongo()) return;

  if (mongoose.connection.readyState === 0) {
    const mongoUri = getMongoUri();

    if (!mongoUri) {
      throw new Error("MONGODB_URI must be set for tests");
    }

    await mongoose.connect(mongoUri, {
      dbName: getMongoDbName(),
    });
  }
});

beforeEach(async () => {
  if (!needsMongo() || mongoose.connection.readyState !== 1) return;

  const collections = Object.values(
    mongoose.connection.collections,
  ) as Array<{ deleteMany(filter: Record<string, never>): Promise<unknown> }>;

  await Promise.all(
    collections.map((collection) => collection.deleteMany({})),
  );
});

afterAll(async () => {
  if (!needsMongo() || mongoose.connection.readyState === 0) return;

  await mongoose.disconnect();
});
