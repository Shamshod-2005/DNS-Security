import { axiosInstance, ApiError, resetRedirectFlag } from "../config/axios";
import type { AxiosRequestConfig } from "axios";

export { ApiError, resetRedirectFlag, axiosInstance };

/**
 * API klient — barcha tarmoq so'rovlari markaziy Axios instansiyasi orqali yuboriladi.
 * withCredentials: true, avtomatik xatolarni qayta ishlash va sessiya boshqaruvi bilan ta'minlangan.
 */
export const api = {
  // GET so'rov
  get: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const res = await axiosInstance.get<T>(url, config);
    return res.data;
  },

  // POST so'rov — JSON tanasi bilan
  post: async <T>(
    url: string,
    body?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<T> => {
    const res = await axiosInstance.post<T>(url, body, config);
    return res.data;
  },

  // PUT so'rov
  put: async <T>(
    url: string,
    body?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<T> => {
    const res = await axiosInstance.put<T>(url, body, config);
    return res.data;
  },

  // DELETE so'rov
  delete: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const res = await axiosInstance.delete<T>(url, config);
    return res.data;
  },

  // Fayl yuklash — FormData bilan
  upload: async <T>(
    url: string,
    file: File,
    fieldName = "file",
    config?: AxiosRequestConfig,
  ): Promise<T> => {
    const fd = new FormData();
    fd.append(fieldName, file);
    const res = await axiosInstance.post<T>(url, fd, {
      ...config,
      headers: {
        ...config?.headers,
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  },
};

export default api;

