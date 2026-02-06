"use client";

import { isTestMode } from "@/lib/test-mode";
import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { BRAND_COLORS } from "@/lib/utils";

export function TestModeBanner() {
  const [isResetting, setIsResetting] = useState(false);

  if (!isTestMode()) return null;

  const handleReset = async () => {
    if (isResetting) return;
    setIsResetting(true);
    try {
      const res = await fetch('/api/reset-session');
      if (res.ok) {
        // Force refresh to clear state
        window.location.reload();
      } else {
        alert("Reset failed.");
        setIsResetting(false);
      }
    } catch (err) {
      console.error(err);
      alert("Error resetting.");
      setIsResetting(false);
    }
  };

  return (
    <div className="fixed bottom-6 left-6 z-[100]">
      <button
        onClick={handleReset}
        disabled={isResetting}
        className="group flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white shadow-xl transition-all active:scale-95 disabled:opacity-50"
      >
        <RefreshCw className={isResetting ? "w-4 h-4 animate-spin" : "w-4 h-4"} />
        <span className="text-xs font-black uppercase tracking-widest">
            {isResetting ? 'Resetting...' : 'Test Mode Reset'}
        </span>
      </button>
    </div>
  );
}