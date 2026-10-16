"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import { useLanguage } from "@/components/providers/language-provider";

export interface ClientDateProps {
  /** Optional date to format; defaults to current date if not provided */
  date?: Date | string | number;
  /** date-fns format string, defaults to "PPP" */
  formatStr?: string;
  /** Optional additional CSS classes */
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
  const [formatted, setFormatted] = useState<string>("");
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    try {
      const targetDate = date !== undefined ? new Date(date) : new Date();
      if (isNaN(targetDate.getTime())) {
        setFormatted("");
      } else if (language === "my" && (formatStr === "PPP" || formatStr === "full")) {
        setFormatted(formatMyanmarDate(targetDate));
      } else {
        setFormatted(format(targetDate, formatStr, { locale: enUS }));
      }
    } catch {
      setFormatted("");
    }
    setMounted(true);
  }, [date, formatStr, language]);

  if (!mounted) {
    return <span className={className} />;
  }

  return <span className={className}>{formatted}</span>;
}

export default ClientDate;

