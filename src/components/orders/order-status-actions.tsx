"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { createClient } from "@/lib/supabase/client";
import type { OrderStatus } from "@/lib/queries/orders";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";

interface OrderStatusActionsProps {
  orderId: string;
  currentStatus: OrderStatus;
}

export function OrderStatusActions({
  orderId,
  currentStatus,
}: OrderStatusActionsProps) {
  const router = useRouter();
  const supabase = createClient();
  const [isUpdating, setIsUpdating] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  const updateStatus = async (newStatus: OrderStatus) => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("id", orderId);

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("အခြေအနေ ပြောင်းပြီးပါပြီ");
      setCancelDialogOpen(false);
      router.refresh();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "အမှားတစ်ခု ဖြစ်ပေါ်ခဲ့သည်"
      );
    } finally {
      setIsUpdating(false);
    }
  };

  if (currentStatus === "delivered") {
    return (
      <div className="flex items-center gap-1.5 text-emerald-600 font-medium text-sm">
        <CheckCircle2 className="h-4 w-4" />
        <span>ပေးပြီးပါပြီ</span>
      </div>
    );
  }

  if (currentStatus === "cancelled") {
    return (
      <div className="flex items-center gap-1.5 text-slate-400 font-medium text-sm">
        <XCircle className="h-4 w-4" />
        <span>ပယ်ဖျက်ပြီး</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {currentStatus === "pending" && (
        <Button
          onClick={() => updateStatus("confirmed")}
          disabled={isUpdating}
          className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium"
        >
          {isUpdating && <Loader2 className="h-4 w-4 animate-spin" />}
          အတည်ပြု
        </Button>
      )}

      {currentStatus === "confirmed" && (
        <Button
          onClick={() => updateStatus("delivered")}
          disabled={isUpdating}
          className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
        >
          {isUpdating && <Loader2 className="h-4 w-4 animate-spin" />}
          ပေးပြီး
        </Button>
      )}

      {/* Confirmation Dialog for Cancel only */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogTrigger
          render={
            <Button
              variant="destructive"
              disabled={isUpdating}
              className="gap-1.5 font-medium"
            >
              ပယ်ဖျက်
            </Button>
          }
        />
        <DialogContent>
          <DialogHeader>
            <DialogTitle>အော်ဒါ ပယ်ဖျက်ရန် သေချာပါသလား?</DialogTitle>
            <DialogDescription>
              ဤအော်ဒါကို ပယ်ဖျက်ပါမည်။ ဤလုပ်ဆောင်ချက်ကို ပြန်လည်ပြင်ဆင်၍ မရနိုင်ပါ။
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <DialogClose
              render={
                <Button variant="outline" disabled={isUpdating}>
                  မလုပ်တော့ပါ
                </Button>
              }
            />
            <Button
              variant="destructive"
              onClick={() => updateStatus("cancelled")}
              disabled={isUpdating}
              className="gap-2"
            >
              {isUpdating && <Loader2 className="h-4 w-4 animate-spin" />}
              ပယ်ဖျက်မည်
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

