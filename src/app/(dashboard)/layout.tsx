import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import { TopBar } from "@/components/dashboard/top-bar";
import { MobileHeader } from "@/components/dashboard/mobile-header";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  // 1. Fetch current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 2. Fetch current shop where owner_id = user.id
  const { data: shop } = await supabase
    .from("shops")
    .select("id, name, phone, logo_url")
    .eq("owner_id", user.id)
    .single();

  if (!shop) {
    redirect("/signup");
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Desktop Sidebar (hidden below md) */}
      <aside className="hidden md:flex w-64 lg:w-72 flex-col border-r border-slate-200/80 bg-white p-4 lg:p-6 shrink-0 h-screen sticky top-0">
        <SidebarNav shopName={shop.name} />
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header (visible below md) */}
        <MobileHeader shopName={shop.name} />

        {/* Desktop Top Bar (hidden below md) */}
        <TopBar shopName={shop.name} />

        {/* Page Content */}
        <main className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
