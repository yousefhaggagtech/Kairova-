import "dotenv/config";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { fileURLToPath } from "node:url";
import connectDB from "./config/db.js";
import categoryRoutes from "./features/categories/routes.js";
import globalErrorHandler from "./middleware/globalErrorHandler.js";
import notFoundHandler from "./middleware/notFoundHandler.js";
const app = express();
const port = Number(process.env.PORT) || 4000;
const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";
app.use(helmet());
app.use(cors({
    origin: clientUrl,
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
});
app.use("/api/categories", categoryRoutes);
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
