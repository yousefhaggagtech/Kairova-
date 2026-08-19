import { Router } from "express";

import {
  createCategoryController,
  deleteCategoryController,
  getCategoryBySlugController,
  getCategoryController,
  listCategoriesController,
  updateCategoryController,
} from "./controller.js";
import { protect, restrictTo } from "../auth/middleware.js";

const router = Router();

router.get("/", listCategoriesController);
router.get("/slug/:slug", getCategoryBySlugController);
router.get("/:id", getCategoryController);

router.post("/", protect, restrictTo("admin"), createCategoryController);
router.patch("/:id", protect, restrictTo("admin"), updateCategoryController);
router.delete("/:id", protect, restrictTo("admin"), deleteCategoryController);

export default router;
