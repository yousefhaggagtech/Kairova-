import { rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import type { MongoMemoryServer } from "mongodb-memory-server";

type TestGlobal = typeof globalThis & {
  __MONGO_SERVER__?: MongoMemoryServer;
};

const mongoUriFile = join(tmpdir(), "kairova-jest-mongodb-uri");

export default async function globalTeardown() {
  await (globalThis as TestGlobal).__MONGO_SERVER__?.stop();
  await rm(mongoUriFile, { force: true });
}
