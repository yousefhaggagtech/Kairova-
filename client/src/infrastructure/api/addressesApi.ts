import type { Address, AddressInput, ApiResponse } from "@/domain/entities/api";

import apiClient from "../http/apiClient";

type AddressListResponse = ApiResponse<{ addresses: Address[] }>;
type AddressCreateResponse = ApiResponse<{
  address: Address;
  addresses: Address[];
}>;

export const addressesApi = {
  list: async (): Promise<Address[]> => {
    const response =
      await apiClient.get<AddressListResponse>("/api/account/addresses");

    return response.data.data?.addresses ?? [];
  },

  create: async (data: AddressInput): Promise<Address[]> => {
    const response = await apiClient.post<AddressCreateResponse>(
      "/api/account/addresses",
      data,
    );

    return response.data.data?.addresses ?? [];
  },

  update: async ({
    id,
    data,
  }: {
    id: string;
    data: Partial<AddressInput>;
  }): Promise<Address[]> => {
    const response = await apiClient.patch<AddressListResponse>(
      `/api/account/addresses/${id}`,
      data,
    );

    return response.data.data?.addresses ?? [];
  },

  remove: async (id: string): Promise<Address[]> => {
    const response = await apiClient.delete<AddressListResponse>(
      `/api/account/addresses/${id}`,
    );

    return response.data.data?.addresses ?? [];
  },

  setDefault: async (id: string): Promise<Address[]> => {
    const response = await apiClient.patch<AddressListResponse>(
      `/api/account/addresses/${id}/default`,
    );

    return response.data.data?.addresses ?? [];
  },
};
