"use client";

import { useRouter } from "next/navigation";
import type { Resolver } from "react-hook-form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import {
  shipmentSchema,
  type ShipmentFormValues,
} from "@/lib/validations/shipment";
import { createClient } from "@/lib/supabase/client";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";

interface ShipmentFormProps {
  initialValues?: ShipmentFormValues;
  shipmentId?: string;
}

const statusLabels: Record<string, string> = {
  ordering: "မှာယူနေ",
  in_transit: "လမ်းပေါ်",
  arrived: "ရောက်ပြီ",
  delivering: "ပို့နေ",
  completed: "ပြီးစီး",
};

export function ShipmentForm({ initialValues, shipmentId }: ShipmentFormProps) {
  const router = useRouter();
  const supabase = createClient();

  const defaultOrderDate = new Date().toISOString().slice(0, 10);

  const form = useForm<ShipmentFormValues>({
    resolver: zodResolver(shipmentSchema) as unknown as Resolver<ShipmentFormValues>,
    defaultValues: initialValues || {
      name: "",
      source: "",
      order_date: defaultOrderDate,
      arrive_date: "",
      status: "ordering",
      total_cost: 0,
      note: "",
    },
  });

  const { isSubmitting } = form.formState;

  const onSubmit = async (values: ShipmentFormValues) => {
    try {
      const arriveDate =
        values.arrive_date && values.arrive_date.trim() !== ""
          ? values.arrive_date
          : null;
      const noteVal =
        values.note && values.note.trim() !== "" ? values.note.trim() : null;

      if (shipmentId) {
        const { error } = await supabase
          .from("shipments")
          .update({
            name: values.name.trim(),
            source: values.source.trim(),
            order_date: values.order_date,
            arrive_date: arriveDate,
            status: values.status,
            total_cost: values.total_cost || 0,
            note: noteVal,
          })
          .eq("id", shipmentId);

        if (error) throw error;

        toast.success("သိမ်းဆည်းပြီးပါပြီ");
        router.push(`/shipments/${shipmentId}`);
        router.refresh();
      } else {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          throw new Error("အကောင့်ဝင်ရန် လိုအပ်သည်");
        }

        const { data: shop, error: shopError } = await supabase
          .from("shops")
          .select("id")
          .eq("owner_id", user.id)
          .single();

        if (shopError || !shop) {
          throw new Error("ဆိုင် မတွေ့ပါ");
        }

        const { error } = await supabase.from("shipments").insert({
          shop_id: shop.id,
          name: values.name.trim(),
          source: values.source.trim(),
          order_date: values.order_date,
          arrive_date: arriveDate,
          status: values.status,
          total_cost: values.total_cost || 0,
          note: noteVal,
        });

        if (error) throw error;

        toast.success("ပို့ဆောင်မှု သိမ်းပြီးပါပြီ");
        router.push("/shipments");
        router.refresh();
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "ပို့ဆောင်မှု သိမ်းဆည်းရာတွင် အမှားတစ်ခု ဖြစ်ပွားခဲ့သည်";
      toast.error(message);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-slate-700">
                အမည်
              </FormLabel>
              <FormControl>
                <Input
                  className="h-12 bg-white border-slate-200 text-base"
                  placeholder="ဥပမာ: Bangkok Trip 1"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Source */}
        <FormField
          control={form.control}
          name="source"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-slate-700">
                မူရင်း
              </FormLabel>
              <FormControl>
                <Input
                  className="h-12 bg-white border-slate-200 text-base"
                  placeholder="Thailand / China / Korea"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Order Date */}
        <FormField
          control={form.control}
          name="order_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-slate-700">
                မှာယူသည့်ရက်
              </FormLabel>
              <FormControl>
                <Input
                  type="date"
                  className="h-12 bg-white border-slate-200 text-base"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Arrive Date */}
        <FormField
          control={form.control}
          name="arrive_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-slate-700">
                ရောက်မည့်ရက် (မသေချာပါက ချန်ထား)
              </FormLabel>
              <FormControl>
                <Input
                  type="date"
                  className="h-12 bg-white border-slate-200 text-base"
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(e.target.value)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Status */}
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-slate-700">
                အခြေအနေ
              </FormLabel>
              <FormControl>
                <Select
                  value={field.value}
                  onValueChange={(val: string | null) => {
                    if (val) field.onChange(val);
                  }}
                >
                  <SelectTrigger className="h-12 w-full bg-white border-slate-200 text-base">
                    <span>{statusLabels[field.value] ?? "အခြေအနေ ရွေးပါ"}</span>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ordering">မှာယူနေ</SelectItem>
                    <SelectItem value="in_transit">လမ်းပေါ်</SelectItem>
                    <SelectItem value="arrived">ရောက်ပြီ</SelectItem>
                    <SelectItem value="delivering">ပို့နေ</SelectItem>
                    <SelectItem value="completed">ပြီးစီး</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Total Cost */}
        <FormField
          control={form.control}
          name="total_cost"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-slate-700">
                ကုန်ကျစရိတ် (ကျပ်)
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

        {/* Note */}
        <FormField
          control={form.control}
          name="note"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-slate-700">
                မှတ်ချက်
              </FormLabel>
              <FormControl>
                <Textarea
                  rows={3}
                  className="bg-white border-slate-200 text-base resize-none"
                  placeholder="မှတ်ချက် ရေးရန် (ရှိပါက)"
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(e.target.value)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit button */}
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
  );
}

