import { z } from "zod";

export const customerSchema = z.object({
  name: z.string().min(1, "အမည် ထည့်ပါ"),
  phone: z.string().min(1, "ဖုန်းနံပါတ် ထည့်ပါ"),
  facebook_name: z.string().optional().or(z.literal("")),
  telegram_username: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  note: z.string().optional().or(z.literal("")),
});

export type CustomerFormValues = z.infer<typeof customerSchema>;

