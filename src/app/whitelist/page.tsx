"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Wifi } from "lucide-react";

export default function WhitelistCheckPage() {
  const [ip, setIp] = useState<string>("Detecting...");

  useEffect(() => {
    // Simple client-side IP check to help IT admins confirm the routing
    fetch("https://api.ipify.org?format=json")
      .then((res) => res.json())
      .then((data) => setIp(data.ip))
      .catch(() => setIp("Unknown (Firewall blocking IP check)"));
  }, []);

  return (
    <div className="min-h-screen bg-green-50 dark:bg-green-950/20 flex flex-col items-center justify-center p-6 font-sans">
      <Card className="max-w-xl w-full border-2 border-green-500 shadow-2xl animate-in fade-in zoom-in duration-500">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 bg-green-100 dark:bg-green-900/50 p-4 rounded-full w-24 h-24 flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-3xl font-bold text-green-700 dark:text-green-400">
            System Online
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <p className="text-lg text-gray-700 dark:text-gray-300">
            If you are seeing this page, your network has successfully whitelisted the <strong>WTN 2026</strong> domain.
          </p>

          <div className="bg-white dark:bg-zinc-900 border border-green-200 dark:border-green-900 rounded-lg p-6 space-y-2">
            <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400 font-semibold uppercase tracking-wider text-sm">
              <Wifi className="w-4 h-4" />
              Connection Verified
            </div>
            <div className="text-xs text-gray-400">
              Access to core exam services is confirmed.
            </div>
          </div>

          <div className="pt-4 border-t border-green-100 dark:border-green-900/30 text-sm text-gray-500">
             <p>Your Public IP: <span className="font-mono font-medium text-black dark:text-white">{ip}</span></p>
             <p className="text-xs mt-1 text-gray-400">(Please verify this IP matches your school's gateway)</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}