import {
  type QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import type { Order } from "@/domain/entities/api";
import { ordersApi } from "@/infrastructure/api/ordersApi";

function updateOrderCaches(queryClient: QueryClient, order: Order) {
  queryClient.setQueryData(["my-order", order._id], order);
  void queryClient.invalidateQueries({ queryKey: ["my-orders"] });
  void queryClient.invalidateQueries({ queryKey: ["admin-order", order._id] });
  void queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
}

export function useMyOrders(enabled = true) {
  return useQuery({
    queryKey: ["my-orders"],
    queryFn: () => ordersApi.getMyOrders(),
    enabled,
  });
}

export function useMyOrder(id: string, enabled = true) {
  return useQuery({
    queryKey: ["my-order", id],
    queryFn: () => ordersApi.getMyOrder(id),
    enabled: !!id && enabled,
  });
}

export function useCreateOrder() {
  return useMutation({
    mutationFn: ordersApi.create,
  });
}

export function useAddPaymentProof() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      url,
      label,
    }: {
      id: string;
      url: string;
      label?: string;
    }) => ordersApi.addPaymentProof(id, { url, label }),
    onSuccess: (order) => updateOrderCaches(queryClient, order),
  });
}
