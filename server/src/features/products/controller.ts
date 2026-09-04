import type { Request, Response } from "express";

import { catchError } from "../../utils/catchError.js";
import {
  addImage,
  createProduct,
  getFeaturedProducts,
  getProductById,
  getProductBySlug,
  listProducts,
  removeImage,
  setPrimaryImage,
  softDeleteProduct,
  updateProduct,
} from "./service.js";

const getStringQueryParam = (value: unknown): string | undefined =>
  typeof value === "string" ? value : undefined;

export const createProductController = catchError(
  async (req: Request, res: Response) => {
    const product = await createProduct(req.body);

    res.status(201).json({
      status: "success",
      data: { product },
    });
  },
);

export const listProductsController = catchError(
  async (req: Request, res: Response) => {
    const products = await listProducts({
      gender: getStringQueryParam(req.query.gender) as never,
      categoryId: getStringQueryParam(req.query.categoryId),
      subcategoryId: getStringQueryParam(req.query.subcategoryId),
      search: getStringQueryParam(req.query.search),
    });

    res.status(200).json({
      status: "success",
      data: { products },
    });
  },
);

export const getProductController = catchError(
  async (req: Request, res: Response) => {
    const product = await getProductById(String(req.params.id));

    res.status(200).json({
      status: "success",
      data: { product },
    });
  },
);

export const getProductBySlugController = catchError(
  async (req: Request, res: Response) => {
    const product = await getProductBySlug(String(req.params.slug));

    res.status(200).json({
      status: "success",
      data: { product },
    });
  },
);

export const getFeaturedProductsController = catchError(
  async (_req: Request, res: Response) => {
    const products = await getFeaturedProducts();

    res.status(200).json({
      status: "success",
      data: { products },
    });
  },
);

export const updateProductController = catchError(
  async (req: Request, res: Response) => {
    const product = await updateProduct(String(req.params.id), req.body);

    res.status(200).json({
      status: "success",
      data: { product },
    });
  },
);

export const deleteProductController = catchError(
  async (req: Request, res: Response) => {
    await softDeleteProduct(String(req.params.id));

    res.status(204).send();
  },
);

export const addImageController = catchError(
  async (req: Request, res: Response) => {
    const image = await addImage(String(req.params.id), req.body);

    res.status(201).json({
      status: "success",
      data: { image },
    });
  },
);

export const removeImageController = catchError(
  async (req: Request, res: Response) => {
    await removeImage(String(req.params.imageId));

    res.status(204).send();
  },
);

export const setPrimaryImageController = catchError(
  async (req: Request, res: Response) => {
    const product = await setPrimaryImage(
      String(req.params.productId),
      String(req.params.imageId),
    );

    res.status(200).json({
      status: "success",
      data: { product },
    });
  },
);
