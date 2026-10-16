"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

import { createClient } from "@/lib/supabase/client";
import type { ShipmentStatus } from "@/lib/queries/shipments";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/providers/language-provider";

interface ShipmentStatusActionsProps {
  shipmentId: string;
  currentStatus: ShipmentStatus;
}

export function ShipmentStatusActions({
  shipmentId,
  currentStatus,
}: ShipmentStatusActionsProps) {
  const router = useRouter();
  const supabase = createClient();
  const { t } = useLanguage();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleAdvance = async (nextStatus: ShipmentStatus) => {
    setIsUpdating(true);
    try {
      const shipRes = await supabase
        .from("shipments")
        .update({ status: nextStatus })
        .eq("id", shipmentId)
        .select();

      if (shipRes.error) {
        throw shipRes.error;
      }

      if (nextStatus === "arrived") {
        const ordRes = await supabase
          .from("orders")
          .update({ status: "delivered" })
          .eq("shipment_id", shipmentId)
          .in("status", ["pending", "confirmed"])
          .select();

        if (ordRes.error) {
          throw ordRes.error;
        }
      }

      toast.success(t("settings.saved_success"));
      router.refresh();
    } catch (error: unknown) {
      console.error("[status] caught error:", error);
      const message =
        error instanceof Error
          ? error.message
          : typeof error === "object" && error !== null && "message" in error
          ? String((error as { message: unknown }).message)
          : t("error");
      toast.error(message);
    } finally {
      setIsUpdating(false);
    }
  };

  if (currentStatus === "completed") {
    return (
      <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-700 dark:text-emerald-300 text-sm font-medium">
        <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
        <span>{t("shipments.status_completed")}</span>
      </div>
    );
  }

  return (
    <div>
      {currentStatus === "ordering" && (
        <Button
          onClick={() => handleAdvance("in_transit")}
          disabled={isUpdating}
          className="w-full h-11 font-semibold shadow-soft rounded-xl"
        >
          {isUpdating && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          {t("shipments.detail.advance_status")}
        </Button>
      )}

      {currentStatus === "in_transit" && (
        <Button
          onClick={() => handleAdvance("arrived")}
          disabled={isUpdating}
          className="w-full h-11 font-semibold shadow-soft rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          {isUpdating && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          {t("shipments.status_arrived")}
        </Button>
      )}

      {currentStatus === "arrived" && (
        <Button
          onClick={() => handleAdvance("delivering")}
          disabled={isUpdating}
          className="w-full h-11 font-semibold shadow-soft rounded-xl bg-amber-600 hover:bg-amber-700 text-white"
        >
          {isUpdating && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          {t("shipments.status_delivering")}
        </Button>
      )}

      {currentStatus === "delivering" && (
        <Button
          onClick={() => handleAdvance("completed")}
          disabled={isUpdating}
          className="w-full h-11 font-semibold shadow-soft rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          {isUpdating && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          {t("shipments.status_completed")}
        </Button>
      )}
    </div>
  );
}
