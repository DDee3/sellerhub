import React from "react";
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-8 text-foreground">
      <div className="w-full max-w-sm">
        {/* Brand header */}
        <div className="flex flex-col items-center mb-6">
          <Link href="/" className="inline-block">
            <span className="font-semibold text-xl tracking-tight lowercase">
              exchange
            </span>
          </Link>
        </div>

        {/* Flat bordered card container */}
        <div className="border border-border bg-card p-6 rounded-lg">
          {children}
        </div>
      </div>
    </div>
  );
}
