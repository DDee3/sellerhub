import Link from "next/link";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import {
  Package,
  ShoppingCart,
  Truck,
  AlertTriangle,
  ArrowRight,
  Plus,
  Inbox,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import {
  getDashboardStats,
  getUpcomingShipments,
  getLowStockProducts,
} from "@/lib/queries/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const myanmarMonths = [
  "ဇန်နဝါရီ",
  "ဖေဖော်ဝါရီ",
  "မတ်",
  "ဧပြီ",
  "မေ",
  "ဇွန်",
  "ဇူလိုင်",
  "ဩဂုတ်",
  "စက်တင်ဘာ",
  "အောက်တိုဘာ",
  "နိုဝင်ဘာ",
  "ဒီဇင်ဘာ",
];

const myanmarDays = [
  "တနင်္ဂနွေ",
  "တနင်္လာ",
  "အင်္ဂါ",
  "ဗုဒ္ဓဟူး",
  "ကြာသပတေး",
  "သောကြာ",
  "စနေ",
];

function formatMyanmarDate(date: Date): string {
  const dayName = myanmarDays[date.getDay()];
  const dayNum = date.getDate();
  const monthName = myanmarMonths[date.getMonth()];
  const year = date.getFullYear();

  return `${year} ခုနှစ်၊ ${monthName}လ (${dayNum}) ရက်၊ ${dayName}နေ့`;
}

