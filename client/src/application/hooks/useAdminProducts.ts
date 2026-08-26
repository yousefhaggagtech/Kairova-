import {
  type QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import type { Product } from "@/domain/entities/api";
import {
  adminProductsApi,
  type AddProductImageInput,
  type AdminProductFilters,
  type ProductPayload,
  type ProductUpdatePayload,
} from "@/infrastructure/api/adminProductsApi";

function invalidateProductLists(queryClient: QueryClient) {
  void queryClient.invalidateQueries({ queryKey: ["admin-products"] });
  void queryClient.invalidateQueries({ queryKey: ["products"] });
}

function updateProductCache(queryClient: QueryClient, product: Product) {
  queryClient.setQueryData(["admin-product", product._id], product);
  void queryClient.invalidateQueries({ queryKey: ["admin-product", product._id] });
  invalidateProductLists(queryClient);
}

export function useAdminProducts(filters?: AdminProductFilters) {
  return useQuery({
    queryKey: ["admin-products", filters],
    queryFn: () => adminProductsApi.list(filters),
  });
}

export function useAdminProduct(id: string) {
  return useQuery({
    queryKey: ["admin-product", id],
    queryFn: () => adminProductsApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ProductPayload) => adminProductsApi.create(data),
    onSuccess: (product) => updateProductCache(queryClient, product),
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ProductUpdatePayload }) =>
      adminProductsApi.update(id, data),
    onSuccess: (product) => updateProductCache(queryClient, product),
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminProductsApi.delete(id),
    onSuccess: () => invalidateProductLists(queryClient),
  });
}

export function useAddProductImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      data,
    }: {
      productId: string;
      data: AddProductImageInput;
    }) => adminProductsApi.addImage(productId, data),
    onSuccess: (_image, variables) => {
      void queryClient.invalidateQueries({
        queryKey: ["admin-product", variables.productId],
      });
      invalidateProductLists(queryClient);
    },
  });
}

export function useRemoveProductImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      imageId,
    }: {
      productId: string;
      imageId: string;
    }) => adminProductsApi.removeImage(productId, imageId),
    onSuccess: (_result, variables) => {
      void queryClient.invalidateQueries({
        queryKey: ["admin-product", variables.productId],
      });
      invalidateProductLists(queryClient);
    },
  });
}

export function useSetPrimaryProductImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      imageId,
    }: {
      productId: string;
      imageId: string;
    }) => adminProductsApi.setPrimaryImage(productId, imageId),
    onSuccess: (product) => updateProductCache(queryClient, product),
  });
}
