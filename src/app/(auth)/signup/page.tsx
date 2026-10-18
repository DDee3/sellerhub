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
  owner_name: string;
  phone: string;
  email: string;
  password: string;
  confirm_password: string;
}

export default function SignupPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);

  const signupSchema = useMemo(
    () =>
      z
        .object({
          shop_name: z
            .string()
            .min(1, { message: t("auth.error_shop_name_required") }),
          owner_name: z
            .string()
            .min(1, { message: t("auth.error_owner_name_required") }),
          phone: z
            .string()
            .min(1, { message: t("auth.error_phone_required") }),
          email: z
            .string()
            .min(1, { message: t("auth.error_email_required") })
            .email({ message: t("auth.error_email_invalid") }),
          password: z
            .string()
            .min(6, { message: t("auth.error_password_min") }),
          confirm_password: z
            .string()
            .min(1, { message: t("auth.error_confirm_password_required") }),
        })
        .refine((data) => data.password === data.confirm_password, {
          message: t("auth.error_passwords_dont_match"),
          path: ["confirm_password"],
        }),
    [t]
  );

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
        toast.error(authError.message || t("auth.error_signup_failed"));
        return;
      }

      if (!authData.user) {
        console.error("[Signup] No user returned from signUp");
        toast.error(t("auth.error_signup_failed"));
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
        toast.error(shopError.message || t("auth.error_signup_failed"));
        return;
      }

      toast.success(t("auth.signup_success"));
      router.push("/dashboard");
      router.refresh();
    } catch (err: unknown) {
      console.error("[Signup] Unexpected catch error:", err);
      toast.error(t("auth.error_unexpected"));
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
        <h1 className="text-xl font-bold tracking-tight text-foreground">
          {t("auth.signup_title")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t("auth.signup_subtitle")}
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
                <FormLabel className="text-sm font-medium text-foreground">
                  {t("auth.shop_name")}
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder={t("auth.shop_name_placeholder")}
                    disabled={isLoading}
                    className="h-12 text-base px-4 bg-muted/50 border-input"
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
                <FormLabel className="text-sm font-medium text-foreground">
                  {t("auth.owner_name")}
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder={t("auth.owner_name_placeholder")}
                    disabled={isLoading}
                    className="h-12 text-base px-4 bg-muted/50 border-input"
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
                <FormLabel className="text-sm font-medium text-foreground">
                  {t("auth.phone")}
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="tel"
                    placeholder={t("auth.phone_placeholder")}
                    disabled={isLoading}
                    className="h-12 text-base px-4 bg-muted/50 border-input"
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
                <FormLabel className="text-sm font-medium text-foreground">
                  {t("auth.email")}
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    placeholder={t("auth.email_placeholder")}
                    autoComplete="email"
                    disabled={isLoading}
                    className="h-12 text-base px-4 bg-muted/50 border-input"
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
                <FormLabel className="text-sm font-medium text-foreground">
                  {t("auth.password_label")}
                </FormLabel>
                <FormControl>
                  <PasswordInput
                    {...field}
                    placeholder={t("auth.password_placeholder")}
                    autoComplete="new-password"
                    disabled={isLoading}
                    className="h-12 text-base px-4 bg-muted/50 border-input"
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
                <FormLabel className="text-sm font-medium text-foreground">
                  {t("auth.confirm_password")}
                </FormLabel>
                <FormControl>
                  <PasswordInput
                    {...field}
                    placeholder={t("auth.password_placeholder")}
                    autoComplete="new-password"
                    disabled={isLoading}
                    className="h-12 text-base px-4 bg-muted/50 border-input"
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
                {t("auth.creating_account")}
              </>
            ) : (
              t("auth.signup_button")
            )}
          </Button>
        </form>
      </Form>

      <div className="text-center pt-2 border-t border-border">
        <p className="text-sm text-muted-foreground">
          {t("auth.has_account")}{" "}
          <Link
            href="/login"
            className="font-semibold text-primary hover:underline underline-offset-4"
          >
            {t("auth.signin_link")}
          </Link>
        </p>
      </div>
    </div>
  );
}
