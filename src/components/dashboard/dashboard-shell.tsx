"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
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
    <div className="min-h-screen bg-background text-foreground relative">
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

      {/* Mobile Floating Action Button (FAB) */}
      <Link
        href="/deals/new"
        aria-label="Record Deal"
        className="md:hidden fixed bottom-20 right-4 z-40 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
      >
        <Plus className="h-6 w-6 stroke-[2.5]" />
      </Link>

      {/* Mobile Bottom Navigation */}
      <div className="block md:hidden">
        <MobileNav />
      </div>
    </div>
  );
}

export default DashboardShell;
