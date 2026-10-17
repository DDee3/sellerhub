import React from "react";
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-background px-4 py-12 text-foreground overflow-hidden">
      {/* Upper atmospheric gradient mesh backdrop from DESIGN.md */}
      <div className="absolute top-0 left-0 right-0 h-96 stripi-mesh-gradient pointer-events-none opacity-80" />

      <div className="relative z-10 w-full max-w-sm space-y-6">
        {/* Brand header */}
        <div className="flex flex-col items-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-primary shrink-0" />
            <span className="font-light text-2xl tracking-[-0.96px] text-foreground lowercase">
              exchange
            </span>
          </Link>
        </div>

        {/* Floating card container with Level 2 shadow */}
        <div className="border border-border bg-card/95 backdrop-blur-md p-8 rounded-xl shadow-stripi-2">
          {children}
        </div>
      </div>
    </div>
  );
}
