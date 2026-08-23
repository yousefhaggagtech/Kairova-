import { useMutation, useQuery } from "@tanstack/react-query";

import { ordersApi } from "@/infrastructure/api/ordersApi";

export function useMyOrders() {
  return useQuery({
    queryKey: ["my-orders"],
    queryFn: () => ordersApi.getMyOrders(),
  });
}

export function useMyOrder(id: string) {
  return useQuery({
    queryKey: ["my-order", id],
    queryFn: () => ordersApi.getMyOrder(id),
    enabled: !!id,
  });
}

export function useCreateOrder() {
  return useMutation({
    mutationFn: ordersApi.create,
  });
}
