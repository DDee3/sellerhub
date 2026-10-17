export default function NewDealLoading() {
  return (
    <div className="space-y-6 max-w-xl animate-pulse">
      <div className="space-y-2">
        <div className="h-4 w-24 bg-muted/60 rounded-md" />
        <div className="h-6 w-36 bg-muted rounded-md" />
      </div>
      <div className="h-96 rounded-lg border border-border bg-card p-6" />
    </div>
  );
}

