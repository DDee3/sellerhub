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

interface DeleteShipmentButtonProps {
  shipmentId: string;
}

export function DeleteShipmentButton({ shipmentId }: DeleteShipmentButtonProps) {
  const router = useRouter();
  const supabase = createClient();
  const { t } = useLanguage();
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

      toast.success(t("delete") || "Deleted");
      setOpen(false);
      router.push("/shipments");
      router.refresh();
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : t("error")
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
            className="gap-1.5 rounded-xl shadow-soft"
            disabled={isDeleting}
          >
            <Trash2 className="h-3.5 w-3.5" />
            {t("common.delete")}
          </Button>
        }
      />
      <DialogContent className="bg-card text-card-foreground border-border shadow-lift rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {t("common.delete")}?
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {t("shipments.detail.title")}
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
