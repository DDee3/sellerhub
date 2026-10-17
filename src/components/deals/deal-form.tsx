"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, type Resolver } from "react-hook-form";
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

export function DealForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<DealFormValues>({
    resolver: zodResolver(dealSchema) as unknown as Resolver<DealFormValues>,
    defaultValues: {
      direction: "mmk_to_thb",
      amount_in: "" as unknown as number,
      customer_rate: "" as unknown as number,
      source_rate: "" as unknown as number,
      note: "",
    },
    mode: "onChange",
  });

  const direction = form.watch("direction");
  const amountInRaw = form.watch("amount_in");
  const customerRateRaw = form.watch("customer_rate");
  const sourceRateRaw = form.watch("source_rate");

  const amountIn = Number(amountInRaw);
  const customerRate = Number(customerRateRaw);
  const sourceRate =
    sourceRateRaw !== "" && sourceRateRaw !== null && sourceRateRaw !== undefined
      ? Number(sourceRateRaw)
      : null;

  // Live calculations
  let amountOut: number | null = null;
  let profitMmk: number | null = null;

  if (amountIn > 0 && customerRate > 0) {
    if (direction === "mmk_to_thb") {
      amountOut = amountIn / customerRate;
    } else {
      amountOut = amountIn * customerRate;
    }

    if (sourceRate !== null && !isNaN(sourceRate) && sourceRate > 0) {
      if (direction === "mmk_to_thb") {
        profitMmk = amountIn - amountOut * sourceRate;
      } else {
        profitMmk = amountIn * sourceRate - amountOut;
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

      // Fetch current user's shop_id
      const { data: shop, error: shopError } = await supabase
        .from("shops")
        .select("id")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (shopError || !shop) {
        toast.error("Could not find a shop for this user. Please set up a shop first.");
        return;
      }

      // Compute final values
      const finalAmountIn = Number(values.amount_in);
      const finalCustomerRate = Number(values.customer_rate);
      const validSourceRate =
        values.source_rate !== "" &&
        values.source_rate !== null &&
        values.source_rate !== undefined &&
        Number(values.source_rate) > 0
          ? Number(values.source_rate)
          : null;

      let finalAmountOut = 0;
      if (values.direction === "mmk_to_thb") {
        finalAmountOut = finalAmountIn / finalCustomerRate;
      } else {
        finalAmountOut = finalAmountIn * finalCustomerRate;
      }
      finalAmountOut = Number(finalAmountOut.toFixed(2));

      let finalProfitMmk: number | null = null;
      if (validSourceRate !== null) {
        if (values.direction === "mmk_to_thb") {
          finalProfitMmk = finalAmountIn - finalAmountOut * validSourceRate;
        } else {
          finalProfitMmk = finalAmountIn * validSourceRate - finalAmountOut;
        }
        finalProfitMmk = Number(finalProfitMmk.toFixed(2));
      }

      const { error: insertError } = await supabase.from("deals").insert({
        shop_id: shop.id,
        direction: values.direction,
        amount_in: finalAmountIn,
        customer_rate: finalCustomerRate,
        source_rate: validSourceRate,
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

  return (
    <div className="border border-border bg-card p-6 rounded-lg max-w-xl">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          {/* Direction Toggle */}
          <FormField
            control={form.control}
            name="direction"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-xs font-medium text-foreground">Direction</FormLabel>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => field.onChange("mmk_to_thb")}
                    className={cn(
                      "h-9 px-3 text-xs font-semibold rounded-md border transition-colors flex items-center justify-center gap-1.5",
                      field.value === "mmk_to_thb"
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background text-muted-foreground border-input hover:bg-muted/60"
                    )}
                  >
                    <span>MMK → THB</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => field.onChange("thb_to_mmk")}
                    className={cn(
                      "h-9 px-3 text-xs font-semibold rounded-md border transition-colors flex items-center justify-center gap-1.5",
                      field.value === "thb_to_mmk"
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background text-muted-foreground border-input hover:bg-muted/60"
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
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-xs font-medium text-foreground">
                  Amount in ({inCurrency})
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    step="any"
                    placeholder={`e.g. ${direction === "mmk_to_thb" ? "100000" : "1000"}`}
                    disabled={isSubmitting}
                    className="h-9 text-sm bg-background border-input"
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          {/* Customer Rate */}
          <FormField
            control={form.control}
            name="customer_rate"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-xs font-medium text-foreground">
                  Customer rate (MMK per 1 THB)
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    step="any"
                    placeholder="e.g. 125.50"
                    disabled={isSubmitting}
                    className="h-9 text-sm bg-background border-input"
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
                <FormLabel className="text-xs font-medium text-foreground">
                  Source rate (optional)
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    type="number"
                    step="any"
                    placeholder="e.g. 124.00"
                    disabled={isSubmitting}
                    className="h-9 text-sm bg-background border-input"
                  />
                </FormControl>
                <FormDescription className="text-[11px] text-muted-foreground">
                  Leave blank if using own float
                </FormDescription>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          {/* Live Calculation Box */}
          <div className="rounded-md border border-border bg-muted/40 p-3 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Amount out ({outCurrency}):</span>
              <span className="font-semibold text-foreground tabular-nums text-sm">
                {amountOut !== null && !isNaN(amountOut)
                  ? `${amountOut.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })} ${outCurrency}`
                  : "—"}
              </span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-border/60">
              <span className="text-muted-foreground">Estimated profit (MMK):</span>
              <span
                className={cn(
                  "font-semibold tabular-nums text-sm",
                  profitMmk !== null && !isNaN(profitMmk)
                    ? profitMmk >= 0
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-rose-600 dark:text-rose-400"
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
                <FormLabel className="text-xs font-medium text-foreground">Note (optional)</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Reference, customer tag, or notes..."
                    rows={2}
                    disabled={isSubmitting}
                    className="text-sm bg-background border-input resize-none"
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
            className="w-full h-9 text-sm font-medium"
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
