"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const signupSchema = z
  .object({
    shop_name: z.string().min(1, { message: "ဆိုင်အမည် ထည့်သွင်းပေးပါ" }),
    owner_name: z.string().min(1, { message: "ဆိုင်ပိုင်ရှင်အမည် ထည့်သွင်းပေးပါ" }),
    phone: z.string().min(1, { message: "ဖုန်းနံပါတ် ထည့်သွင်းပေးပါ" }),
    email: z
      .string()
      .min(1, { message: "အီးမေးလ် ထည့်သွင်းပေးပါ" })
      .email({ message: "မှန်ကန်သော အီးမေးလ် ဖြစ်ရပါမည်" }),
    password: z
      .string()
      .min(6, { message: "စကားဝှက်သည် အနည်းဆုံး ၆ လုံး ရှိရပါမည်" }),
    confirm_password: z
      .string()
      .min(1, { message: "စကားဝှက်ကို ထပ်မံအတည်ပြုပေးပါ" }),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "စကားဝှက်များ ကိုက်ညီမှု မရှိပါ",
    path: ["confirm_password"],
  });

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      shop_name: "",
      owner_name: "",
      phone: "",
      email: "",
      password: "",
      confirm_password: "",
    },
  });

  const onSubmit = async (values: SignupFormValues) => {
    console.log("[Signup] Form submitted with values:", {
      shop_name: values.shop_name,
      owner_name: values.owner_name,
      phone: values.phone,
      email: values.email,
    });

    setIsLoading(true);
    const supabase = createClient();

    try {
      console.log("[Signup] Calling supabase.auth.signUp...");
      // 1. Sign up user with metadata
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            shop_name: values.shop_name,
            owner_name: values.owner_name,
            phone: values.phone,
          },
        },
      });

      console.log("[Signup] supabase.auth.signUp result:", {
        user: authData?.user?.id,
        session: !!authData?.session,
        error: authError,
      });

      if (authError) {
        console.error("[Signup] authError:", authError);
        toast.error(authError.message || "အကောင့်ဖွင့်ခြင်း မအောင်မြင်ပါ");
        return;
      }

      if (!authData.user) {
        console.error("[Signup] No user returned from signUp");
        toast.error("အကောင့်ဖွင့်ခြင်း မအောင်မြင်ပါ။ ပြန်လည်စမ်းသပ်ကြည့်ပါ။");
        return;
      }

      console.log("[Signup] Inserting into shops table for user:", authData.user.id);
      // 2. Insert into shops table
      const { data: insertedShop, error: shopError } = await supabase
        .from("shops")
        .insert({
          owner_id: authData.user.id,
          name: values.shop_name,
          phone: values.phone,
        })
        .select()
        .single();

      console.log("[Signup] shops table insert result:", { insertedShop, shopError });

      if (shopError) {
        console.error("[Signup] shopError:", shopError);
        toast.error(`ဆိုင်အချက်အလက် သိမ်းဆည်းရာတွင် အမှားဖြစ်ပေါ်ပါသည်: ${shopError.message}`);
        return;
      }

      toast.success("အကောင့်ဖွင့်ခြင်း အောင်မြင်ပါသည်");
      router.push("/dashboard");
      router.refresh();
    } catch (err: unknown) {
      console.error("[Signup] Unexpected catch error:", err);
      toast.error("တစ်ခုခု မှားယွင်းနေပါသည်။ ထပ်မံကြိုးစားကြည့်ပါ။");
    } finally {
      setIsLoading(false);
    }
  };

  const onError = (errors: unknown) => {
    console.warn("[Signup] Validation errors:", errors);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="text-xl font-bold tracking-tight text-slate-900">
          အကောင့်အသစ်ဖွင့်ရန်
        </h1>
        <p className="text-sm text-slate-500">
          SellerHub တွင် စတင်အသုံးပြုရန် အချက်အလက်များ ဖြည့်စွက်ပါ
        </p>
      </div>

      <Form {...form}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit(onSubmit, onError)(e);
          }}
          noValidate
          className="space-y-4"
        >
          <FormField
            control={form.control}
            name="shop_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-slate-700">
                  ဆိုင်အမည်
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="ဥပမာ - Beauty Corner"
                    disabled={isLoading}
                    className="h-12 text-base px-4 bg-slate-50/50"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="owner_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-slate-700">
                  ဆိုင်ပိုင်ရှင်အမည်
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="ဥပမာ - ဒေါ်စုစု"
                    disabled={isLoading}
                    className="h-12 text-base px-4 bg-slate-50/50"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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
                    {...field}
                    type="tel"
                    placeholder="09xxxxxxxxx"
                    disabled={isLoading}
                    className="h-12 text-base px-4 bg-slate-50/50"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-slate-700">
                  အီးမေးလ်
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    placeholder="example@mail.com"
                    autoComplete="email"
                    disabled={isLoading}
                    className="h-12 text-base px-4 bg-slate-50/50"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-slate-700">
                  စကားဝှက် (အနည်းဆုံး ၆ လုံး)
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="password"
                    placeholder="••••••••"
                    autoComplete="new-password"
                    disabled={isLoading}
                    className="h-12 text-base px-4 bg-slate-50/50"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirm_password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-slate-700">
                  စကားဝှက် အတည်ပြုပါ
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="password"
                    placeholder="••••••••"
                    autoComplete="new-password"
                    disabled={isLoading}
                    className="h-12 text-base px-4 bg-slate-50/50"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 text-base font-semibold shadow-sm transition-all mt-2 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                အကောင့်ဖွင့်နေသည်...
              </>
            ) : (
              "အကောင့်ဖွင့်ရန်"
            )}
          </Button>
        </form>
      </Form>

      <div className="text-center pt-2 border-t border-slate-100">
        <p className="text-sm text-slate-600">
          အကောင့်ရှိပြီးသားလား?{" "}
          <Link
            href="/login"
            className="font-semibold text-primary hover:underline underline-offset-4"
          >
            ဝင်ရောက်ရန်
          </Link>
        </p>
      </div>
    </div>
  );
}
