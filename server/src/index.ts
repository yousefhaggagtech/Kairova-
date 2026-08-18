import "dotenv/config";

import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Request, Response } from "express";
import helmet from "helmet";
import { fileURLToPath } from "node:url";

const app = express();
const port = Number(process.env.PORT) || 4000;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({ status: "ok" });
});

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}

export default app;
