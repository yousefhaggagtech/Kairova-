import { Router } from "express";
import { createCategoryController, deleteCategoryController, getCategoryBySlugController, getCategoryController, listCategoriesController, updateCategoryController, } from "./controller.js";
const router = Router();
router.get("/", listCategoriesController);
router.get("/slug/:slug", getCategoryBySlugController);
router.get("/:id", getCategoryController);
// TODO: add protect + restrictTo('admin') middleware
router.post("/", createCategoryController);
// TODO: add protect + restrictTo('admin') middleware
router.patch("/:id", updateCategoryController);
// TODO: add protect + restrictTo('admin') middleware
router.delete("/:id", deleteCategoryController);
export default router;
