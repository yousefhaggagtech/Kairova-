import type { ApiResponse, Product } from "@/domain/entities/api";

import apiClient from "../http/apiClient";

type ProductFilters = {
  gender?: string;
  categoryId?: string;
  subcategoryId?: string;
};

export const productsApi = {
  list: async (filters?: ProductFilters): Promise<Product[]> => {
    const params = new URLSearchParams();
    if (filters?.gender) params.set("gender", filters.gender);
    if (filters?.categoryId) params.set("categoryId", filters.categoryId);
    if (filters?.subcategoryId) {
      params.set("subcategoryId", filters.subcategoryId);
    }

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
};
