import type {
  ApiResponse,
  LocalizedString,
  Product,
  ProductImage,
} from "@/domain/entities/api";

import apiClient from "../http/apiClient";

export type AdminProductFilters = {
  gender?: string;
  categoryId?: string;
};

export type ProductPayload = {
  name: LocalizedString;
  description: LocalizedString;
  gender: "men" | "women";
  categoryId: string;
  subcategoryId: string;
  price: number;
  stockQuantity: number;
};

export type ProductUpdatePayload = Partial<ProductPayload>;

export type AddProductImageInput = {
  url: string;
  publicId: string;
  alt?: Partial<LocalizedString>;
  isPrimary?: boolean;
  order?: number;
};

function buildQueryString(filters?: AdminProductFilters) {
  const params = new URLSearchParams();

  if (filters?.gender) {
    params.set("gender", filters.gender);
  }

  if (filters?.categoryId) {
    params.set("categoryId", filters.categoryId);
  }

  const query = params.toString();

  return query ? `?${query}` : "";
}

function getProductFromResponse(response: ApiResponse<{ product: Product }>) {
  return response.data!.product;
}

export const adminProductsApi = {
  list: async (filters?: AdminProductFilters): Promise<Product[]> => {
    const response = await apiClient.get<ApiResponse<{ products: Product[] }>>(
      `/api/products${buildQueryString(filters)}`,
    );
    return response.data.data?.products ?? [];
  },

  getById: async (id: string): Promise<Product> => {
    const response = await apiClient.get<ApiResponse<{ product: Product }>>(
      `/api/products/${id}`,
    );
    return getProductFromResponse(response.data);
  },

  create: async (data: ProductPayload): Promise<Product> => {
    const response = await apiClient.post<ApiResponse<{ product: Product }>>(
      "/api/admin/products",
      data,
    );
    return getProductFromResponse(response.data);
  },

  update: async (id: string, data: ProductUpdatePayload): Promise<Product> => {
    const response = await apiClient.patch<ApiResponse<{ product: Product }>>(
      `/api/admin/products/${id}`,
      data,
    );
    return getProductFromResponse(response.data);
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/admin/products/${id}`);
  },

  addImage: async (
    productId: string,
    data: AddProductImageInput,
  ): Promise<ProductImage> => {
    const response = await apiClient.post<ApiResponse<{ image: ProductImage }>>(
      `/api/products/${productId}/images`,
      data,
    );
    return response.data.data!.image;
  },

  removeImage: async (productId: string, imageId: string): Promise<void> => {
    await apiClient.delete(`/api/products/${productId}/images/${imageId}`);
  },

  setPrimaryImage: async (
    productId: string,
    imageId: string,
  ): Promise<Product> => {
    const response = await apiClient.patch<ApiResponse<{ product: Product }>>(
      `/api/products/${productId}/images/${imageId}/primary`,
    );
    return getProductFromResponse(response.data);
  },
};
