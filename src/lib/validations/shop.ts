import { z } from "zod";

export const floatSchema = z.object({
  float_mmk: z.coerce.number().min(0, "Amount must be 0 or greater"),
  float_thb: z.coerce.number().min(0, "Amount must be 0 or greater"),
});

export type FloatFormValues = z.infer<typeof floatSchema>;

