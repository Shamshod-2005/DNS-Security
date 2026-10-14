import { z } from "zod";

// ??? Foydalanuvchi nomi uchun xavfsizlik qoidasi (harflar, raqamlar, . _ -) ??
const usernameRegex = /^[A-Za-z0-9._-]{3,32}$/;

// ??? 1. Login Sxemasi ????????????????????????????????????????????????????????
export const loginSchema = z.object({
  username: z
    .string()
    .min(1, "Foydalanuvchi nomini kiriting")
    .trim(),
  password: z
    .string()
    .min(1, "Parolni kiriting"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// ??? 2. Dastlabki Parolni Yangilash Sxemasi (mode == 'change') ???????????????
export const changePasswordSchema = z
  .object({
    current_password: z
      .string()
      .min(1, "Joriy parolni kiriting"),
    username: z
      .string()
      .min(3, "Foydalanuvchi nomi kamida 3 ta belgidan iborat bo'lishi kerak")
      .max(32, "Foydalanuvchi nomi 32 ta belgidan oshmasligi kerak")
      .regex(
        usernameRegex,
        "Faqat harflar, raqamlar va . _ - belgilariga ruxsat etiladi"
      ),
    new_password: z
      .string()
      .min(8, "Yangi parol kamida 8 ta belgidan iborat bo'lishi shart"),
    confirm_password: z
      .string()
      .min(8, "Tasdiqlovchi parolni kiriting"),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Yangi parol va tasdiqlovchi parol bir-biriga mos kelmadi",
    path: ["confirm_password"],
  });

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
