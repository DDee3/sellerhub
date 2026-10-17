import { z } from "zod";

export const dealSchema = z.object({
  direction: z.enum(["mmk_to_thb", "thb_to_mmk"]),
  amount_in: z.coerce.number().positive("Amount must be greater than 0"),
  customer_rate: z.coerce.number().positive("Rate must be greater than 0"),
  source_rate: z
    .coerce
    .number()
    .positive("Rate must be greater than 0")
    .optional()
    .nullable()
    .or(z.literal("")),
  note: z.string().optional(),
});

export type DealFormValues = z.infer<typeof dealSchema>;

