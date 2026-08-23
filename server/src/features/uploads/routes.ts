import { Router } from "express";

import { protect, restrictTo } from "../auth/middleware.js";
import { getUploadSignatureController } from "./controller.js";

const router = Router();

router.use(protect);
router.use(restrictTo("admin"));

router.get("/sign", getUploadSignatureController);

export default router;
