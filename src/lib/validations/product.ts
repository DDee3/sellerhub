import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(1, "နာမည် ထည့်ပါ"),
  image_url: z.string().url("URL ပုံစံ မှန်ကန်စွာ ထည့်ပါ").optional().or(z.literal("")),
  price: z.coerce.number().min(0, "ဈေးနှုန်း ထည့်ပါ"),
  type: z.enum(["stock", "preorder", "hybrid"]),
  stock_qty: z.coerce.number().int().min(0).default(0),
  low_stock_alert: z.coerce.number().int().min(0).default(3),
  deposit_percent: z.coerce.number().min(0).max(100).default(0),
  source: z.string().optional().or(z.literal("")),
  description: z.string().optional().or(z.literal("")),
  is_active: z.boolean().default(true),
});

export type ProductFormValues = z.infer<typeof productSchema>;

