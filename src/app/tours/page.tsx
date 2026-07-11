"use client";

import TourPackageCard from "@/Components/TourPackageCard";
import { useState, useEffect, useRef, useCallback } from "react";

// ------------------------------------------------------------------
// টাইপ ডেফিনিশন
// ------------------------------------------------------------------
interface TourPackageListItem {
  _id: { $oid: string } | string;
  title: string;
  destination: string;
  category: string;
  shortDescription?: string;
  basePrice: number;
  discountPrice?: number;
  coverImage: string;
  galleryImages?: string[];
  durationDays?: number | null;
  durationNights?: number | null;
  status: "published" | "draft" | "unpublished";
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  limit: number;
  hasMore: boolean;
}

interface Filters {
  search: string;
  category: string;
  duration: string;
  maxPrice: string;
}

const API_BASE = "http://localhost:2000";
const LIMIT = 12;

const DURATION_OPTIONS = [
  { label: "Any duration", value: "" },
  { label: "1-3 Days", value: "1-3" },
  { label: "4-6 Days", value: "4-6" },
  { label: "7+ Days", value: "7+" },
];

export default function TourPackagesGridPage() {
  const [packages, setPackages] = useState<TourPackageListItem[]>([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);

  // ---------------- ফিল্টার স্টেট ----------------
  const [filters, setFilters] = useState<Filters>({
    search: "",
    category: "",
    duration: "",
    maxPrice: "",
  });
  const [searchInput, setSearchInput] = useState(""); // ডিবাউন্সড ইনপুট আলাদা রাখা হচ্ছে

  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // ---------------- ক্যাটাগরি লিস্ট একবার fetch ----------------
  useEffect(() => {
    fetch(`${API_BASE}/api/packages/categories`)
      .then((res) => res.json())
      .then((result) => {
        if (result.success) setCategories(result.data);
      })
      .catch(() => {});
  }, []);

  // ---------------- সার্চ ইনপুট ডিবাউন্স (৫০০ms) ----------------
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: searchInput }));
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // ---------------- ডেটা fetch করা ----------------
  const fetchPackages = useCallback(
    async (pageToFetch: number, activeFilters: Filters) => {
      setIsLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          page: String(pageToFetch),
          limit: String(LIMIT),
        });
        if (activeFilters.search) params.set("search", activeFilters.search);
        if (activeFilters.category) params.set("category", activeFilters.category);
        if (activeFilters.duration) params.set("duration", activeFilters.duration);
        if (activeFilters.maxPrice) params.set("maxPrice", activeFilters.maxPrice);

        const res = await fetch(`${API_BASE}/api/packages?${params.toString()}`);
        const result = await res.json();

        if (result.success) {
          setPackages((prev) =>
            pageToFetch === 1 ? result.data : [...prev, ...result.data]
          );
          setPagination(result.pagination);
        } else {
          setError(result.message || "Failed to load packages");
        }
      } catch (err) {
        setError("Could not reach the server");
      } finally {
        setIsLoading(false);
        setIsInitialLoading(false);
      }
    },
    []
  );

  // ---------------- ফিল্টার বদলালে page 1 থেকে নতুন করে fetch ----------------
  useEffect(() => {
    setPackages([]);
    setPage(1);
    fetchPackages(1, filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.search, filters.category, filters.duration, filters.maxPrice]);

  // ---------------- ইনফিনিট স্ক্রলে পরের পেজ ----------------
  useEffect(() => {
    if (page === 1) return;
    fetchPackages(page, filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // ---------------- IntersectionObserver ----------------
  useEffect(() => {
    if (!sentinelRef.current) return;
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && !isLoading && pagination?.hasMore) {
          setPage((prev) => prev + 1);
        }
      },
      { rootMargin: "200px" }
    );

    observerRef.current.observe(sentinelRef.current);
    return () => observerRef.current?.disconnect();
  }, [isLoading, pagination?.hasMore]);

  const hasActiveFilters =
    filters.search || filters.category || filters.duration || filters.maxPrice;

  const clearFilters = () => {
    setSearchInput("");
    setFilters({ search: "", category: "", duration: "", maxPrice: "" });
  };

  return (
    <div className="min-h-screen bg-[#FAF8F3] py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1
            className="text-3xl sm:text-4xl font-semibold text-[#12332E]"
            style={{ fontFamily: "'Newsreader', Georgia, serif" }}
          >
            All Tour Packages
          </h1>
          <p className="text-sm text-[#6B6459] mt-1">
            {pagination?.totalItems ?? 0} packages available
          </p>
        </div>

        {/* ---------------- সার্চ + ফিল্টার বার ---------------- */}
        <div className="bg-white rounded-2xl border border-[#E7E3D8] p-4 mb-8 flex flex-col sm:flex-row flex-wrap gap-3 items-stretch sm:items-center">
          {/* সার্চ বক্স */}
          <div className="relative flex-1 min-w-[200px]">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9A9484]">
              🔍
            </span>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by title, destination..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E7E3D8] bg-[#FAF8F3] text-sm text-[#12332E] placeholder:text-[#9A9484] focus:outline-none focus:ring-2 focus:ring-[#C9A227]/50 focus:border-[#C9A227]"
            />
          </div>

          {/* ক্যাটাগরি */}
          <select
            value={filters.category}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, category: e.target.value }))
            }
            className="px-4 py-2.5 rounded-xl border border-[#E7E3D8] bg-[#FAF8F3] text-sm text-[#12332E] focus:outline-none focus:ring-2 focus:ring-[#C9A227]/50 focus:border-[#C9A227] capitalize"
          >
            <option value="">All categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat} className="capitalize">
                {cat}
              </option>
            ))}
          </select>

          {/* ডিউরেশন */}
          <select
            value={filters.duration}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, duration: e.target.value }))
            }
            className="px-4 py-2.5 rounded-xl border border-[#E7E3D8] bg-[#FAF8F3] text-sm text-[#12332E] focus:outline-none focus:ring-2 focus:ring-[#C9A227]/50 focus:border-[#C9A227]"
          >
            {DURATION_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* ম্যাক্স বাজেট */}
          <input
            type="number"
            min={0}
            value={filters.maxPrice}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, maxPrice: e.target.value }))
            }
            placeholder="Max budget (৳)"
            className="w-full sm:w-40 px-4 py-2.5 rounded-xl border border-[#E7E3D8] bg-[#FAF8F3] text-sm text-[#12332E] placeholder:text-[#9A9484] focus:outline-none focus:ring-2 focus:ring-[#C9A227]/50 focus:border-[#C9A227]"
          />

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-[#B4453D] hover:bg-[#B4453D]/10 transition-colors whitespace-nowrap"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* ---------------- Initial loading ---------------- */}
        {isInitialLoading ? (
          <div className="min-h-[40vh] flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-[#12332E]/20 border-t-[#12332E] rounded-full animate-spin" />
              <p className="text-sm text-[#6B6459] tracking-wide">
                Loading tour packages…
              </p>
            </div>
          </div>
        ) : error && packages.length === 0 ? (
          <div className="min-h-[40vh] flex items-center justify-center">
            <p className="text-sm text-[#B4453D]">{error}</p>
          </div>
        ) : packages.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[#6B6459] text-sm mb-3">
              No tour packages match your filters.
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm font-medium text-[#C9A227] hover:underline"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {packages.map((pkg) => {
                const id = typeof pkg._id === "object" ? pkg._id.$oid : pkg._id;
                return <TourPackageCard key={id} pkg={pkg} />;
              })}
            </div>

            <div ref={sentinelRef} className="h-4 w-full" />

            {isLoading && (
              <div className="flex justify-center py-8">
                <div className="w-6 h-6 border-2 border-[#12332E]/20 border-t-[#12332E] rounded-full animate-spin" />
              </div>
            )}

            {!pagination?.hasMore && packages.length > 0 && (
              <p className="text-center text-xs text-[#9A9484] py-8">
                You've reached the end — all {pagination?.totalItems} packages loaded.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}