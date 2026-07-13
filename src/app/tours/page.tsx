"use client";

import TourPackageCard from "@/Components/TourPackageCard";
import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

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
  transportation?: string;
  maxGroupSize?: number;
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
  destination: string;
  transportation: string;
  duration: string;
  minPrice: string;
  maxPrice: string;
  minGroupSize: string;
  sort: string;
}

const API_BASE = "http://localhost:2000";
const LIMIT = 12;

// ✅ ছবি অনুযায়ী স্ট্যাটিক ক্যাটাগরি লিস্ট
const CATEGORY_OPTIONS = [
  "Adventure",
  "Beach",
  "Hill & Mountain",
  "Honeymoon",
  "Family",
  "Corporate",
  "Historical & Cultural",
  "Wildlife",
];

// ✅ ছবি অনুযায়ী স্ট্যাটিক ট্রান্সপোর্টেশন লিস্ট
const TRANSPORTATION_OPTIONS = ["Bus", "Flight", "Train", "Private Car", "Mixed"];

const DURATION_OPTIONS = [
  { label: "Any duration", value: "" },
  { label: "1-3 Days", value: "1-3" },
  { label: "4-6 Days", value: "4-6" },
  { label: "7-10 Days", value: "7-10" },
  { label: "11+ Days", value: "11+" },
];

const SORT_OPTIONS = [
  { label: "Newest first", value: "newest" },
  { label: "Price: Low to High", value: "priceLowToHigh" },
  { label: "Price: High to Low", value: "priceHighToLow" },
  { label: "Duration: Short to Long", value: "durationShort" },
  { label: "Duration: Long to Short", value: "durationLong" },
];

const initialFilters: Filters = {
  search: "",
  category: "",
  destination: "",
  transportation: "",
  duration: "",
  minPrice: "",
  maxPrice: "",
  minGroupSize: "",
  sort: "newest",
};

// ---------------- URL <-> Filters হেল্পার ----------------
function filtersFromParams(params: URLSearchParams): Filters {
  return {
    search: params.get("search") || "",
    category: params.get("category") || "",
    destination: params.get("destination") || "",
    transportation: params.get("transportation") || "",
    duration: params.get("duration") || "",
    minPrice: params.get("minPrice") || "",
    maxPrice: params.get("maxPrice") || "",
    minGroupSize: params.get("minGroupSize") || "",
    sort: params.get("sort") || "newest",
  };
}

function TourPackagesGridPageInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // ✅ প্রথমবার URL থেকে ফিল্টার লোড হচ্ছে (page refresh/share করলেও কাজ করবে)
  const [filters, setFilters] = useState<Filters>(() =>
    filtersFromParams(searchParams)
  );
  const [searchInput, setSearchInput] = useState(filters.search);
  const [showMoreFilters, setShowMoreFilters] = useState(false);

  const [packages, setPackages] = useState<TourPackageListItem[]>([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const isFirstRender = useRef(true);

  // ---------------- সার্চ ইনপুট ডিবাউন্স (৫০০ms) ----------------
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: searchInput }));
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // ---------------- ✅ ফিল্টার বদলালে URL query params আপডেট হচ্ছে ----------------
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.search) params.set("search", filters.search);
    if (filters.category) params.set("category", filters.category);
    if (filters.destination) params.set("destination", filters.destination);
    if (filters.transportation) params.set("transportation", filters.transportation);
    if (filters.duration) params.set("duration", filters.duration);
    if (filters.minPrice) params.set("minPrice", filters.minPrice);
    if (filters.maxPrice) params.set("maxPrice", filters.maxPrice);
    if (filters.minGroupSize) params.set("minGroupSize", filters.minGroupSize);
    if (filters.sort && filters.sort !== "newest") params.set("sort", filters.sort);

    const queryString = params.toString();
    const newUrl = queryString ? `${pathname}?${queryString}` : pathname;

    // scroll: false দেওয়া হয়েছে যাতে ফিল্টার করলে পেজ উপরে জাম্প না করে
    router.replace(newUrl, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  // ---------------- ডেটা fetch করা ----------------
  const fetchPackages = useCallback(
    async (pageToFetch: number, activeFilters: Filters) => {
      setIsLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          page: String(pageToFetch),
          limit: String(LIMIT),
          sort: activeFilters.sort,
        });
        if (activeFilters.search) params.set("search", activeFilters.search);
        if (activeFilters.category) params.set("category", activeFilters.category);
        if (activeFilters.destination) params.set("destination", activeFilters.destination);
        if (activeFilters.transportation) params.set("transportation", activeFilters.transportation);
        if (activeFilters.duration) params.set("duration", activeFilters.duration);
        if (activeFilters.minPrice) params.set("minPrice", activeFilters.minPrice);
        if (activeFilters.maxPrice) params.set("maxPrice", activeFilters.maxPrice);
        if (activeFilters.minGroupSize) params.set("minGroupSize", activeFilters.minGroupSize);

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
  }, [
    filters.search,
    filters.category,
    filters.destination,
    filters.transportation,
    filters.duration,
    filters.minPrice,
    filters.maxPrice,
    filters.minGroupSize,
    filters.sort,
  ]);

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
    filters.search ||
    filters.category ||
    filters.destination ||
    filters.transportation ||
    filters.duration ||
    filters.minPrice ||
    filters.maxPrice ||
    filters.minGroupSize;

  const clearFilters = () => {
    setSearchInput("");
    setFilters(initialFilters);
  };

  const updateFilter = (key: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-screen bg-[#FAF8F3] py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
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

          <select
            value={filters.sort}
            onChange={(e) => updateFilter("sort", e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-[#E7E3D8] bg-white text-sm text-[#12332E] focus:outline-none focus:ring-2 focus:ring-[#C9A227]/50 focus:border-[#C9A227]"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* ---------------- সার্চ + প্রাইমারি ফিল্টার বার ---------------- */}
        <div className="bg-white rounded-2xl border border-[#E7E3D8] p-4 mb-3 flex flex-col sm:flex-row flex-wrap gap-3 items-stretch sm:items-center">
          <div className="relative flex-1 min-w-[200px]">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9A9484]">
              🔍
            </span>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by title, destination, description..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E7E3D8] bg-[#FAF8F3] text-sm text-[#12332E] placeholder:text-[#9A9484] focus:outline-none focus:ring-2 focus:ring-[#C9A227]/50 focus:border-[#C9A227]"
            />
          </div>

          {/* ✅ স্ট্যাটিক ক্যাটাগরি ড্রপডাউন */}
          <select
            value={filters.category}
            onChange={(e) => updateFilter("category", e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-[#E7E3D8] bg-[#FAF8F3] text-sm text-[#12332E] focus:outline-none focus:ring-2 focus:ring-[#C9A227]/50 focus:border-[#C9A227]"
          >
            <option value="">All categories</option>
            {CATEGORY_OPTIONS.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <select
            value={filters.duration}
            onChange={(e) => updateFilter("duration", e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-[#E7E3D8] bg-[#FAF8F3] text-sm text-[#12332E] focus:outline-none focus:ring-2 focus:ring-[#C9A227]/50 focus:border-[#C9A227]"
          >
            {DURATION_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <button
            onClick={() => setShowMoreFilters((prev) => !prev)}
            className="px-4 py-2.5 rounded-xl border border-[#E7E3D8] text-sm font-medium text-[#12332E] hover:bg-[#FAF8F3] transition-colors whitespace-nowrap"
          >
            {showMoreFilters ? "Fewer filters ▲" : "More filters ▼"}
          </button>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-[#B4453D] hover:bg-[#B4453D]/10 transition-colors whitespace-nowrap"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* ---------------- সেকেন্ডারি ফিল্টার ---------------- */}
        {showMoreFilters && (
          <div className="bg-white rounded-2xl border border-[#E7E3D8] p-4 mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <input
              type="text"
              value={filters.destination}
              onChange={(e) => updateFilter("destination", e.target.value)}
              placeholder="Destination"
              className="px-4 py-2.5 rounded-xl border border-[#E7E3D8] bg-[#FAF8F3] text-sm text-[#12332E] placeholder:text-[#9A9484] focus:outline-none focus:ring-2 focus:ring-[#C9A227]/50 focus:border-[#C9A227]"
            />

            {/* ✅ স্ট্যাটিক ট্রান্সপোর্টেশন ড্রপডাউন */}
            <select
              value={filters.transportation}
              onChange={(e) => updateFilter("transportation", e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-[#E7E3D8] bg-[#FAF8F3] text-sm text-[#12332E] focus:outline-none focus:ring-2 focus:ring-[#C9A227]/50 focus:border-[#C9A227]"
            >
              <option value="">Any transportation</option>
              {TRANSPORTATION_OPTIONS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>

            <div className="flex gap-2">
              <input
                type="number"
                min={0}
                value={filters.minPrice}
                onChange={(e) => updateFilter("minPrice", e.target.value)}
                placeholder="Min budget (৳)"
                className="w-1/2 px-3 py-2.5 rounded-xl border border-[#E7E3D8] bg-[#FAF8F3] text-sm text-[#12332E] placeholder:text-[#9A9484] focus:outline-none focus:ring-2 focus:ring-[#C9A227]/50 focus:border-[#C9A227]"
              />
              <input
                type="number"
                min={0}
                value={filters.maxPrice}
                onChange={(e) => updateFilter("maxPrice", e.target.value)}
                placeholder="Max budget (৳)"
                className="w-1/2 px-3 py-2.5 rounded-xl border border-[#E7E3D8] bg-[#FAF8F3] text-sm text-[#12332E] placeholder:text-[#9A9484] focus:outline-none focus:ring-2 focus:ring-[#C9A227]/50 focus:border-[#C9A227]"
              />
            </div>

            <input
              type="number"
              min={0}
              value={filters.minGroupSize}
              onChange={(e) => updateFilter("minGroupSize", e.target.value)}
              placeholder="Min group size"
              className="px-4 py-2.5 rounded-xl border border-[#E7E3D8] bg-[#FAF8F3] text-sm text-[#12332E] placeholder:text-[#9A9484] focus:outline-none focus:ring-2 focus:ring-[#C9A227]/50 focus:border-[#C9A227]"
            />
          </div>
        )}

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

// ✅ useSearchParams ব্যবহার করার জন্য Suspense boundary বাধ্যতামূলক (Next.js App Router requirement)
export default function TourPackagesGridPage() {
  return (
    <Suspense fallback={null}>
      <TourPackagesGridPageInner />
    </Suspense>
  );
}