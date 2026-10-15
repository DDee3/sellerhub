"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/components/providers/language-provider";

export function Greeting({ name }: { name: string }) {
  const { language } = useLanguage();
  const [hour, setHour] = useState<number | null>(null);

  useEffect(() => {
    setHour(new Date().getHours());
  }, []);

  let greeting = language === "en" ? "Welcome" : "မင်္ဂလာပါ";
  if (hour !== null) {
    if (language === "en") {
      greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
    } else {
      greeting = hour < 12 ? "မင်္ဂလာပါ" : hour < 17 ? "မင်္ဂလာနေ့လယ်ခင်း" : "မင်္ဂလာညနေခင်း";
    }
  }

  return <span>{greeting}, {name} 👋</span>;
}

export default Greeting;
