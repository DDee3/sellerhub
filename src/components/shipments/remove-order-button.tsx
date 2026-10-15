"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { createClient } from "@/lib/supabase/client";
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

interface RemoveOrderButtonProps {
  orderId: string;
}

export function RemoveOrderButton({ orderId }: RemoveOrderButtonProps) {
  const router = useRouter();
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const handleRemove = async () => {
    setIsRemoving(true);
    try {
      const { error } = await supabase
        .from("orders")
        .update({ shipment_id: null })
        .eq("id", orderId);

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("ဖယ်ရှားပြီးပါပြီ");
      setOpen(false);
      router.refresh();
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "အမှားတစ်ခု ဖြစ်ပေါ်ခဲ့သည်"
      );
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            className="text-slate-400 hover:text-red-600 hover:bg-red-50 h-7 w-7 rounded-md"
            title="ဖယ်ရှားမည်"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">ဖယ်ရှားမည်</span>
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>ဤအော်ဒါကို ပို့ဆောင်မှုမှ ဖယ်ရှားမည်လား?</DialogTitle>
          <DialogDescription>
            ဤအော်ဒါကို ပို့ဆောင်မှုမှ ဖယ်ထုတ်ပါမည်။ အော်ဒါသည် ပျက်ပြယ်မည် မဟုတ်ပါ။
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <DialogClose
            render={
              <Button type="button" variant="outline" disabled={isRemoving}>
                မလုပ်တော့ပါ
              </Button>
            }
          />
          <Button
            type="button"
            variant="destructive"
            onClick={handleRemove}
            disabled={isRemoving}
            className="gap-2"
          >
            {isRemoving && <Loader2 className="h-4 w-4 animate-spin" />}
            ဖယ်ရှားမည်
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

