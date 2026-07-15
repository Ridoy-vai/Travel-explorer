"use client";

import { useEffect, useState } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend,
} from "recharts";
import {
    Plane,
    Wallet,
    MapPin,
    Star,
    Calendar,
    ArrowUpRight,
    Compass,
    Loader2,
    AlertTriangle,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";

// ============================================================
// TYPES — matches the /dashboard-overview API response
// ============================================================
interface SpendingPoint {
    month: string;
    spent: number;
}

interface CategorySlice {
    name: string;
    value: number;
}

interface UpcomingTrip {
    _id: string;
    destination: string;
    image: string | null;
    tourStartDate: string | null;
    tourEndDate: string | null;
    travelers: number;
    status: string;
}

interface RecentBooking {
    _id: string;
    destination: string;
    bookedOn: string;
    amount: number;
    currency: string;
    status: string;
}

interface DashboardStats {
    totalTrips: number;
    totalSpent: number; // smallest currency unit (e.g. cents)
    currency: string;
    uniqueDestinations: number;
    upcomingCount: number;
}

interface DashboardOverview {
    stats: DashboardStats;
    spendingTrend: SpendingPoint[];
    categoryBreakdown: CategorySlice[];
    upcomingTrips: UpcomingTrip[];
    recentBookings: RecentBooking[];
}

const CATEGORY_COLORS = ["#2563eb", "#f59e0b", "#0ea5e9", "#64748b", "#8b5cf6"];
const FALLBACK_IMAGE =
    "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=200&q=80";

// Amounts from the API are assumed to be in the smallest currency unit
// (Stripe-style cents). If your totalAmount is already whole-currency,
// remove the "/ 100" here.
function toDisplayAmount(amount: number) {
    return amount / 100;
}

function formatCurrency(amount: number, currency = "usd") {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency.toUpperCase(),
        maximumFractionDigits: 0,
    }).format(amount);
}

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
    });
}

