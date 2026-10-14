"use client";

import { useEffect, useState } from "react";

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

export function MyanmarDate() {
  const [dateStr, setDateStr] = useState<string>("");

  useEffect(() => {
    setDateStr(formatMyanmarDate(new Date()));
  }, []);

  if (!dateStr) {
    return <span className="inline-block h-4 w-44 bg-slate-100 rounded animate-pulse" />;
  }

  return <span>{dateStr}</span>;
}

