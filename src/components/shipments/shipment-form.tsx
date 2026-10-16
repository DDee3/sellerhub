"use client";

import { useEffect } from "react";
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
import { useLanguage } from "@/components/providers/language-provider";

interface ShipmentFormProps {
  initialValues?: ShipmentFormValues;
  shipmentId?: string;
}

export function ShipmentForm({ initialValues, shipmentId }: ShipmentFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const { t } = useLanguage();

  const statusLabels: Record<string, string> = {
    ordering: t("shipments.status_ordering"),
    in_transit: t("shipments.status_in_transit"),
    arrived: t("shipments.status_arrived"),
    delivering: t("shipments.status_delivering"),
    completed: t("shipments.status_completed"),
  };

  const form = useForm<ShipmentFormValues>({
    resolver: zodResolver(shipmentSchema) as unknown as Resolver<ShipmentFormValues>,
    defaultValues: initialValues || {
      name: "",
      source: "",
      order_date: "",
      arrive_date: "",
      status: "ordering",
      total_cost: 0,
      note: "",
    },
  });

  // Client-side initialization of current date to prevent prerender errors
  useEffect(() => {
    if (!initialValues?.order_date && !form.getValues("order_date")) {
      form.setValue("order_date", new Date().toISOString().slice(0, 10));
    }
  }, [form, initialValues]);

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

        toast.success(t("shipments.form.success"));
        router.push(`/shipments/${shipmentId}`);
        router.refresh();
      } else {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          throw new Error(t("products.form.error_auth"));
        }

        const { data: shop, error: shopError } = await supabase
          .from("shops")
          .select("id")
          .eq("owner_id", user.id)
          .single();

        if (shopError || !shop) {
          throw new Error(t("products.form.error_shop"));
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

        toast.success(t("shipments.form.success"));
        router.push("/shipments");
        router.refresh();
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "An unexpected error occurred while saving the shipment";
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
              <FormLabel className="text-sm font-medium text-foreground">
                {t("shipments.form.name")}
              </FormLabel>
              <FormControl>
                <Input
                  className="h-12 bg-background text-foreground border-input text-base"
                  placeholder={t("shipments.form.placeholder_name")}
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
              <FormLabel className="text-sm font-medium text-foreground">
                {t("shipments.form.source")}
              </FormLabel>
              <FormControl>
                <Input
                  className="h-12 bg-background text-foreground border-input text-base"
                  placeholder={t("shipments.form.placeholder_source")}
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
              <FormLabel className="text-sm font-medium text-foreground">
                {t("shipments.form.order_date")}
              </FormLabel>
              <FormControl>
                <Input
                  type="date"
                  className="h-12 bg-background text-foreground border-input text-base"
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
              <FormLabel className="text-sm font-medium text-foreground">
                {t("shipments.form.arrive_date_hint")}
              </FormLabel>
              <FormControl>
                <Input
                  type="date"
                  className="h-12 bg-background text-foreground border-input text-base"
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
              <FormLabel className="text-sm font-medium text-foreground">
                {t("shipments.form.status")}
              </FormLabel>
              <FormControl>
                <Select
                  value={field.value}
                  onValueChange={(val: string | null) => {
                    if (val) field.onChange(val);
                  }}
                >
                  <SelectTrigger className="h-12 w-full bg-background text-foreground border-input text-base">
                    <span>{statusLabels[field.value] ?? t("shipments.form.select_status")}</span>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ordering">{t("shipments.status_ordering")}</SelectItem>
                    <SelectItem value="in_transit">{t("shipments.status_in_transit")}</SelectItem>
                    <SelectItem value="arrived">{t("shipments.status_arrived")}</SelectItem>
                    <SelectItem value="delivering">{t("shipments.status_delivering")}</SelectItem>
                    <SelectItem value="completed">{t("shipments.status_completed")}</SelectItem>
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
              <FormLabel className="text-sm font-medium text-foreground">
                {t("shipments.form.total_cost")} ({t("currency")})
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  inputMode="numeric"
                  step="any"
                  min={0}
                  className="h-12 bg-background text-foreground border-input text-base"
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
              <FormLabel className="text-sm font-medium text-foreground">
                {t("shipments.form.note")}
              </FormLabel>
              <FormControl>
                <Textarea
                  rows={3}
                  className="bg-background text-foreground border-input text-base resize-none"
                  placeholder={t("shipments.form.note_placeholder")}
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
          className="w-full h-12 text-base font-semibold shadow-soft"
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          {isSubmitting ? t("shipments.form.saving") : t("shipments.form.submit")}
        </Button>
      </form>
    </Form>
  );
}
