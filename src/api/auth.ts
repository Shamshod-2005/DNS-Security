import { axiosInstance, resetRedirectFlag } from "../config/axios";
import { queryClient } from "../config/queryClient";
import type {
  AuthMeResponse,
  AuthChangeRequest,
  AuthChangeResponse,
} from "./types";

export interface LoginResult {
  ok: boolean; 
  error?: string;
  must_change?: boolean;
  username?: string;
}

// Joriy sessiya foydalanuvchisini olish
export async function getCurrentUser(): Promise<AuthMeResponse> {
  const res = await axiosInstance.get<AuthMeResponse>("/api/auth/me", {
    skipAuthRedirect: true,
  });
  return res.data;
}

// Tizimga kirish (POST /login orqali sessiya o'rnatish) — to'liq Axios orqali
export async function loginUser(credentials: {
  username: string;
  password: string;
}): Promise<LoginResult> {
  try {
    const params = new URLSearchParams();
    params.append("username", credentials.username.trim());
    params.append("password", credentials.password);

    try {
      await axiosInstance.post("/login", params, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "text/html, application/xhtml+xml, */*",
        },
        skipAuthRedirect: true,
      });
    } catch (postErr: any) {
      const postStatus = postErr?.status || postErr?.response?.status;
      // Agar server xatoligi (502, 500, 503, 504) yoki 401/429 bo'lsa darhol xato tashlash
      if (
        postStatus === 401 ||
        postStatus === 429 ||
        postStatus >= 500 ||
        postStatus === 0
      ) {
        throw postErr;
      }
      // 302 redirect oqibatidagi navigatsiya holatlarida pastda me tekshiriladi
    }

    // Muvaffaqiyatli kirishdan so'ng profil ma'lumotlarini tekshiramiz
    const me = await axiosInstance.get<AuthMeResponse>("/api/auth/me", {
      skipAuthRedirect: true,
    });

    if (me.data && me.data.username) {
      return {
        ok: true,
        username: me.data.username,
        must_change: me.data.must_change,
      };
    }

    return {
      ok: false,
      error:
        "Avtorizatsiya tasdiqlanmadi. Foydalanuvchi nomi yoki parol noto'g'ri.",
    };
  } catch (error: any) {
    const status = error?.status || error?.response?.status;
    if (status === 401) {
      return { ok: false, error: "Foydalanuvchi nomi yoki parol noto'g'ri." };
    }
    if (status === 429) {
      return {
        ok: false,
        error:
          "Urinishlar soni juda ko'p. Iltimos, 5 daqiqadan so'ng qayta urinib ko'ring.",
      };
    }
    if (status === 502 || status === 504 || status === 0) {
      return {
        ok: false,
        error:
          "Backend serveri bilan aloqa yo'q (502 Bad Gateway). Iltimos, backend ishga tushirilganini tekshiring.",
      };
    }
    if (status === 503) {
      return {
        ok: false,
        error: "Server band. Birozdan so'ng qayta urinib ko'ring.",
      };
    }
    return {
      ok: false,
      error: error?.message || "Tizimga kirishda xatolik yuz berdi.",
    };
  }
}

// Username va/yoki parolni almashtirish
export async function changeCredentials(
  body: AuthChangeRequest,
): Promise<AuthChangeResponse> {
  const res = await axiosInstance.post<AuthChangeResponse>(
    "/api/auth/change",
    body,
  );
  return res.data;
}

// Tizimdan chiqish (sessiyani tozalash va /login ga yo'naltirish)
export async function logoutUser(): Promise<void> {
  try {
    await axiosInstance.post("/logout", null, { skipAuthRedirect: true });
  } catch {
    // Tarmoq xatosi bo'lsa ham frontend sessiyasini tozalaymiz
  }

  // React Query keshini to'liq tozalaymiz
  queryClient.clear();
  queryClient.setQueryData(["auth", "me"], null);
  resetRedirectFlag();

  // Chiqilganligini belgilab qo'yish (login sahifasida ortiqcha 401 so'rovi ketmasligi uchun)
  try {
    sessionStorage.setItem("logged_out", "true");
  } catch {
    // ignore
  }

  // Logout qilinganda mavzuni har doim default DARK holatiga qaytarish
  try {
    localStorage.setItem("mdns.theme", "dark");
    document.documentElement.classList.add("dark");
    document.documentElement.setAttribute("data-theme", "dark");
  } catch {
    // ignore
  }

  // To'g'ridan-to'g'ri /login sahifasiga o'tkazish
  window.location.replace("/login");
}
