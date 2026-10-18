"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { dealSchema } from "@/lib/validations/deal";

export type SubmitDealState = {
  message?: string | null;
  errors?: {
    direction?: string[];
    amount_in?: string[];
    customer_rate?: string[];
    sources?: string[];
    note?: string[];
    [key: string]: string[] | undefined;
  };
};

export async function submitDeal(
  prevState: any,
  formData: FormData
): Promise<SubmitDealState> {
  const direction = formData.get("direction");
  const amount_in = formData.get("amount_in");
  const customer_rate = formData.get("customer_rate");
  const note = formData.get("note");
  const deal_id = formData.get("deal_id") as string | null;
  const rate_mode = (formData.get("rate_display_mode") as string) || "mmk_per_thb";

  // Extract sources using array convention: sources[0].amount, sources[0].rate, etc.
  const sourcesMap: Record<number, { amount?: number; rate?: number }> = {};
  for (const [key, value] of formData.entries()) {
    const match = key.match(/^sources\[(\d+)\]\.(amount|rate)$/);
    if (match) {
      const index = parseInt(match[1], 10);
      const field = match[2] as "amount" | "rate";
      if (!sourcesMap[index]) {
        sourcesMap[index] = {};
      }
      const numVal = Number(value);
      sourcesMap[index][field] = !isNaN(numVal) ? numVal : 0;
    }
  }

  let extractedSources = Object.keys(sourcesMap)
    .sort((a, b) => Number(a) - Number(b))
    .map((k) => ({
      amount: sourcesMap[Number(k)].amount ?? 0,
      rate: sourcesMap[Number(k)].rate ?? 0,
    }));

  // Fallback for single source if amount was left blank but rate was entered
  const parsedAmountIn = Number(amount_in) || 0;
  if (
    extractedSources.length === 1 &&
    extractedSources[0].amount === 0 &&
    extractedSources[0].rate > 0
  ) {
    extractedSources[0].amount = parsedAmountIn;
  }

  // Filter out completely blank rows if there are multiple, but keep at least one
  if (extractedSources.length > 1) {
    const filled = extractedSources.filter(
      (s) => s.amount > 0 || s.rate > 0
    );
    if (filled.length > 0) {
      extractedSources = filled;
    }
  }

  const validatedFields = dealSchema.safeParse({
    direction,
    amount_in,
    customer_rate,
    sources: extractedSources,
    note: typeof note === "string" ? note : undefined,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
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
      message: "You must be logged in to record a deal",
    };
  }

  // Fetch or create user's shop to guarantee a valid shop_id
  let { data: shop } = await supabase
    .from("shops")
    .select("id")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!shop) {
    const { data: newShop, error: createShopError } = await supabase
      .from("shops")
      .insert({
        owner_id: user.id,
        name: "My Store",
        rate_display_mode: "thb_per_lakh",
      })
      .select("id")
      .single();

    if (createShopError || !newShop) {
      return {
        errors: {},
        message: "Could not find or create a shop for your account.",
      };
    }
    shop = newShop;
  }

  const finalAmountIn = Number(validatedFields.data.amount_in);
  const rawCustomerRate = Number(validatedFields.data.customer_rate);

  // Real customer rate: convert 'Lakh' rate to 'per-THB' rate before calculating
  const isCustLakh = rate_mode === "thb_per_lakh" || rawCustomerRate > 500;
  const realCustomerRate = isCustLakh
    ? 100000 / rawCustomerRate
    : rawCustomerRate;

  let finalAmountOut = 0;
  if (validatedFields.data.direction === "mmk_to_thb") {
    finalAmountOut = finalAmountIn / realCustomerRate;
  } else {
    finalAmountOut = finalAmountIn * realCustomerRate;
  }
  finalAmountOut = Number(finalAmountOut.toFixed(2));

  // Compute weighted average source rate and profit across all sources
  let totalSourceCostOrRevenueMmk = 0;
  let totalSourceAmount = 0;

  for (const s of validatedFields.data.sources) {
    const isSrcLakh = rate_mode === "thb_per_lakh" || s.rate > 500;
    const realSrcRate = isSrcLakh ? 100000 / s.rate : s.rate;
    totalSourceCostOrRevenueMmk += s.amount * realSrcRate;
    totalSourceAmount += s.amount;
  }

  let weightedAverageSourceRate: number | null = null;
  let finalProfitMmk: number | null = null;

  if (totalSourceAmount > 0) {
    weightedAverageSourceRate = totalSourceCostOrRevenueMmk / totalSourceAmount;

    if (validatedFields.data.direction === "mmk_to_thb") {
      finalProfitMmk = finalAmountIn - totalSourceCostOrRevenueMmk;
    } else {
      finalProfitMmk = totalSourceCostOrRevenueMmk - finalAmountOut;
    }
    finalProfitMmk = Number(finalProfitMmk.toFixed(2));
  }

  const noteVal = validatedFields.data.note?.trim() || null;

  if (deal_id && deal_id.trim() !== "") {
    // 1. Update main record in deals
    const { error: updateError } = await supabase
      .from("deals")
      .update({
        direction: validatedFields.data.direction,
        amount_in: finalAmountIn,
        customer_rate: Number(realCustomerRate.toFixed(6)),
        source_rate:
          weightedAverageSourceRate !== null
            ? Number(weightedAverageSourceRate.toFixed(6))
            : null,
        amount_out: finalAmountOut,
        profit_mmk: finalProfitMmk,
        note: noteVal,
      })
      .eq("id", deal_id);

    if (updateError) {
      console.error("[submitDeal] Update error:", updateError);
      return {
        errors: {},
        message: updateError.message || "Failed to update deal",
      };
    }

    // 2. Delete existing deal_sources and insert new sources
    await supabase.from("deal_sources").delete().eq("deal_id", deal_id);

    const sourceRows = validatedFields.data.sources.map((s) => {
      const isSrcLakh = rate_mode === "thb_per_lakh" || s.rate > 500;
      const realSrcRate = isSrcLakh ? 100000 / s.rate : s.rate;
      return {
        deal_id: deal_id,
        source_amount: s.amount,
        source_rate: Number(realSrcRate.toFixed(6)),
      };
    });

    if (sourceRows.length > 0) {
      const { error: insertSourcesError } = await supabase
        .from("deal_sources")
        .insert(sourceRows);

      if (insertSourcesError) {
        console.error(
          "[submitDeal] Insert sources error:",
          insertSourcesError
        );
      }
    }
  } else {
    // 1. Insert main record into deals
    const { data: newDeal, error: insertError } = await supabase
      .from("deals")
      .insert({
        shop_id: shop.id,
        direction: validatedFields.data.direction,
        amount_in: finalAmountIn,
        customer_rate: Number(realCustomerRate.toFixed(6)),
        source_rate:
          weightedAverageSourceRate !== null
            ? Number(weightedAverageSourceRate.toFixed(6))
            : null,
        amount_out: finalAmountOut,
        profit_mmk: finalProfitMmk,
        note: noteVal,
      })
      .select("id")
      .single();

    if (insertError || !newDeal) {
      console.error("[submitDeal] Insert error:", insertError);
      return {
        errors: {},
        message: insertError?.message || "Failed to save deal",
      };
    }

    // 2. Take returned deal_id and insert array of sources into deal_sources
    const sourceRows = validatedFields.data.sources.map((s) => {
      const isSrcLakh = rate_mode === "thb_per_lakh" || s.rate > 500;
      const realSrcRate = isSrcLakh ? 100000 / s.rate : s.rate;
      return {
        deal_id: newDeal.id,
        source_amount: s.amount,
        source_rate: Number(realSrcRate.toFixed(6)),
      };
    });

    if (sourceRows.length > 0) {
      const { error: insertSourcesError } = await supabase
        .from("deal_sources")
        .insert(sourceRows);

      if (insertSourcesError) {
        console.error(
          "[submitDeal] Insert sources error:",
          insertSourcesError
        );
      }
    }
  }

  revalidatePath("/deals");
  revalidatePath("/dashboard");
  redirect("/deals");
}
