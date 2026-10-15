"use client";

import { useState } from "react";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import { TopBar } from "@/components/dashboard/top-bar";
import { MobileHeader } from "@/components/dashboard/mobile-header";
import { MobileNav } from "@/components/dashboard/mobile-nav";
import { DashboardContentWrapper } from "@/components/dashboard/dashboard-content-wrapper";
import { cn } from "@/lib/utils";

interface DashboardShellProps {
  children: React.ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Floating Collapsible Desktop Sidebar */}
      <div className="hidden md:block">
        <SidebarNav
          isExpanded={isSidebarExpanded}
          onToggle={() => setIsSidebarExpanded(!isSidebarExpanded)}
        />
      </div>

      {/* Main Content Area */}
      <div
        className={cn(
          "flex-1 flex flex-col min-w-0 pb-24 md:pb-0 transition-all duration-300 ease-in-out",
          isSidebarExpanded ? "md:pl-72" : "md:pl-24"
        )}
      >
        {/* Mobile Header (visible below md) */}
        <MobileHeader />

        {/* Desktop Top Bar (hidden below md) */}
        <TopBar />

        {/* Page Content */}
        <DashboardContentWrapper>{children}</DashboardContentWrapper>
      </div>

      {/* Floating Pill Mobile Bottom Navigation */}
      <div className="block md:hidden">
        <MobileNav />
      </div>
    </div>
  );
}

export default DashboardShell;

