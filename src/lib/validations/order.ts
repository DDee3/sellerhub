import { z } from "zod";

export const orderSchema = z
  .object({
    customer_mode: z.enum(["existing", "new"]),
    customer_id: z.string().optional(),
    new_customer_name: z.string().optional(),
    new_customer_phone: z.string().optional(),
    new_customer_facebook: z.string().optional(),
    order_type: z.enum(["stock", "preorder"]),
    deposit_paid: z.preprocess(
      (val) => (val === "" || val === undefined ? 0 : val),
      z.coerce.number().min(0).default(0)
    ),
    payment_method: z.enum(["kbz_pay", "wave_pay", "cash", "cod"]),
    note: z.string().optional().or(z.literal("")),
    items: z
      .array(
        z.object({
          product_id: z.string().min(1, "ပစ္စည်း ရွေးချယ်ပါ"),
          quantity: z.preprocess(
            (val) => (val === "" || val === undefined ? 1 : val),
            z.coerce
              .number()
              .int()
              .min(1, "အရေအတွက် အနည်းဆုံး ၁ ခု ထည့်ပါ")
              .default(1)
          ),
        })
      )
      .min(1, "ပစ္စည်း အနည်းဆုံး ၁ မျိုး ထည့်ပါ"),
  })
  .superRefine((data, ctx) => {
    if (data.customer_mode === "existing") {
      if (!data.customer_id || data.customer_id.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "ဖောက်သည် ရွေးချယ်ပါ",
          path: ["customer_id"],
        });
      }
    } else {
      if (!data.new_customer_name || data.new_customer_name.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "ဖောက်သည် အမည် ထည့်ပါ",
          path: ["new_customer_name"],
        });
      }
      if (!data.new_customer_phone || data.new_customer_phone.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "ဖောက်သည် ဖုန်းနံပါတ် ထည့်ပါ",
          path: ["new_customer_phone"],
        });
      }
    }
  });

export type OrderFormValues = z.infer<typeof orderSchema>;
