"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface OrderPaymentEditorProps {
  orderId: string;
  depositPaid: number;
  totalPrice: number;
  paymentMethod: "kbz_pay" | "wave_pay" | "cash" | "cod" | string;
}

const paymentEditorSchema = z.object({
  deposit_paid: z.preprocess(
    (val) => (val === "" || val === undefined ? 0 : val),
    z.coerce.number().min(0, "စရံငွေ အနည်းဆုံး ၀ ကျပ် ဖြစ်ရပါမည်").default(0)
  ),
  payment_method: z.enum(["kbz_pay", "wave_pay", "cash", "cod"]),
});

type PaymentEditorFormValues = z.infer<typeof paymentEditorSchema>;

export function OrderPaymentEditor({
  orderId,
  depositPaid,
  totalPrice,
  paymentMethod,
}: OrderPaymentEditorProps) {
  const router = useRouter();
  const supabase = createClient();
  const [isPending, startTransition] = useTransition();

  const validPaymentMethod = (
    ["kbz_pay", "wave_pay", "cash", "cod"].includes(paymentMethod)
      ? paymentMethod
      : "cash"
  ) as "kbz_pay" | "wave_pay" | "cash" | "cod";

  const form = useForm<PaymentEditorFormValues>({
    resolver: zodResolver(paymentEditorSchema) as unknown as Resolver<PaymentEditorFormValues>,
    defaultValues: {
      deposit_paid: depositPaid === 0 ? ("" as unknown as number) : depositPaid,
      payment_method: validPaymentMethod,
    },
  });

  const isSubmitting = form.formState.isSubmitting || isPending;

  // Live computed balance due
  const watchedDeposit = form.watch("deposit_paid");
  const parsedDeposit = Number(watchedDeposit) || 0;
  const balanceDue = Math.max(0, totalPrice - parsedDeposit);

  const onSubmit = async (data: PaymentEditorFormValues) => {
    try {
      const sanitizedDeposit = Number(data.deposit_paid) || 0;
      const computedBalance = Math.max(0, totalPrice - sanitizedDeposit);

      const { error } = await supabase
        .from("orders")
        .update({
          deposit_paid: sanitizedDeposit,
          balance_due: computedBalance,
          payment_method: data.payment_method,
        })
        .eq("id", orderId);

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("ငွေပေးချေမှု သိမ်းပြီးပါပြီ");
      startTransition(() => {
        router.refresh();
      });
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "အမှားတစ်ခု ဖြစ်ပေါ်ခဲ့သည်"
      );
    }
  };

  return (
    <Card className="bg-white border-slate-200/80 shadow-xs">
      <CardHeader className="border-b border-slate-100 pb-3">
        <CardTitle className="text-base font-semibold text-slate-900">
          ငွေပေးချေမှု
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        {/* Read-only Total Price display */}
        <div className="flex items-center justify-between py-2 border-b border-slate-100 mb-4 text-sm">
          <span className="text-slate-500">ကျသင့်ငွေ စုစုပေါင်း</span>
          <span className="font-semibold text-slate-900 text-base tabular-nums">
            {totalPrice.toLocaleString()} ကျပ်
          </span>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Deposit Paid Input */}
            <FormField
              control={form.control}
              name="deposit_paid"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-slate-700">
                    စရံ ပေးပြီး (ကျပ်)
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      inputMode="numeric"
                      step="any"
                      min={0}
                      className="h-12 bg-white border-slate-200 text-base"
                      placeholder="0"
                      value={field.value === 0 ? "" : (field.value ?? "")}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === "" ? "" : Number(e.target.value)
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Payment Method Select */}
            <FormField
              control={form.control}
              name="payment_method"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-slate-700">
                    ငွေပေးချေနည်း
                  </FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={(val: string | null) => {
                        if (val) field.onChange(val);
                      }}
                    >
                      <SelectTrigger className="h-12 w-full bg-white border-slate-200 text-base">
                        <span>
                          {field.value === "kbz_pay"
                            ? "KBZ Pay"
                            : field.value === "wave_pay"
                            ? "Wave Pay"
                            : field.value === "cash"
                            ? "လက်ငင်း"
                            : field.value === "cod"
                            ? "ပို့ချိန်ပေး"
                            : "ငွေပေးချေနည်း ရွေးပါ"}
                        </span>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kbz_pay">KBZ Pay</SelectItem>
                        <SelectItem value="wave_pay">Wave Pay</SelectItem>
                        <SelectItem value="cash">လက်ငင်း</SelectItem>
                        <SelectItem value="cod">ပို့ချိန်ပေး</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Live-computed balance due display */}
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-between text-sm">
              <span className="text-slate-600 font-medium">ကျန်ငွေ ပမာဏ</span>
              <span className="font-bold text-base text-slate-900 tabular-nums">
                {balanceDue.toLocaleString()} ကျပ်
              </span>
            </div>

            {/* Save Button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 text-base font-semibold shadow-xs"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              သိမ်းဆည်း
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
