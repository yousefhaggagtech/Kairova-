import { useQuery } from "@tanstack/react-query";

import { productsApi } from "@/infrastructure/api/productsApi";

type ProductFilters = {
  gender?: string;
  categoryId?: string;
  subcategoryId?: string;
  search?: string;
};

type UseProductsOptions = {
  enabled?: boolean;
};

type UseProductOptions = {
  enabled?: boolean;
  initialData?: Awaited<ReturnType<typeof productsApi.getBySlug>>;
};

export function useProducts(
  filters?: ProductFilters,
  options: UseProductsOptions = {},
) {
  return useQuery({
    queryKey: ["products", filters],
    queryFn: () => productsApi.list(filters),
    enabled: options.enabled ?? true,
  });
}

export function useProduct(slug: string, options: UseProductOptions = {}) {
  return useQuery({
    queryKey: ["product", slug],
    queryFn: () => productsApi.getBySlug(slug),
    enabled: (options.enabled ?? true) && !!slug,
    initialData: options.initialData,
  });
}
