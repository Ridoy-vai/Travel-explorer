"use client";

import { Button, Chip } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// ---- Types ----
interface SummaryData {
  totalRevenue: number;
  confirmedCount: number;
  avgBookingValue: number;
  pendingAmount: number;
  pendingCount: number;
  statusBreakdown: { status: string; count: number; amount: number }[];
  revenueByMonth: { month: string; revenue: number; bookings: number }[];
  revenueByAgency: { agency: string; revenue: number; bookings: number }[];
}

interface Transaction {
  _id: string;
  invoiceId: string;
  sessionId: string;
  email: string;
  totalAmount: number;
  currency: string;
  status: string;
  createdAt: string;
  adultCount: number;
  childCount: number;
  packageTitle: string;
  agencyName: string;
}

interface SummaryResponse {
  success: boolean;
  message?: string;
  data: SummaryData;
}

interface TransactionsResponse {
  success: boolean;
  message?: string;
  data: {
    transactions: Transaction[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const STATUS_COLORS: Record<string, string> = {
  confirmed: "#22c55e",
  pending: "#f59e0b",
  cancelled: "#ef4444",
  failed: "#ef4444",
};

const STATUS_CHIP: Record<string, "success" | "warning" | "danger" | "default"> = {
  confirmed: "success",
  pending: "warning",
  cancelled: "danger",
  failed: "danger",
};

const AGENCY_COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ec4899", "#06b6d4", "#a855f7", "#ef4444", "#0ea5e9"];

// Stripe-style amounts are stored in the smallest currency unit (cents).
// If your DB actually stores whole-unit amounts, remove the "/ 100" below.
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
  sub,
  color,
}: {
  icon: string;
  label: string;
  value: string;
  sub?: string;
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
        {sub && <p className="text-xs text-muted">{sub}</p>}
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

function exportToCSV(transactions: Transaction[]) {
  if (transactions.length === 0) return;

  const headers = ["Invoice ID", "Email", "Package", "Agency", "Amount", "Currency", "Status", "Date"];
  const rows = transactions.map((t) => [
    t.invoiceId,
    t.email,
    t.packageTitle,
    t.agencyName,
    ((t.totalAmount || 0) / 100).toFixed(2),
    t.currency,
    t.status,
    new Date(t.createdAt).toISOString(),
  ]);

  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `transactions-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export function AdminFinance({ token }: { token: string | null }) {
  // ---- Summary state ----
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [isSummaryLoading, setIsSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState("");

  // ---- Transactions state ----
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [isTableLoading, setIsTableLoading] = useState(true);
  const [tableError, setTableError] = useState("");

  const fetchSummary = async () => {
    setIsSummaryLoading(true);
    setSummaryError("");
    try {
      const res = await fetch(`${API_URL}/api/admin/finance/summary`, {
        headers: {
          // "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const json: SummaryResponse = await res.json();

      if (!res.ok || !json.success) {
        setSummaryError(json.message || "Failed to load finance summary");
        setSummary(null);
        return;
      }
      setSummary(json.data);
    } catch (err) {
      console.error("Fetch finance summary error:", err);
      setSummaryError("Something went wrong while loading the finance summary.");
      setSummary(null);
    } finally {
      setIsSummaryLoading(false);
    }
  };

  const fetchTransactions = async () => {
    setIsTableLoading(true);
    setTableError("");
    try {
      const params = new URLSearchParams({ page: String(page), limit: "10", status: statusFilter });
      if (search) params.set("search", search);

      const res = await fetch(`${API_URL}/api/admin/finance/transactions?${params.toString()}`, {
        headers: {
          // "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const json: TransactionsResponse = await res.json();

      if (!res.ok || !json.success) {
        setTableError(json.message || "Failed to load transactions");
        setTransactions([]);
        return;
      }

      setTransactions(json.data.transactions || []);
      setTotal(json.data.total || 0);
      setTotalPages(json.data.totalPages || 1);
    } catch (err) {
      console.error("Fetch transactions error:", err);
      setTableError("Something went wrong while loading transactions.");
      setTransactions([]);
    } finally {
      setIsTableLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  useEffect(() => {
    fetchTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statusFilter, search]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      setSearch(searchInput.trim());
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const pendingLabel = useMemo(() => {
    if (!summary) return "";
    return `${summary.pendingCount} pending`;
  }, [summary]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Finance</h2>
        <Button size="sm" variant="tertiary" onClick={() => { fetchSummary(); fetchTransactions(); }}>
          <Icon icon="gravity-ui:arrows-rotate-right" className="size-4" />
          Refresh
        </Button>
      </div>

      {/* ---- Summary ---- */}
      {isSummaryLoading ? (
        <div className="py-10 text-center text-muted">Loading finance summary...</div>
      ) : summaryError || !summary ? (
        <div className="flex items-center justify-between rounded-md bg-red-50 px-3 py-2 text-sm text-red-500">
          <span>{summaryError || "No data available."}</span>
          <Button size="sm" variant="tertiary" onClick={fetchSummary}>
            Retry
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon="gravity-ui:wallet"
              label="Total Revenue"
              value={formatMoney(summary.totalRevenue)}
              sub={`${summary.confirmedCount} confirmed bookings`}
              color="#22c55e"
            />
            <StatCard
              icon="gravity-ui:chart-line"
              label="Avg. Booking Value"
              value={formatMoney(summary.avgBookingValue)}
              color="#6366f1"
            />
            <StatCard
              icon="gravity-ui:clock"
              label="Pending Amount"
              value={formatMoney(summary.pendingAmount)}
              sub={pendingLabel}
              color="#f59e0b"
            />
            <StatCard
              icon="gravity-ui:credit-card"
              label="Total Transactions"
              value={total.toLocaleString()}
              color="#ec4899"
            />
          </div>

          {/* Revenue trend */}
          <ChartCard title="Revenue trend (confirmed bookings)">
            {summary.revenueByMonth.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted">No revenue data yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={summary.revenueByMonth} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="financeRevenueFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#22c55e" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" fontSize={12} tickLine={false} />
                  <YAxis fontSize={12} tickLine={false} tickFormatter={(v) => formatMoney(v)} width={80} />
                  <Tooltip
                    formatter={(value, name) => {
                      const formattedValue = typeof value === "number" ? formatMoney(value) : String(value ?? "");
                      return name === "revenue"
                        ? [formattedValue, "Revenue"]
                        : [formattedValue, "Bookings"];
                    }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#22c55e" strokeWidth={2} fill="url(#financeRevenueFill)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Revenue by agency */}
            <ChartCard title="Top agencies by revenue">
              {summary.revenueByAgency.length === 0 ? (
                <p className="py-10 text-center text-sm text-muted">No confirmed bookings yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={summary.revenueByAgency} layout="vertical" margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" fontSize={12} tickFormatter={(v) => formatMoney(v as number)} />
                    <YAxis dataKey="agency" type="category" fontSize={12} width={120} tickLine={false} />
                    <Tooltip
                      formatter={(value) => {
                        if (typeof value !== "number") return "";
                        return formatMoney(value);
                      }}
                    />
                    <Bar dataKey="revenue" radius={[0, 6, 6, 0]}>
                      {summary.revenueByAgency.map((entry, i) => (
                        <Cell key={entry.agency} fill={AGENCY_COLORS[i % AGENCY_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </ChartCard>

            {/* Status breakdown */}
            <ChartCard title="Transactions by status">
              <div className="flex flex-col gap-3">
                {summary.statusBreakdown.map((s) => (
                  <div key={s.status} className="flex items-center justify-between rounded-lg border px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="size-2.5 rounded-full"
                        style={{ backgroundColor: STATUS_COLORS[s.status] || "#a1a1aa" }}
                      />
                      <span className="text-sm capitalize">{s.status}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{formatMoney(s.amount)}</p>
                      <p className="text-xs text-muted">{s.count} txn{s.count === 1 ? "" : "s"}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ChartCard>
          </div>
        </>
      )}

      {/* ---- Transactions table ---- */}
      <div className="flex flex-col gap-3 rounded-xl border p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-sm font-semibold">Transactions</h3>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Icon icon="gravity-ui:magnifier" className="absolute left-2 top-1/2 size-4 -translate-y-1/2 text-muted" />
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search email or invoice ID"
                className="rounded-md border bg-transparent py-1.5 pl-8 pr-3 text-sm"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setPage(1);
                setStatusFilter(e.target.value);
              }}
              className="rounded-md border bg-transparent px-2 py-1.5 text-sm"
            >
              <option value="all">All statuses</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
              <option value="failed">Failed</option>
            </select>
            <Button size="sm" variant="tertiary" onClick={() => exportToCSV(transactions)} isDisabled={transactions.length === 0}>
              <Icon icon="gravity-ui:arrow-down-to-line" className="size-4" />
              Export CSV
            </Button>
          </div>
        </div>

        {tableError && (
          <div className="flex items-center justify-between rounded-md bg-red-50 px-3 py-2 text-sm text-red-500">
            <span>{tableError}</span>
            <Button size="sm" variant="tertiary" onClick={fetchTransactions}>
              Retry
            </Button>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b text-left text-xs text-muted">
                <th className="py-2 pr-3 font-medium">Invoice</th>
                <th className="py-2 pr-3 font-medium">Customer</th>
                <th className="py-2 pr-3 font-medium">Package / Agency</th>
                <th className="py-2 pr-3 font-medium">Amount</th>
                <th className="py-2 pr-3 font-medium">Status</th>
                <th className="py-2 pr-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {isTableLoading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted">Loading...</td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted">No transactions found.</td>
                </tr>
              ) : (
                transactions.map((t) => (
                  <tr key={t._id} className="border-b last:border-0">
                    <td className="py-2.5 pr-3 font-mono text-xs">{t.invoiceId}</td>
                    <td className="py-2.5 pr-3">{t.email}</td>
                    <td className="py-2.5 pr-3">
                      <p className="truncate max-w-[220px]">{t.packageTitle}</p>
                      <p className="text-xs text-muted">{t.agencyName}</p>
                    </td>
                    <td className="py-2.5 pr-3 font-medium">{formatMoney(t.totalAmount, t.currency)}</td>
                    <td className="py-2.5 pr-3">
                      <Chip size="sm" variant="soft" color={STATUS_CHIP[t.status] || "default"}>
                        {t.status}
                      </Chip>
                    </td>
                    <td className="py-2.5 pr-3 text-muted">{new Date(t.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-xs text-muted">Page {page} of {totalPages} · {total} total</span>
          <div className="flex gap-2">
            <Button size="sm" variant="tertiary" isDisabled={page <= 1 || isTableLoading} onClick={() => setPage((p) => p - 1)}>
              Previous
            </Button>
            <Button size="sm" variant="tertiary" isDisabled={page >= totalPages || isTableLoading} onClick={() => setPage((p) => p + 1)}>
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
