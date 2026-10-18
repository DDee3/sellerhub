"use client";

import { useState, useMemo } from "react";
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
import { PasswordInput } from "@/components/ui/password-input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useLanguage } from "@/components/providers/language-provider";

interface SignupFormValues {
  shop_name: string;
  email: string;
  password: string;
}

export default function SignupPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);

  const signupSchema = useMemo(
    () =>
      z.object({
        shop_name: z
          .string()
          .min(1, { message: t("auth.error_shop_name_required") }),
        email: z
          .string()
          .min(1, { message: t("auth.error_email_required") })
          .email({ message: t("auth.error_email_invalid") }),
        password: z
          .string()
          .min(6, { message: t("auth.error_password_min") }),
      }),
    [t]
  );

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      shop_name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: SignupFormValues) => {
    setIsLoading(true);
    const supabase = createClient();

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: values.email.trim(),
        password: values.password,
      });

      if (authError) {
        toast.error(authError.message || t("auth.error_signup_failed"));
        return;
      }

      if (!authData?.session) {
        toast(t("auth.confirm_email_msg"));
        router.push("/login");
        return;
      }

      if (authData.user) {
        const { error: shopError } = await supabase.from("shops").insert({
          owner_id: authData.user.id,
          name: values.shop_name.trim(),
        });

        if (shopError) {
          console.error("[Signup] Shop creation error:", shopError);
          toast.error(t("auth.shop_init_failed"));
        }
      }

      toast.success(t("auth.signup_success"));
      router.push("/dashboard");
      router.refresh();
    } catch (err: unknown) {
      console.error("[Signup] Unexpected error:", err);
      toast.error(t("auth.error_unexpected"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h1 className="text-2xl font-light tracking-[-0.64px] text-foreground">
          {t("auth.signup_title")}
        </h1>
        <p className="text-[13px] font-light text-muted-foreground">
          {t("auth.signup_subtitle")}
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="shop_name"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-[13px] font-normal text-foreground">
                  {t("auth.shop_name")}
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder={t("auth.shop_name_placeholder")}
                    disabled={isLoading}
                    className="h-10 text-[15px] font-light bg-card border-input"
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-[13px] font-normal text-foreground">
                  {t("auth.email")}
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    placeholder={t("auth.email_placeholder")}
                    autoComplete="email"
                    disabled={isLoading}
                    className="h-10 text-[15px] font-light bg-card border-input"
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-[13px] font-normal text-foreground">
                  {t("auth.password")}
                </FormLabel>
                <FormControl>
                  <PasswordInput
                    {...field}
                    placeholder={t("auth.password_placeholder")}
                    autoComplete="new-password"
                    disabled={isLoading}
                    className="h-10 text-[15px] font-light bg-card border-input"
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-10 text-sm font-normal rounded-full mt-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("auth.creating_account")}
              </>
            ) : (
              t("auth.signup_button")
            )}
          </Button>
        </form>
      </Form>

      <div className="text-center pt-4 border-t border-border">
        <p className="text-[13px] font-light text-muted-foreground">
          {t("auth.has_account")}{" "}
          <Link
            href="/login"
            className="font-normal text-primary hover:underline underline-offset-4"
          >
            {t("auth.signin_link")}
          </Link>
        </p>
      </div>
    </div>
  );
}
