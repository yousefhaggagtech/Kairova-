import type { ApiResponse, Category } from "@/domain/entities/api";

import apiClient from "../http/apiClient";

type CategoryFilters = {
  gender?: string;
  parentCategory?: string;
};

export const categoriesApi = {
  list: async (filters?: CategoryFilters): Promise<Category[]> => {
    const params = new URLSearchParams();
    if (filters?.gender) params.set("gender", filters.gender);
    if (filters?.parentCategory) {
      params.set("parentCategory", filters.parentCategory);
    }

    const queryString = params.toString();
    const response = await apiClient.get<ApiResponse<{ categories: Category[] }>>(
      `/api/categories${queryString ? `?${queryString}` : ""}`,
    );
    return response.data.data?.categories ?? [];
  },

  getBySlug: async (slug: string): Promise<Category> => {
    const response = await apiClient.get<ApiResponse<{ category: Category }>>(
      `/api/categories/slug/${slug}`,
    );
    return response.data.data!.category;
  },
};
