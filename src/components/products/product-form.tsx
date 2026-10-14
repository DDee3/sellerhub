"use client";

import { useRouter } from "next/navigation";
import type { Resolver } from "react-hook-form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Switch } from "@base-ui/react/switch";

import {
  productSchema,
  type ProductFormValues,
} from "@/lib/validations/product";
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
  SelectValue,
} from "@/components/ui/select";

interface ProductFormProps {
  initialValues?: ProductFormValues;
  productId?: string;
}

export function ProductForm({ initialValues, productId }: ProductFormProps) {
  const router = useRouter();
  const supabase = createClient();

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema) as unknown as Resolver<ProductFormValues>,
    defaultValues: initialValues || {
      name: "",
      image_url: "",
      price: "" as unknown as number,
      type: "stock",
      stock_qty: "" as unknown as number,
      low_stock_alert: 3,
      deposit_percent: "" as unknown as number,
      source: "",
      description: "",
      is_active: true,
    },
  });

  const { isSubmitting } = form.formState;
  const currentType = form.watch("type");

  const onSubmit = async (values: ProductFormValues) => {
    try {
      const sanitizedPrice = Number(values.price) || 0;
      const sanitizedStockQty =
        values.type === "preorder" ? 0 : Number(values.stock_qty) || 0;
      const sanitizedLowStock = Number(values.low_stock_alert) || 3;
      const sanitizedDepositPercent =
        values.type === "stock" ? 0 : Number(values.deposit_percent) || 0;

      if (productId) {
        // Edit existing product
        const { error } = await supabase
          .from("products")
          .update({
            name: values.name,
            image_url: values.image_url || null,
            price: sanitizedPrice,
            type: values.type,
            stock_qty: sanitizedStockQty,
            low_stock_alert: sanitizedLowStock,
            deposit_percent: sanitizedDepositPercent,
            source: values.source || null,
            description: values.description || null,
            is_active: values.is_active,
          })
          .eq("id", productId);

        if (error) {
          toast.error(error.message);
          return;
        }
      } else {
        // Create new product: find shop_id first
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          toast.error("အကောင့်ဝင်ရန် လိုအပ်ပါသည်");
          return;
        }

        const { data: shop, error: shopError } = await supabase
          .from("shops")
          .select("id")
          .eq("owner_id", user.id)
          .single();

        if (shopError || !shop) {
          toast.error("ဆိုင်အချက်အလက် ရှာမတွေ့ပါ");
          return;
        }

        const { error } = await supabase.from("products").insert({
          shop_id: shop.id,
          name: values.name,
          image_url: values.image_url || null,
          price: sanitizedPrice,
          type: values.type,
          stock_qty: sanitizedStockQty,
          low_stock_alert: sanitizedLowStock,
          deposit_percent: sanitizedDepositPercent,
          source: values.source || null,
          description: values.description || null,
          is_active: values.is_active,
        });

        if (error) {
          toast.error(error.message);
          return;
        }
      }

      toast.success("သိမ်းဆည်းပြီးပါပြီ");
      router.push("/products");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "အမှားတစ်ခု ဖြစ်ပေါ်ခဲ့သည်");
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
                ပစ္စည်းနာမည် *
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="ပစ္စည်းနာမည် ရိုက်ထည့်ပါ"
                  className="h-12 text-base bg-white border-slate-200"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Image URL */}
        <FormField
          control={form.control}
          name="image_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-slate-700">
                ပုံ URL
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="https://example.com/image.jpg"
                  className="h-12 text-base bg-white border-slate-200"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Price */}
        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-slate-700">
                ဈေးနှုန်း (ကျပ်) *
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  inputMode="numeric"
                  step="any"
                  min="0"
                  placeholder="0"
                  value={field.value === 0 ? "" : (field.value ?? "")}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value === "" ? "" : Number(e.target.value)
                    )
                  }
                  className="h-12 text-base bg-white border-slate-200"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Type */}
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-slate-700">
                အမျိုးအစား *
              </FormLabel>
              <FormControl>
                <Select
                  value={field.value}
                  onValueChange={(value: string | null) => {
                    if (value) field.onChange(value);
                  }}
                >
                  <SelectTrigger className="h-12 w-full bg-white border-slate-200 text-base">
                    <SelectValue placeholder="အမျိုးအစား ရွေးပါ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="stock">လက်ကျန် (Stock)</SelectItem>
                    <SelectItem value="preorder">ကြိုမှာ (Pre-order)</SelectItem>
                    <SelectItem value="hybrid">နှစ်မျိုးရော (Hybrid)</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Stock Qty (show only if type !== 'preorder') */}
        {currentType !== "preorder" && (
          <FormField
            control={form.control}
            name="stock_qty"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-slate-700">
                  လက်ကျန်အရေအတွက်
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    inputMode="numeric"
                    step="any"
                    min="0"
                    placeholder="0"
                    value={field.value === 0 ? "" : (field.value ?? "")}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === "" ? "" : Number(e.target.value)
                      )
                    }
                    className="h-12 text-base bg-white border-slate-200"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Low Stock Alert */}
        <FormField
          control={form.control}
          name="low_stock_alert"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-slate-700">
                လက်ကျန်သတိပေးချက်
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  inputMode="numeric"
                  step="any"
                  min="0"
                  placeholder="3"
                  value={field.value === 0 ? "" : (field.value ?? "")}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value === "" ? "" : Number(e.target.value)
                    )
                  }
                  className="h-12 text-base bg-white border-slate-200"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Deposit Percent (show only if type !== 'stock') */}
        {currentType !== "stock" && (
          <FormField
            control={form.control}
            name="deposit_percent"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-slate-700">
                  စရံ %
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    inputMode="numeric"
                    step="any"
                    min="0"
                    max="100"
                    placeholder="0"
                    value={field.value === 0 ? "" : (field.value ?? "")}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === "" ? "" : Number(e.target.value)
                      )
                    }
                    className="h-12 text-base bg-white border-slate-200"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Source */}
        <FormField
          control={form.control}
          name="source"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-slate-700">
                အရင်းအမြစ်
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="ဥပမာ - BKK, China, Local"
                  className="h-12 text-base bg-white border-slate-200"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-slate-700">
                အသေးစိတ် ဖော်ပြချက်
              </FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="ပစ္စည်း အကြောင်း အသေးစိတ် ရေးရန်"
                  rows={3}
                  className="text-base bg-white border-slate-200"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Is Active Switch */}
        <FormField
          control={form.control}
          name="is_active"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border border-slate-200 p-4 bg-white">
              <div className="space-y-0.5">
                <FormLabel className="text-sm font-medium text-slate-900">
                  အသက်ဝင်သည်
                </FormLabel>
                <p className="text-xs text-slate-500">
                  ပိတ်ထားပါက ပစ္စည်းစာရင်းတွင် မပြသတော့ပါ
                </p>
              </div>
              <FormControl>
                <Switch.Root
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className="group relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 data-[checked]:bg-primary bg-slate-200"
                >
                  <Switch.Thumb className="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out data-[checked]:translate-x-5 translate-x-0" />
                </Switch.Root>
              </FormControl>
            </FormItem>
          )}
        />

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-12 w-full text-base font-semibold shadow-xs"
        >
          {isSubmitting ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : productId ? (
            "ပြင်ဆင်ချက် သိမ်းမည်"
          ) : (
            "ပစ္စည်း အသစ်ထည့်မည်"
          )}
        </Button>
      </form>
    </Form>
  );
}
