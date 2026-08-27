import { Router } from "express";

import { validate } from "../../middleware/validate.js";
import { protect, restrictTo } from "../auth/middleware.js";
import {
  getSettingsController,
  updateSettingsController,
} from "./controller.js";
import { updateSettingsSchema } from "./validation.js";

const router = Router();

router.use(protect);
router.use(restrictTo("admin"));

router.get("/", getSettingsController);
router.patch("/", validate(updateSettingsSchema), updateSettingsController);

export default router;
