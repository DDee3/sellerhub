"use client";

import { useState, useActionState, useEffect } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { submitDeal, type SubmitDealState } from "@/lib/actions/deal-actions";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { RateDisplayMode } from "@/types/database";

export interface SourceInputItem {
  id: string;
  amount: string;
  rate: string;
}

export interface DealFormProps {
  initialRateDisplayMode?: RateDisplayMode;
  dealId?: string;
  initialData?: {
    direction: "mmk_to_thb" | "thb_to_mmk";
    amount_in: number;
    customer_rate: number;
    source_rate?: number | null;
    amount_out?: number | null;
    profit_mmk?: number | null;
    note?: string | null;
    customer_id?: string | null;
  } | null;
  initialSources?: {
    source_amount: number;
    source_rate: number;
  }[] | null;
}

export function DealForm({
  initialRateDisplayMode,
  dealId,
  initialData,
  initialSources,
}: DealFormProps) {
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

  const getInitialRates = (mode: RateDisplayMode) => {
    if (!initialData) {
      return {
        customer_rate: "",
        source_rate: "",
      };
    }
    const isLakh = mode === "thb_per_lakh";
    const custRate = initialData.customer_rate
      ? isLakh
        ? initialData.customer_rate > 500
          ? initialData.customer_rate
          : Number((100000 / initialData.customer_rate).toFixed(2))
        : initialData.customer_rate > 500
        ? Number((100000 / initialData.customer_rate).toFixed(2))
        : initialData.customer_rate
      : "";

    const srcRate = initialData.source_rate
      ? isLakh
        ? initialData.source_rate > 500
          ? initialData.source_rate
          : Number((100000 / initialData.source_rate).toFixed(2))
        : initialData.source_rate > 500
        ? Number((100000 / initialData.source_rate).toFixed(2))
        : initialData.source_rate
      : "";

    return {
      customer_rate: custRate !== "" ? String(custRate) : "",
      source_rate: srcRate !== "" ? String(srcRate) : "",
    };
  };

  const initialRates = getInitialRates(initialRateDisplayMode || "mmk_per_thb");

  const [direction, setDirection] = useState<"mmk_to_thb" | "thb_to_mmk">(
    initialData?.direction || "mmk_to_thb"
  );
  const [amountIn, setAmountIn] = useState<string>(
    initialData?.amount_in !== undefined && initialData?.amount_in !== null
      ? String(initialData.amount_in)
      : ""
  );
  const [customerRate, setCustomerRate] = useState<string>(initialRates.customer_rate);

  // Dynamic sources state
  const isLakh = (initialRateDisplayMode || "mmk_per_thb") === "thb_per_lakh";
  const [sources, setSources] = useState<SourceInputItem[]>(() => {
    if (initialSources && initialSources.length > 0) {
      return initialSources.map((s, idx) => {
        const formattedRate = isLakh
          ? s.source_rate > 500
            ? s.source_rate
            : Number((100000 / s.source_rate).toFixed(2))
          : s.source_rate > 500
          ? Number((100000 / s.source_rate).toFixed(2))
          : s.source_rate;
        return {
          id: `src-${idx + 1}`,
          amount: String(s.source_amount),
          rate: String(formattedRate),
        };
      });
    }

    return [
      {
        id: "src-1",
        amount: initialData?.amount_in ? String(initialData.amount_in) : "",
        rate: initialRates.source_rate || "",
      },
    ];
  });

  const [note, setNote] = useState<string>(initialData?.note || "");

  const initialState: SubmitDealState = { message: null, errors: {} };
  const [state, formAction, isPending] = useActionState(submitDeal, initialState);

  useEffect(() => {
    if (state?.message && (!state?.errors || Object.keys(state.errors).length === 0)) {
      toast.error(state.message);
    }
  }, [state]);

  const handleAddSource = () => {
    setSources((prev) => [
      ...prev,
      {
        id: `src-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        amount: "",
        rate: "",
      },
    ]);
  };

  const handleRemoveSource = (indexToRemove: number) => {
    setSources((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((_, idx) => idx !== indexToRemove);
    });
  };

  const handleSourceChange = (
    index: number,
    field: "amount" | "rate",
    value: string
  ) => {
    setSources((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, [field]: value } : item))
    );
  };

  const numAmountIn = Number(amountIn);
  const numCustomerRate = Number(customerRate);

  // Real customer rate: convert 'Lakh' rate to 'per-THB' rate before calculating
  const real_customer_rate =
    numCustomerRate > 0
      ? rateDisplayMode === "thb_per_lakh" || numCustomerRate > 500
        ? 100000 / numCustomerRate
        : numCustomerRate
      : null;

  // Live calculations using real rates and multiple sources
  let amountOut: number | null = null;
  let profitMmk: number | null = null;

  if (numAmountIn > 0 && real_customer_rate !== null && real_customer_rate > 0) {
    if (direction === "mmk_to_thb") {
      amountOut = numAmountIn / real_customer_rate;
    } else {
      amountOut = numAmountIn * real_customer_rate;
    }

    // Calculate source costs/revenues across sources
    const validSources = sources
      .map((s) => {
        const amt = Number(s.amount) || 0;
        const rt = Number(s.rate) || 0;
        const isSrcLakh = rateDisplayMode === "thb_per_lakh" || rt > 500;
        const realRt = rt > 0 ? (isSrcLakh ? 100000 / rt : rt) : null;
        return { amt, realRt };
      })
      .filter((s) => s.realRt !== null && s.realRt > 0);

    if (validSources.length > 0) {
      if (direction === "mmk_to_thb") {
        let totalCostMmk = 0;
        for (const s of validSources) {
          const srcAmt = validSources.length === 1 && s.amt === 0 ? amountOut : s.amt;
          totalCostMmk += srcAmt * s.realRt!;
        }
        profitMmk = numAmountIn - totalCostMmk;
      } else {
        let totalRevenueMmk = 0;
        for (const s of validSources) {
          const srcAmt = validSources.length === 1 && s.amt === 0 ? numAmountIn : s.amt;
          totalRevenueMmk += srcAmt * s.realRt!;
        }
        profitMmk = totalRevenueMmk - amountOut;
      }
    }
  }

  const displayAmountOut =
    amountOut !== null && !isNaN(amountOut)
      ? amountOut
      : initialData?.amount_out !== undefined && initialData?.amount_out !== null
      ? initialData.amount_out
      : null;

  const displayProfitMmk =
    profitMmk !== null && !isNaN(profitMmk)
      ? profitMmk
      : initialData?.profit_mmk !== undefined && initialData?.profit_mmk !== null
      ? initialData.profit_mmk
      : null;

  const inCurrency = direction === "mmk_to_thb" ? "MMK" : "THB";
  const outCurrency = direction === "mmk_to_thb" ? "THB" : "MMK";

  // Dynamic labels based on rate_display_mode
  const isLakhMode = rateDisplayMode === "thb_per_lakh";
  const customerRateLabel = isLakhMode
    ? "Customer rate (1 Lakh MMK = [X] THB)"
    : "Customer rate (1 THB = [X] MMK)";
  const sourceRatePlaceholder = isLakhMode ? "e.g. 740" : "e.g. 135.00";
  const customerRatePlaceholder = isLakhMode ? "e.g. 728" : "e.g. 137.50";

  const quickAmounts = [
    { label: "10k", value: 10000 },
    { label: "50k", value: 50000 },
    { label: "1 Lakh", value: 100000 },
    { label: "5 Lakh", value: 500000 },
    { label: "10 Lakh", value: 1000000 },
  ];

  return (
    <div className="border border-border bg-card p-8 rounded-xl shadow-stripi-1 max-w-xl">
      <form action={formAction} className="space-y-6">
        <input type="hidden" name="direction" value={direction} />
        <input type="hidden" name="deal_id" value={dealId || ""} />
        <input type="hidden" name="rate_display_mode" value={rateDisplayMode} />

        {state?.message && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
            {state.message}
          </div>
        )}

        {/* Direction Toggle */}
        <div className="space-y-2">
          <label className="text-[13px] font-normal text-foreground">Direction</label>
          <div className="grid grid-cols-2 gap-2 p-1 rounded-full bg-muted/50 border border-border">
            <button
              type="button"
              onClick={() => setDirection("mmk_to_thb")}
              className={cn(
                "h-9 px-4 text-xs font-normal rounded-full transition-all flex items-center justify-center gap-1.5",
                direction === "mmk_to_thb"
                  ? "bg-primary text-white shadow-stripi-1"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span>MMK → THB</span>
            </button>
            <button
              type="button"
              onClick={() => setDirection("thb_to_mmk")}
              className={cn(
                "h-9 px-4 text-xs font-normal rounded-full transition-all flex items-center justify-center gap-1.5",
                direction === "thb_to_mmk"
                  ? "bg-primary text-white shadow-stripi-1"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span>THB → MMK</span>
            </button>
          </div>
          {state?.errors?.direction && (
            <p className="text-sm text-destructive mt-1">{state.errors.direction[0]}</p>
          )}
        </div>

        {/* Amount In */}
        <div className="space-y-1.5">
          <label className="text-[13px] font-normal text-foreground">
            Amount in ({inCurrency})
          </label>
          <Input
            name="amount_in"
            type="number"
            step="any"
            value={amountIn}
            onChange={(e) => setAmountIn(e.target.value)}
            placeholder={`e.g. ${direction === "mmk_to_thb" ? "100000" : "1000"}`}
            disabled={isPending}
            className="h-10 text-[15px] font-light bg-card border-input tabular-nums"
          />
          {/* Quick Amount Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {quickAmounts.map((item) => (
              <button
                key={item.label}
                type="button"
                disabled={isPending}
                onClick={() => setAmountIn(String(item.value))}
                className={cn(
                  "h-7 px-2.5 text-xs rounded-full border transition-all select-none disabled:opacity-50",
                  Number(amountIn) === item.value
                    ? "border-primary/50 bg-primary/10 text-primary font-normal"
                    : "border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted font-light"
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
          {state?.errors?.amount_in && (
            <p className="text-sm text-destructive mt-1">{state.errors.amount_in[0]}</p>
          )}
        </div>

        {/* Customer Rate */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[13px] font-normal text-foreground">
              {customerRateLabel}
            </label>
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
          <Input
            name="customer_rate"
            type="number"
            step="any"
            value={customerRate}
            onChange={(e) => setCustomerRate(e.target.value)}
            placeholder={customerRatePlaceholder}
            disabled={isPending}
            className="h-10 text-[15px] font-light bg-card border-input tabular-nums"
          />
          {state?.errors?.customer_rate && (
            <p className="text-sm text-destructive mt-1">{state.errors.customer_rate[0]}</p>
          )}
        </div>

        {/* Split Sourcing - Dynamic List of Sources */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-[13px] font-normal text-foreground">
                Sources (Split Sourcing)
              </label>
              <p className="text-[11px] font-light text-muted-foreground">
                Enter source amounts and rates ({isLakhMode ? "1 Lakh MMK = X THB" : "1 THB = X MMK"}).
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddSource}
              disabled={isPending}
              className="h-7 px-2.5 text-xs font-normal rounded-full gap-1 border-border bg-card hover:bg-muted"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Source</span>
            </Button>
          </div>

          <div className="space-y-2.5">
            {sources.map((source, index) => (
              <div
                key={source.id}
                className="rounded-xl border border-border bg-muted/30 p-3 space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-foreground">
                    Source #{index + 1}
                  </span>
                  {sources.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveSource(index)}
                      disabled={isPending}
                      className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1 transition-colors"
                      title="Remove source"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Source Amount */}
                  <div className="space-y-1">
                    <label
                      htmlFor={`source_amount_${index}`}
                      className="text-[11px] font-light text-muted-foreground"
                    >
                      Source Amount ({inCurrency})
                    </label>
                    <Input
                      id={`source_amount_${index}`}
                      name={`sources[${index}].amount`}
                      type="number"
                      step="any"
                      value={source.amount}
                      onChange={(e) =>
                        handleSourceChange(index, "amount", e.target.value)
                      }
                      placeholder={`e.g. ${amountIn || "100000"}`}
                      disabled={isPending}
                      className="h-9 text-[14px] font-light bg-card border-input tabular-nums"
                    />
                  </div>

                  {/* Source Rate */}
                  <div className="space-y-1">
                    <label
                      htmlFor={`source_rate_${index}`}
                      className="text-[11px] font-light text-muted-foreground"
                    >
                      Source Rate
                    </label>
                    <Input
                      id={`source_rate_${index}`}
                      name={`sources[${index}].rate`}
                      type="number"
                      step="any"
                      value={source.rate}
                      onChange={(e) =>
                        handleSourceChange(index, "rate", e.target.value)
                      }
                      placeholder={sourceRatePlaceholder}
                      disabled={isPending}
                      className="h-9 text-[14px] font-light bg-card border-input tabular-nums"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {state?.errors?.sources && (
            <p className="text-sm text-destructive mt-1">{state.errors.sources[0]}</p>
          )}
        </div>

        {/* Live Calculation Box */}
        <div className="rounded-xl border border-border bg-muted/50 p-4 space-y-3 text-[13px]">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground font-light">Amount out ({outCurrency}):</span>
            <span className="font-light text-foreground tabular-nums text-base tracking-[-0.42px]">
              {displayAmountOut !== null && !isNaN(displayAmountOut)
                ? `${displayAmountOut.toLocaleString(undefined, {
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
                displayProfitMmk !== null && !isNaN(displayProfitMmk)
                  ? displayProfitMmk >= 0
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-destructive"
                  : "text-muted-foreground"
              )}
            >
              {displayProfitMmk !== null && !isNaN(displayProfitMmk)
                ? `${displayProfitMmk.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })} MMK`
                : "—"}
            </span>
          </div>
        </div>

        {/* Note (Optional) */}
        <div className="space-y-1.5">
          <label className="text-[13px] font-normal text-foreground">Note (optional)</label>
          <Textarea
            name="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Reference, customer tag, or notes..."
            rows={2}
            disabled={isPending}
            className="text-[15px] font-light bg-card border-input resize-none"
          />
          {state?.errors?.note && (
            <p className="text-sm text-destructive mt-1">{state.errors.note[0]}</p>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isPending}
          className="w-full h-10 text-sm font-normal rounded-full"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {dealId ? "Updating..." : "Saving..."}
            </>
          ) : dealId ? (
            "Update Deal"
          ) : (
            "Save deal"
          )}
        </Button>
      </form>
    </div>
  );
}

export default DealForm;
