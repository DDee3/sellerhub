import React from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Store } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-md space-y-6">
        {/* Logo & Header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-sm">
              <Store className="h-6 w-6" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-slate-900">
              SellerHub
            </span>
          </Link>
          <p className="text-sm text-slate-500">
            အွန်လိုင်း အရောင်းဆိုင် စီမံခန့်ခွဲမှု စနစ်
          </p>
        </div>

        {/* Centered card content */}
        <Card className="border-slate-200/80 shadow-sm p-6 sm:p-8 bg-white">
          {children}
        </Card>
      </div>
    </div>
  );
}

