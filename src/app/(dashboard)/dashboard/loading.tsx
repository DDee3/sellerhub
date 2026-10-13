import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function DashboardLoading() {
  return (
    <div className="space-y-6 pb-8 animate-pulse">
      {/* 1. Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-200/60 pb-4">
        <div className="space-y-2">
          <div className="h-8 w-48 sm:w-64 bg-slate-200 rounded-md" />
          <div className="h-4 w-36 sm:w-48 bg-slate-100 rounded-md" />
        </div>
        <div className="flex items-center gap-2 pt-2 sm:pt-0">
          <div className="h-10 w-28 bg-slate-200 rounded-lg" />
          <div className="h-10 w-32 bg-slate-200 rounded-lg" />
        </div>
      </div>

      {/* 2. Stat Cards Grid Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="bg-white border-slate-200/80 shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <div className="h-4 w-20 bg-slate-200 rounded" />
              <div className="h-8 w-8 bg-slate-100 rounded-lg" />
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="h-7 w-16 bg-slate-200 rounded" />
              <div className="h-3 w-24 bg-slate-100 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 3. Two column grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Card Skeleton */}
        <Card className="bg-white border-slate-200/80 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-100">
            <div className="space-y-1">
              <div className="h-5 w-36 bg-slate-200 rounded" />
              <div className="h-3 w-48 bg-slate-100 rounded" />
            </div>
            <div className="h-4 w-16 bg-slate-200 rounded" />
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="py-3 border-b border-slate-100 last:border-0 flex items-center justify-between gap-3"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="h-4 w-40 bg-slate-200 rounded" />
                  <div className="h-3 w-28 bg-slate-100 rounded" />
                </div>
                <div className="h-5 w-16 bg-slate-200 rounded-full" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Right Card Skeleton */}
        <Card className="bg-white border-slate-200/80 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-100">
            <div className="space-y-1">
              <div className="h-5 w-36 bg-slate-200 rounded" />
              <div className="h-3 w-48 bg-slate-100 rounded" />
            </div>
            <div className="h-4 w-16 bg-slate-200 rounded" />
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="py-3 border-b border-slate-100 last:border-0 flex items-center justify-between gap-3"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="h-4 w-40 bg-slate-200 rounded" />
                  <div className="h-3 w-28 bg-slate-100 rounded" />
                </div>
                <div className="h-5 w-20 bg-slate-200 rounded-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

