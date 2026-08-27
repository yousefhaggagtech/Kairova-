import { Router } from "express";

import { protect, restrictTo } from "../auth/middleware.js";
import {
  getPaymentProofUploadSignatureController,
  getUploadSignatureController,
} from "./controller.js";

const adminRouter = Router();

adminRouter.use(protect);
adminRouter.use(restrictTo("admin"));

adminRouter.get("/sign", getUploadSignatureController);

export const paymentProofRouter = Router();

paymentProofRouter.use(protect);
paymentProofRouter.get(
  "/payment-proofs/sign",
  getPaymentProofUploadSignatureController,
);

export default adminRouter;
