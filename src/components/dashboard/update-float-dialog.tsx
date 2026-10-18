"use client";

import { useState, useActionState, useEffect } from "react";
import { Loader2, Pencil } from "lucide-react";
import { toast } from "sonner";

import { updateFloat, type UpdateFloatState } from "@/lib/actions/shop-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

export interface UpdateFloatDialogProps {
  currentMmk: number;
  currentThb: number;
  trigger?: React.ReactNode;
}

export function UpdateFloatDialog({
  currentMmk,
  currentThb,
  trigger,
}: UpdateFloatDialogProps) {
  const [open, setOpen] = useState(false);
  const [mmk, setMmk] = useState<string>(String(currentMmk ?? 0));
  const [thb, setThb] = useState<string>(String(currentThb ?? 0));

  const initialState: UpdateFloatState = {
    success: false,
    errors: {},
    message: null,
  };
  const [state, formAction, isPending] = useActionState(
    updateFloat,
    initialState
  );

  useEffect(() => {
    if (open) {
      setMmk(String(currentMmk ?? 0));
      setThb(String(currentThb ?? 0));
    }
  }, [open, currentMmk, currentThb]);

  useEffect(() => {
    if (state?.success) {
      toast.success("Float updated successfully");
      setOpen(false);
    } else if (state?.message && !state?.success) {
      toast.error(state.message);
    }
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? (
        <DialogTrigger render={trigger as React.ReactElement} />
      ) : (
        <DialogTrigger
          render={
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs font-normal text-primary hover:text-primary hover:bg-primary/10 gap-1 rounded-md"
            >
              <Pencil className="h-3 w-3" />
              <span>Edit</span>
            </Button>
          }
        />
      )}

      <DialogContent className="sm:max-w-md bg-card text-card-foreground border-border shadow-stripi-2 rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-foreground">Manage Own Float</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Update your own starting cash float balances for MMK and THB.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4 pt-2">
          {state?.message && !state?.success && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-2.5 text-xs text-destructive">
              {state.message}
            </div>
          )}

          {/* MMK Float Input */}
          <div className="space-y-1.5">
            <Label htmlFor="float_mmk" className="text-xs font-normal text-foreground">
              Own Float (MMK)
            </Label>
            <Input
              id="float_mmk"
              name="float_mmk"
              type="number"
              step="any"
              min="0"
              value={mmk}
              onChange={(e) => setMmk(e.target.value)}
              placeholder="e.g. 1000000"
              disabled={isPending}
              className="h-10 text-[14px] font-light bg-card border-input tabular-nums"
            />
            {state?.errors?.float_mmk && (
              <p className="text-destructive text-sm mt-1">
                {state.errors.float_mmk[0]}
              </p>
            )}
          </div>

          {/* THB Float Input */}
          <div className="space-y-1.5">
            <Label htmlFor="float_thb" className="text-xs font-normal text-foreground">
              Own Float (THB)
            </Label>
            <Input
              id="float_thb"
              name="float_thb"
              type="number"
              step="any"
              min="0"
              value={thb}
              onChange={(e) => setThb(e.target.value)}
              placeholder="e.g. 50000"
              disabled={isPending}
              className="h-10 text-[14px] font-light bg-card border-input tabular-nums"
            />
            {state?.errors?.float_thb && (
              <p className="text-destructive text-sm mt-1">
                {state.errors.float_thb[0]}
              </p>
            )}
          </div>

          <DialogFooter className="pt-2 gap-2 sm:gap-2">
            <DialogClose
              render={
                <Button
                  type="button"
                  variant="outline"
                  disabled={isPending}
                  className="rounded-full text-xs font-normal"
                >
                  Cancel
                </Button>
              }
            />
            <Button
              type="submit"
              disabled={isPending}
              className="rounded-full text-xs font-normal"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Float"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default UpdateFloatDialog;

