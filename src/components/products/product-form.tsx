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
import { useLanguage } from "@/components/providers/language-provider";

interface ProductFormProps {
  initialValues?: ProductFormValues;
  productId?: string;
}

export function ProductForm({ initialValues, productId }: ProductFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const { t } = useLanguage();

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
          toast.error(t("products.form.error_auth"));
          return;
        }

        const { data: shop, error: shopError } = await supabase
          .from("shops")
          .select("id")
          .eq("owner_id", user.id)
          .single();

        if (shopError || !shop) {
          toast.error(t("products.form.error_shop"));
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

      toast.success(t("products.form.success"));
      router.push("/products");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("error"));
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
                {t("products.form.name")}
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder={t("products.form.name_placeholder")}
                  className="h-11 text-base bg-background text-foreground border-input rounded-xl"
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
              <FormLabel className="text-sm font-medium text-foreground">
                {t("products.form.image_url")}
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder={t("products.form.image_placeholder")}
                  className="h-11 text-base bg-background text-foreground border-input rounded-xl"
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
              <FormLabel className="text-sm font-medium text-foreground">
                {t("products.form.price")}
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  inputMode="numeric"
                  step="any"
                  min="0"
                  placeholder={t("products.form.price_placeholder")}
                  value={field.value === 0 ? "" : (field.value ?? "")}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value === "" ? "" : Number(e.target.value)
                    )
                  }
                  className="h-11 text-base bg-background text-foreground border-input rounded-xl"
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
              <FormLabel className="text-sm font-medium text-foreground">
                {t("products.form.type")}
              </FormLabel>
              <FormControl>
                <Select
                  value={field.value}
                  onValueChange={(value: string | null) => {
                    if (value) field.onChange(value);
                  }}
                >
                  <SelectTrigger className="h-11 w-full bg-background text-foreground border-input text-base rounded-xl">
                    <SelectValue placeholder={t("products.form.type_placeholder")} />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="stock">{t("products.form.type_stock")}</SelectItem>
                    <SelectItem value="preorder">{t("products.form.type_preorder")}</SelectItem>
                    <SelectItem value="hybrid">{t("products.form.type_hybrid")}</SelectItem>
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
                <FormLabel className="text-sm font-medium text-foreground">
                  {t("products.form.stock_qty")}
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
                    className="h-11 text-base bg-background text-foreground border-input rounded-xl"
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
              <FormLabel className="text-sm font-medium text-foreground">
                {t("products.form.low_stock_alert")}
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
                  className="h-11 text-base bg-background text-foreground border-input rounded-xl"
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
                <FormLabel className="text-sm font-medium text-foreground">
                  {t("products.form.deposit_percent")}
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
                    className="h-11 text-base bg-background text-foreground border-input rounded-xl"
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
              <FormLabel className="text-sm font-medium text-foreground">
                {t("products.form.source")}
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder={t("products.form.source_placeholder")}
                  className="h-11 text-base bg-background text-foreground border-input rounded-xl"
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
              <FormLabel className="text-sm font-medium text-foreground">
                {t("products.form.description")}
              </FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder={t("products.form.description_placeholder")}
                  rows={3}
                  className="text-base bg-background text-foreground border-input rounded-xl"
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
            <FormItem className="flex items-center justify-between rounded-2xl border border-border p-4 bg-card text-card-foreground">
              <div className="space-y-0.5">
                <FormLabel className="text-sm font-medium text-foreground">
                  {t("products.form.is_active")}
                </FormLabel>
                <p className="text-xs text-muted-foreground">
                  {t("products.form.is_active_desc")}
                </p>
              </div>
              <FormControl>
                <Switch.Root
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className="group relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 data-[checked]:bg-primary bg-muted"
                >
                  <Switch.Thumb className="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white dark:bg-card-foreground shadow-lg ring-0 transition duration-200 ease-in-out data-[checked]:translate-x-5 translate-x-0" />
                </Switch.Root>
              </FormControl>
            </FormItem>
          )}
        />

        {/* Submit Button */}
        <Button
          type="submit"
          variant="premium"
          disabled={isSubmitting}
          className="h-11 w-full text-base font-semibold shadow-soft hover:shadow-lift rounded-xl"
        >
          {isSubmitting ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : productId ? (
            t("products.form.submit_edit")
          ) : (
            t("products.form.submit_create")
          )}
        </Button>
      </form>
    </Form>
  );
}

export default ProductForm;
