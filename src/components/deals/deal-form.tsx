"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { dealSchema, type DealFormValues } from "@/lib/validations/deal";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import type { RateDisplayMode } from "@/types/database";

interface DealFormProps {
  initialRateDisplayMode?: RateDisplayMode;
}

export function DealForm({ initialRateDisplayMode }: DealFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rateDisplayMode, setRateDisplayMode] = useState<RateDisplayMode>(
    initialRateDisplayMode || "mmk_per_thb"
  );
  const [prevInitialMode, setPrevInitialMode] = useState(initialRateDisplayMode);

  if (prevInitialMode !== initialRateDisplayMode) {
    setPrevInitialMode(initialRateDisplayMode);
    setRateDisplayMode(initialRateDisplayMode || "mmk_per_thb");
  }

  useEffect(() => {
    let isMounted = true;
    async function loadShopSetting() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || !isMounted) return;

      const { data: shop } = await supabase
        .from("shops")
        .select("rate_display_mode")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (shop?.rate_display_mode && isMounted) {
        setRateDisplayMode(shop.rate_display_mode as RateDisplayMode);
      }
    }

    loadShopSetting();
    return () => {
      isMounted = false;
    };
  }, []);

  const form = useForm<DealFormValues>({
    resolver: zodResolver(dealSchema) as unknown as Resolver<DealFormValues>,
    defaultValues: {
      direction: "mmk_to_thb",
      amount_in: "" as unknown as number,
      customer_rate: "" as unknown as number,
      source_rate: "" as unknown as number,
      note: "",
    },
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  const direction = useWatch({ control: form.control, name: "direction" });
  const amountInRaw = useWatch({ control: form.control, name: "amount_in" });
  const customerRateRaw = useWatch({ control: form.control, name: "customer_rate" });
  const sourceRateRaw = useWatch({ control: form.control, name: "source_rate" });

  const amountIn = Number(amountInRaw);
  const rate_mode = rateDisplayMode;
  const customer_rate = Number(customerRateRaw);
  const source_rate =
    sourceRateRaw !== "" && sourceRateRaw !== null && sourceRateRaw !== undefined
      ? Number(sourceRateRaw)
      : null;

  // Real rates: convert 'Lakh' rate to 'per-THB' rate before calculating
  const real_customer_rate =
    customer_rate > 0
      ? rate_mode === "thb_per_lakh" || customer_rate > 500
        ? 100000 / customer_rate
        : customer_rate
      : null;

  const real_source_rate =
    source_rate !== null && source_rate > 0
      ? rate_mode === "thb_per_lakh" || source_rate > 500
        ? 100000 / source_rate
        : source_rate
      : null;

  // Live calculations using the real_ rates
  let amountOut: number | null = null;
  let profitMmk: number | null = null;

  if (amountIn > 0 && real_customer_rate !== null && real_customer_rate > 0) {
    if (direction === "mmk_to_thb") {
      amountOut = amountIn / real_customer_rate;
      if (real_source_rate !== null && real_source_rate > 0) {
        profitMmk = amountIn - amountOut * real_source_rate;
      }
    } else {
      amountOut = amountIn * real_customer_rate;
      if (real_source_rate !== null && real_source_rate > 0) {
        profitMmk = amountIn * real_source_rate - amountOut;
      }
    }
  }

  const onSubmit = async (values: DealFormValues) => {
    setIsSubmitting(true);
    const supabase = createClient();

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        toast.error("You must be logged in to record a deal");
        return;
      }

      // Fetch or create user's shop to guarantee a valid shop_id
      let { data: shop } = await supabase
        .from("shops")
        .select("id, rate_display_mode")
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
            rate_display_mode: "mmk_per_thb",
          })
          .select("id, rate_display_mode")
          .single();

        if (createShopError || !newShop) {
          toast.error("Could not find or create a shop for your account.");
          return;
        }
        shop = newShop;
      }

      const rate_mode = rateDisplayMode;
      const finalAmountIn = Number(values.amount_in);
      const customer_rate = Number(values.customer_rate);
      const source_rate =
        values.source_rate !== "" &&
        values.source_rate !== null &&
        values.source_rate !== undefined &&
        Number(values.source_rate) > 0
          ? Number(values.source_rate)
          : null;

      // Real rates: convert 'Lakh' rate to 'per-THB' rate before calculating
      const real_customer_rate =
        rate_mode === "thb_per_lakh" || customer_rate > 500
          ? 100000 / customer_rate
          : customer_rate;

      if (!real_customer_rate || real_customer_rate <= 0) {
        toast.error("Invalid customer rate");
        return;
      }

      const real_source_rate =
        source_rate !== null
          ? rate_mode === "thb_per_lakh" || source_rate > 500
            ? 100000 / source_rate
            : source_rate
          : null;

      let finalAmountOut = 0;
      let finalProfitMmk: number | null = null;

      if (values.direction === "mmk_to_thb") {
        finalAmountOut = finalAmountIn / real_customer_rate;
        if (real_source_rate !== null) {
          finalProfitMmk = finalAmountIn - finalAmountOut * real_source_rate;
        }
      } else {
        finalAmountOut = finalAmountIn * real_customer_rate;
        if (real_source_rate !== null) {
          finalProfitMmk = finalAmountIn * real_source_rate - finalAmountOut;
        }
      }

      finalAmountOut = Number(finalAmountOut.toFixed(2));
      if (finalProfitMmk !== null) {
        finalProfitMmk = Number(finalProfitMmk.toFixed(2));
      }

      const { error: insertError } = await supabase.from("deals").insert({
        shop_id: shop.id,
        direction: values.direction,
        amount_in: finalAmountIn,
        customer_rate: Number(real_customer_rate.toFixed(6)),
        source_rate:
          real_source_rate !== null
            ? Number(real_source_rate.toFixed(6))
            : null,
        amount_out: finalAmountOut,
        profit_mmk: finalProfitMmk,
        note: values.note?.trim() || null,
      });

      if (insertError) {
        console.error("[DealForm] Insert error:", insertError);
        toast.error(insertError.message || "Failed to save deal");
        return;
      }

      toast.success("Deal saved");
      router.push("/deals");
      router.refresh();
    } catch (err: unknown) {
      console.error("[DealForm] Unexpected error:", err);
      toast.error("An unexpected error occurred while saving deal");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inCurrency = direction === "mmk_to_thb" ? "MMK" : "THB";
  const outCurrency = direction === "mmk_to_thb" ? "THB" : "MMK";

  // Dynamic labels based on rate_display_mode
  const isLakhMode = rateDisplayMode === "thb_per_lakh";
  const customerRateLabel = isLakhMode
    ? "Customer rate (1 Lakh MMK = [X] THB)"
    : "Customer rate (1 THB = [X] MMK)";
  const sourceRateLabel = isLakhMode
    ? "Source rate (1 Lakh MMK = [X] THB, optional)"
    : "Source rate (1 THB = [X] MMK, optional)";
  const customerRatePlaceholder = isLakhMode ? "e.g. 728" : "e.g. 137.50";
  const sourceRatePlaceholder = isLakhMode ? "e.g. 740" : "e.g. 135.00";

  return (
    <div className="border border-border bg-card p-8 rounded-xl shadow-stripi-1 max-w-xl">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Direction Toggle */}
          <FormField
            control={form.control}
            name="direction"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="text-[13px] font-normal text-foreground">Direction</FormLabel>
                <div className="grid grid-cols-2 gap-2 p-1 rounded-full bg-canvas-soft border border-border">
                  <button
                    type="button"
                    onClick={() => field.onChange("mmk_to_thb")}
                    className={cn(
                      "h-9 px-4 text-xs font-normal rounded-full transition-all flex items-center justify-center gap-1.5",
                      field.value === "mmk_to_thb"
                        ? "bg-primary text-white shadow-stripi-1"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <span>MMK → THB</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => field.onChange("thb_to_mmk")}
                    className={cn(
                      "h-9 px-4 text-xs font-normal rounded-full transition-all flex items-center justify-center gap-1.5",
                      field.value === "thb_to_mmk"
                        ? "bg-primary text-white shadow-stripi-1"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <span>THB → MMK</span>
                  </button>
                </div>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          {/* Amount In */}
          <FormField
            control={form.control}
            name="amount_in"
            render={({ field }) => {
              const quickAmounts = [
                { label: "10k", value: 10000 },
                { label: "50k", value: 50000 },
                { label: "1 Lakh", value: 100000 },
                { label: "5 Lakh", value: 500000 },
                { label: "10 Lakh", value: 1000000 },
              ];

              return (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-[13px] font-normal text-foreground">
                    Amount in ({inCurrency})
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      step="any"
                      placeholder={`e.g. ${direction === "mmk_to_thb" ? "100000" : "1000"}`}
                      disabled={isSubmitting}
                      className="h-10 text-[15px] font-light bg-card border-input tabular-nums"
                    />
                  </FormControl>
                  {/* Quick Amount Buttons */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {quickAmounts.map((item) => (
                      <button
                        key={item.label}
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => {
                          field.onChange(item.value);
                        }}
                        className={cn(
                          "h-7 px-2.5 text-xs rounded-full border transition-all select-none disabled:opacity-50",
                          Number(field.value) === item.value
                            ? "border-primary/50 bg-primary/10 text-primary font-normal"
                            : "border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted font-light"
                        )}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                  <FormMessage className="text-xs" />
                </FormItem>
              );
            }}
          />

          {/* Customer Rate */}
          <FormField
            control={form.control}
            name="customer_rate"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <FormLabel className="text-[13px] font-normal text-foreground">
                    {customerRateLabel}
                  </FormLabel>
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() =>
                      setRateDisplayMode((prev) =>
                        prev === "thb_per_lakh" ? "mmk_per_thb" : "thb_per_lakh"
                      )
                    }
                    className="text-[11px] text-primary hover:underline font-light"
                  >
                    Switch to {rateDisplayMode === "thb_per_lakh" ? "1 THB = X MMK" : "1 Lakh MMK = X THB"}
                  </button>
                </div>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    step="any"
                    placeholder={customerRatePlaceholder}
                    disabled={isSubmitting}
                    className="h-10 text-[15px] font-light bg-card border-input tabular-nums"
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          {/* Source Rate (Optional) */}
          <FormField
            control={form.control}
            name="source_rate"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-[13px] font-normal text-foreground">
                  {sourceRateLabel}
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    type="number"
                    step="any"
                    placeholder={sourceRatePlaceholder}
                    disabled={isSubmitting}
                    className="h-10 text-[15px] font-light bg-card border-input tabular-nums"
                  />
                </FormControl>
                <FormDescription className="text-[12px] font-light text-muted-foreground">
                  Leave blank if using own float
                </FormDescription>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          {/* Live Calculation Box */}
          <div className="rounded-xl border border-border bg-canvas-soft p-4 space-y-3 text-[13px]">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground font-light">Amount out ({outCurrency}):</span>
              <span className="font-light text-foreground tabular-nums text-base tracking-[-0.42px]">
                {amountOut !== null && !isNaN(amountOut)
                  ? `${amountOut.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })} ${outCurrency}`
                  : "—"}
              </span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <span className="text-muted-foreground font-light">Estimated profit (MMK):</span>
              <span
                className={cn(
                  "font-light tabular-nums text-base tracking-[-0.42px]",
                  profitMmk !== null && !isNaN(profitMmk)
                    ? profitMmk >= 0
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-[#ea2261]"
                    : "text-muted-foreground"
                )}
              >
                {profitMmk !== null && !isNaN(profitMmk)
                  ? `${profitMmk.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })} MMK`
                  : "—"}
              </span>
            </div>
          </div>

          {/* Note (Optional) */}
          <FormField
            control={form.control}
            name="note"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-[13px] font-normal text-foreground">Note (optional)</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Reference, customer tag, or notes..."
                    rows={2}
                    disabled={isSubmitting}
                    className="text-[15px] font-light bg-card border-input resize-none"
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-10 text-sm font-normal rounded-full"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving deal...
              </>
            ) : (
              "Save deal"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}

export default DealForm;
