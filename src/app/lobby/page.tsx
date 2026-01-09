"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function LobbyPage() {
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [status, setStatus] = useState('Syncing with server...');
  const [offset, setOffset] = useState<number>(0);

  useEffect(() => {
    async function init() {
      try {
        // 1. Get Session Info
        const sessionRes = await fetch('/api/session');
        const sessionData = await sessionRes.json();
        const startTime = sessionData.startTime;

        // 2. Sync Clock (Simple implementation)
        const t0 = Date.now();
        const timeRes = await fetch('/api/time');
        const timeData = await timeRes.json();
        const t1 = Date.now();
        const latency = t1 - t0;
        const serverTime = timeData.time + (latency / 2);
        const clockOffset = serverTime - t1; // Add this to local Date.now() to get Server Time
        setOffset(clockOffset);

        setStatus('Waiting for session to start...');

        // 3. Start Timer Loop
        const intervalId = setInterval(() => {
          const currentServerTime = Date.now() + clockOffset;
          const remaining = startTime - currentServerTime;

          if (remaining <= 0) {
            clearInterval(intervalId);
            router.push('/quiz');
          } else {
            setTimeLeft(remaining);
          }
        }, 100);

        return () => clearInterval(intervalId);

      } catch (err) {
        setStatus('Error connecting to server.');
      }
    }

    init();
  }, [router]);

  // Format milliseconds to MM:SS or HH:MM:SS
  const formatTime = (ms: number) => {
    if (ms < 0) return "00:00:00";
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-8">
        <div>
          <h1 className="text-4xl font-bold tracking-wider text-blue-500 mb-2">LOBBY</h1>
          <p className="text-gray-400">{status}</p>
        </div>

        {timeLeft !== null && (
          <div className="bg-gray-800 rounded-2xl p-8 shadow-2xl border border-gray-700">
            <div className="text-sm text-gray-500 uppercase tracking-widest mb-4">Time Until Start</div>
            <div className="text-6xl font-mono font-bold tabular-nums text-white">
              {formatTime(timeLeft)}
            </div>
            <div className="mt-2 text-xs text-gray-600 font-mono">
              .{Math.floor((timeLeft % 1000) / 10).toString().padStart(2, '0')}
            </div>
          </div>
        )}

        <div className="text-sm text-gray-600">
          <p>Please do not refresh the page.</p>
          <p>You will be automatically redirected when the quiz begins.</p>
        </div>
      </div>
    </div>
  );
}
