import type { ApiResponse, Order, OrderStatus } from "@/domain/entities/api";

import apiClient from "../http/apiClient";

export interface AdminOrderFilters {
  status?: OrderStatus;
  customerId?: string;
}

function buildQueryString(filters?: AdminOrderFilters) {
  const params = new URLSearchParams();

  if (filters?.status) {
    params.set("status", filters.status);
  }

  if (filters?.customerId) {
    params.set("customerId", filters.customerId);
  }

  const query = params.toString();

  return query ? `?${query}` : "";
}

function getOrderFromResponse(response: ApiResponse<{ order: Order }>) {
  return response.data!.order;
}

export const adminOrdersApi = {
  list: async (filters?: AdminOrderFilters): Promise<Order[]> => {
    const response = await apiClient.get<ApiResponse<{ orders: Order[] }>>(
      `/api/admin/orders${buildQueryString(filters)}`,
    );
    return response.data.data?.orders ?? [];
  },

  getById: async (id: string): Promise<Order> => {
    const response = await apiClient.get<ApiResponse<{ order: Order }>>(
      `/api/admin/orders/${id}`,
    );
    return getOrderFromResponse(response.data);
  },

  confirmDeposit: async (id: string): Promise<Order> => {
    const response = await apiClient.post<ApiResponse<{ order: Order }>>(
      `/api/admin/orders/${id}/confirm-deposit`,
    );
    return getOrderFromResponse(response.data);
  },

  markPacked: async (id: string): Promise<Order> => {
    const response = await apiClient.post<ApiResponse<{ order: Order }>>(
      `/api/admin/orders/${id}/mark-packed`,
    );
    return getOrderFromResponse(response.data);
  },

  confirmPayment: async (id: string): Promise<Order> => {
    const response = await apiClient.post<ApiResponse<{ order: Order }>>(
      `/api/admin/orders/${id}/confirm-payment`,
    );
    return getOrderFromResponse(response.data);
  },

  ship: async (id: string, waybillNumber: string): Promise<Order> => {
    const response = await apiClient.post<ApiResponse<{ order: Order }>>(
      `/api/admin/orders/${id}/ship`,
      { waybillNumber },
    );
    return getOrderFromResponse(response.data);
  },

  cancel: async (id: string, reason: string): Promise<Order> => {
    const response = await apiClient.post<ApiResponse<{ order: Order }>>(
      `/api/admin/orders/${id}/cancel`,
      { reason },
    );
    return getOrderFromResponse(response.data);
  },
};
