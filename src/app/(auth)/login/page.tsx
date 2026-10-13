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

const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: "အီးမေးလ် ထည့်သွင်းပေးပါ" })
    .email({ message: "မှန်ကန်သော အီးမေးလ် လိပ်စာ ဖြစ်ရပါမည်" }),
  password: z
    .string()
    .min(1, { message: "စကားဝှက် ထည့်သွင်းပေးပါ" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);
    const supabase = createClient();

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) {
        toast.error(error.message || "အကောင့်ဝင်ရောက်မှု မအောင်မြင်ပါ");
        return;
      }

      toast.success("အောင်မြင်စွာ ဝင်ရောက်ပြီးပါပြီ");
      router.push("/dashboard");
      router.refresh();
    } catch (err: unknown) {
      toast.error("တစ်ခုခု မှားယွင်းနေပါသည်။ ထပ်မံကြိုးစားကြည့်ပါ။");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="text-xl font-bold tracking-tight text-slate-900">
          အကောင့်ဝင်ရောက်ရန်
        </h1>
        <p className="text-sm text-slate-500">
          သင့်အကောင့်အချက်အလက်များကို ထည့်သွင်းပါ
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                  စကားဝှက်
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="password"
                    placeholder="••••••••"
                    autoComplete="current-password"
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
            className="w-full h-12 text-base font-semibold shadow-sm transition-all"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ဝင်ရောက်နေသည်...
              </>
            ) : (
              "ဝင်ရောက်ရန်"
            )}
          </Button>
        </form>
      </Form>

      <div className="text-center pt-2 border-t border-slate-100">
        <p className="text-sm text-slate-600">
          အကောင့်မရှိသေးဘူးလား?{" "}
          <Link
            href="/signup"
            className="font-semibold text-primary hover:underline underline-offset-4"
          >
            အကောင့်ဖွင့်ရန်
          </Link>
        </p>
      </div>
    </div>
  );
}
