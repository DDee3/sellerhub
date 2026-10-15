"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";
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

interface DeleteShipmentButtonProps {
  shipmentId: string;
}

export function DeleteShipmentButton({ shipmentId }: DeleteShipmentButtonProps) {
  const router = useRouter();
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("shipments")
        .delete()
        .eq("id", shipmentId);

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("ဖျက်ပြီးပါပြီ");
      setOpen(false);
      router.push("/shipments");
      router.refresh();
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "အမှားတစ်ခု ဖြစ်ပေါ်ခဲ့သည်"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="gap-1.5"
            disabled={isDeleting}
          >
            <Trash2 className="h-3.5 w-3.5" />
            ဖျက်မည်
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>ဤပို့ဆောင်မှုကို ဖျက်မည်လား?</DialogTitle>
          <DialogDescription>
            ဤပို့ဆောင်မှုကို အပြီးတိုင် ဖျက်ပါမည်။ ဤလုပ်ဆောင်ချက်ကို ပြန်လည်ပြင်ဆင်၍ မရနိုင်ပါ။
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <DialogClose
            render={
              <Button type="button" variant="outline" disabled={isDeleting}>
                မလုပ်တော့ပါ
              </Button>
            }
          />
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
            className="gap-2"
          >
            {isDeleting && <Loader2 className="h-4 w-4 animate-spin" />}
            ဖျက်မည်
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

