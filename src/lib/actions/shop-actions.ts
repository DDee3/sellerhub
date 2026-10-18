"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { floatSchema } from "@/lib/validations/shop";

export { floatSchema };

export type UpdateFloatState = {
  success?: boolean;
  message?: string | null;
  errors?: {
    float_mmk?: string[];
    float_thb?: string[];
    [key: string]: string[] | undefined;
  };
};

export async function updateFloat(
  prevState: any,
  formData: FormData
): Promise<UpdateFloatState> {
  const float_mmk = formData.get("float_mmk");
  const float_thb = formData.get("float_thb");

  const parsed = floatSchema.safeParse({
    float_mmk,
    float_thb,
  });

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
      message: "Invalid fields",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      errors: {},
      message: "You must be logged in to update float values.",
    };
  }

  // Fetch or create user's shop
  let { data: shop } = await supabase
    .from("shops")
    .select("id")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!shop) {
    const { data: newShop, error: createError } = await supabase
      .from("shops")
      .insert({
        owner_id: user.id,
        name: "My Store",
        float_mmk: parsed.data.float_mmk,
        float_thb: parsed.data.float_thb,
      })
      .select("id")
      .single();

    if (createError || !newShop) {
      return {
        errors: {},
        message: "Could not find or create a shop for your account.",
      };
    }
  } else {
    const { error: updateError } = await supabase
      .from("shops")
      .update({
        float_mmk: parsed.data.float_mmk,
        float_thb: parsed.data.float_thb,
      })
      .eq("id", shop.id);

    if (updateError) {
      console.error("[updateFloat] Update error:", updateError);
      return {
        errors: {},
        message: updateError.message || "Failed to update float values",
      };
    }
  }

  revalidatePath("/dashboard");
  return { success: true };
}

