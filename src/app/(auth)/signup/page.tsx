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
import { PasswordInput } from "@/components/ui/password-input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const signupSchema = z.object({
  shop_name: z.string().min(1, { message: "Shop name is required" }),
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

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
      // 1. supabase.auth.signUp
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: values.email.trim(),
        password: values.password,
      });

      // 2. if error -> toast, return
      if (authError) {
        toast.error(authError.message || "Sign up failed");
        return;
      }

      // 3. if no session -> toast, push /login, return
      if (!authData?.session) {
        toast("Check your email to confirm, then log in");
        router.push("/login");
        return;
      }

      // 4. insert into shops (owner_id = user.id, name = shop name)
      if (authData.user) {
        const { error: shopError } = await supabase.from("shops").insert({
          owner_id: authData.user.id,
          name: values.shop_name.trim(),
        });

        if (shopError) {
          console.error("[Signup] Shop creation error:", shopError);
          toast.error("Account created, but failed to initialize shop");
        }
      }

      // 5. push /dashboard, refresh
      toast.success("Account created successfully");
      router.push("/dashboard");
      router.refresh();
    } catch (err: unknown) {
      console.error("[Signup] Unexpected error:", err);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h1 className="text-lg font-semibold tracking-tight text-foreground">
          Create an account
        </h1>
        <p className="text-xs text-muted-foreground">
          Enter your details below to get started
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3.5">
          <FormField
            control={form.control}
            name="shop_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium text-foreground">
                  Shop Name
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="My Store"
                    disabled={isLoading}
                    className="h-9 text-sm bg-background border-input"
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
              <FormItem>
                <FormLabel className="text-xs font-medium text-foreground">
                  Email
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    placeholder="name@example.com"
                    autoComplete="email"
                    disabled={isLoading}
                    className="h-9 text-sm bg-background border-input"
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
              <FormItem>
                <FormLabel className="text-xs font-medium text-foreground">
                  Password
                </FormLabel>
                <FormControl>
                  <PasswordInput
                    {...field}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    disabled={isLoading}
                    className="h-9 text-sm bg-background border-input"
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-9 text-sm font-medium mt-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              "Sign Up"
            )}
          </Button>
        </form>
      </Form>

      <div className="text-center pt-3 border-t border-border">
        <p className="text-xs text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-foreground hover:underline underline-offset-4"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