function getShipmentStatusBadge(status: string) {
  switch (status) {
    case "ordering":
      return <Badge variant="secondary">မှာယူဆဲ</Badge>;
    case "in_transit":
      return <Badge variant="default" className="bg-blue-600 hover:bg-blue-700">လမ်းခရီးတွင်</Badge>;
    case "arrived":
      return <Badge variant="default" className="bg-emerald-600 hover:bg-emerald-700">ရောက်ရှိပါပြီ</Badge>;
    case "delivering":
      return <Badge variant="default" className="bg-amber-600 hover:bg-amber-700">ပို့ဆောင်ဆဲ</Badge>;
    case "completed":
      return <Badge variant="secondary">ပြီးစီး</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: shop } = await supabase
    .from("shops")
    .select("id, name")
    .eq("owner_id", user.id)
    .single();

  if (!shop) {
    redirect("/signup");
  }

  // Fetch all 3 queries in parallel
  const [stats, upcomingShipments, lowStockProducts] = await Promise.all([
    getDashboardStats(shop.id),
    getUpcomingShipments(shop.id, 7),
    getLowStockProducts(shop.id),
  ]);

  const todayStr = formatMyanmarDate(new Date());

  return (
    <div className="space-y-6 pb-8">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-200/60 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            မင်္ဂလာပါ, {shop.name} 👋
          </h1>
          <p className="text-sm text-slate-500 mt-1">{todayStr}</p>
        </div>

        {/* 3. Quick Actions */}
        <div className="flex items-center gap-2 pt-2 sm:pt-0">
          <Link
            href="/orders/new"
            className={cn(
              buttonVariants({ variant: "default" }),
              "gap-1.5 h-10 px-4 font-medium shadow-xs"
            )}
          >
            <Plus className="h-4 w-4" />
            အော်ဒါအသစ်
          </Link>
          <Link
            href="/shipments/new"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "gap-1.5 h-10 px-4 font-medium border-slate-200 bg-white"
            )}
          >
            <Plus className="h-4 w-4" />
            ပို့ဆောင်မှုအသစ်
          </Link>
        </div>
      </div>

      {/* 2. Stat Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Active Shipments */}
        <Card className="bg-white border-slate-200/80 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs sm:text-sm font-medium text-slate-600">
              Active Shipments
            </CardTitle>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Truck className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {stats.activeShipments}
            </div>
            <p className="text-xs text-slate-500 mt-1">ပို့ဆောင်ဆဲ အသုတ်များ</p>
          </CardContent>
        </Card>

        {/* Pending Orders */}
        <Card className="bg-white border-slate-200/80 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs sm:text-sm font-medium text-slate-600">
              Pending Orders
            </CardTitle>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <ShoppingCart className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {stats.pendingOrders}
            </div>
            <p className="text-xs text-slate-500 mt-1">စောင့်ဆိုင်းဆဲ အော်ဒါ</p>
          </CardContent>
        </Card>

        {/* Unpaid Balance */}
        <Card className="bg-white border-slate-200/80 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs sm:text-sm font-medium text-slate-600 truncate">
              Unpaid Balance
            </CardTitle>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <span className="text-xs font-bold leading-none">MMK</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-slate-900 truncate">
              {stats.unpaidBalance.toLocaleString()}
            </div>
            <p className="text-xs text-slate-500 mt-1">ကျန်ငွေ စုစုပေါင်း (ကျပ်)</p>
          </CardContent>
        </Card>

        {/* Low Stock Items */}
        <Card className="bg-white border-slate-200/80 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs sm:text-sm font-medium text-slate-600">
              Low Stock Items
            </CardTitle>
            <div className="p-2 bg-red-50 text-red-600 rounded-lg">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {stats.lowStockCount}
            </div>
            <p className="text-xs text-slate-500 mt-1">လက်ကျန်နည်း ပစ္စည်းများ</p>
          </CardContent>
        </Card>
      </div>

      {/* 4. Two column grid on lg */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Upcoming Shipments */}
        <Card className="bg-white border-slate-200/80 shadow-xs flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <CardTitle className="text-base font-bold text-slate-900">
                လာမည့် ပို့ဆောင်မှုများ
              </CardTitle>
              <p className="text-xs text-slate-500">လာမည့် ၇ ရက်အတွင်း ရောက်ရှိမည့်အသုတ်များ</p>
            </div>
            <Link
              href="/shipments"
              className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
            >
              အားလုံးကြည့်ရန်
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardHeader>
          <CardContent className="pt-4 flex-1">
            {upcomingShipments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-2">
                  <Inbox className="h-5 w-5" />
                </div>
                <p className="text-sm font-medium text-slate-600">
                  ဒီနေ့ အလုပ်မရှိပါ
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  လာမည့် ပို့ဆောင်မှု မရှိသေးပါ
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {upcomingShipments.map((s) => (
                  <div
                    key={s.id}
                    className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-900 truncate">
                        {s.name}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        ရောက်ရှိမည့်ရက်: {s.arrive_date || "သတ်မှတ်မထားပါ"}
                        {s.source ? ` • (${s.source})` : ""}
                      </p>
                    </div>
                    <div>{getShipmentStatusBadge(s.status)}</div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right: Low Stock Products */}
        <Card className="bg-white border-slate-200/80 shadow-xs flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <CardTitle className="text-base font-bold text-slate-900">
                လက်ကျန်နည်း ပစ္စည်းများ
              </CardTitle>
              <p className="text-xs text-slate-500">သတ်မှတ်လက်ကျန်အောက် ရောက်နေသော ပစ္စည်းများ</p>
            </div>
            <Link
              href="/products"
              className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
            >
              အားလုံးကြည့်ရန်
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardHeader>
          <CardContent className="pt-4 flex-1">
            {lowStockProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-2">
                  <Package className="h-5 w-5" />
                </div>
                <p className="text-sm font-medium text-slate-600">
                  ဒီနေ့ အလုပ်မရှိပါ
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  လက်ကျန်နည်းသော ပစ္စည်း မရှိပါ
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {lowStockProducts.map((p) => (
                  <div
                    key={p.id}
                    className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-900 truncate">
                        {p.name}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        သတိပေးသတ်မှတ်ချက်: {p.low_stock_alert} ခု
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant="destructive"
                        className="font-semibold text-xs px-2.5 py-0.5"
                      >
                        လက်ကျန် {p.stock_qty} ခု
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
