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

const router = Router();

router.get("/", listProductsController);
router.get("/slug/:slug", getProductBySlugController);
router.get("/:id", getProductController);

// TODO: add auth middleware
router.post("/", createProductController);
// TODO: add auth middleware
router.patch("/:id", updateProductController);
// TODO: add auth middleware
router.delete("/:id", deleteProductController);
// TODO: add auth middleware
router.post("/:id/images", addImageController);
// TODO: add auth middleware
router.delete("/:productId/images/:imageId", removeImageController);
// TODO: add auth middleware
router.patch(
  "/:productId/images/:imageId/primary",
  setPrimaryImageController,
);

export default router;
