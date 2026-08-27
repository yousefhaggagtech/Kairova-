import type { ApiResponse } from "@/domain/entities/api";

import apiClient from "../http/apiClient";

export interface PublicSettings {
  whatsappNumber: string;
  instapayNumber: string;
  vodafoneCashNumber: string;
  depositPercentage: number;
}

export type AdminSettings = PublicSettings;

export const settingsApi = {
  getPublic: async (): Promise<PublicSettings> => {
    const response = await apiClient.get<ApiResponse<{ settings: PublicSettings }>>(
      "/api/settings",
    );

    return response.data.data!.settings;
  },

  getAdmin: async (): Promise<AdminSettings> => {
    const response = await apiClient.get<ApiResponse<{ settings: AdminSettings }>>(
      "/api/admin/settings",
    );

    return response.data.data!.settings;
  },

  update: async (data: Partial<AdminSettings>): Promise<AdminSettings> => {
    const response = await apiClient.patch<ApiResponse<{ settings: AdminSettings }>>(
      "/api/admin/settings",
      data,
    );

    return response.data.data!.settings;
  },
};
