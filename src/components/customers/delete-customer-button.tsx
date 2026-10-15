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

interface DeleteCustomerButtonProps {
  customerId: string;
  customerName: string;
  ordersCount: number;
}

export function DeleteCustomerButton({
  customerId,
  customerName,
  ordersCount,
}: DeleteCustomerButtonProps) {
  const router = useRouter();
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (ordersCount > 0) {
    return (
      <Button
        type="button"
        variant="destructive"
        size="sm"
        className="gap-1.5 opacity-50 cursor-not-allowed"
        title="အော်ဒါများ ရှိသဖြင့် ဖျက်၍ မရပါ"
        onClick={() => {
          toast.error(
            `ဤဝယ်ယူသူတွင် အော်ဒါ ${ordersCount} ခု ရှိသဖြင့် ဖျက်၍ မရပါ`
          );
        }}
      >
        <Trash2 className="h-3.5 w-3.5" />
        ဖျက်မည်
      </Button>
    );
  }

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("customers")
        .delete()
        .eq("id", customerId);

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("ဖျက်ပြီးပါပြီ");
      setOpen(false);
      router.push("/customers");
      router.refresh();
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : typeof err === "object" && err !== null && "message" in err
          ? String((err as { message: unknown }).message)
          : "အမှားတစ်ခု ဖြစ်ပေါ်ခဲ့သည်";
      toast.error(message);
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
          <DialogTitle>ဖျက်ရန် သေချာပါသလား?</DialogTitle>
          <DialogDescription>
            ဝယ်ယူသူ &ldquo;{customerName}&rdquo; ကို အပြီးတိုင် ဖျက်ပါမည်။ ဤလုပ်ဆောင်ချက်ကို ပြန်လည်ပြင်ဆင်၍ မရနိုင်ပါ။
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

