"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { createClient } from "@/lib/supabase/client";
import type { UnassignedPreorderOrder } from "@/lib/queries/shipments";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface AssignOrdersButtonProps {
  shipmentId: string;
  unassignedOrders: UnassignedPreorderOrder[];
}

export function AssignOrdersButton({
  shipmentId,
  unassignedOrders,
}: AssignOrdersButtonProps) {
  const router = useRouter();
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleOrder = (orderId: string) => {
    setSelectedOrderIds((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handleAssign = async () => {
    if (selectedOrderIds.length === 0) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("orders")
        .update({ shipment_id: shipmentId })
        .in("id", selectedOrderIds);

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("အော်ဒါများ ပို့ဆောင်မှုထဲသို့ ထည့်ပြီးပါပြီ");
      setOpen(false);
      setSelectedOrderIds([]);
      router.refresh();
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "အမှားတစ်ခု ဖြစ်ပေါ်ခဲ့သည်"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button className="w-full h-11 font-semibold gap-1.5 shadow-xs">
            <Plus className="h-4 w-4" />
            အော်ဒါ ထည့်
          </Button>
        }
      />
      <DialogContent className="max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold text-slate-900">
            ကြိုမှာအော်ဒါများ ရွေးချယ်ပါ
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            ဤပို့ဆောင်မှုထဲသို့ ထည့်သွင်းမည့် အော်ဒါများကို ရွေးချယ်ပါ
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-72 overflow-y-auto space-y-2 py-2">
          {unassignedOrders.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-6">
              ထည့်ရန် ကြိုမှာအော်ဒါ မရှိပါ
            </p>
          ) : (
            unassignedOrders.map((order) => {
              const isSelected = selectedOrderIds.includes(order.id);
              return (
                <div
                  key={order.id}
                  onClick={() => toggleOrder(order.id)}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg border text-sm cursor-pointer transition select-none",
                    isSelected
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "border-slate-200 hover:bg-slate-50"
                  )}
                >
                  <div className="flex-1 min-w-0 pr-3">
                    <p className="font-medium text-slate-900 truncate">
                      {order.customer_name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      ပစ္စည်း {order.items_count} မျိုး •{" "}
                      {Number(order.total_price).toLocaleString()} ကျပ်
                    </p>
                  </div>
                  <div
                    className={cn(
                      "h-5 w-5 rounded-md border flex items-center justify-center shrink-0 transition",
                      isSelected
                        ? "bg-primary border-primary text-white"
                        : "border-slate-300 bg-white"
                    )}
                  >
                    {isSelected && <Check className="h-3.5 w-3.5" />}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <DialogFooter className="flex gap-2 sm:justify-end pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isSubmitting}
            className="flex-1 sm:flex-initial"
          >
            မလုပ်တော့ပါ
          </Button>
          <Button
            type="button"
            onClick={handleAssign}
            disabled={selectedOrderIds.length === 0 || isSubmitting}
            className="flex-1 sm:flex-initial font-medium gap-1.5"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            ထည့်သွင်းမည် ({selectedOrderIds.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

