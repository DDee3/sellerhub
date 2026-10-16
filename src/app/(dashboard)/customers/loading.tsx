export default function CustomersLoading() {
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

      {/* Search Input */}
      <div className="h-10 w-full max-w-md bg-muted/60 rounded-xl" />

      {/* Customers list items */}
      <div className="space-y-2.5 pt-2">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between p-4 rounded-2xl border border-border/60 bg-card shadow-soft gap-4"
          >
            <div className="flex items-center gap-3.5 min-w-0 flex-1">
              <div className="h-10 w-10 rounded-full bg-muted shrink-0" />
              <div className="space-y-1.5 min-w-0 flex-1">
                <div className="h-4 w-32 bg-muted rounded-md" />
                <div className="flex items-center gap-2">
                  <div className="h-3 w-24 bg-muted/50 rounded-md" />
                  <div className="h-3 w-20 bg-muted/40 rounded-md" />
                </div>
              </div>
            </div>
            <div className="h-8 w-8 rounded-full bg-muted/40 shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}

