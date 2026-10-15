import { Suspense } from "react";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import { TopBar } from "@/components/dashboard/top-bar";
import { MobileHeader } from "@/components/dashboard/mobile-header";
import { MobileNav } from "@/components/dashboard/mobile-nav";
import { AuthGate } from "@/components/dashboard/auth-gate";

import { DashboardContentWrapper } from "@/components/dashboard/dashboard-content-wrapper";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={null}>
        <AuthGate />
      </Suspense>

      {/* Floating Desktop Sidebar (removed from normal document flow) */}
      <Suspense fallback={null}>
        <SidebarNav />
      </Suspense>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 md:pl-72 pb-24 md:pb-0">
        {/* Mobile Header (visible below md) */}
        <Suspense fallback={<div className="h-14 bg-card border-b border-border/60" />}>
          <MobileHeader />
        </Suspense>

        {/* Desktop Top Bar (hidden below md) */}
        <Suspense fallback={<div className="h-16 bg-card border-b border-border/60" />}>
          <TopBar />
        </Suspense>

        {/* Page Content */}
        <DashboardContentWrapper>
          <Suspense fallback={null}>
            {children}
          </Suspense>
        </DashboardContentWrapper>
      </div>

      {/* Floating Pill Mobile Bottom Navigation */}
      <Suspense fallback={null}>
        <MobileNav />
      </Suspense>
    </div>
  );
}
