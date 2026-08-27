import type { Request, Response } from "express";

import { catchError } from "../../utils/catchError.js";
import { getSettings, serializeBusinessSettings } from "./service.js";

export const getPublicSettingsController = catchError(
  async (_req: Request, res: Response) => {
    const settings = await getSettings();

    res.status(200).json({
      status: "success",
      data: { settings: serializeBusinessSettings(settings) },
    });
  },
);
