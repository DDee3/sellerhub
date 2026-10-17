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

interface LoginFormValues {
  email: string;
  password: string;
}

export default function LoginPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);

  const loginSchema = useMemo(
    () =>
      z.object({
        email: z
          .string()
          .min(1, { message: t("auth.error_email_required") })
          .email({ message: t("auth.error_email_invalid") }),
        password: z
          .string()
          .min(1, { message: t("auth.error_password_required") }),
      }),
    [t]
  );

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    console.log("[Login] Form submitted with email:", values.email);
    setIsLoading(true);
    const supabase = createClient();

    try {
      console.log("[Login] Calling supabase.auth.signInWithPassword...");
      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      console.log("[Login] signInWithPassword result:", { user: data?.user?.id, error });

      if (error) {
        toast.error(error.message || t("auth.error_login_failed"));
        return;
      }

      toast.success(t("auth.error_login_success"));
      router.push("/dashboard");
      router.refresh();
    } catch (err: unknown) {
      console.error("[Login] Unexpected catch error:", err);
      toast.error(t("auth.error_unexpected"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h1 className="text-2xl font-light tracking-[-0.64px] text-foreground">
          {t("auth.login_title")}
        </h1>
        <p className="text-[13px] font-light text-muted-foreground">
          {t("auth.login_subtitle")}
        </p>
      </div>

      <Form {...form}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit(onSubmit)(e);
          }}
          noValidate
          className="space-y-4"
        >
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
                    placeholder="example@mail.com"
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
                    placeholder="••••••••"
                    autoComplete="current-password"
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
                {t("auth.signing_in")}
              </>
            ) : (
              t("auth.login_button")
            )}
          </Button>
        </form>
      </Form>

      <div className="text-center pt-4 border-t border-border">
        <p className="text-[13px] font-light text-muted-foreground">
          {t("auth.no_account")}{" "}
          <Link
            href="/signup"
            className="font-normal text-primary hover:underline underline-offset-4"
          >
            {t("auth.signup_link")}
          </Link>
        </p>
      </div>
    </div>
  );
}
