import type { Request, Response } from "express";

import { catchError } from "../../utils/catchError.js";
import {
  getSettings,
  serializeBusinessSettings,
  updateSettings,
} from "./service.js";
import type { UpdateSettingsInput } from "./validation.js";

export const getSettingsController = catchError(
  async (_req: Request, res: Response) => {
    const settings = await getSettings();

    res.status(200).json({
      status: "success",
      data: { settings: serializeBusinessSettings(settings) },
    });
  },
);

export const updateSettingsController = catchError(
  async (req: Request, res: Response) => {
    const settings = await updateSettings(req.body as UpdateSettingsInput);

    res.status(200).json({
      status: "success",
      data: { settings: serializeBusinessSettings(settings) },
    });
  },
);
