"use client";

import { Button, Chip } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface OverviewData {
  totals: {
    users: number;
    packages: number;
    bookings: number;
    revenue: number;
  };
  usersByRole: { role: string; count: number }[];
  packagesByStatus: { status: string; count: number }[];
  packagesByCategory: { category: string; count: number }[];
  bookingsByStatus: { status: string; count: number }[];
  revenueByMonth: { month: string; revenue: number; bookings: number }[];
  recentBookings: {
    _id: string;
    email: string;
    totalAmount: number;
    currency: string;
    status: string;
    createdAt: string;
  }[];
}

interface OverviewResponse {
  success: boolean;
  message?: string;
  data: OverviewData;
}

// ---- Colors ----
const ROLE_COLORS: Record<string, string> = {
  traveler: "#22c55e",
  agency: "#f59e0b",
  admin: "#ef4444",
};

const STATUS_COLORS: Record<string, string> = {
  confirmed: "#22c55e",
  pending: "#f59e0b",
  cancelled: "#ef4444",
  failed: "#ef4444",
  published: "#22c55e",
  draft: "#a1a1aa",
};

const CATEGORY_COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ec4899", "#06b6d4", "#a855f7", "#ef4444"];

function fallbackColor(key: string, index: number) {
  return STATUS_COLORS[key] || ROLE_COLORS[key] || CATEGORY_COLORS[index % CATEGORY_COLORS.length];
}

// Stripe-style amounts are stored in the smallest currency unit (cents)
function formatMoney(amount: number, currency = "usd") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    maximumFractionDigits: 0,
  }).format((amount || 0) / 100);
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: string;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border p-4">
      <div
        className="flex size-10 shrink-0 items-center justify-center rounded-lg"
        style={{ backgroundColor: `${color}1A`, color }}
      >
        <Icon icon={icon} className="size-5" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted">{label}</p>
        <p className="truncate text-lg font-semibold">{value}</p>
      </div>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border p-4">
      <h3 className="mb-3 text-sm font-semibold">{title}</h3>
      {children}
    </div>
  );
}

export function AdminOverview() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const fetchOverview = async () => {
    setIsLoading(true);
    setErrorMsg("");
    console.log("API_URL:", API_URL);
    try {
      const res = await fetch(`${API_URL}/api/admin/overview`);
      const json: OverviewResponse = await res.json();

      if (!res.ok || !json.success) {
        setErrorMsg(json.message || "Failed to load overview");
        setData(null);
        return;
      }

      setData(json.data);
    } catch (err) {
      console.error("Fetch overview error:", err);
      setErrorMsg("Something went wrong while loading overview.");
      setData(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  if (isLoading) {
    return <div className="py-16 text-center text-muted">Loading overview...</div>;
  }

  if (errorMsg || !data) {
    return (
      <div className="flex items-center justify-between rounded-md bg-red-50 px-3 py-2 text-sm text-red-500">
        <span>{errorMsg || "No data available."}</span>
        <Button size="sm" variant="tertiary" onClick={fetchOverview}>
          Retry
        </Button>
      </div>
    );
  }

  const totalUsersForPercent = data.usersByRole.reduce((sum, r) => sum + r.count, 0) || 1;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Overview</h2>
        <Button size="sm" variant="tertiary" onClick={fetchOverview}>
          <Icon icon="gravity-ui:arrows-rotate-right" className="size-4" />
          Refresh
        </Button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon="gravity-ui:persons" label="Total Users" value={data.totals.users.toLocaleString()} color="#6366f1" />
        <StatCard icon="gravity-ui:map-pin" label="Total Packages" value={data.totals.packages.toLocaleString()} color="#22c55e" />
        <StatCard icon="gravity-ui:calendar-check" label="Total Bookings" value={data.totals.bookings.toLocaleString()} color="#f59e0b" />
        <StatCard icon="gravity-ui:wallet" label="Total Revenue" value={formatMoney(data.totals.revenue)} color="#ef4444" />
      </div>

      {/* Revenue trend */}
      <ChartCard title="Revenue trend (confirmed bookings)">
        {data.revenueByMonth.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted">No revenue data yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={data.revenueByMonth} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" fontSize={12} tickLine={false} />
              <YAxis fontSize={12} tickLine={false} tickFormatter={(v) => formatMoney(v as number)} width={80} />
              <Tooltip
                formatter={(value) => {
                  const numericValue = typeof value === "number" ? value : 0;
                  return [formatMoney(numericValue), "Revenue"];
                }}
              />
              <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} fill="url(#revenueFill)" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Users by role */}
        <ChartCard title="Users by role">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={data.usersByRole}
                dataKey="count"
                nameKey="role"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
              >
                {data.usersByRole.map((entry, i) => (
                  <Cell key={entry.role} fill={fallbackColor(entry.role, i)} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name) => {
                  const numericValue = typeof value === "number" ? value : 0;
                  return [
                    `${numericValue} (${Math.round((numericValue / totalUsersForPercent) * 100)}%)`,
                    name as string,
                  ];
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Bookings by status */}
        <ChartCard title="Bookings by status">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={data.bookingsByStatus}
                dataKey="count"
                nameKey="status"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
              >
                {data.bookingsByStatus.map((entry, i) => (
                  <Cell key={entry.status} fill={fallbackColor(entry.status, i)} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Packages by category */}
      <ChartCard title="Packages by category">
        {data.packagesByCategory.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted">No packages yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data.packagesByCategory} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="category" fontSize={12} tickLine={false} />
              <YAxis fontSize={12} tickLine={false} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {data.packagesByCategory.map((entry, i) => (
                  <Cell key={entry.category} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      {/* Recent bookings */}
      <ChartCard title="Recent bookings">
        {data.recentBookings.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted">No bookings yet.</p>
        ) : (
          <div className="flex flex-col divide-y">
            {data.recentBookings.map((b) => (
              <div key={b._id} className="flex items-center justify-between py-3 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-medium">{b.email}</p>
                  <p className="text-xs text-muted">{new Date(b.createdAt).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-medium">{formatMoney(b.totalAmount, b.currency)}</span>
                  <Chip
                    size="sm"
                    variant="soft"
                    color={
                      b.status === "confirmed" ? "success" : b.status === "pending" ? "warning" : "danger"
                    }
                  >
                    {b.status}
                  </Chip>
                </div>
              </div>
            ))}
          </div>
        )}
      </ChartCard>
    </div>
  );
}