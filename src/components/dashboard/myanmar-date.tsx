"use client";

import { useSyncExternalStore } from "react";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import { useLanguage } from "@/components/providers/language-provider";

const emptySubscribe = () => () => {};

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

export function MyanmarDate({ date }: { date?: string | Date } = {}) {
  const { language } = useLanguage();
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

  if (!mounted) {
    return <span className="inline-block h-4 w-32 bg-muted/60 rounded animate-pulse" />;
  }

  const d = date ? new Date(date) : new Date();
  const dateStr =
    language === "en"
      ? format(d, "MMMM d, yyyy", { locale: enUS })
      : formatMyanmarDate(d);

  return <span>{dateStr}</span>;
}

export default MyanmarDate;
