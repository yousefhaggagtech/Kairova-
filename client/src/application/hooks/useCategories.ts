import { useQuery } from "@tanstack/react-query";

import { categoriesApi } from "@/infrastructure/api/categoriesApi";

type CategoryFilters = {
  gender?: string;
  parentCategory?: string;
};

export function useCategories(filters?: CategoryFilters) {
  return useQuery({
    queryKey: ["categories", filters],
    queryFn: () => categoriesApi.list(filters),
  });
}

export function useCategory(slug: string) {
  return useQuery({
    queryKey: ["category", slug],
    queryFn: () => categoriesApi.getBySlug(slug),
    enabled: !!slug,
  });
}
