import { Router } from "express";

import {
  addImageController,
  createProductController,
  deleteProductController,
  getProductBySlugController,
  getProductController,
  listProductsController,
  removeImageController,
  setPrimaryImageController,
  updateProductController,
} from "./controller.js";
import { protect, restrictTo } from "../auth/middleware.js";

const router = Router();
export const adminRouter = Router();

router.get("/", listProductsController);
router.get("/slug/:slug", getProductBySlugController);
router.get("/:id", getProductController);

router.post("/", protect, restrictTo("admin"), createProductController);
router.patch("/:id", protect, restrictTo("admin"), updateProductController);
router.delete("/:id", protect, restrictTo("admin"), deleteProductController);
router.post("/:id/images", protect, restrictTo("admin"), addImageController);
router.delete(
  "/:productId/images/:imageId",
  protect,
  restrictTo("admin"),
  removeImageController,
);
router.patch(
  "/:productId/images/:imageId/primary",
  protect,
  restrictTo("admin"),
  setPrimaryImageController,
);

adminRouter.use(protect);
adminRouter.use(restrictTo("admin"));
adminRouter.post("/", createProductController);
adminRouter.patch("/:id", updateProductController);
adminRouter.delete("/:id", deleteProductController);

export default router;
