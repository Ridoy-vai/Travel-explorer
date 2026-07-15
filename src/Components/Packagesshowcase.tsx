"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { Check, Footprints, Gem, type LucideIcon } from "lucide-react";

/**
 * PackagesShowcase
 * -----------------
 * Fetches published tour packages from /api/packages and auto-rotates
 * through them every 2 seconds, showing one package at a time in the
 * "Packages of only X days" layout (title/description/features on the
 * left, cover image on the right).
 *
 * Adjust the TourPackage interface / field names below if your API
 * response uses different keys.
 */

const ROTATE_INTERVAL_MS = 5000; // 5 seconds
const BACKEND_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:2000";

interface TourPackage {
  _id: string;
  title: string;
  destination: string;
  shortDescription?: string;
  category?: string;
  basePrice: number;
  durationDays: number;
  coverImage?: string;
  images?: string[];
  tags?: string[];
  status?: string;
}

interface PackagesApiResponse {
  success: boolean;
  message?: string;
  data: TourPackage[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    limit: number;
    hasMore: boolean;
  };
}

interface Feature {
  icon: LucideIcon;
  title: string;
  text: string;
}

// Static feature copy shown for every slide — edit freely, or swap for
// per-package data (e.g. pkg.highlights) if you add that field later.
const FEATURES: Feature[] = [
  {
    icon: Check,
    title: "Guaranteed comfort",
    text: "Includes transfers, expert guides and everything you need to enjoy your trip without worries.",
  },
  {
    icon: Footprints,
    title: "Experience the best",
    text: "Immerse yourself in the local culture through curated cultural and gastronomic tours.",
  },
  {
    icon: Gem,
    title: "Express adventure",
    text: "Explore the best spots in just a few days, with itineraries full of excitement.",
  },
];

export default function PackagesShowcase() {
  const [packages, setPackages] = useState<TourPackage[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fade, setFade] = useState(true);

  const fetchPackages = useCallback(async () => {
    try {
      setLoading(true);
      // No filters or pagination needed here — just grab everything
      // published (limit=50 is the API's max per request).
      const res = await fetch(`${BACKEND_BASE}/api/packages?limit=50`, {
        cache: "no-store",
      });
      const json: PackagesApiResponse = await res.json();

      if (!json.success) throw new Error(json.message || "Failed to load packages");

      setPackages(json.data || []);
      setError(null);
    } catch (err) {
      console.error("PackagesShowcase fetch error:", err);
      setError("Could not load packages right now.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

  // Auto-rotate every 2s with a short fade transition
  useEffect(() => {
    if (packages.length <= 1) return;

    const timer = setInterval(() => {
      setFade(false); // fade out
      setTimeout(() => {
        setActiveIndex((prev) => (prev + 1) % packages.length);
        setFade(true); // fade in
      }, 250);
    }, ROTATE_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [packages.length]);

  const goTo = (i: number) => {
    setFade(false);
    setTimeout(() => {
      setActiveIndex(i);
      setFade(true);
    }, 200);
  };

  if (loading) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="animate-pulse space-y-6">
          <div className="mx-auto h-8 w-72 rounded bg-slate-200" />
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
            <div className="space-y-4">
              <div className="h-6 w-2/3 rounded bg-slate-200" />
              <div className="h-4 w-full rounded bg-slate-200" />
              <div className="h-4 w-5/6 rounded bg-slate-200" />
            </div>
            <div className="h-72 rounded-2xl bg-slate-200" />
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-16 text-center text-slate-500">
        {error}
      </section>
    );
  }

  if (packages.length === 0) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-16 text-center text-slate-500">
        No packages published yet.
      </section>
    );
  }

  const pkg = packages[activeIndex];
  const coverImage =
    pkg.coverImage || (Array.isArray(pkg.images) ? pkg.images[0] : null) || "/placeholder-tour.jpg";

  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      {/* Section heading reacts to the active package's duration */}
      <div className="mb-14 text-center">
        <h2 className="text-3xl font-bold text-slate-700 md:text-4xl">
          Packages of only {pkg.durationDays} {pkg.durationDays === 1 ? "day" : "days"}
        </h2>
        <span className="mx-auto mt-3 block h-1 w-16 rounded-full bg-blue-600" />
      </div>

      <div
        className={`grid grid-cols-1 items-center gap-10 transition-opacity duration-300 md:grid-cols-2 md:gap-14 ${
          fade ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* Left: copy */}
        <div>
          <h3 className="mb-4 text-2xl font-bold leading-snug text-blue-700 md:text-3xl">
            Quick getaway: {pkg.destination}
          </h3>

          <p className="mb-8 leading-relaxed text-slate-500">
            {pkg.shortDescription ||
              `Discover ${pkg.destination} in just ${pkg.durationDays} days. Perfect for travelers with little time who don't want to miss out on unforgettable moments.`}
          </p>

          <ul className="space-y-6">
            {FEATURES.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex gap-4">
                <span className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-orange-100 text-orange-500">
                  <Icon size={20} strokeWidth={2.5} />
                </span>
                <div>
                  <p className="font-semibold text-slate-800">{title}</p>
                  <p className="text-sm text-slate-500">{text}</p>
                </div>
              </li>
            ))}
          </ul>

          {pkg.basePrice != null && (
            <p className="mt-8 text-lg font-semibold text-slate-800">
              From ${pkg.basePrice.toLocaleString()}
            </p>
          )}
        </div>

        {/* Right: cover image */}
        <div className="relative h-72 w-full overflow-hidden rounded-2xl shadow-lg md:h-96">
          <img
            src={coverImage}
            alt={pkg.title}
            // fill
            // sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
      </div>

      {/* Dots — click to jump to a package, resets the auto-rotate cycle */}
      {packages.length > 1 && (
        <div className="mt-10 flex justify-center gap-2">
          {packages.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Show package ${i + 1}`}
              className={`h-2.5 rounded-full transition-all ${
                i === activeIndex ? "w-6 bg-blue-600" : "w-2.5 bg-slate-300"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}