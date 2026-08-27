import type {
  ApiResponse,
  Order,
  PaymentMethod,
  ShippingAddress,
} from "@/domain/entities/api";

import apiClient from "../http/apiClient";

export const ordersApi = {
  create: async (data: {
    items: Array<{ productId: string; quantity: number }>;
    shippingAddress: ShippingAddress;
    paymentMethod: PaymentMethod;
    customerPhone: string;
  }): Promise<Order> => {
    const response = await apiClient.post<ApiResponse<{ order: Order }>>(
      "/api/orders",
      data,
    );
    return response.data.data!.order;
  },

  getMyOrders: async (): Promise<Order[]> => {
    const response =
      await apiClient.get<ApiResponse<{ orders: Order[] }>>("/api/orders/me");
    return response.data.data?.orders ?? [];
  },

  getMyOrder: async (id: string): Promise<Order> => {
    const response = await apiClient.get<ApiResponse<{ order: Order }>>(
      `/api/orders/${id}`,
    );
    return response.data.data!.order;
  },

  addPaymentProof: async (
    id: string,
    data: { url: string; label?: string },
  ): Promise<Order> => {
    const response = await apiClient.post<ApiResponse<{ order: Order }>>(
      `/api/orders/${id}/payment-proofs`,
      data,
    );
    return response.data.data!.order;
  },
};
