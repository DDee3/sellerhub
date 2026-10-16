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

interface DeleteProductButtonProps {
  productId: string;
  productName: string;
}

export function DeleteProductButton({
  productId,
  productName,
}: DeleteProductButtonProps) {
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const { t } = useLanguage();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", productId);

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success(t("common.delete"));
      setOpen(false);
      router.push("/products");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("error"));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            variant="destructive"
            className="h-10 gap-2 bg-destructive/10 text-red-400 hover:bg-destructive/20 hover:text-red-300 border border-destructive/20"
          >
            <Trash2 className="h-4 w-4 text-red-400" />
            {t("common.delete")}
          </Button>
        }
      />
      <DialogContent className="bg-card text-card-foreground border-border shadow-lift rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-foreground">{t("common.delete")}?</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            &quot;{productName}&quot;
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
