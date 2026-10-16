"use client";

import { useRouter } from "next/navigation";
import type { Resolver } from "react-hook-form";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus, Trash2, Loader2 } from "lucide-react";

import { orderSchema, type OrderFormValues } from "@/lib/validations/order";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useLanguage } from "@/components/providers/language-provider";
import { cn } from "@/lib/utils";

export interface OrderFormProduct {
  id: string;
  name: string;
  price: number;
  type: "stock" | "preorder" | "hybrid";
  stock_qty: number;
  deposit_percent: number;
}

export interface OrderFormCustomer {
  id: string;
  name: string;
  phone: string | null;
}

export interface OrderFormInitialValues {
  items?: { product_id: string; quantity: number }[];
  deposit_paid?: number;
  payment_method?: "kbz_pay" | "wave_pay" | "cash" | "cod";
  note?: string;
  customer_name?: string;
  order_type?: "stock" | "preorder";
}

interface OrderFormProps {
  products: OrderFormProduct[];
  customers?: OrderFormCustomer[];
  orderId?: string;
  initialValues?: OrderFormInitialValues;
}

export function OrderForm({
  products,
  customers = [],
  orderId,
  initialValues,
}: OrderFormProps) {
  const router = useRouter();
  const { t } = useLanguage();

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema) as unknown as Resolver<OrderFormValues>,
    defaultValues: {
      customer_mode: "existing",
      customer_id: orderId ? "locked" : (customers[0]?.id || ""),
      new_customer_name: "",
      new_customer_phone: "",
      new_customer_facebook: "",
      order_type: initialValues?.order_type || "stock",
      deposit_paid: (initialValues?.deposit_paid ?? "") as unknown as number,
      payment_method: initialValues?.payment_method || "kbz_pay",
      note: initialValues?.note || "",
      items:
        initialValues?.items && initialValues.items.length > 0
          ? initialValues.items
          : [{ product_id: "", quantity: 1 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const { isSubmitting } = form.formState;

  const watchedCustomerMode = form.watch("customer_mode");

  // Live total calculation using Number() to coerce Supabase numeric strings
  const items = form.watch("items") ?? [];
  const total = items.reduce((sum, item) => {
    const product = products.find((p) => p.id === item.product_id);
    if (!product) return sum;
    const qty = Number(item.quantity) || 0;
    return sum + Number(product.price) * qty;
  }, 0);

  const watchedDepositPaid = form.watch("deposit_paid");
  const depositNum = Number(watchedDepositPaid) || 0;
  const balanceDue = Math.max(0, total - depositNum);

  const onSubmit = async (values: OrderFormValues) => {
    try {
      const sanitizedItems = values.items.map((item) => ({
        product_id: item.product_id,
        quantity: Number(item.quantity) || 1,
      }));

      if (orderId) {
        const payload = {
          items: sanitizedItems,
          deposit_paid: Number(values.deposit_paid) || 0,
          payment_method: values.payment_method,
          note: values.note || "",
        };

        const res = await fetch(`/api/orders/${orderId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json();

        if (!res.ok) {
          toast.error(
            data.error || t("error")
          );
          return;
        }

        toast.success(t("orders.form.success"));
        router.push(`/orders/${orderId}`);
        router.refresh();
      } else {
        const sanitizedValues: OrderFormValues = {
          ...values,
          deposit_paid: Number(values.deposit_paid) || 0,
          items: sanitizedItems,
        };

        const res = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(sanitizedValues),
        });

        const data = await res.json();

        if (!res.ok) {
          toast.error(
            data.error || t("error")
          );
          return;
        }

        toast.success(t("orders.form.success"));
        router.push(`/orders/${data.id}`);
        router.refresh();
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : t("error")
      );
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Section A: Customer */}
        {orderId ? (
          <Card className="bg-card text-card-foreground border-border shadow-soft rounded-2xl">
            <CardHeader className="border-b border-border/60 pb-3">
              <CardTitle className="text-base font-semibold text-foreground">
                1. {t("orders.form.customer")}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="p-3.5 rounded-xl bg-muted/40 border border-border flex items-center justify-between">
                <div>
                  <span className="text-xs text-muted-foreground block">
                    {t("orders.form.customer")}
                  </span>
                  <span className="text-base font-medium text-foreground mt-0.5 block">
                    {initialValues?.customer_name || "—"}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-md border border-border font-medium">
                  {t("orders.form.locked_customer")}
                </span>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-card text-card-foreground border-border shadow-soft rounded-2xl">
            <CardHeader className="border-b border-border/60 pb-3">
              <CardTitle className="text-base font-semibold text-foreground">
                1. {t("orders.form.customer")}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <FormField
                control={form.control}
                name="customer_mode"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormControl>
                      <RadioGroup
                        value={field.value}
                        onValueChange={field.onChange}
                        className="grid grid-cols-2 gap-3"
                      >
                        <label
                          htmlFor="mode-existing"
                          className={cn(
                            "flex items-center gap-2.5 rounded-xl border p-3.5 cursor-pointer text-sm font-medium transition-colors",
                            field.value === "existing"
                              ? "border-primary bg-primary/10 text-primary font-semibold"
                              : "border-border bg-card text-foreground hover:bg-muted"
                          )}
                        >
                          <RadioGroupItem value="existing" id="mode-existing" />
                          <span>{t("orders.form.customer_existing")}</span>
                        </label>
                        <label
                          htmlFor="mode-new"
                          className={cn(
                            "flex items-center gap-2.5 rounded-xl border p-3.5 cursor-pointer text-sm font-medium transition-colors",
                            field.value === "new"
                              ? "border-primary bg-primary/10 text-primary font-semibold"
                              : "border-border bg-card text-foreground hover:bg-muted"
                          )}
                        >
                          <RadioGroupItem value="new" id="mode-new" />
                          <span>{t("orders.form.customer_new")}</span>
                        </label>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {watchedCustomerMode === "existing" ? (
                <FormField
                  control={form.control}
                  name="customer_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-foreground">
                        {t("orders.form.select_customer")}
                      </FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={(val: string | null) => {
                            if (val) field.onChange(val);
                          }}
                        >
                          <SelectTrigger className="h-11 w-full bg-background text-foreground border-input text-base rounded-xl">
                            <span className="truncate">
                              {field.value
                                ? (() => {
                                    const c = customers.find(
                                      (cust) => cust.id === field.value
                                    );
                                    return c
                                      ? `${c.name}${c.phone ? ` — ${c.phone}` : ""}`
                                      : t("orders.form.select_customer");
                                  })()
                                : t("orders.form.select_customer")}
                            </span>
                          </SelectTrigger>
                          <SelectContent className="rounded-xl">
                            {customers.length === 0 ? (
                              <SelectItem value="none" disabled>
                                {t("orders.form.no_customers")}
                              </SelectItem>
                            ) : (
                              customers.map((c) => (
                                <SelectItem key={c.id} value={c.id}>
                                  {c.name} {c.phone ? `— ${c.phone}` : ""}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                <div className="space-y-3 pt-1">
                  <FormField
                    control={form.control}
                    name="new_customer_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-foreground">
                          {t("orders.form.customer_name")}
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder={t("orders.form.customer_name_placeholder")}
                            className="h-11 text-base bg-background text-foreground border-input rounded-xl"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name="new_customer_phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-foreground">
                            {t("orders.form.phone")}
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="tel"
                              placeholder={t("orders.form.phone_placeholder")}
                              className="h-11 text-base bg-background text-foreground border-input rounded-xl"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="new_customer_facebook"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-foreground">
                            {t("orders.form.facebook")}
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder={t("orders.form.facebook_placeholder")}
                              className="h-11 text-base bg-background text-foreground border-input rounded-xl"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Section B: Order Type */}
        {!orderId && (
          <Card className="bg-card text-card-foreground border-border shadow-soft rounded-2xl">
            <CardHeader className="border-b border-border/60 pb-3">
              <CardTitle className="text-base font-semibold text-foreground">
                2. {t("orders.form.order_type")}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <FormField
                control={form.control}
                name="order_type"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormControl>
                      <RadioGroup
                        value={field.value}
                        onValueChange={field.onChange}
                        className="grid grid-cols-2 gap-3"
                      >
                        <label
                          htmlFor="type-stock"
                          className={cn(
                            "flex items-center gap-2.5 rounded-xl border p-3.5 cursor-pointer text-sm font-medium transition-colors",
                            field.value === "stock"
                              ? "border-primary bg-primary/10 text-primary font-semibold"
                              : "border-border bg-card text-foreground hover:bg-muted"
                          )}
                        >
                          <RadioGroupItem value="stock" id="type-stock" />
                          <span>{t("orders.form.type_stock")}</span>
                        </label>
                        <label
                          htmlFor="type-preorder"
                          className={cn(
                            "flex items-center gap-2.5 rounded-xl border p-3.5 cursor-pointer text-sm font-medium transition-colors",
                            field.value === "preorder"
                              ? "border-primary bg-primary/10 text-primary font-semibold"
                              : "border-border bg-card text-foreground hover:bg-muted"
                          )}
                        >
                          <RadioGroupItem value="preorder" id="type-preorder" />
                          <span>{t("orders.form.type_preorder")}</span>
                        </label>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        )}

        {/* Section C: Items */}
        <Card className="bg-card text-card-foreground border-border shadow-soft rounded-2xl">
          <CardHeader className="border-b border-border/60 pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold text-foreground">
              3. {t("orders.form.products")}
            </CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                append({ product_id: "", quantity: 1 })
              }
              className="gap-1.5 h-9 text-xs font-medium rounded-xl border-border bg-card text-foreground hover:bg-muted shadow-soft"
            >
              <Plus className="h-3.5 w-3.5" />
              {t("orders.form.add_product")}
            </Button>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            {fields.map((fieldItem, index) => {
              const currentProductId = form.watch(`items.${index}.product_id`);
              const currentQty = form.watch(`items.${index}.quantity`);
              const product = products.find((p) => p.id === currentProductId);
              const qty = Number(currentQty) || 0;
              const subtotal = product
                ? Number(product.price) * qty
                : 0;

              return (
                <div
                  key={fieldItem.id}
                  className="p-3.5 rounded-xl border border-border bg-muted/40 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                    {/* Select product */}
                    <div className="flex-1 w-full">
                      <FormField
                        control={form.control}
                        name={`items.${index}.product_id`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Select
                                value={field.value}
                                onValueChange={(val: string | null) => {
                                  if (val) field.onChange(val);
                                }}
                              >
                                <SelectTrigger className="h-11 w-full bg-background text-foreground border-input text-sm rounded-xl">
                                  <span className="truncate">
                                    {field.value
                                      ? products.find((p) => p.id === field.value)?.name ?? t("orders.form.select_product")
                                      : t("orders.form.select_product")}
                                  </span>
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                  {products.map((p) => (
                                    <SelectItem key={p.id} value={p.id}>
                                      {p.name} — {Number(p.price).toLocaleString()} MMK
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Quantity + Remove */}
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <FormField
                        control={form.control}
                        name={`items.${index}.quantity`}
                        render={({ field }) => (
                          <FormItem className="w-28 sm:w-24">
                            <FormControl>
                              <Input
                                type="number"
                                inputMode="numeric"
                                step="any"
                                min="1"
                                placeholder="1"
                                value={field.value ?? ""}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  field.onChange(
                                    val === "" ? "" : Number(val)
                                  );
                                }}
                                className="h-11 text-center bg-background text-foreground border-input font-semibold rounded-xl"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        disabled={fields.length <= 1}
                        onClick={() => remove(index)}
                        className="h-11 w-11 text-muted-foreground hover:text-destructive hover:bg-destructive/10 disabled:opacity-30 shrink-0 rounded-xl"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">{t("delete")}</span>
                      </Button>
                    </div>
                  </div>

                  {/* Subtotal */}
                  <div className="flex justify-between items-center text-xs text-muted-foreground pt-1 border-t border-border/60">
                    <span>
                      {t("orders.form.unit_price")} {product ? Number(product.price).toLocaleString() : 0} MMK
                    </span>
                    <span className="font-semibold text-foreground text-sm">
                      {t("orders.form.subtotal")} {subtotal.toLocaleString()} MMK
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Total summary */}
            <div className="pt-3 border-t border-border flex items-center justify-between text-base font-bold text-foreground">
              <span>{t("orders.form.total")}</span>
              <span className="text-primary text-lg">
                {total.toLocaleString()} MMK
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Section D: Payment */}
        <Card className="bg-card text-card-foreground border-border shadow-soft rounded-2xl">
          <CardHeader className="border-b border-border/60 pb-3">
            <CardTitle className="text-base font-semibold text-foreground">
              4. {t("orders.form.payment")}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Deposit paid */}
              <FormField
                control={form.control}
                name="deposit_paid"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-foreground">
                      {t("orders.form.deposit_paid")}
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

              {/* Payment method */}
              <FormField
                control={form.control}
                name="payment_method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-foreground">
                      {t("orders.form.payment_method")}
                    </FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={(val: string | null) => {
                          if (val) field.onChange(val);
                        }}
                      >
                        <SelectTrigger className="h-11 w-full bg-background text-foreground border-input text-base rounded-xl">
                          <span>
                            {field.value === "kbz_pay"
                              ? "KBZ Pay"
                              : field.value === "wave_pay"
                              ? "Wave Pay"
                              : field.value === "cash"
                              ? t("orders.form.method_cash")
                              : field.value === "cod"
                              ? t("orders.form.method_cod")
                              : t("orders.form.method_select")}
                          </span>
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="kbz_pay">KBZ Pay</SelectItem>
                          <SelectItem value="wave_pay">Wave Pay</SelectItem>
                          <SelectItem value="cash">{t("orders.form.method_cash")}</SelectItem>
                          <SelectItem value="cod">{t("orders.form.method_cod")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Balance due computation display */}
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-sm">
              <span className="text-amber-600 dark:text-amber-400 font-medium">
                {t("orders.form.balance_due")}
              </span>
              <span className="text-amber-700 dark:text-amber-300 font-bold text-base tabular-nums">
                {balanceDue.toLocaleString()} MMK
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Section E: Note */}
        <Card className="bg-card text-card-foreground border-border shadow-soft rounded-2xl">
          <CardHeader className="border-b border-border/60 pb-3">
            <CardTitle className="text-base font-semibold text-foreground">
              5. {t("orders.form.note")}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={3}
                      placeholder={t("orders.form.note_placeholder")}
                      className="text-base bg-background text-foreground border-input rounded-xl"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="pt-2">
          <Button
            type="submit"
            variant="premium"
            disabled={isSubmitting}
            className="h-11 w-full text-base font-semibold shadow-soft hover:shadow-lift rounded-xl"
          >
            {isSubmitting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : orderId ? (
              t("orders.form.submit_edit")
            ) : (
              t("orders.form.submit")
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default OrderForm;
