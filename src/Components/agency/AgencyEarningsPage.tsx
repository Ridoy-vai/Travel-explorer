"use client";

import { Avatar, Chip, Table } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const BACKEND_BASE = process.env.NEXT_PUBLIC_API_URL;

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

interface EarningsData {
  totalEarnings: number;
  totalBookings: number;
  totalTravelers: number;
  thisMonthEarnings: number;
  lastMonthEarnings: number;
  growthPercent: number;
  monthlyTrend: { _id: { year: number; month: number }; earnings: number; bookings: number }[];
  earningsByPackage: {
    _id: string;
    earnings: number;
    bookings: number;
    packageDetails?: { title: string; coverImage: string; destination: string };
  }[];
  recentTransactions: {
    _id: string;
    sessionId: string;
    invoiceId: string;
    email: string;
    totalAmount: number;
    currency: string;
    adultCount: number;
    childCount: number;
    createdAt: string;
  }[];
}

function formatCurrency(amount: number) {
  return amount.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

export function AgencyEarningsPage({ agencyId }: { agencyId: string }) {
  const [data, setData] = useState<EarningsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!agencyId) return;

    async function fetchEarnings() {
      try {
        setLoading(true);
        const res = await fetch(`${BACKEND_BASE}/api/agency/${agencyId}/earnings`, {
          cache: "no-store",
        });
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        const json = await res.json();
        setData(json.data);
      } catch (err) {
        console.error("Failed to load earnings:", err);
        setError("Failed to load earnings data.");
      } finally {
        setLoading(false);
      }
    }

    fetchEarnings();
  }, [agencyId]);

  if (loading) return <p className="text-sm text-muted p-6">Loading earnings…</p>;
  if (error) return <p className="text-sm text-danger p-6">{error}</p>;
  if (!data) return null;

  const chartData = data.monthlyTrend.map((m) => ({
    label: `${MONTH_NAMES[m._id.month - 1]} ${m._id.year}`,
    earnings: m.earnings,
    bookings: m.bookings,
  }));

  const isPositiveGrowth = Number(data.growthPercent) >= 0;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Earnings</h1>
        <p className="text-sm text-muted">Overview of your agencys revenue and bookings.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Earnings"
          value={formatCurrency(data.totalEarnings)}
          icon="gravity-ui:wallet"
        />
        <StatCard
          label="This Month"
          value={formatCurrency(data.thisMonthEarnings)}
          icon="gravity-ui:calendar"
          trend={{
            value: `${isPositiveGrowth ? "+" : ""}${data.growthPercent}%`,
            positive: isPositiveGrowth,
          }}
        />
        <StatCard
          label="Total Bookings"
          value={data.totalBookings.toString()}
          icon="gravity-ui:ticket"
        />
        <StatCard
          label="Total Travelers"
          value={data.totalTravelers.toString()}
          icon="gravity-ui:persons"
        />
      </div>

      {/* Monthly trend chart */}
      <div className="rounded-2xl border border-default-200 p-5">
        <h2 className="text-sm font-medium mb-4">Earnings Trend (Last 6 Months)</h2>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="earningsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#C9A227" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#C9A227" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="label" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `$${v}`}
            />
            <Tooltip
              formatter={(value) =>
                typeof value === "number" ? formatCurrency(value) : ""
              }
              contentStyle={{ borderRadius: 8, border: "1px solid #eee" }}
            />
            <Area
              type="monotone"
              dataKey="earnings"
              stroke="#12332E"
              strokeWidth={2}
              fill="url(#earningsGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Earnings by package */}
      <div>
        <h2 className="text-sm font-medium mb-3">Earnings by Package</h2>
        <Table>
          <Table.ScrollContainer>
            <Table.Content aria-label="Earnings by package" className="min-w-[700px]">
              <Table.Header>
                <Table.Column isRowHeader>Package</Table.Column>
                <Table.Column>Bookings</Table.Column>
                <Table.Column>Earnings</Table.Column>
                <Table.Column className="text-end">Avg. per Booking</Table.Column>
              </Table.Header>
              <Table.Body>
                {data.earningsByPackage.map((pkg) => (
                  <Table.Row key={pkg._id} id={pkg._id}>
                    <Table.Cell>
                      <div className="flex items-center gap-3">
                        <Avatar size="sm">
                          <Avatar.Image src={pkg.packageDetails?.coverImage} />
                          <Avatar.Fallback>
                            {pkg.packageDetails?.title?.slice(0, 2).toUpperCase() ?? "PK"}
                          </Avatar.Fallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="text-xs font-medium">
                            {pkg.packageDetails?.title ?? "Deleted package"}
                          </span>
                          <span className="text-xs text-muted">
                            {pkg.packageDetails?.destination}
                          </span>
                        </div>
                      </div>
                    </Table.Cell>
                    <Table.Cell>{pkg.bookings}</Table.Cell>
                    <Table.Cell className="font-medium">{formatCurrency(pkg.earnings)}</Table.Cell>
                    <Table.Cell className="text-end text-muted">
                      {formatCurrency(pkg.earnings / pkg.bookings)}
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Content>
          </Table.ScrollContainer>
        </Table>
      </div>

      {/* Recent transactions */}
      <div>
        <h2 className="text-sm font-medium mb-3">Recent Transactions</h2>
        <Table>
          <Table.ScrollContainer>
            <Table.Content aria-label="Recent transactions" className="min-w-[800px]">
              <Table.Header>
                <Table.Column isRowHeader>Invoice</Table.Column>
                <Table.Column>Customer</Table.Column>
                <Table.Column>Travelers</Table.Column>
                <Table.Column>Amount</Table.Column>
                <Table.Column>Status</Table.Column>
                <Table.Column className="text-end">Date</Table.Column>
              </Table.Header>
              <Table.Body>
                {data.recentTransactions.map((tx) => (
                  <Table.Row key={tx._id} id={tx._id}>
                    <Table.Cell className="font-mono text-xs">{tx.invoiceId}</Table.Cell>
                    <Table.Cell className="text-xs">{tx.email}</Table.Cell>
                    <Table.Cell>
                      {tx.adultCount} adult{tx.adultCount !== 1 ? "s" : ""}
                      {tx.childCount ? `, ${tx.childCount} child` : ""}
                    </Table.Cell>
                    <Table.Cell className="font-medium">
                      {tx.totalAmount.toLocaleString("en-US", {
                        style: "currency",
                        currency: tx.currency?.toUpperCase() || "USD",
                      })}
                    </Table.Cell>
                    <Table.Cell>
                      <Chip color="success" size="sm" variant="soft">
                        Confirmed
                      </Chip>
                    </Table.Cell>
                    <Table.Cell className="text-end text-xs text-muted">
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Content>
          </Table.ScrollContainer>
        </Table>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  trend,
}: {
  label: string;
  value: string;
  icon: string;
  trend?: { value: string; positive: boolean };
}) {
  return (
    <div className="rounded-2xl border border-default-200 p-5 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted">{label}</span>
        <div className="size-8 rounded-full bg-[#12332E]/5 flex items-center justify-center">
          <Icon className="size-4 text-[#12332E]" icon={icon} />
        </div>
      </div>
      <div className="flex items-end gap-2">
        <span className="text-xl font-semibold">{value}</span>
        {trend && (
          <span className={`text-xs font-medium mb-0.5 ${trend.positive ? "text-success" : "text-danger"}`}>
            {trend.value}
          </span>
        )}
      </div>
    </div>
  );
}