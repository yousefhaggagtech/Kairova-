import type { Request, Response } from "express";

import { catchError } from "../../utils/catchError.js";
import { generateUploadSignature } from "./service.js";

export const getUploadSignatureController = catchError(
  async (_req: Request, res: Response) => {
    const signatureData = generateUploadSignature();

    res.status(200).json({
      status: "success",
      data: signatureData,
    });
  },
);
