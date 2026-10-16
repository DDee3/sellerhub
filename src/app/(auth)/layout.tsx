import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui/card";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-md space-y-6">
        {/* Logo & Header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <Link href="/" className="flex items-center gap-2.5 group">
            <Image
              src="/logo.png"
              alt="SellerHub"
              width={48}
              height={48}
              className="rounded-xl object-contain shrink-0"
              priority
            />
            <span className="text-2xl font-bold tracking-tight text-foreground">
              SellerHub
            </span>
          </Link>
          <p className="text-sm text-muted-foreground">
            အွန်လိုင်း အရောင်းဆိုင် စီမံခန့်ခွဲမှု စနစ်
          </p>
        </div>

        {/* Centered card content */}
        <Card className="border-border shadow-soft p-6 sm:p-8 bg-card text-card-foreground">
          {children}
        </Card>
      </div>
    </div>
  );
}

