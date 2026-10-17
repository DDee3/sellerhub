"use client";

import { useSyncExternalStore } from "react";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import { useLanguage } from "@/components/providers/language-provider";

const emptySubscribe = () => () => {};

interface ClientDateProps {
  date?: string | Date;
  formatStr?: string;
  className?: string;
}

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

function formatMyanmarDate(d: Date): string {
  const dayName = myanmarDays[d.getDay()];
  const dayNum = d.getDate();
  const monthName = myanmarMonths[d.getMonth()];
  const year = d.getFullYear();

  return `${year} ခုနှစ်၊ ${monthName}လ (${dayNum}) ရက်၊ ${dayName}နေ့`;
}

export function ClientDate({
  date,
  formatStr = "PPP",
  className,
}: ClientDateProps) {
  const { language } = useLanguage();
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

  if (!mounted) {
    return <span className={className} />;
  }

  let formatted = "";
  try {
    const targetDate = date !== undefined ? new Date(date) : new Date();
    if (!isNaN(targetDate.getTime())) {
      if (language === "my" && (formatStr === "PPP" || formatStr === "full")) {
        formatted = formatMyanmarDate(targetDate);
      } else {
        formatted = format(targetDate, formatStr, { locale: enUS });
      }
    }
  } catch {
    formatted = "";
  }

  return <span className={className}>{formatted}</span>;
}

export default ClientDate;
