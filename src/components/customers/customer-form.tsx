"use client";

import { useRouter } from "next/navigation";
import type { Resolver } from "react-hook-form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import {
  customerSchema,
  type CustomerFormValues,
} from "@/lib/validations/customer";
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

interface CustomerFormProps {
  initialValues?: CustomerFormValues;
  customerId?: string;
}

export function CustomerForm({ initialValues, customerId }: CustomerFormProps) {
  const router = useRouter();
  const supabase = createClient();

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema) as unknown as Resolver<CustomerFormValues>,
    defaultValues: initialValues || {
      name: "",
      phone: "",
      facebook_name: "",
      telegram_username: "",
      address: "",
      note: "",
    },
  });

  const { isSubmitting } = form.formState;

  const onSubmit = async (values: CustomerFormValues) => {
    try {
      const payload = {
        name: values.name.trim(),
        phone: values.phone.trim(),
        facebook_name: values.facebook_name?.trim() || null,
        telegram_username: values.telegram_username?.trim() || null,
        address: values.address?.trim() || null,
        note: values.note?.trim() || null,
      };

      if (customerId) {
        const { error } = await supabase
          .from("customers")
          .update(payload)
          .eq("id", customerId);

        if (error) throw error;
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
          .maybeSingle();

        if (shopError || !shop) {
          throw new Error("ဆိုင် မတွေ့ပါ");
        }

        const { error } = await supabase.from("customers").insert({
          shop_id: shop.id,
          ...payload,
        });

        if (error) throw error;
      }

      toast.success("သိမ်းဆည်းပြီးပါပြီ");
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
                  placeholder="ဝယ်ယူသူ အမည်"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Phone */}
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-slate-700">
                ဖုန်းနံပါတ်
              </FormLabel>
              <FormControl>
                <Input
                  type="tel"
                  inputMode="tel"
                  className="h-12 bg-white border-slate-200 text-base"
                  placeholder="09xxxxxxxxx"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Facebook Name */}
        <FormField
          control={form.control}
          name="facebook_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-slate-700">
                Facebook အမည်
              </FormLabel>
              <FormControl>
                <Input
                  className="h-12 bg-white border-slate-200 text-base"
                  placeholder="Facebook Account အမည်"
                  value={field.value ?? ""}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Telegram Username */}
        <FormField
          control={form.control}
          name="telegram_username"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-slate-700">
                Telegram Username
              </FormLabel>
              <FormControl>
                <Input
                  className="h-12 bg-white border-slate-200 text-base"
                  placeholder="@username"
                  value={field.value ?? ""}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Address */}
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-slate-700">
                လိပ်စာ
              </FormLabel>
              <FormControl>
                <Textarea
                  rows={3}
                  className="bg-white border-slate-200 text-base resize-none"
                  placeholder="ပို့ဆောင်ရမည့် လိပ်စာ"
                  value={field.value ?? ""}
                  onChange={field.onChange}
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
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit Button */}
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

