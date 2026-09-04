import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

import { defaultLocale, locales } from "@/src/i18n/config";

type RetriableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

const apiClient = axios.create({
  baseURL: "/",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

apiClient.interceptors.request.use((config) => {
  if (typeof document !== "undefined") {
    config.headers["Accept-Language"] = document.documentElement.lang || "ar";
  }

  return config;
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: () => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error?: unknown) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
      return;
    }

    resolve();
  });
  failedQueue = [];
};

function getLocaleFromPathname(pathname: string) {
  const firstSegment = pathname.split("/").filter(Boolean)[0];

  return locales.includes(firstSegment as (typeof locales)[number])
    ? firstSegment
    : defaultLocale;
}

function getLocaleAwareLoginUrl() {
  const locale = getLocaleFromPathname(window.location.pathname);

  return new URL(`/${locale}/auth/login`, window.location.origin);
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetriableRequestConfig | undefined;
    const isLoginRequest = originalRequest?.url?.includes("/api/auth/login");
    const isRefreshRequest = originalRequest?.url?.includes("/api/auth/refresh");

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isLoginRequest &&
      !isRefreshRequest
    ) {
      if (isRefreshing) {
        return new Promise<void>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => apiClient(originalRequest));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await apiClient.post("/api/auth/refresh");
        processQueue();
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);

        if (typeof window !== "undefined") {
          window.location.assign(getLocaleAwareLoginUrl());
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
