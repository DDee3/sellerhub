import React from "react";
import Image from "next/image";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo + Branding */}
        <div className="flex flex-col items-center mb-8">
          <Image src="/logo.png" alt="SellerHub" width={64} height={64} className="rounded-2xl object-contain mb-4" />
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">SellerHub</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your reseller business</p>
        </div>
        {children}
      </div>
    </div>
  );
}

