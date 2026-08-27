import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { settingsApi } from "@/infrastructure/api/settingsApi";

export function usePublicSettings() {
  return useQuery({
    queryKey: ["public-settings"],
    queryFn: settingsApi.getPublic,
    staleTime: 60 * 1000,
  });
}

export function useAdminSettings() {
  return useQuery({
    queryKey: ["admin-settings"],
    queryFn: settingsApi.getAdmin,
    staleTime: 60 * 1000,
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: settingsApi.update,
    onSuccess: (settings) => {
      queryClient.setQueryData(["admin-settings"], settings);
      void queryClient.invalidateQueries({ queryKey: ["public-settings"] });
    },
  });
}
