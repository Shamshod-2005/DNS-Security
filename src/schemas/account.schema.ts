import { z } from "zod";

// Foydalanuvchi nomi uchun xavfsizlik qoidasi (harflar, raqamlar, . _ -)
const usernameRegex = /^[A-Za-z0-9._-]{3,32}$/;

export const accountCredentialsSchema = z
  .object({
    current_password: z
      .string()
      .min(1, "Joriy parolni kiriting"),
    username: z
      .string()
      .optional()
      .refine(
        (val) => !val || val.trim().length === 0 || (val.trim().length >= 3 && val.trim().length <= 32),
        {
          message: "Foydalanuvchi nomi 3 dan 32 gacha belgidan iborat bo'lishi kerak",
        }
      )
      .refine(
        (val) => !val || val.trim().length === 0 || usernameRegex.test(val.trim()),
        {
          message: "Faqat harflar, raqamlar va . _ - belgilariga ruxsat etiladi",
        }
      ),
    new_password: z
      .string()
      .optional()
      .refine(
        (val) => !val || val.length === 0 || val.length >= 8,
        {
          message: "Yangi parol kamida 8 ta belgidan iborat bo'lishi shart",
        }
      ),
    confirm_password: z.string().optional(),
  })
  .refine(
    (data) => {
      const newPwd = data.new_password || "";
      const confirmPwd = data.confirm_password || "";

      if (newPwd.length > 0 || confirmPwd.length > 0) {
        return newPwd === confirmPwd;
      }
      return true;
    },
    {
      message: "Yangi parol va tasdiqlovchi parol bir-biriga mos kelmadi",
      path: ["confirm_password"],
    }
  );

export type AccountCredentialsFormData = z.infer<typeof accountCredentialsSchema>;

