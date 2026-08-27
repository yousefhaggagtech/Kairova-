import { Router } from "express";

import { getPublicSettingsController } from "./publicController.js";

const router = Router();

router.get("/", getPublicSettingsController);

export default router;
