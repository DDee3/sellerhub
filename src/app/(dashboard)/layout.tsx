import { Suspense, ViewTransition } from "react";
import { AuthGate } from "@/components/dashboard/auth-gate";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Suspense fallback={null}>
        <AuthGate />
      </Suspense>

      <Suspense fallback={<div className="min-h-screen bg-background" />}>
        <DashboardShell>
          <ViewTransition>{children}</ViewTransition>
        </DashboardShell>
      </Suspense>
    </>
  );
}
