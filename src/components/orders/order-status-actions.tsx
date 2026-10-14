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
  orderType: "stock" | "preorder";
}

export function OrderStatusActions({
  orderId,
  currentStatus,
  orderType,
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
      router.refresh();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "အမှားတစ်ခု ဖြစ်ပေါ်ခဲ့သည်"
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = async () => {
    // Guard: only run restore if not already cancelled
    if (currentStatus === "cancelled") return;

    setIsUpdating(true);
    try {
      // If stock order, restore inventory first
      if (orderType === "stock") {
        const { data: items, error: itemsErr } = await supabase
          .from("order_items")
          .select("product_id, quantity")
          .eq("order_id", orderId);

        if (itemsErr) {
          throw new Error(itemsErr.message);
        }

        if (items) {
          for (const item of items) {
            if (!item.product_id) continue;

            const { data: prod, error: prodErr } = await supabase
              .from("products")
              .select("stock_qty, shop_id")
              .eq("id", item.product_id)
              .single();

            if (prodErr) {
              throw new Error(prodErr.message);
            }

            if (prod) {
              const { error: updateErr } = await supabase
                .from("products")
                .update({ stock_qty: prod.stock_qty + item.quantity })
                .eq("id", item.product_id);

              if (updateErr) {
                throw new Error(updateErr.message);
              }

              const { error: moveErr } = await supabase
                .from("stock_movements")
                .insert({
                  shop_id: prod.shop_id,
                  product_id: item.product_id,
                  change: item.quantity,
                  reason: "returned",
                  note: `Order ${orderId} cancelled`,
                });

              if (moveErr) {
                throw new Error(moveErr.message);
              }
            }
          }
        }
      }

      // THEN update order status to cancelled
      const { error: statusErr } = await supabase
        .from("orders")
        .update({ status: "cancelled" })
        .eq("id", orderId);

      if (statusErr) {
        throw new Error(statusErr.message);
      }

      toast.success("အော်ဒါ ပယ်ဖျက်ပြီးပါပြီ");
      setCancelDialogOpen(false);
      router.refresh();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "အော်ဒါ ပယ်ဖျက်ရာတွင် အမှားတစ်ခု ဖြစ်ပေါ်ခဲ့သည်"
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
              {orderType === "stock"
                ? "ဤအော်ဒါကို ပယ်ဖျက်ပါမည်။ ပစ္စည်းလက်ကျန်များကို အလိုအလျောက် ပြန်လည်ဖြည့်သွင်းပေးပါမည်။"
                : "ဤအော်ဒါကို ပယ်ဖျက်ပါမည်။ ဤလုပ်ဆောင်ချက်ကို ပြန်လည်ပြင်ဆင်၍ မရနိုင်ပါ။"}
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
              onClick={handleCancel}
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
