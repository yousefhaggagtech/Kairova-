import type { User } from "@/domain/entities/api";

import apiClient from "../http/apiClient";

interface AuthResponse {
  user: User;
}

export const authApi = {
  register: async (data: {
    name: string;
    email: string;
    password: string;
    phone: string;
  }): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>(
      "/api/auth/register",
      data,
    );
    return response.data;
  },

  login: async (data: {
    email: string;
    password: string;
  }): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>("/api/auth/login", data);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post("/api/auth/logout");
  },

  getMe: async (): Promise<User> => {
    const response = await apiClient.get<AuthResponse>("/api/auth/me");
    return response.data.user;
  },

  refresh: async (): Promise<void> => {
    await apiClient.post("/api/auth/refresh");
  },
};