function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        confirmed: "bg-emerald-50 text-emerald-600 border-emerald-200",
        paid: "bg-emerald-50 text-emerald-600 border-emerald-200",
        pending: "bg-amber-50 text-amber-600 border-amber-200",
        refunded: "bg-slate-100 text-slate-500 border-slate-200",
        cancelled: "bg-red-50 text-red-500 border-red-200",
    };
    return (
        <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border capitalize ${
                styles[status] || "bg-gray-50 text-gray-500 border-gray-200"
            }`}
        >
            {status}
        </span>
    );
}

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function TravelerDashboardOverview() {
    const { data: session } = authClient.useSession();
    const travelerId = session?.user?.id;

    const [overview, setOverview] = useState<DashboardOverview | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!travelerId) return;

        const controller = new AbortController();

        async function fetchOverview() {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/travelers/${travelerId}/dashboard-overview`,
                    { credentials: "include", signal: controller.signal }
                );

                if (!res.ok) {
                    throw new Error("Failed to load your dashboard. Please try again.");
                }

                const json = await res.json();
                setOverview(json.data);
            } catch (err) {
                if ((err as Error).name !== "AbortError") {
                    console.error("Fetch dashboard overview error:", err);
                    setError((err as Error).message || "Something went wrong.");
                }
            } finally {
                setLoading(false);
            }
        }

        fetchOverview();
        return () => controller.abort();
    }, [travelerId]);

    // ---------------- Render states ----------------
    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-24 flex flex-col items-center justify-center text-gray-400 gap-3">
                <Loader2 className="animate-spin" size={28} />
                <p className="text-sm font-medium">Loading your dashboard…</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-24 flex flex-col items-center justify-center text-center gap-3">
                <AlertTriangle className="text-red-500" size={28} />
                <p className="text-sm font-semibold text-gray-700">{error}</p>
                <p className="text-xs text-gray-400">Please refresh the page or try again shortly.</p>
            </div>
        );
    }

    if (!overview || overview.stats.totalTrips === 0) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
                    <Plane className="mx-auto text-gray-300 mb-3" size={32} />
                    <p className="text-sm font-semibold text-gray-700">No bookings yet</p>
                    <p className="text-xs text-gray-400 mt-1">
                        Once you book your first trip, your dashboard will fill up here.
                    </p>
                </div>
            </div>
        );
    }

    const { stats, spendingTrend, categoryBreakdown, upcomingTrips, recentBookings } = overview;

    const statCards = [
        {
            label: "Total Trips Booked",
            value: String(stats.totalTrips).padStart(2, "0"),
            icon: Plane,
            trend: `${stats.upcomingCount} upcoming`,
            accent: "text-blue-600 bg-blue-50",
        },
        {
            label: "Total Spent",
            value: formatCurrency(toDisplayAmount(stats.totalSpent), stats.currency),
            icon: Wallet,
            trend: `${stats.totalTrips} bookings`,
            accent: "text-amber-600 bg-amber-50",
        },
        {
            label: "Destinations Explored",
            value: String(stats.uniqueDestinations).padStart(2, "0"),
            icon: MapPin,
            trend: "unique packages",
            accent: "text-sky-600 bg-sky-50",
        },
        {
            label: "Loyalty Level",
            value: stats.totalTrips >= 5 ? "Gold Buddy" : "Silver Buddy",
            icon: Star,
            trend: stats.totalTrips >= 5 ? "Top tier" : `${5 - stats.totalTrips} trips to Gold`,
            accent: "text-purple-600 bg-purple-50",
        },
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans">
            {/* ==================== HEADER ==================== */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="inline-flex items-center gap-1.5 bg-blue-50 px-2.5 py-1 rounded-full text-xs text-blue-600 font-semibold mb-2 border border-blue-100">
                        <Compass size={12} />
                        <span>Traveler Hub</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                        Welcome back{session?.user?.name ? `, ${session.user.name}` : ""} 👋
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Here&apos;s an overview of your journeys and spending.
                    </p>
                </div>
                <button
                    type="button"
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-4 py-2.5 rounded-xl shadow-md shadow-blue-600/10 transition-all"
                >
                    <Plane size={15} />
                    Book a New Trip
                </button>
            </div>

            {/* ==================== STAT CARDS ==================== */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div
                            key={stat.label}
                            className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${stat.accent}`}>
                                    <Icon size={17} />
                                </div>
                                <span className="flex items-center gap-0.5 text-[11px] font-bold text-emerald-600">
                                    <ArrowUpRight size={12} />
                                    {stat.trend}
                                </span>
                            </div>
                            <p className="text-xl font-extrabold text-gray-900">{stat.value}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
                        </div>
                    );
                })}
            </div>

            {/* ==================== CHARTS ROW ==================== */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                {/* Spending Trend — Line Chart */}
                <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                    <div className="mb-4">
                        <h3 className="text-sm font-bold text-gray-900">Spending Trend</h3>
                        <p className="text-xs text-gray-400 mt-0.5">Booking spend by month</p>
                    </div>
                    <ResponsiveContainer width="100%" height={260}>
                        <LineChart data={spendingTrend} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis
                                dataKey="month"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 11, fill: "#94a3b8" }}
                            />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                            <Tooltip
                                formatter={(value) => {
                                    if (typeof value !== "number") return ["", ""];
                                    return [formatCurrency(toDisplayAmount(value), stats.currency), "Spent"];
                                }}
                                contentStyle={{
                                    borderRadius: 12,
                                    border: "1px solid #e2e8f0",
                                    fontSize: 12,
                                    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
                                }}
                            />
                            <Line
                                type="monotone"
                                dataKey="spent"
                                stroke="#2563eb"
                                strokeWidth={2.5}
                                dot={{ r: 4, fill: "#2563eb", strokeWidth: 0 }}
                                activeDot={{ r: 6 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Trip Category Breakdown — Donut Chart */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                    <h3 className="text-sm font-bold text-gray-900">Trip Categories</h3>
                    <p className="text-xs text-gray-400 mt-0.5 mb-2">Where your bookings go</p>
                    <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                            <Pie
                                data={categoryBreakdown}
                                dataKey="value"
                                nameKey="name"
                                innerRadius={55}
                                outerRadius={80}
                                paddingAngle={3}
                            >
                                {categoryBreakdown.map((_, index) => (
                                    <Cell key={index} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(value, name) => {
                                    if (typeof value !== "number") return ["", name ?? ""];
                                    return [value, name ?? ""];
                                }}
                                contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }}
                            />
                            <Legend
                                iconType="circle"
                                iconSize={8}
                                formatter={(value) => <span className="text-xs text-gray-600">{value}</span>}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* ==================== UPCOMING TRIPS + RECENT BOOKINGS ==================== */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                {/* Upcoming Trips */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                    <h3 className="text-sm font-bold text-gray-900 mb-4">Upcoming Trips</h3>
                    {upcomingTrips.length === 0 ? (
                        <p className="text-xs text-gray-400 py-6 text-center">No confirmed upcoming trips.</p>
                    ) : (
                        <div className="space-y-3">
                            {upcomingTrips.map((trip) => (
                                <div
                                    key={trip._id}
                                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors"
                                >
                                    <div
                                        className="h-11 w-11 rounded-xl bg-cover bg-center shrink-0 border border-gray-100"
                                        style={{ backgroundImage: `url('${trip.image || FALLBACK_IMAGE}')` }}
                                    />
                                    <div className="min-w-0 flex-1">
                                        <p className="text-xs font-bold text-gray-900 truncate">
                                            {trip.destination}
                                        </p>
                                        <p className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                                            <Calendar size={10} />
                                            {trip.tourStartDate ? formatDate(trip.tourStartDate) : "Date TBA"} ·{" "}
                                            {trip.travelers} traveler{trip.travelers > 1 ? "s" : ""}
                                        </p>
                                    </div>
                                    <StatusBadge status={trip.status} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Recent Bookings Table */}
                <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                    <h3 className="text-sm font-bold text-gray-900 mb-4">Recent Bookings</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-[11px] text-gray-400 uppercase tracking-wide border-b border-gray-100">
                                    <th className="pb-2 font-bold">Destination</th>
                                    <th className="pb-2 font-bold">Booked On</th>
                                    <th className="pb-2 font-bold">Amount</th>
                                    <th className="pb-2 font-bold">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentBookings.map((booking) => (
                                    <tr key={booking._id} className="border-b border-gray-50 last:border-0">
                                        <td className="py-3 text-xs font-semibold text-gray-800">
                                            {booking.destination}
                                        </td>
                                        <td className="py-3 text-xs text-gray-500">
                                            {formatDate(booking.bookedOn)}
                                        </td>
                                        <td className="py-3 text-xs font-bold text-gray-800">
                                            {formatCurrency(toDisplayAmount(booking.amount), booking.currency)}
                                        </td>
                                        <td className="py-3">
                                            <StatusBadge status={booking.status} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}