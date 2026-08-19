import { existsSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { MongoMemoryServer } from "mongodb-memory-server";

const localMongoBinary = "C:\\Program Files\\MongoDB\\Server\\7.0\\bin\\mongod.exe";
const localMongoVersion = "7.0.12";
const mongoUriFile = join(tmpdir(), "kairova-jest-mongodb-uri");

type TestGlobal = typeof globalThis & {
  __MONGO_SERVER__?: MongoMemoryServer;
};

const getMongoMemoryServerOptions = () => {
  const systemBinary = process.env.MONGOMS_SYSTEM_BINARY;

  if (systemBinary) {
    return { binary: { systemBinary } };
  }

  if (process.platform === "win32" && existsSync(localMongoBinary)) {
    return {
      binary: {
        systemBinary: localMongoBinary,
        version: localMongoVersion,
      },
    };
  }

  return {};
};

export default async function globalSetup() {
  const mongoServer = await MongoMemoryServer.create(
    getMongoMemoryServerOptions(),
  );

  (globalThis as TestGlobal).__MONGO_SERVER__ = mongoServer;
  process.env.MONGODB_URI = mongoServer.getUri();
  await writeFile(mongoUriFile, mongoServer.getUri(), "utf8");
}
