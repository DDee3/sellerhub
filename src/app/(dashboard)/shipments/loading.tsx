export default function ShipmentsLoading() {
  return (
    <div className="space-y-4 pb-10 animate-pulse">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div className="space-y-2">
          <div className="h-7 w-40 bg-muted rounded-lg" />
          <div className="h-4 w-28 bg-muted/60 rounded-md" />
        </div>
        <div className="h-9 w-36 bg-muted rounded-full" />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="h-10 flex-1 bg-muted/60 rounded-xl" />
        <div className="h-10 w-64 bg-muted/40 rounded-xl" />
      </div>

      {/* Shipments list items */}
      <div className="space-y-2.5 pt-2">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between p-4 rounded-2xl border border-border/60 bg-card shadow-soft gap-4"
          >
            <div className="space-y-1.5 min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <div className="h-4 w-36 bg-muted rounded-md" />
                <div className="h-5 w-16 bg-muted/60 rounded-full" />
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-40 bg-muted/50 rounded-md" />
                <div className="h-3 w-20 bg-muted/40 rounded-md" />
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <div className="h-6 w-20 bg-muted/60 rounded-full" />
              <div className="h-8 w-8 rounded-full bg-muted/40" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

