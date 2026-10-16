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
import { useLanguage } from "@/components/providers/language-provider";

interface RemoveOrderButtonProps {
  orderId: string;
}

export function RemoveOrderButton({ orderId }: RemoveOrderButtonProps) {
  const router = useRouter();
  const supabase = createClient();
  const { t } = useLanguage();
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

      toast.success(t("delete") || "Removed");
      setOpen(false);
      router.refresh();
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : t("error")
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
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-7 w-7 rounded-lg"
            title={t("delete")}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">{t("delete")}</span>
          </Button>
        }
      />
      <DialogContent className="bg-card text-card-foreground border-border shadow-lift rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {t("common.delete")}?
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {t("shipments.detail.orders")}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <DialogClose
            render={
              <Button type="button" variant="outline" disabled={isRemoving} className="rounded-xl border-border bg-card text-foreground hover:bg-muted">
                {t("common.cancel")}
              </Button>
            }
          />
          <Button
            type="button"
            variant="destructive"
            onClick={handleRemove}
            disabled={isRemoving}
            className="gap-2 rounded-xl"
          >
            {isRemoving && <Loader2 className="h-4 w-4 animate-spin" />}
            {t("common.delete")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
