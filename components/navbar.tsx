"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const isDashboard = pathname === "/dashboard";

  const [clicks, setClicks] = useState(0);
  const [holding, setHolding] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [showLock, setShowLock] = useState(false);

  const clickResetTimer = useRef<NodeJS.Timeout | null>(null);
  const holdTimer = useRef<NodeJS.Timeout | null>(null);
  const progressTimer = useRef<NodeJS.Timeout | null>(null);

  // Step 1 - click 3 times within 3 seconds.
  function handleClick() {
    if (showLock) return;

    const newClicks = clicks + 1;
    setClicks(newClicks);

    if (clickResetTimer.current) clearTimeout(clickResetTimer.current);
    clickResetTimer.current = setTimeout(() => setClicks(0), 3000);

    if (newClicks >= 3) {
      setClicks(0);
      setShowLock(true);

      if (clickResetTimer.current) clearTimeout(clickResetTimer.current);

      setTimeout(() => {
        setShowLock(false);
        setHoldProgress(0);
      }, 5000);
    }
  }

  // Step 2 - hold the lock icon for 2 seconds.
  const startHold = useCallback(() => {
    if (!showLock) return;

    setHolding(true);

    let progress = 0;
    progressTimer.current = setInterval(() => {
      progress += 5;
      setHoldProgress(progress);

      if (progress >= 100 && progressTimer.current) {
        clearInterval(progressTimer.current);
      }
    }, 100);

    holdTimer.current = setTimeout(() => {
      setShowLock(false);
      setHoldProgress(0);
      setHolding(false);
      router.push("/dashboard");
    }, 2000);
  }, [router, showLock]);

  const cancelHold = useCallback(() => {
    if (holdTimer.current) clearTimeout(holdTimer.current);
    if (progressTimer.current) clearInterval(progressTimer.current);

    setHolding(false);
    setHoldProgress(0);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-[#0f0f0f]/95 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div
            onClick={handleClick}
            className="relative flex cursor-default select-none items-center gap-2"
          >
            <div className="relative">
              <img src="/icon.png" alt="logo" className="h-10 w-auto" />
            </div>
            <span className="font-bold text-white">
              <span className="text-red-500">AR</span>Complaint
            </span>

            {showLock && (
              <div
                onMouseDown={startHold}
                onMouseUp={cancelHold}
                onMouseLeave={cancelHold}
                onTouchStart={startHold}
                onTouchEnd={cancelHold}
                className="absolute -top-2 -right-8 cursor-pointer"
                style={{ animation: "fadeIn 0.3s ease" }}
              >
                <svg width="28" height="28" viewBox="0 0 28 28">
                  <circle
                    cx="14"
                    cy="14"
                    r="12"
                    fill="rgba(15,15,15,0.9)"
                    stroke="rgba(239,68,68,0.3)"
                    strokeWidth="1.5"
                  />
                  <circle
                    cx="14"
                    cy="14"
                    r="12"
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="2"
                    strokeDasharray={`${holdProgress * 0.754} 75.4`}
                    strokeLinecap="round"
                    transform="rotate(-90 14 14)"
                    style={{ transition: "stroke-dasharray 0.1s linear" }}
                  />
                  <text
                    x="14"
                    y="18"
                    textAnchor="middle"
                    fontSize="11"
                    fill={holding ? "#ef4444" : "rgba(239,68,68,0.7)"}
                  >
                    {"\uD83D\uDD12"}
                  </text>
                </svg>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            {isDashboard && (
              <button
                onClick={() => {
                  const headers = ["ID", "Status", "Type", "Details", "Date"];
                  const rows =
                    (window as any).__complaints?.map((c: any) => [
                      c.platoId,
                      c.status,
                      c.type,
                      `"${c.details?.replace(/"/g, '""')}"`,
                      new Date(c.createdAt).toLocaleString(),
                    ]) || [];
                  const csv = [headers, ...rows]
                    .map((row: any) => row.join(","))
                    .join("\n");
                  const blob = new Blob([csv], { type: "text/csv" });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement("a");

                  link.href = url;
                  link.download = "complaints.csv";
                  link.click();
                  URL.revokeObjectURL(url);
                }}
                className="flex items-center gap-2 rounded-lg border border-primary/50 px-4 py-2 text-sm font-medium text-primary transition-all duration-200 hover:bg-primary/10"
              >
                Download CSV
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
