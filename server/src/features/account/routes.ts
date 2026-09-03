import { Router } from "express";

import { validate } from "../../middleware/validate.js";
import { protect } from "../auth/middleware.js";
import {
  createAddressController,
  deleteAddressController,
  listAddressesController,
  setDefaultAddressController,
  updateAddressController,
} from "./controller.js";
import {
  addressIdParamsSchema,
  addressInputSchema,
  updateAddressSchema,
} from "./validation.js";

const router = Router();

router.use(protect);

router.get("/addresses", listAddressesController);
router.post("/addresses", validate(addressInputSchema), createAddressController);
router.patch(
  "/addresses/:addressId",
  validate(addressIdParamsSchema, "params"),
  validate(updateAddressSchema),
  updateAddressController,
);
router.delete(
  "/addresses/:addressId",
  validate(addressIdParamsSchema, "params"),
  deleteAddressController,
);
router.patch(
  "/addresses/:addressId/default",
  validate(addressIdParamsSchema, "params"),
  setDefaultAddressController,
);

export default router;
