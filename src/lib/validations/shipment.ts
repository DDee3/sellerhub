import { z } from "zod";

export const shipmentSchema = z.object({
  name: z.string().min(1, "အမည် ထည့်ပါ"),
  source: z.string().min(1, "မူရင်း ထည့်ပါ"),
  order_date: z.string().min(1, "မှာယူသည့်ရက် ထည့်ပါ"),
  arrive_date: z.string().optional().or(z.literal("")),
  status: z
    .enum(["ordering", "in_transit", "arrived", "delivering", "completed"])
    .default("ordering"),
  total_cost: z.preprocess(
    (val) => (val === "" || val === undefined ? 0 : val),
    z.coerce.number().min(0, "ကုန်ကျစရိတ် အနည်းဆုံး ၀ ကျပ် ဖြစ်ရပါမည်").default(0)
  ),
  note: z.string().optional().or(z.literal("")),
});

export type ShipmentFormValues = z.infer<typeof shipmentSchema>;

