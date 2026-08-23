import { useQuery } from "@tanstack/react-query";

import { productsApi } from "@/infrastructure/api/productsApi";

type ProductFilters = {
  gender?: string;
  categoryId?: string;
};

export function useProducts(filters?: ProductFilters) {
  return useQuery({
    queryKey: ["products", filters],
    queryFn: () => productsApi.list(filters),
  });
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: ["product", slug],
    queryFn: () => productsApi.getBySlug(slug),
    enabled: !!slug,
  });
}
