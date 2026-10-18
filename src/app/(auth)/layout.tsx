import React from "react";
import { Store } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo + Branding */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-4 shadow-sm border border-primary/20">
            <Store className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">SellerHub</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your reseller business</p>
        </div>
        {children}
      </div>
    </div>
  );
}
