import type { Request, Response } from "express";

import { catchError } from "../../utils/catchError.js";
import {
  createCategory,
  getCategoryById,
  getCategoryBySlug,
  listCategories,
  softDeleteCategory,
  updateCategory,
} from "./service.js";

export const createCategoryController = catchError(
  async (req: Request, res: Response) => {
    const category = await createCategory(req.body);

    res.status(201).json({
      status: "success",
      data: { category },
    });
  },
);

export const listCategoriesController = catchError(
  async (req: Request, res: Response) => {
    const categories = await listCategories(req.query);

    res.status(200).json({
      status: "success",
      data: { categories },
    });
  },
);

export const getCategoryController = catchError(
  async (req: Request, res: Response) => {
    const category = await getCategoryById(String(req.params.id));

    res.status(200).json({
      status: "success",
      data: { category },
    });
  },
);

export const getCategoryBySlugController = catchError(
  async (req: Request, res: Response) => {
    const category = await getCategoryBySlug(String(req.params.slug));

    res.status(200).json({
      status: "success",
      data: { category },
    });
  },
);

export const updateCategoryController = catchError(
  async (req: Request, res: Response) => {
    const category = await updateCategory(String(req.params.id), req.body);

    res.status(200).json({
      status: "success",
      data: { category },
    });
  },
);

export const deleteCategoryController = catchError(
  async (req: Request, res: Response) => {
    await softDeleteCategory(String(req.params.id));

    res.status(204).send();
  },
);
