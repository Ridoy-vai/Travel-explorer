"use client";

import { Button, Chip } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useEffect, useState, useRef, useCallback } from "react";

const BACKEND_BASE = process.env.NEXT_PUBLIC_API_URL;
const LIMIT = 6;

const statusColorMap: Record<string, "success" | "danger" | "warning"> = {
    confirmed: "success",
    pending: "warning",
    cancelled: "danger",
};

interface PackageDetails {
    title: string;
    coverImage: string;
    destination: string;
    durationDays: number;
    durationNights: number;
    departureLocation: string;
    agencyName: string;
    pickupTime?: string; // ✅ নতুন
    tourStartDate: string;
    tourEndDate: string;
}

interface Booking {
    _id: string;
    sessionId: string;
    invoiceId: string;
    packageId: string;
    email: string;
    adultCount: number;
    childCount: number;
    totalMale: number;
    totalFemale: number;
    totalChildPrice: number;
    totalAmount: number;
    currency: string;
    status: string;
    createdAt: string;
    packageDetails: PackageDetails | null;
}

interface PaginationInfo {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    limit: number;
    hasMore: boolean;
}


function formatCurrency(amount: number, currency: string) {
    return amount.toLocaleString("en-US", {
        style: "currency",
        currency: currency?.toUpperCase() || "USD",
    });
}

// ✅ Safe date formatter — invalid/missing date হলে fallback দেখাবে, "Invalid Date" নয়
function formatDate(dateValue?: string | null) {
    if (!dateValue) return "N/A";
    const d = new Date(dateValue);
    if (isNaN(d.getTime())) return "N/A";
    return d.toLocaleDateString("en-GB");
}

