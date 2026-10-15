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
          : [{ product_id: products[0]?.id || "", quantity: 1 }],
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
            data.error || "အော်ဒါ ပြင်ဆင်ရာတွင် အမှားတစ်ခု ဖြစ်ပေါ်ခဲ့သည်"
          );
          return;
        }

        toast.success("အော်ဒါ ပြင်ဆင်ပြီးပါပြီ");
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
            data.error || "အော်ဒါ ဖန်တီးရာတွင် အမှားတစ်ခု ဖြစ်ပေါ်ခဲ့သည်"
          );
          return;
        }

        toast.success("အော်ဒါ ဖန်တီးပြီးပါပြီ");
        router.push(`/orders/${data.id}`);
        router.refresh();
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "ကွန်ရက် အမှား ဖြစ်ပေါ်ခဲ့သည်"
      );
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Section A: Customer */}
        {orderId ? (
          <Card className="bg-white border-slate-200/80 shadow-xs">
            <CardHeader className="border-b border-slate-100 pb-3">
              <CardTitle className="text-base font-semibold text-slate-900">
                ၁။ ဖောက်သည်
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/60 flex items-center justify-between">
                <div>
                  <span className="text-xs text-muted-foreground block">
                    ဖောက်သည်
                  </span>
                  <span className="text-base font-medium text-slate-900 mt-0.5 block">
                    {initialValues?.customer_name || "—"}
                  </span>
                </div>
                <span className="text-xs text-slate-500 bg-white px-2.5 py-1 rounded-md border border-slate-200 font-medium">
                  ပြင်ဆင်၍ မရပါ
                </span>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-white border-slate-200/80 shadow-xs">
          <CardHeader className="border-b border-slate-100 pb-3">
            <CardTitle className="text-base font-semibold text-slate-900">
              ၁။ ဖောက်သည်
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
                          "flex items-center gap-2.5 rounded-lg border p-3.5 cursor-pointer text-sm font-medium transition-colors",
                          field.value === "existing"
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-slate-200 bg-white text-slate-700"
                        )}
                      >
                        <RadioGroupItem value="existing" id="mode-existing" />
                        <span>ရှိပြီးသား ဖောက်သည်</span>
                      </label>
                      <label
                        htmlFor="mode-new"
                        className={cn(
                          "flex items-center gap-2.5 rounded-lg border p-3.5 cursor-pointer text-sm font-medium transition-colors",
                          field.value === "new"
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-slate-200 bg-white text-slate-700"
                        )}
                      >
                        <RadioGroupItem value="new" id="mode-new" />
                        <span>ဖောက်သည် အသစ်</span>
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
                    <FormLabel className="text-sm font-medium text-slate-700">
                      ဖောက်သည် ရွေးချယ်ပါ *
                    </FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={(val: string | null) => {
                          if (val) field.onChange(val);
                        }}
                      >
                        <SelectTrigger className="h-12 w-full bg-white border-slate-200 text-base">
                          <span className="truncate">
                            {field.value
                              ? (() => {
                                  const c = customers.find(
                                    (cust) => cust.id === field.value
                                  );
                                  return c
                                    ? `${c.name}${c.phone ? ` — ${c.phone}` : ""}`
                                    : "ဖောက်သည် ရွေးချယ်ပါ";
                                })()
                              : "ဖောက်သည် ရွေးချယ်ပါ"}
                          </span>
                        </SelectTrigger>
                        <SelectContent>
                          {customers.length === 0 ? (
                            <SelectItem value="none" disabled>
                              ဖောက်သည် မရှိသေးပါ (ဖောက်သည် အသစ် ရွေးပါ)
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
                      <FormLabel className="text-sm font-medium text-slate-700">
                        ဖောက်သည် အမည် *
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="အမည် ရိုက်ထည့်ပါ"
                          className="h-12 text-base bg-white border-slate-200"
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
                        <FormLabel className="text-sm font-medium text-slate-700">
                          ဖုန်းနံပါတ် *
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="tel"
                            placeholder="09..."
                            className="h-12 text-base bg-white border-slate-200"
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
                        <FormLabel className="text-sm font-medium text-slate-700">
                          Facebook အကောင့် (ရှိလျှင်)
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="အကောင့်အမည် သို့မဟုတ် Link"
                            className="h-12 text-base bg-white border-slate-200"
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
          <Card className="bg-white border-slate-200/80 shadow-xs">
            <CardHeader className="border-b border-slate-100 pb-3">
              <CardTitle className="text-base font-semibold text-slate-900">
                ၂။ အော်ဒါ အမျိုးအစား
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
                            "flex items-center gap-2.5 rounded-lg border p-3.5 cursor-pointer text-sm font-medium transition-colors",
                            field.value === "stock"
                              ? "border-primary bg-primary/5 text-primary"
                              : "border-slate-200 bg-white text-slate-700"
                          )}
                        >
                          <RadioGroupItem value="stock" id="type-stock" />
                          <span>လက်ကျန် (Stock)</span>
                        </label>
                        <label
                          htmlFor="type-preorder"
                          className={cn(
                            "flex items-center gap-2.5 rounded-lg border p-3.5 cursor-pointer text-sm font-medium transition-colors",
                            field.value === "preorder"
                              ? "border-primary bg-primary/5 text-primary"
                              : "border-slate-200 bg-white text-slate-700"
                          )}
                        >
                          <RadioGroupItem value="preorder" id="type-preorder" />
                          <span>ကြိုမှာ (Pre-order)</span>
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
        <Card className="bg-white border-slate-200/80 shadow-xs">
          <CardHeader className="border-b border-slate-100 pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold text-slate-900">
              ၃။ ပစ္စည်းများ
            </CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                append({ product_id: products[0]?.id || "", quantity: 1 })
              }
              className="gap-1.5 h-9 text-xs font-medium border-slate-200"
            >
              <Plus className="h-3.5 w-3.5" />
              ပစ္စည်းထည့်
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
                  className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 space-y-3"
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
                                <SelectTrigger className="h-12 w-full bg-white border-slate-200 text-sm">
                                  <span className="truncate">
                                    {field.value
                                      ? products.find((p) => p.id === field.value)?.name ?? "ပစ္စည်း ရွေးပါ"
                                      : "ပစ္စည်း ရွေးပါ"}
                                  </span>
                                </SelectTrigger>
                                <SelectContent>
                                  {products.map((product) => (
                                    <SelectItem key={product.id} value={product.id}>
                                      {product.name} — {Number(product.price).toLocaleString()} ကျပ်
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
                                className="h-12 text-center bg-white border-slate-200 font-semibold"
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
                        className="h-12 w-12 text-slate-400 hover:text-red-600 disabled:opacity-30 shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">ဖျက်မည်</span>
                      </Button>
                    </div>
                  </div>

                  {/* Subtotal */}
                  <div className="flex justify-between items-center text-xs text-slate-500 pt-1 border-t border-slate-200/60">
                    <span>
                      တစ်ခုလျှင်: {product ? Number(product.price).toLocaleString() : 0} ကျပ်
                    </span>
                    <span className="font-semibold text-slate-800 text-sm">
                      စုစုပေါင်း: {subtotal.toLocaleString()} ကျပ်
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Total summary */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-base font-bold text-slate-900">
              <span>စုစုပေါင်း တန်ဖိုး</span>
              <span className="text-primary text-lg">
                {total.toLocaleString()} ကျပ်
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Section D: Payment */}
        <Card className="bg-white border-slate-200/80 shadow-xs">
          <CardHeader className="border-b border-slate-100 pb-3">
            <CardTitle className="text-base font-semibold text-slate-900">
              ၄။ ငွေပေးချေမှု
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
                    <FormLabel className="text-sm font-medium text-slate-700">
                      စရံ ပေးပြီး (ကျပ်)
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

              {/* Payment method */}
              <FormField
                control={form.control}
                name="payment_method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-slate-700">
                      ငွေပေးချေမှု နည်းလမ်း *
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
                              ? "ပို့ချိန်ပေး (COD)"
                              : "ငွေပေးချေမှု ရွေးပါ"}
                          </span>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="kbz_pay">KBZ Pay</SelectItem>
                          <SelectItem value="wave_pay">Wave Pay</SelectItem>
                          <SelectItem value="cash">လက်ငင်း</SelectItem>
                          <SelectItem value="cod">ပို့ချိန်ပေး (COD)</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Balance due computation display */}
            <div className="p-3.5 rounded-lg bg-amber-50/60 border border-amber-200/60 flex items-center justify-between text-sm">
              <span className="text-amber-800 font-medium">ကျန်ငွေ ပမာဏ</span>
              <span className="text-amber-900 font-bold text-base tabular-nums">
                {balanceDue.toLocaleString()} ကျပ်
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Section E: Note */}
        <Card className="bg-white border-slate-200/80 shadow-xs">
          <CardHeader className="border-b border-slate-100 pb-3">
            <CardTitle className="text-base font-semibold text-slate-900">
              ၅။ မှတ်ချက်
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
                      placeholder="ပို့ဆောင်ရမည့် လိပ်စာ သို့မဟုတ် အခြား မှတ်ချက်များ"
                      className="text-base bg-white border-slate-200"
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
            disabled={isSubmitting}
            className="h-12 w-full text-base font-semibold shadow-xs"
          >
            {isSubmitting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : orderId ? (
              "အော်ဒါ ပြင်ဆင်"
            ) : (
              "အော်ဒါ ဖန်တီး"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
