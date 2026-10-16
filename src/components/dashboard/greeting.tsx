"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import { useLanguage } from "@/components/providers/language-provider";

interface GreetingProps {
  name: string;
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

function formatMyanmarDate(date: Date): string {
  const dayName = myanmarDays[date.getDay()];
  const dayNum = date.getDate();
  const monthName = myanmarMonths[date.getMonth()];
  const year = date.getFullYear();

  return `${year} ခုနှစ်၊ ${monthName}လ (${dayNum}) ရက်၊ ${dayName}နေ့`;
}

export function Greeting({ name }: GreetingProps) {
  const { language } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [greetingText, setGreetingText] = useState<string>(
    language === "en" ? "Welcome" : "မင်္ဂလာပါ"
  );
  const [formattedDate, setFormattedDate] = useState<string>("");

  useEffect(() => {
    const now = new Date();
    const hour = now.getHours();

    // Compute greeting based on time of day
    let greet = language === "en" ? "Welcome" : "မင်္ဂလာပါ";
    if (language === "en") {
      greet = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
    } else {
      greet = hour < 12 ? "မင်္ဂလာပါ" : hour < 17 ? "မင်္ဂလာနေ့လယ်ခင်း" : "မင်္ဂလာညနေခင်း";
    }

    // Format current date based on active locale
    let dateStr = "";
    if (language === "en") {
      dateStr = format(now, "MMMM d, yyyy", { locale: enUS });
    } else {
      dateStr = formatMyanmarDate(now);
    }

    setGreetingText(greet);
    setFormattedDate(dateStr);
    setMounted(true);
  }, [language]);

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        {greetingText}, {name} 👋
      </h1>
      <p className="text-sm text-muted-foreground mt-0.5 min-h-[1.25rem]">
        {mounted ? (
          formattedDate
        ) : (
          <span className="inline-block h-4 w-36 bg-muted/60 rounded animate-pulse" />
        )}
      </p>
    </div>
  );
}

export default Greeting;
