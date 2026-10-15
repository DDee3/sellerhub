import { Suspense } from "react";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import { TopBar } from "@/components/dashboard/top-bar";
import { MobileHeader } from "@/components/dashboard/mobile-header";
import { AuthGate } from "@/components/dashboard/auth-gate";

import { DashboardContentWrapper } from "@/components/dashboard/dashboard-content-wrapper";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      <Suspense fallback={null}>
        <AuthGate />
      </Suspense>

      {/* Desktop Sidebar (hidden below md) */}
      <aside className="hidden md:flex w-64 lg:w-72 flex-col border-r border-border/60 bg-card p-4 lg:p-6 shrink-0 h-screen sticky top-0 z-20">
        <Suspense fallback={<div className="w-full h-full bg-card" />}>
          <SidebarNav />
        </Suspense>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
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
    </div>
  );
}
