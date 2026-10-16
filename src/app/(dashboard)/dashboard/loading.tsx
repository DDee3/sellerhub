export default function DashboardLoading() {
  return (
    <div className="space-y-6 pb-8 animate-pulse">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/60 pb-4 mb-6">
        <div className="space-y-2">
          <div className="h-7 w-48 bg-muted rounded-lg" />
          <div className="h-4 w-32 bg-muted/60 rounded-md" />
        </div>
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-28 bg-muted rounded-full" />
          <div className="h-9 w-32 bg-muted rounded-full" />
        </div>
      </div>

      {/* 2. Stat Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-border/60 bg-card py-4 px-5 shadow-soft space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="h-3 w-20 bg-muted/70 rounded-md" />
              <div className="h-7 w-7 rounded-full bg-muted/60" />
            </div>
            <div className="space-y-1.5">
              <div className="h-8 w-16 bg-muted rounded-lg" />
              <div className="h-3 w-24 bg-muted/50 rounded-md" />
            </div>
          </div>
        ))}
      </div>

      {/* 2.5 Profit Widget Skeleton */}
      <div className="rounded-2xl border border-border/70 bg-card p-5 sm:p-6 shadow-soft space-y-5">
        <div className="flex items-center justify-between border-b border-border/50 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-muted/60" />
            <div className="space-y-1.5">
              <div className="h-4 w-32 bg-muted rounded-md" />
              <div className="h-3 w-40 bg-muted/50 rounded-md" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-6 w-24 bg-muted/60 rounded-full" />
            <div className="h-6 w-16 bg-muted/60 rounded-full" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="md:col-span-2 space-y-2">
            <div className="h-3 w-28 bg-muted/60 rounded-md" />
            <div className="h-10 w-44 bg-muted rounded-lg" />
          </div>
          <div className="h-16 rounded-xl border border-border/50 bg-muted/30" />
        </div>
        <div className="h-28 rounded-xl bg-muted/20" />
      </div>

      {/* 3. Two column grid on lg */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[...Array(2)].map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-border/60 bg-card p-4 shadow-soft space-y-4"
          >
            <div className="flex items-center justify-between border-b border-border/50 pb-3">
              <div className="space-y-1">
                <div className="h-4 w-32 bg-muted rounded-md" />
                <div className="h-3 w-40 bg-muted/60 rounded-md" />
              </div>
              <div className="h-4 w-12 bg-muted/50 rounded-md" />
            </div>
            <div className="space-y-2.5">
              {[...Array(3)].map((_, j) => (
                <div
                  key={j}
                  className="p-2.5 flex items-center justify-between gap-3 rounded-xl bg-muted/20"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="h-4 w-3/5 bg-muted rounded-md" />
                    <div className="h-3 w-2/5 bg-muted/50 rounded-md" />
                  </div>
                  <div className="h-6 w-16 bg-muted/60 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
