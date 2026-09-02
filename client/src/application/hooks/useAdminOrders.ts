import {
  type QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import type { Order } from "@/domain/entities/api";
import {
  adminOrdersApi,
  type AdminOrderFilters,
} from "@/infrastructure/api/adminOrdersApi";

function updateOrderCache(queryClient: QueryClient, order: Order) {
  queryClient.setQueryData(["admin-order", order._id], order);
  void queryClient.invalidateQueries({ queryKey: ["admin-order", order._id] });
  void queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
  void queryClient.invalidateQueries({ queryKey: ["my-order", order._id] });
  void queryClient.invalidateQueries({ queryKey: ["my-orders"] });
}

export function useAdminOrders(filters?: AdminOrderFilters) {
  return useQuery({
    queryKey: ["admin-orders", filters],
    queryFn: () => adminOrdersApi.list(filters),
  });
}

export function useAdminOrder(id: string) {
  return useQuery({
    queryKey: ["admin-order", id],
    queryFn: () => adminOrdersApi.getById(id),
    enabled: !!id,
  });
}

export function useConfirmDeposit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminOrdersApi.confirmDeposit(id),
    onSuccess: (order) => updateOrderCache(queryClient, order),
  });
}

export function useMarkPacked() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminOrdersApi.markPacked(id),
    onSuccess: (order) => updateOrderCache(queryClient, order),
  });
}

export function useConfirmPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminOrdersApi.confirmPayment(id),
    onSuccess: (order) => updateOrderCache(queryClient, order),
  });
}

export function useShipOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      waybillNumber,
    }: {
      id: string;
      waybillNumber: string;
    }) => adminOrdersApi.ship(id, waybillNumber),
    onSuccess: (order) => updateOrderCache(queryClient, order),
  });
}

export function useCancelOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminOrdersApi.cancel(id),
    onSuccess: (order) => updateOrderCache(queryClient, order),
  });
}
