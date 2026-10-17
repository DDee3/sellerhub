"use client";

import { useState, useEffect } from "react";
import {
  ClipboardList,
  Copy,
  Check,
  RotateCw,
  Clock,
  Sparkles,
  Sun,
  Moon,
} from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function RateCardView() {
  const [rate1, setRate1] = useState<string>("137.36");
  const [rate2, setRate2] = useState<string>("137.55");
  const [rate3, setRate3] = useState<string>("134.4");

  const [previewTheme, setPreviewTheme] = useState<"light" | "dark">("light");
  const [timeString, setTimeString] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    const now = new Date();
    const datePart = now.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    const timePart = now.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTimeString(`${datePart} ( ${timePart} )`);
  }, []);

  const refreshTimestamp = () => {
    const now = new Date();
    const datePart = now.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    const timePart = now.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
    setTimeString(`${datePart} ( ${timePart} )`);
    toast.success("Timestamp refreshed to current time");
  };

  const num1 = parseFloat(rate1);
  const num2 = parseFloat(rate2);
  const num3 = parseFloat(rate3);

  const calc1 = !isNaN(num1) && num1 > 0 ? Math.floor(100000 / num1) : 0;
  const calc2 = !isNaN(num2) && num2 > 0 ? Math.floor(100000 / num2) : 0;
  const calc3 = !isNaN(num3) && num3 > 0 ? Math.floor(100000 / num3) : 0;

  const outputText = `Update Rate
${timeString}💸

[kyat➡️baht]  { ${calc1} baht }
———Baht 50,000အထက်———

1 THB = ${rate1}MMK{ ${calc1} baht}
Baht 5000⏬🔽🔽
1 THB = ${rate2}MMK{ ${calc2} baht}

🇹🇭🔁🇲🇲 [baht to kyat]
1 THB = ${rate3}MMK{ ${calc3} baht }

K PAY / KBZ Special / Wave Pay / AYA / CB Special / AYA PAY / CB PAY နဲ့လဲလို့ရပါတယ်

စျေးအပြောင်းအလဲရှိနိုင်တာမို့ မလွှဲခင် rateလေး ပြန်မေးပေးပါဗျ`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(outputText);
      setCopied(true);
      toast.success("Rate card copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
      toast.error("Failed to copy to clipboard");
    }
  };

  const handleResetDefaults = () => {
    setRate1("137.36");
    setRate2("137.55");
    setRate3("134.4");
    refreshTimestamp();
    toast.success("Reset rates to defaults");
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-light tracking-[-0.64px] text-foreground">
            Rate Card Generator
          </h1>
          <p className="text-xs sm:text-sm font-light text-muted-foreground mt-0.5">
            Quickly generate exchange rate broadcast messages for customers
          </p>
        </div>
        <div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleResetDefaults}
            className="h-8 px-3 text-xs font-normal rounded-full gap-1.5 border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Reset Sample Rates</span>
          </Button>
        </div>
      </div>

      {/* Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left Column: Form Inputs */}
        <Card className="bg-card text-card-foreground border-border rounded-xl shadow-stripi-1 p-5 md:p-6 space-y-6">
          <div className="flex items-start gap-3 pb-4 border-b border-border">
            <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <ClipboardList className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-[15px] font-normal text-foreground tracking-[-0.2px]">
                Rate Inputs
              </h2>
              <p className="text-xs font-light text-muted-foreground mt-0.5">
                Enter rates in MMK per 1 THB. The Lakh conversions calculate automatically.
              </p>
            </div>
          </div>

          <div className="space-y-5">
            {/* Input 1 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="rate1"
                  className="text-xs font-normal text-foreground"
                >
                  Kyat to Baht (Above 50k)
                </Label>
                <span className="text-[11px] font-light text-muted-foreground">
                  1 Lakh MMK ={" "}
                  <strong className="font-normal text-foreground tabular-nums">
                    {calc1} THB
                  </strong>
                </span>
              </div>
              <div className="relative">
                <Input
                  id="rate1"
                  type="number"
                  step="any"
                  value={rate1}
                  onChange={(e) => setRate1(e.target.value)}
                  placeholder="137.36"
                  className="h-10 rounded-[6px] bg-card text-foreground border-input text-sm font-light tabular-nums pr-16"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-light pointer-events-none">
                  MMK/THB
                </span>
              </div>
            </div>

            {/* Input 2 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="rate2"
                  className="text-xs font-normal text-foreground"
                >
                  Kyat to Baht (Below 5k)
                </Label>
                <span className="text-[11px] font-light text-muted-foreground">
                  1 Lakh MMK ={" "}
                  <strong className="font-normal text-foreground tabular-nums">
                    {calc2} THB
                  </strong>
                </span>
              </div>
              <div className="relative">
                <Input
                  id="rate2"
                  type="number"
                  step="any"
                  value={rate2}
                  onChange={(e) => setRate2(e.target.value)}
                  placeholder="137.55"
                  className="h-10 rounded-[6px] bg-card text-foreground border-input text-sm font-light tabular-nums pr-16"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-light pointer-events-none">
                  MMK/THB
                </span>
              </div>
            </div>

            {/* Input 3 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="rate3"
                  className="text-xs font-normal text-foreground"
                >
                  Baht to Kyat
                </Label>
                <span className="text-[11px] font-light text-muted-foreground">
                  1 Lakh MMK ={" "}
                  <strong className="font-normal text-foreground tabular-nums">
                    {calc3} THB
                  </strong>
                </span>
              </div>
              <div className="relative">
                <Input
                  id="rate3"
                  type="number"
                  step="any"
                  value={rate3}
                  onChange={(e) => setRate3(e.target.value)}
                  placeholder="134.4"
                  className="h-10 rounded-[6px] bg-card text-foreground border-input text-sm font-light tabular-nums pr-16"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-light pointer-events-none">
                  MMK/THB
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Right Column: Live Preview & Copy */}
        <div className="space-y-4">
          <Card className="bg-card text-card-foreground border-border rounded-xl shadow-stripi-1 p-5 md:p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <h2 className="text-[15px] font-normal text-foreground tracking-[-0.2px]">
                  Live Preview
                </h2>
              </div>
              <div className="flex items-center gap-2.5">
                {/* Theme preview toggle */}
                <div className="flex items-center rounded-full border border-border bg-muted/60 p-0.5">
                  <button
                    type="button"
                    onClick={() => setPreviewTheme("light")}
                    className={cn(
                      "px-2.5 py-0.5 text-[11px] rounded-full transition-all flex items-center gap-1",
                      previewTheme === "light"
                        ? "bg-card text-foreground shadow-xs font-normal"
                        : "text-muted-foreground hover:text-foreground font-light"
                    )}
                  >
                    <Sun className="h-3 w-3" />
                    <span>Light</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewTheme("dark")}
                    className={cn(
                      "px-2.5 py-0.5 text-[11px] rounded-full transition-all flex items-center gap-1",
                      previewTheme === "dark"
                        ? "bg-card text-foreground shadow-xs font-normal"
                        : "text-muted-foreground hover:text-foreground font-light"
                    )}
                  >
                    <Moon className="h-3 w-3" />
                    <span>Dark</span>
                  </button>
                </div>

                {/* Timestamp & Refresh */}
                <div className="flex items-center gap-1 text-xs text-muted-foreground font-light pl-1 border-l border-border">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="hidden sm:inline">
                    {timeString}
                  </span>
                  <button
                    type="button"
                    onClick={refreshTimestamp}
                    title="Update timestamp to current time"
                    className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  >
                    <RotateCw className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Generated Output Preview Box (Chat Bubble style) */}
            <div
              className={cn(
                "relative rounded-xl p-4 sm:p-5 text-[13.5px] sm:text-sm leading-relaxed font-sans whitespace-pre-wrap select-all min-h-[340px] transition-colors border shadow-xs",
                previewTheme === "light"
                  ? "bg-white text-slate-900 border-slate-200"
                  : "bg-slate-950 text-slate-100 border-slate-800"
              )}
            >
              {outputText}
            </div>
          </Card>

          {/* Large Copy to Clipboard Button */}
          <Button
            type="button"
            onClick={handleCopy}
            className="w-full h-12 text-sm font-normal rounded-full gap-2 shadow-stripi-1 transition-all"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-emerald-300" />
                <span>Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                <span>Copy to Clipboard</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default RateCardView;