export function MyBookingsPage({ travelerId }: { travelerId: string }) {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState<PaginationInfo | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const observerRef = useRef<IntersectionObserver | null>(null);
    const sentinelRef = useRef<HTMLDivElement | null>(null);

    // ---------------- ডেটা fetch করা ----------------
    const fetchBookings = useCallback(
        async (pageToFetch: number) => {
            if (!travelerId) return;
            setIsLoading(true);
            setError(null);
            try {
                const params = new URLSearchParams({
                    page: String(pageToFetch),
                    limit: String(LIMIT),
                });
                const res = await fetch(
                    `${BACKEND_BASE}/api/travelers/${travelerId}/bookings?${params.toString()}`,
                    { cache: "no-store" }
                );
                if (!res.ok) throw new Error(`Request failed: ${res.status}`);
                const json = await res.json();

                setBookings((prev) =>
                    pageToFetch === 1 ? json.data ?? [] : [...prev, ...(json.data ?? [])]
                );
                setPagination(json.pagination ?? null);
            } catch (err) {
                console.error("Failed to load bookings:", err);
                setError("Failed to load your bookings.");
            } finally {
                setIsLoading(false);
                setIsInitialLoading(false);
            }
        },
        [travelerId]
    );

    // ---------------- travelerId বদলালে প্রথম পেজ থেকে আবার fetch ----------------
    useEffect(() => {
        setBookings([]);
        setPage(1);
        setIsInitialLoading(true);
        fetchBookings(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [travelerId]);

    // ---------------- পরের পেজ fetch (page > 1) ----------------
    useEffect(() => {
        if (page === 1) return;
        fetchBookings(page);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page]);

    // ---------------- IntersectionObserver দিয়ে ইনফিনিট স্ক্রল ----------------
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

    if (isInitialLoading) return <p className="text-sm text-muted p-6">Loading your bookings…</p>;
    if (error && bookings.length === 0) return <p className="text-sm text-danger p-6">{error}</p>;

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-xl font-semibold">My Bookings</h1>
                <p className="text-sm text-muted">
                    {pagination?.totalItems ?? 0} bookings — all your tour bookings in one place.
                </p>
            </div>

            {bookings.length === 0 ? (
                <div className="text-center py-16 border border-dashed border-default-200 rounded-2xl">
                    <Icon className="size-10 text-muted mx-auto mb-3" icon="gravity-ui:ticket" />
                    <p className="text-sm text-muted">You haven't booked any tours yet.</p>
                </div>
            ) : (
                <>
                    <div className="flex flex-col gap-4">
                        {bookings.map((b) => {
                            const totalTravelers = b.adultCount + b.childCount;
                            return (
                                <div
                                    key={b._id}
                                    className="rounded-2xl border border-default-200 overflow-hidden flex flex-col sm:flex-row"
                                >
                                    {b.packageDetails?.coverImage && (
                                        <img
                                            src={b.packageDetails.coverImage}
                                            alt={b.packageDetails.title}
                                            className="w-full sm:w-48 h-40 sm:h-auto object-cover"
                                        />
                                    )}
                                    <div className="flex-1 p-5 flex flex-col gap-3">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <h2 className="text-sm font-semibold">
                                                    {b.packageDetails?.title ?? "Package unavailable"}
                                                </h2>
                                                <p className="text-xs text-muted mt-0.5">
                                                    {b.packageDetails?.destination}
                                                </p>
                                                {/* ✅ ফিক্স: packageDetails থেকে date নেওয়া হচ্ছে + safe formatter */}
                                                <p className="text-xs text-muted mt-0.5">
                                                    {formatDate(b.packageDetails?.tourStartDate)} -{" "}
                                                    {formatDate(b.packageDetails?.tourEndDate)}
                                                </p>
                                            </div>
                                            <Chip
                                                color={statusColorMap[b.status] ?? "warning"}
                                                size="sm"
                                                variant="soft"
                                            >
                                                {b.status}
                                            </Chip>
                                        </div>

                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                                            <InfoBlock label="Travelers" value={`${totalTravelers}`} />
                                            <InfoBlock label="Adults / Children" value={`${b.adultCount} / ${b.childCount}`} />
                                            <InfoBlock label="Male / Female" value={`${b.totalMale} / ${b.totalFemale}`} />
                                            <InfoBlock label="Booked On" value={formatDate(b.createdAt)} />
                                        </div>

                                        {b.packageDetails && (
                                            <div className="flex items-center gap-4 text-xs text-muted flex-wrap">
                                                <span className="flex items-center gap-1">
                                                    <Icon className="size-3.5" icon="gravity-ui:calendar" />
                                                    {b.packageDetails.durationDays}D / {b.packageDetails.durationNights}N
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Icon className="size-3.5" icon="gravity-ui:map-pin" />
                                                    {b.packageDetails.departureLocation}
                                                </span>
                                                {/* ✅ নতুন: Pickup time */}
                                                {b.packageDetails.pickupTime && (
                                                    <span className="flex items-center gap-1">
                                                        <Icon className="size-3.5" icon="gravity-ui:clock" />
                                                        Pickup: {b.packageDetails.pickupTime}
                                                    </span>
                                                )}
                                                <span className="flex items-center gap-1">
                                                    <Icon className="size-3.5" icon="gravity-ui:briefcase" />
                                                    {b.packageDetails.agencyName}
                                                </span>
                                            </div>
                                        )}


                                        <div className="flex items-center justify-between pt-2 border-t border-default-100 mt-1">
                                            <div>
                                                <p className="text-xs text-muted">Invoice #{b.invoiceId}</p>
                                                <p className="text-sm font-semibold">
                                                    {formatCurrency(b.totalAmount, b.currency)}
                                                </p>
                                            </div>
                                            <a href={`/Packages/success?session_id=${b.sessionId}`}>
                                                <Button size="sm" variant="tertiary">
                                                    View Invoice
                                                </Button>
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* ইনফিনিট স্ক্রল সেন্টিনেল */}
                    <div ref={sentinelRef} className="h-4 w-full" />

                    {isLoading && (
                        <div className="flex justify-center py-6">
                            <div className="w-6 h-6 border-2 border-default-200 border-t-primary rounded-full animate-spin" />
                        </div>
                    )}

                    {!pagination?.hasMore && bookings.length > 0 && (
                        <p className="text-center text-xs text-muted py-6">
                            You've reached the end — all {pagination?.totalItems} bookings loaded.
                        </p>
                    )}
                </>
            )}
        </div>
    );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <p className="text-muted">{label}</p>
            <p className="font-medium">{value}</p>
        </div>
    );
}