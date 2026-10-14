import { z } from "zod";

/**
 * Domenlarni qo'lda kiritish validation sxemasi
 */
export const manualDomainsSchema = z.object({
  text: z
    .string()
    .min(1, "Kamida bitta domen kiriting")
    .refine((val) => val.trim().length > 0, "Domen maydoni bo'sh bo'lmasligi kerak"),
});

export type ManualDomainsFormData = z.infer<typeof manualDomainsSchema>;

/**
 * Sinkhole / Block page sozlamalari validation sxemasi
 */
export const sinkholeSettingsSchema = z
  .object({
    sinkhole: z.boolean(),
    sinkhole_ip: z.string().trim().min(1, "Sinkhole IP manzili kiritilishi shart"),
    block_action: z.enum(["0", "1"]),
    redirect_url: z.string().trim(),
    sinkhole_https: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (data.block_action === "1") {
      if (!data.redirect_url) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Yo'naltirish manzili (URL) kiritilishi shart",
          path: ["redirect_url"],
        });
      } else if (!/^https?:\/\/.+/i.test(data.redirect_url)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "URL 'http://' yoki 'https://' bilan boshlanishi kerak",
          path: ["redirect_url"],
        });
      }
    }
  });

export type SinkholeSettingsFormData = z.infer<typeof sinkholeSettingsSchema>;

/**
 * Jurnallarni saqlash muddati (Log retention) sxemasi
 */
export const retentionBucketSchema = z.object({
  enabled: z.boolean(),
  days: z.coerce.number().min(0, "0 dan kichik bo'lishi mumkin emas"),
});

export const retentionSchema = z
  .object({
    normal: retentionBucketSchema,
    dot: retentionBucketSchema,
    malicious: retentionBucketSchema,
  })
  .superRefine((data, ctx) => {
    (["normal", "dot", "malicious"] as const).forEach((key) => {
      if (data[key].enabled && (!data[key].days || data[key].days < 1)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Faollashtirilgan tur uchun kunlar soni kamida 1 bo'lishi kerak",
          path: [key, "days"],
        });
      }
    });
  });

export type RetentionFormData = z.infer<typeof retentionSchema>;

