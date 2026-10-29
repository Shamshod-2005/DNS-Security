import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
  type AxiosResponse,
  type AxiosError,
} from "axios";

// TypeScript uchun AxiosRequestConfig kengaytmasi
declare module "axios" {
  export interface AxiosRequestConfig {
    skipAuthRedirect?: boolean;
  }
}

// API xatosi klassi — status kodi va backend ma'lumotlarini saqlaydi
export class ApiError extends Error {
  status: number;
  data?: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

// Login sahifasiga bir marta yo'naltirish uchun bayroqcha (flag)
let redirecting = false;

export function resetRedirectFlag(): void {
  redirecting = false;
}

// ─── Markaziy Axios instansiyasi ─────────────────────────────────────────────
export const axiosInstance: AxiosInstance = axios.create({
  baseURL: import.meta.env.DEV ? "" : (import.meta.env.VITE_BACKEND_URL || ""),
  withCredentials: true, // Flask ning mdns_session sessiya cookie'larini qabul qilish va yuborish uchun shart
  timeout: 15000, // 15 soniya kutish vaqti
  headers: {
    Accept: "application/json",
  },
});

// ─── Request Interceptor ─────────────────────────────────────────────────────
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    return config;
  },
  (error: unknown) => {
    return Promise.reject(error);
  },
);

// ─── Response Interceptor ────────────────────────────────────────────────────
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    const data = response.data;

    // Backend javobida HTTP 200 bo'lsa ham { ok: false, error: "..." } kelishi mumkin
    if (
      typeof data === "object" &&
      data !== null &&
      ("error" in data || (data as Record<string, unknown>).ok === false)
    ) {
      const errData = data as Record<string, unknown>;
      const message =
        typeof errData.error === "string"
          ? errData.error
          : `Xato: ${response.status}`;
      throw new ApiError(message, response.status, data);
    }

    return response;
  },
  (error: AxiosError) => {
    const status = error.response?.status || 0;
    const data = error.response?.data;
    let message = "Server bilan aloqa yo'q";

    if (data && typeof data === "object" && "error" in data) {
      message = String((data as Record<string, unknown>).error);
    } else if (error.message) {
      message = error.message;
    }

    const isPasswordChange =
      typeof data === "object" &&
      data !== null &&
      (data as Record<string, unknown>).error === "Password change required";

    const config = error.config as
      | (InternalAxiosRequestConfig & { skipAuthRedirect?: boolean })
      | undefined;

    // 401 yoki majburiy parol o'zgartirish talabi
    if (status === 401 || isPasswordChange) {
      const isAlreadyOnLogin =
        typeof window !== "undefined" &&
        (window.location.pathname === "/login" ||
          window.location.pathname.startsWith("/login") ||
          window.location.hash.includes("/login"));

      // Agar login sahifasida bo'lmasa va skipAuthRedirect qo'yilmagan bo'lsa, login sahifasiga yo'naltiramiz
      if (!config?.skipAuthRedirect && !isAlreadyOnLogin && !redirecting) {
        redirecting = true;
        try {
          localStorage.setItem("mdns.theme", "dark");
          localStorage.setItem("i18nextLng", "en");
          document.documentElement.classList.add("dark");
          document.documentElement.setAttribute("data-theme", "dark");
        } catch {
          // ignore
        }
        window.location.href = "/login";
      }

      return Promise.reject(
        new ApiError(
          isPasswordChange ? "Password change required" : "Login required",
          status,
          data,
        ),
      );
    }

    return Promise.reject(new ApiError(message, status, data));
  },
);

export default axiosInstance;
