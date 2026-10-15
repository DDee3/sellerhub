"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

import { createClient } from "@/lib/supabase/client";
import type { ShipmentStatus } from "@/lib/queries/shipments";
import { Button } from "@/components/ui/button";

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
  const [isUpdating, setIsUpdating] = useState(false);

  const handleAdvance = async (nextStatus: ShipmentStatus) => {
    setIsUpdating(true);
    try {
      console.log("[status] shipmentId:", shipmentId, "next:", nextStatus);
      const shipRes = await supabase
        .from("shipments")
        .update({ status: nextStatus })
        .eq("id", shipmentId)
        .select();
      console.log("[status] ship result:", shipRes);
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
        console.log("[status] ord result:", ordRes);
        if (ordRes.error) {
          throw ordRes.error;
        }
      }

      toast.success("အခြေအနေ ပြောင်းပြီးပါပြီ");
      router.refresh();
    } catch (error: any) {
      console.error("[status] caught error:", error);
      toast.error(error?.message ?? "အမှားတစ်ခု ဖြစ်ပေါ်ခဲ့သည်");
    } finally {
      setIsUpdating(false);
    }
  };

  if (currentStatus === "completed") {
    return (
      <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-sm font-medium">
        <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
        <span>ပြီးစီးပါပြီ</span>
      </div>
    );
  }

  return (
    <div>
      {currentStatus === "ordering" && (
        <Button
          onClick={() => handleAdvance("in_transit")}
          disabled={isUpdating}
          className="w-full h-11 font-semibold shadow-xs"
        >
          {isUpdating && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          လမ်းပေါ် ရောက်ပြီ
        </Button>
      )}

      {currentStatus === "in_transit" && (
        <Button
          onClick={() => handleAdvance("arrived")}
          disabled={isUpdating}
          className="w-full h-11 font-semibold shadow-xs bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          {isUpdating && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          မြန်မာ ရောက်ပြီ
        </Button>
      )}

      {currentStatus === "arrived" && (
        <Button
          onClick={() => handleAdvance("delivering")}
          disabled={isUpdating}
          className="w-full h-11 font-semibold shadow-xs bg-amber-600 hover:bg-amber-700 text-white"
        >
          {isUpdating && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          ပို့နေပြီ
        </Button>
      )}

      {currentStatus === "delivering" && (
        <Button
          onClick={() => handleAdvance("completed")}
          disabled={isUpdating}
          className="w-full h-11 font-semibold shadow-xs bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          {isUpdating && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          ပြီးစီးပါပြီ
        </Button>
      )}
    </div>
  );
}

