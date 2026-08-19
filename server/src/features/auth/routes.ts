import { Router } from "express";

import { validate } from "../../middleware/validate.js";
import {
  getMeController,
  loginController,
  logoutController,
  refreshController,
  registerController,
} from "./controller.js";
import { protect } from "./middleware.js";
import { loginSchema, registerSchema } from "./validation.js";

const router = Router();

router.post("/register", validate(registerSchema), registerController);
router.post("/login", validate(loginSchema), loginController);
router.post("/refresh", refreshController);
router.post("/logout", logoutController);
router.get("/me", protect, getMeController);

export default router;
