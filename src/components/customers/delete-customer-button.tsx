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
import { useLanguage } from "@/components/providers/language-provider";

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
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (ordersCount > 0) {
    return (
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="gap-1.5 text-destructive/50 hover:bg-transparent cursor-not-allowed"
        title="အော်ဒါများ ရှိသဖြင့် ဖျက်၍ မရပါ"
        onClick={() => {
          toast.error(
            `ဤဝယ်ယူသူတွင် အော်ဒါ ${ordersCount} ခု ရှိသဖြင့် ဖျက်၍ မရပါ`
          );
        }}
      >
        <Trash2 className="h-4 w-4" />
        {t("common.delete")}
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

      toast.success(t("common.delete"));
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
            variant="ghost"
            size="sm"
            className="gap-1.5 text-destructive hover:bg-destructive/10"
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4" />
            {t("common.delete")}
          </Button>
        }
      />
      <DialogContent className="bg-card text-card-foreground border-border shadow-lift rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-foreground">{t("common.delete")}?</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            &ldquo;{customerName}&rdquo;
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <DialogClose
            render={
              <Button type="button" variant="outline" disabled={isDeleting} className="rounded-xl border-border bg-card text-foreground hover:bg-muted">
                {t("common.cancel")}
              </Button>
            }
          />
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
            className="gap-2 rounded-xl"
          >
            {isDeleting && <Loader2 className="h-4 w-4 animate-spin" />}
            {t("common.delete")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


