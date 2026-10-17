"use client";

import { useLanguage } from "@/components/providers/language-provider";

export function DashboardContentWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { language } = useLanguage();

  return (
    <main key={language} className="p-4 md:p-6 max-w-7xl mx-auto w-full flex-1">
      {children}
    </main>
  );
}

export default DashboardContentWrapper;

