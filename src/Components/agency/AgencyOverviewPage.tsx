"use client";

import { Avatar, Chip } from "@heroui/react";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useEffect, useState } from "react";

const BACKEND_BASE = process.env.NEXT_PUBLIC_API_URL;

interface OverviewData {
  totalPackages: number;
  publishedPackages: number;
  draftPackages: number;
  totalEarnings: number;
  totalBookings: number;
  totalTravelers: number;
  thisMonthEarnings: number;
  thisMonthBookings: number;
  topPackages: {
    _id: string;
    earnings: number;
    bookings: number;
    packageDetails?: { title: string; coverImage: string; destination: string };
  }[];
  recentBookings: {
    _id: string;
    invoiceId: string;
    email: string;
    packageTitle: string;
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

export function AgencyOverviewPage({ agencyId }: { agencyId: string }) {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // agencyId না থাকলে loading আটকে না রেখে সাথে সাথে বন্ধ করে দাও
    if (!agencyId) {
      setLoading(false);
      setError("Agency ID not found.");
      return;
    }

    let isCancelled = false;

    async function fetchOverview() {
      try {
        setLoading(true);
        setError(null);

        if (!BACKEND_BASE) {
          throw new Error("NEXT_PUBLIC_API_URL is not set");
        }

        const res = await fetch(`${BACKEND_BASE}/api/agency/${agencyId}/overview`, {
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error(`Request failed: ${res.status}`);
        }

        const json = await res.json();

        if (!isCancelled) {
          setData(json.data);
        }
      } catch (err) {
        console.error("Failed to load overview:", err);
        if (!isCancelled) {
          setError("Failed to load dashboard.");
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    fetchOverview();

    // cleanup: component unmount হলে বা agencyId পাল্টে গেলে পুরনো রেসপন্স ignore করো
    return () => {
      isCancelled = true;
    };
  }, [agencyId]);

  if (loading) return <p className="text-sm text-muted p-6">Loading dashboard…</p>;
  if (error) return <p className="text-sm text-danger p-6">{error}</p>;
  if (!data) return null;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Overview</h1>
        <p className="text-sm text-muted">Snapshot of your agencys performance.</p>
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
          subtext={`${data.thisMonthBookings} booking${data.thisMonthBookings !== 1 ? "s" : ""}`}
          icon="gravity-ui:calendar"
        />
        <StatCard
          label="Total Bookings"
          value={data.totalBookings.toString()}
          subtext={`${data.totalTravelers} travelers`}
          icon="gravity-ui:ticket"
        />
        <StatCard
          label="Packages"
          value={data.totalPackages.toString()}
          subtext={`${data.publishedPackages} published`}
          icon="gravity-ui:layers"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top performing packages */}
        <div className="lg:col-span-1 rounded-2xl border border-default-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium">Top Packages</h2>
            <Link href="/dashboard/agency/packages" className="text-xs text-[#12332E] hover:underline">
              View all
            </Link>
          </div>
          <div className="flex flex-col gap-4">
            {data.topPackages.length === 0 && (
              <p className="text-xs text-muted">No bookings yet.</p>
            )}
            {data.topPackages.map((pkg, i) => (
              <div key={pkg._id} className="flex items-center gap-3">
                <span className="text-xs text-muted w-4">{i + 1}</span>
                <Avatar size="sm">
                  <Avatar.Image src={pkg.packageDetails?.coverImage} />
                  <Avatar.Fallback>
                    {pkg.packageDetails?.title?.slice(0, 2).toUpperCase() ?? "PK"}
                  </Avatar.Fallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">
                    {pkg.packageDetails?.title ?? "Deleted package"}
                  </p>
                  <p className="text-xs text-muted">{pkg.bookings} bookings</p>
                </div>
                <span className="text-xs font-semibold">{formatCurrency(pkg.earnings)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent bookings */}
        <div className="lg:col-span-2 rounded-2xl border border-default-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium">Recent Bookings</h2>
            <Link href="/dashboard/agency/bookings" className="text-xs text-[#12332E] hover:underline">
              View all
            </Link>
          </div>
          <div className="flex flex-col divide-y divide-default-100">
            {data.recentBookings.length === 0 && (
              <p className="text-xs text-muted">No bookings yet.</p>
            )}
            {data.recentBookings.map((b) => (
              <div key={b._id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="size-9 rounded-full bg-[#12332E]/5 flex items-center justify-center shrink-0">
                    <Icon className="size-4 text-[#12332E]" icon="gravity-ui:person" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium truncate">{b.packageTitle}</p>
                    <p className="text-xs text-muted truncate">{b.email}</p>
                  </div>
                </div>
                <div className="text-right shrink-0 pl-3">
                  <p className="text-xs font-semibold">
                    {b.totalAmount.toLocaleString("en-US", {
                      style: "currency",
                      currency: b.currency?.toUpperCase() || "USD",
                    })}
                  </p>
                  <p className="text-xs text-muted">
                    {new Date(b.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Package status breakdown */}
      <div className="rounded-2xl border border-default-200 p-5">
        <h2 className="text-sm font-medium mb-4">Package Status</h2>
        <div className="flex gap-6">
          <div className="flex items-center gap-2">
            <Chip color="success" size="sm" variant="soft">Published</Chip>
            <span className="text-sm font-medium">{data.publishedPackages}</span>
          </div>
          <div className="flex items-center gap-2">
            <Chip color="warning" size="sm" variant="soft">Draft</Chip>
            <span className="text-sm font-medium">{data.draftPackages}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  subtext,
  icon,
}: {
  label: string;
  value: string;
  subtext?: string;
  icon: string;
}) {
  return (
    <div className="rounded-2xl border border-default-200 p-5 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted">{label}</span>
        <div className="size-8 rounded-full bg-[#12332E]/5 flex items-center justify-center">
          <Icon className="size-4 text-[#12332E]" icon={icon} />
        </div>
      </div>
      <span className="text-xl font-semibold">{value}</span>
      {subtext && <span className="text-xs text-muted">{subtext}</span>}
    </div>
  );
}