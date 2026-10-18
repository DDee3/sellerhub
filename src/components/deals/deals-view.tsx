"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Download, ArrowLeftRight, Pencil, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { DealListItem } from "@/lib/queries/deals";
import type { RateDisplayMode } from "@/types/database";

interface DealsViewProps {
  deals: DealListItem[];
  rateDisplayMode: RateDisplayMode;
}

export function DealsView({ deals, rateDisplayMode }: DealsViewProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const isLakhMode = rateDisplayMode === "thb_per_lakh";

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };

  const escapeCsvCell = (val: unknown): string => {
    if (val === null || val === undefined) return "";
    const str = String(val);
    if (
      str.includes(",") ||
      str.includes('"') ||
      str.includes("\n") ||
      str.includes("\r")
    ) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const handleExportCsv = () => {
    if (deals.length === 0) {
      toast.error("No deals to export");
      return;
    }

    const headers = [
      "Date",
      "Direction",
      "Amount In",
      "Customer Rate",
      "Amount Out",
      "Profit MMK",
      "Note",
    ];

    const rows = deals.map((deal) => {
      const formattedRate = isLakhMode
        ? (100000 / deal.customer_rate).toFixed(2)
        : deal.customer_rate.toString();

      const directionLabel =
        deal.direction === "mmk_to_thb" ? "MMK to THB" : "THB to MMK";

      return [
        escapeCsvCell(formatDate(deal.created_at)),
        escapeCsvCell(directionLabel),
        escapeCsvCell(deal.amount_in),
        escapeCsvCell(formattedRate),
        escapeCsvCell(deal.amount_out),
        escapeCsvCell(deal.profit_mmk !== null ? deal.profit_mmk : ""),
        escapeCsvCell(deal.note || ""),
      ].join(",");
    });

    const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const now = new Date();
    const dateStr = now.toISOString().split("T")[0];
    const filename = `deals-export-${dateStr}.csv`;

    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success(`Exported ${deals.length} deals to CSV`);
  };

  const handleDelete = async (dealId: string) => {
    if (!window.confirm("Are you sure you want to delete this deal?")) return;
    try {
      setDeletingId(dealId);
      const supabase = createClient();
      const { error } = await supabase.from("deals").delete().eq("id", dealId);
      if (error) {
        toast.error("Failed to delete deal: " + error.message);
        return;
      }
      toast.success("Deal deleted");
      router.refresh();
    } catch {
      toast.error("Failed to delete deal");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-light tracking-[-0.64px] text-foreground">
            Deals
          </h1>
          <p className="text-xs sm:text-sm font-light text-muted-foreground mt-0.5">
            {deals.length} recorded currency exchange transaction{deals.length === 1 ? "" : "s"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            disabled={deals.length === 0}
            className="gap-1.5 h-8 px-3.5 text-xs font-normal rounded-full border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-50"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </Button>
        </div>
      </div>

      {/* Deals Table or Empty State */}
      {deals.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center flex flex-col items-center justify-center space-y-4 shadow-stripi-1">
          <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
            <ArrowLeftRight className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-light tracking-[-0.22px] text-foreground">
              No deals recorded yet
            </h3>
            <p className="text-xs font-light text-muted-foreground max-w-sm">
              Record your first currency exchange deal to start tracking rates and daily profits.
            </p>
          </div>
          <Link
            href="/deals/new"
            className={cn(
              buttonVariants({ variant: "default" }),
              "h-8 px-3.5 text-xs font-normal gap-1.5"
            )}
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Record a deal</span>
          </Link>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card shadow-stripi-1 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[13px]">
              <thead>
                <tr className="border-b border-border bg-muted/50 text-muted-foreground font-normal">
                  <th className="py-2.5 px-3.5 font-normal text-[11px] tracking-[0.05px]">
                    Date
                  </th>
                  <th className="py-2.5 px-3.5 font-normal text-[11px] tracking-[0.05px]">
                    Direction
                  </th>
                  <th className="py-2.5 px-3.5 text-right font-normal text-[11px] tracking-[0.05px]">
                    Amount In
                  </th>
                  <th className="py-2.5 px-3.5 text-right font-normal text-[11px] tracking-[0.05px]">
                    Customer Rate
                  </th>
                  <th className="py-2.5 px-3.5 text-right font-normal text-[11px] tracking-[0.05px]">
                    Amount Out
                  </th>
                  <th className="py-2.5 px-3.5 text-right font-normal text-[11px] tracking-[0.05px]">
                    Profit
                  </th>
                  <th className="py-2.5 px-3.5 font-normal text-[11px] tracking-[0.05px]">
                    Note
                  </th>
                  <th className="py-2.5 px-3.5 text-right font-normal text-[11px] tracking-[0.05px]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {deals.map((deal) => {
                  const inCurrency =
                    deal.direction === "mmk_to_thb" ? "MMK" : "THB";
                  const outCurrency =
                    deal.direction === "mmk_to_thb" ? "THB" : "MMK";

                  const formattedRate = isLakhMode
                    ? (100000 / deal.customer_rate).toLocaleString(undefined, {
                        maximumFractionDigits: 2,
                      }) + " THB/Lakh"
                    : deal.customer_rate.toLocaleString(undefined, {
                        maximumFractionDigits: 2,
                      }) + " MMK/THB";

                  const dateObj = new Date(deal.created_at);
                  const formattedDate = dateObj.toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  });
                  const formattedTime = dateObj.toLocaleTimeString(undefined, {
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  return (
                    <tr
                      key={deal.id}
                      className="hover:bg-canvas-soft/70 transition-colors"
                    >
                      <td className="py-2.5 px-3.5 whitespace-nowrap text-muted-foreground font-light text-[12px]">
                        <div>{formattedDate}</div>
                        <div className="text-[11px] text-muted-foreground/70">
                          {formattedTime}
                        </div>
                      </td>
                      <td className="py-2.5 px-3.5 whitespace-nowrap">
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-normal tracking-[0.1px]",
                            deal.direction === "mmk_to_thb"
                              ? "bg-[#b9b9f9]/40 text-[#4434d4] dark:bg-[#533afd]/25 dark:text-[#b9b9f9]"
                              : "bg-amber-500/15 text-amber-700 dark:text-amber-400"
                          )}
                        >
                          {deal.direction === "mmk_to_thb"
                            ? "MMK → THB"
                            : "THB → MMK"}
                        </span>
                      </td>
                      <td className="py-2.5 px-3.5 whitespace-nowrap text-right font-light text-foreground tabular-nums tracking-[-0.42px]">
                        {deal.amount_in.toLocaleString()} {inCurrency}
                      </td>
                      <td className="py-2.5 px-3.5 whitespace-nowrap text-right tabular-nums tracking-[-0.42px] text-muted-foreground font-light">
                        {formattedRate}
                      </td>
                      <td className="py-2.5 px-3.5 whitespace-nowrap text-right font-light text-foreground tabular-nums tracking-[-0.42px]">
                        {deal.amount_out.toLocaleString()} {outCurrency}
                      </td>
                      <td className="py-2.5 px-3.5 whitespace-nowrap text-right font-light tabular-nums tracking-[-0.42px]">
                        {deal.profit_mmk !== null ? (
                          <span
                            className={
                              deal.profit_mmk >= 0
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-[#ea2261]"
                            }
                          >
                            {deal.profit_mmk.toLocaleString()} MMK
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3.5 text-muted-foreground font-light max-w-xs truncate">
                        {deal.note || "—"}
                      </td>
                      <td className="py-2.5 px-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/deals/${deal.id}/edit`}
                            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors inline-flex items-center justify-center"
                            title="Edit deal"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            <span className="sr-only">Edit</span>
                          </Link>
                          <button
                            type="button"
                            disabled={deletingId === deal.id}
                            onClick={() => handleDelete(deal.id)}
                            className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors inline-flex items-center justify-center disabled:opacity-50"
                            title="Delete deal"
                          >
                            {deletingId === deal.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin text-destructive" />
                            ) : (
                              <Trash2 className="h-3.5 w-3.5" />
                            )}
                            <span className="sr-only">Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default DealsView;

