import { Router } from "express";

import { validate } from "../../middleware/validate.js";
import { protect, restrictTo } from "../auth/middleware.js";
import {
  addPaymentProofController,
  cancelOrderController,
  confirmDepositController,
  confirmPaymentController,
  createOrderController,
  getMyOrderByIdController,
  getMyOrdersController,
  getOrderByIdController,
  listAllOrdersController,
  markPackedController,
  shipOrderController,
} from "./controller.js";
import {
  addPaymentProofSchema,
  cancelOrderSchema,
  createOrderSchema,
  orderFiltersSchema,
  shipOrderSchema,
} from "./validation.js";

export const customerRouter = Router();

customerRouter.use(protect);
customerRouter.post("/", validate(createOrderSchema), createOrderController);
customerRouter.get("/me", getMyOrdersController);
customerRouter.post(
  "/:id/payment-proofs",
  validate(addPaymentProofSchema),
  addPaymentProofController,
);
customerRouter.get("/:id", getMyOrderByIdController);

export const adminRouter = Router();

adminRouter.use(protect);
adminRouter.use(restrictTo("admin"));
adminRouter.get(
  "/",
  validate(orderFiltersSchema, "query"),
  listAllOrdersController,
);
adminRouter.get("/:id", getOrderByIdController);
adminRouter.post("/:id/confirm-deposit", confirmDepositController);
adminRouter.post("/:id/mark-packed", markPackedController);
adminRouter.post("/:id/confirm-payment", confirmPaymentController);
adminRouter.post("/:id/ship", validate(shipOrderSchema), shipOrderController);
adminRouter.post(
  "/:id/cancel",
  validate(cancelOrderSchema),
  cancelOrderController,
);
