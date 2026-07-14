import Link from "next/link";
import { Compass, Home, MapPinOff, Search } from "lucide-react";

/**
 * 404 — Not Found
 * ----------------
 * Brand-matched to the Travel Buddies navbar/footer:
 *   signal blue  #2563EB  (primary actions, links)
 *   trail orange #F97316  (secondary CTA, accents)
 *   ink          #1E293B  (headings/body)
 *   muted slate  #94A3B8  (dotted trail, captions)
 *
 * Signature element: a dashed "trail" that winds down the page and
 * simply stops at a torn map pin — the visual metaphor for a route
 * that doesn't exist, which is exactly what a 404 means on a tour site.
 */
export default function NotFound() {
  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center overflow-hidden bg-white px-6 py-20 text-center">
      {/* Faint topographic wash in the background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, #2563EB 0, transparent 35%), radial-gradient(circle at 80% 0%, #F97316 0, transparent 30%), radial-gradient(circle at 50% 100%, #2563EB 0, transparent 40%)",
        }}
      />

      {/* Small wordmark, echoing the navbar logo */}
      <span
        className="relative mb-8 text-lg font-extrabold text-blue-600 select-none"
        style={{ fontFamily: "'Comic Sans MS', cursive" }}
      >
        Travel Buddies
      </span>

      {/* The trail: dashed route that winds down and simply ends */}
      <svg
        aria-hidden
        viewBox="0 0 220 90"
        className="relative mb-4 h-16 w-auto sm:h-20"
      >
        <path
          d="M10 15 C 60 5, 90 45, 140 35 S 190 65, 205 55"
          fill="none"
          stroke="#CBD5E1"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="1 12"
        />
        {/* Compass at the trailhead */}
        <g style={{ transformOrigin: "10px 15px" }} className="animate-[spin_10s_linear_infinite] motion-reduce:animate-none">
          <circle cx="10" cy="15" r="7" fill="#EFF6FF" stroke="#2563EB" strokeWidth="1.5" />
          <path d="M10 11 L12 17 L10 19 L8 17 Z" fill="#2563EB" />
        </g>
        {/* Broken pin where the trail gives out */}
        <g transform="translate(198, 40)">
          <path
            d="M7 0C10.9 0 14 3 14 6.8C14 11.5 7 20 7 20S0 11.5 0 6.8C0 3 3.1 0 7 0Z"
            fill="#F97316"
            opacity="0.15"
          />
          <path
            d="M7 0C10.9 0 14 3 14 6.8C14 10.5 9 16 7 19"
            fill="none"
            stroke="#F97316"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <circle cx="7" cy="6.8" r="2.4" fill="#F97316" />
        </g>
      </svg>

      {/* The number, set big and confident */}
      <h1 className="relative text-[5.5rem] font-extrabold leading-none tracking-tight text-slate-800 sm:text-[7rem]">
        4<span className="text-orange-500">0</span>4
      </h1>

      <h2 className="relative mt-2 text-xl font-bold text-slate-800 sm:text-2xl">
        This trail doesn&apos;t exist
      </h2>

      <p className="relative mt-3 max-w-md text-sm leading-relaxed text-slate-500 sm:text-base">
        The page you&apos;re looking for has wandered off the map — maybe the
        link is old, or the address was typed wrong. Let&apos;s get you back
        on route.
      </p>

      {/* Actions, matching the navbar's button styles exactly */}
      <div className="relative mt-8 flex flex-col items-center gap-3 sm:flex-row">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          <Home size={16} />
          Back to Home
        </Link>
        <Link
          href="/Packages"
          className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600"
        >
          <Compass size={16} />
          Browse Tour Packages
        </Link>
      </div>

      {/* Quiet secondary affordance */}
      <div className="relative mt-6 flex items-center gap-2 text-xs text-slate-400">
        <MapPinOff size={14} />
        <span>Error code: 404 — page not found</span>
      </div>
    </div>
  );
}