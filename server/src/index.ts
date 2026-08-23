import { env } from "./config/env.js";

import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Request, Response } from "express";
import helmet from "helmet";
import { fileURLToPath } from "node:url";

import connectDB from "./config/db.js";
import authRoutes from "./features/auth/routes.js";
import categoryRoutes from "./features/categories/routes.js";
import {
  adminRouter as adminOrdersRouter,
  customerRouter as customerOrdersRouter,
} from "./features/orders/routes.js";
import productRoutes from "./features/products/routes.js";
import uploadRoutes from "./features/uploads/routes.js";
import globalErrorHandler from "./middleware/globalErrorHandler.js";
import notFoundHandler from "./middleware/notFoundHandler.js";

const app = express();
const port = env.port;
const clientUrl = env.clientUrl;

app.use(helmet());
app.use(
  cors({
    origin: clientUrl,
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/orders", customerOrdersRouter);
app.use("/api/admin/orders", adminOrdersRouter);
app.use("/api/admin/uploads", uploadRoutes);

app.use(notFoundHandler);
app.use(globalErrorHandler);

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  connectDB()
    .then(() => {
      app.listen(port, () => {
        console.log(`Server listening on port ${port}`);
      });
    })
    .catch((err) => {
      console.error("Failed to start server:", err);
      process.exit(1);
    });
}

export default app;
