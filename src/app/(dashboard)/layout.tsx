import { Suspense } from "react";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import { TopBar } from "@/components/dashboard/top-bar";
import { MobileHeader } from "@/components/dashboard/mobile-header";
import { AuthGate } from "@/components/dashboard/auth-gate";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      <Suspense fallback={null}>
        <AuthGate />
      </Suspense>

      {/* Desktop Sidebar (hidden below md) */}
      <aside className="hidden md:flex w-64 lg:w-72 flex-col border-r border-slate-200/80 bg-white p-4 lg:p-6 shrink-0 h-screen sticky top-0">
        <Suspense fallback={<div className="w-full h-full bg-white" />}>
          <SidebarNav />
        </Suspense>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header (visible below md) */}
        <Suspense fallback={<div className="h-14 bg-white border-b border-slate-200/80" />}>
          <MobileHeader />
        </Suspense>

        {/* Desktop Top Bar (hidden below md) */}
        <Suspense fallback={<div className="h-16 bg-white border-b border-slate-200/80" />}>
          <TopBar />
        </Suspense>

        {/* Page Content */}
        <main className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full flex-1">
          <Suspense fallback={null}>
            {children}
          </Suspense>
        </main>
      </div>
    </div>
  );
}
