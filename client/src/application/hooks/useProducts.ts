import { useQuery } from "@tanstack/react-query";

import { productsApi } from "@/infrastructure/api/productsApi";

type ProductFilters = {
  gender?: string;
  categoryId?: string;
  subcategoryId?: string;
};

type UseProductsOptions = {
  enabled?: boolean;
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

export function useProduct(slug: string) {
  return useQuery({
    queryKey: ["product", slug],
    queryFn: () => productsApi.getBySlug(slug),
    enabled: !!slug,
  });
}
