"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, Home, RotateCcw } from "lucide-react";

/**
 * error.tsx — Runtime Error Boundary
 * ------------------------------------
 * Distinct from not-found.tsx: this catches unexpected runtime errors
 * (failed fetch, thrown exception, etc.), not "page doesn't exist".
 * Next.js requires this to be a Client Component and passes `error` +
 * `reset` automatically — must live at app/error.tsx (or nested
 * per-segment as app/dashboard/error.tsx, etc.).
 *
 * Same brand tokens as not-found.tsx (signal blue #2563EB, trail
 * orange #F97316, ink #1E293B) but the signature element here is a
 * "snapped compass needle" — the trail wasn't just unmarked, something
 * actually broke mid-route.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to your monitoring service (Sentry, LogRocket, etc.) if you have one.
    console.error("Unhandled error:", error);
  }, [error]);

  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center overflow-hidden bg-white px-6 py-20 text-center">
      {/* Faint background wash, matching not-found.tsx */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, #2563EB 0, transparent 35%), radial-gradient(circle at 80% 0%, #F97316 0, transparent 30%), radial-gradient(circle at 50% 100%, #2563EB 0, transparent 40%)",
        }}
      />

      <span
        className="relative mb-8 text-lg font-extrabold text-blue-600 select-none"
        style={{ fontFamily: "'Comic Sans MS', cursive" }}
      >
        Travel Buddies
      </span>

      {/* Snapped compass — something broke, not just "not found" */}
      <svg aria-hidden viewBox="0 0 100 100" className="relative mb-5 h-20 w-20">
        <circle cx="50" cy="50" r="34" fill="#FFF7ED" stroke="#F97316" strokeWidth="2" />
        {/* Needle, split apart to read as "snapped" */}
        <path d="M50 50 L38 30" stroke="#2563EB" strokeWidth="3" strokeLinecap="round" />
        <path d="M50 50 L64 68" stroke="#94A3B8" strokeWidth="3" strokeLinecap="round" />
        <circle cx="50" cy="50" r="4" fill="#1E293B" />
        {/* Tick marks */}
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (i * 360) / 8;
          const r1 = 34,
            r2 = 29;
          const x1 = 50 + r1 * Math.cos((angle * Math.PI) / 180);
          const y1 = 50 + r1 * Math.sin((angle * Math.PI) / 180);
          const x2 = 50 + r2 * Math.cos((angle * Math.PI) / 180);
          const y2 = 50 + r2 * Math.sin((angle * Math.PI) / 180);
          return (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#CBD5E1" strokeWidth="1.5" />
          );
        })}
      </svg>

      <div className="relative mb-2 inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-600">
        <AlertTriangle size={13} />
        Something went wrong
      </div>

      <h1 className="relative text-2xl font-extrabold text-slate-800 sm:text-3xl">
        Our compass slipped
      </h1>

      <p className="relative mt-3 max-w-md text-sm leading-relaxed text-slate-500 sm:text-base">
        An unexpected error interrupted this page. It&apos;s not something you
        did — try again, and if it keeps happening, head back home and let us
        know.
      </p>

      {/* Dev-only detail, safe to keep since it's stripped in production builds
          if you gate it — shown here for local debugging convenience */}
      {process.env.NODE_ENV === "development" && (
        <pre className="relative mt-4 max-w-lg overflow-x-auto rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-left text-xs text-slate-500">
          {error.message}
          {error.digest ? `\n\nDigest: ${error.digest}` : ""}
        </pre>
      )}

      <div className="relative mt-8 flex flex-col items-center gap-3 sm:flex-row">
        <button
          onClick={() => reset()}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          <RotateCcw size={16} />
          Try Again
        </button>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600"
        >
          <Home size={16} />
          Back to Home
        </Link>
      </div>
    </div>
  );
}