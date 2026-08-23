import type { ApiResponse, Product, ProductImage } from "@/domain/entities/api";

import apiClient from "../http/apiClient";

type ProductFilters = {
  gender?: string;
  categoryId?: string;
};

type AddProductImageInput = {
  url: string;
  publicId: string;
  alt?: {
    ar?: string;
    en?: string;
  };
};

export const productsApi = {
  list: async (filters?: ProductFilters): Promise<Product[]> => {
    const params = new URLSearchParams();
    if (filters?.gender) params.set("gender", filters.gender);
    if (filters?.categoryId) params.set("categoryId", filters.categoryId);

    const queryString = params.toString();
    const response = await apiClient.get<ApiResponse<{ products: Product[] }>>(
      `/api/products${queryString ? `?${queryString}` : ""}`,
    );
    return response.data.data?.products ?? [];
  },

  getBySlug: async (slug: string): Promise<Product> => {
    const response = await apiClient.get<ApiResponse<{ product: Product }>>(
      `/api/products/slug/${slug}`,
    );
    return response.data.data!.product;
  },

  addImage: async (
    productId: string,
    data: AddProductImageInput,
  ): Promise<ApiResponse<{ image: ProductImage }>> => {
    const response = await apiClient.post<ApiResponse<{ image: ProductImage }>>(
      `/api/products/${productId}/images`,
      data,
    );
    return response.data;
  },
};
