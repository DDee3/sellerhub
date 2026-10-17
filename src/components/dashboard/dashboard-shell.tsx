"use client";

import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import { TopBar } from "@/components/dashboard/top-bar";
import { MobileHeader } from "@/components/dashboard/mobile-header";
import { MobileNav } from "@/components/dashboard/mobile-nav";
import { DashboardContentWrapper } from "@/components/dashboard/dashboard-content-wrapper";

interface DashboardShellProps {
  children: React.ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Fixed Flat Desktop Sidebar */}
      <div className="hidden md:block">
        <SidebarNav />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0 md:pl-56">
        {/* Mobile Header (visible below md) */}
        <MobileHeader />

        {/* Desktop Top Bar (hidden below md) */}
        <TopBar />

        {/* Page Content */}
        <DashboardContentWrapper>{children}</DashboardContentWrapper>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="block md:hidden">
        <MobileNav />
      </div>
    </div>
  );
}

export default DashboardShell;
