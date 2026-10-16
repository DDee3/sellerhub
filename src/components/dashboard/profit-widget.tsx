"use client";

import { useEffect, useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Percent,
  CircleDollarSign,
  ArrowUpRight,
  Sparkles,
  BarChart3,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  Cell,
} from "recharts";
import type { ProfitSummary } from "@/lib/queries/profit";
import { useLanguage } from "@/components/providers/language-provider";
import { cn } from "@/lib/utils";

interface ProfitWidgetProps {
  summary: ProfitSummary;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload: { day: string; profit: number };
  }>;
  currency: string;
}

function CustomTooltip({ active, payload, currency }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="rounded-lg border border-border bg-card/95 px-3 py-1.5 shadow-md backdrop-blur-xs">
        <p className="text-[11px] font-mono text-muted-foreground">{data.day}</p>
        <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
          +{data.profit.toLocaleString()} {currency}
        </p>
      </div>
    );
  }
  return null;
}

export function ProfitWidget({ summary }: ProfitWidgetProps) {
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    thisMonthRevenue,
    thisMonthProfit,
    percentChange,
    marginPercent,
    dailySeries,
  } = summary;

  const isPositiveChange = percentChange > 0;
  const isNegativeChange = percentChange < 0;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-card p-5 sm:p-6 shadow-soft transition-all duration-200 hover:shadow-lift">
      {/* Decorative background glow */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-primary/5 blur-3xl" />

      {/* Header Row */}
      <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border/50 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
            <CircleDollarSign className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold tracking-tight text-foreground flex items-center gap-1.5">
              {t("dashboard.profit_title")}
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            </h2>
            <p className="text-xs text-muted-foreground">
              {t("dashboard.profit_this_month")}
            </p>
          </div>
        </div>

        {/* Badges: MoM Change & Margin */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Percent Change Badge */}
          <div
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold tabular-nums",
              isPositiveChange &&
                "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
              isNegativeChange &&
                "bg-rose-500/15 text-rose-700 dark:text-rose-300",
              !isPositiveChange &&
                !isNegativeChange &&
                "bg-muted text-muted-foreground"
            )}
          >
            {isPositiveChange && <TrendingUp className="h-3.5 w-3.5" />}
            {isNegativeChange && <TrendingDown className="h-3.5 w-3.5" />}
            <span>
              {isPositiveChange ? "+" : ""}
              {percentChange.toFixed(1)}%
            </span>
            <span className="text-[10px] font-normal opacity-80">
              {t("dashboard.vs_last_month")}
            </span>
          </div>

          {/* Profit Margin Pill */}
          <div className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary dark:text-primary-foreground/90">
            <Percent className="h-3 w-3" />
            <span>{marginPercent.toFixed(1)}%</span>
            <span className="text-[10px] font-normal opacity-75">
              {t("dashboard.profit_margin")}
            </span>
          </div>
        </div>
      </div>

      {/* Hero Stats */}
      <div className="relative mt-5 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        {/* Main Net Profit */}
        <div className="md:col-span-2">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {t("dashboard.profit_this_month")}
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground tabular-nums">
              {thisMonthProfit.toLocaleString()}
            </span>
            <span className="text-sm font-semibold text-muted-foreground">
              {t("currency")}
            </span>
          </div>
        </div>

        {/* Revenue Sub-card */}
        <div className="md:col-span-1">
          <div className="rounded-xl border border-border/50 bg-muted/30 p-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{t("dashboard.revenue")}</span>
              <ArrowUpRight className="h-3.5 w-3.5 text-blue-500" />
            </div>
            <div className="mt-1 text-lg font-bold text-foreground tabular-nums truncate">
              {thisMonthRevenue.toLocaleString()}{" "}
              <span className="text-xs font-normal text-muted-foreground">
                {t("currency")}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recharts Chart / Daily Series */}
      <div className="relative mt-6 pt-5 border-t border-border/50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <BarChart3 className="h-3.5 w-3.5" />
            <span>{t("dashboard.daily_profit_trend")}</span>
          </div>
        </div>

        {dailySeries.length > 0 && mounted ? (
          <div className="h-36 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={dailySeries}
                margin={{ top: 8, right: 6, left: 6, bottom: 0 }}
                onMouseMove={(state) => {
                  if (typeof state.activeTooltipIndex === "number") {
                    setHoveredIdx(state.activeTooltipIndex);
                  }
                }}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                <XAxis
                  dataKey="day"
                  tickFormatter={(val: string) => val.slice(8, 10)}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                />
                <Tooltip
                  cursor={{ fill: "rgba(16, 185, 129, 0.08)" }}
                  content={<CustomTooltip currency={t("currency")} />}
                />
                <Bar dataKey="profit" radius={[4, 4, 0, 0]} maxBarSize={28}>
                  {dailySeries.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        hoveredIdx === index
                          ? "rgb(16, 185, 129)"
                          : "rgba(16, 185, 129, 0.65)"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border/80 bg-muted/20 py-8 px-4 text-center">
            <p className="text-xs font-medium text-muted-foreground">
              {t("dashboard.no_profit_data")}
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground/80 max-w-md mx-auto">
              {t("dashboard.profit_hint")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
