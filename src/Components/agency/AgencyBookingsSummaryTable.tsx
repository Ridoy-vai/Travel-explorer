"use client";

import type { Selection, SortDescriptor } from "@heroui/react";
import { Avatar, Chip, Table } from "@heroui/react";
// import { Icon } from "@iconify/react";
import { useEffect, useMemo, useState } from "react";

const BACKEND_BASE = process.env.NEXT_PUBLIC_API_URL;

interface BookingSummaryRow {
  _id: string; // packageId
  totalBookings: number;
  totalAdults: number;
  totalChildren: number;
  totalRevenue: number;
  lastBookedAt: string;
  packageDetails?: {
    title: string;
    coverImage: string;
    destination: string;
    basePrice: number;
    status: string;
  };
}

export function AgencyBookingsSummaryTable({ agencyId, token }: { agencyId: string, token: string | null }) {
  const [rows, setRows] = useState<BookingSummaryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set());
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "totalBookings",
    direction: "descending",
  });

  useEffect(() => {
    if (!agencyId) return;

    async function fetchSummary() {
      try {
        setLoading(true);
        const res = await fetch(`${BACKEND_BASE}/api/agency/${agencyId}/bookings-summary`, {
          cache: "no-store",
          headers: {
            // "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
        );
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        const json = await res.json();
        setRows(json.data ?? []);
      } catch (err) {
        console.error("Failed to load booking summary:", err);
        setError("Failed to load bookings.");
      } finally {
        setLoading(false);
      }
    }

    fetchSummary();
  }, [agencyId]);

  const sortedRows = useMemo(() => {
    return [...rows].sort((a, b) => {
      const col = sortDescriptor.column as keyof BookingSummaryRow;
      const first = col === "totalBookings" || col === "totalRevenue"
        ? Number(a[col] ?? 0)
        : String(a.packageDetails?.title ?? "");
      const second = col === "totalBookings" || col === "totalRevenue"
        ? Number(b[col] ?? 0)
        : String(b.packageDetails?.title ?? "");

      let cmp = typeof first === "number" && typeof second === "number"
        ? first - second
        : String(first).localeCompare(String(second));

      if (sortDescriptor.direction === "descending") cmp *= -1;
      return cmp;
    });
  }, [rows, sortDescriptor]);

  if (loading) return <p className="text-sm text-muted p-4">Loading bookings…</p>;
  if (error) return <p className="text-sm text-danger p-4">{error}</p>;
  if (!rows.length) return <p className="text-sm text-muted p-4">No bookings yet.</p>;

  return (
    <Table>
      <Table.ScrollContainer>
        <Table.Content
          aria-label="Package booking summary"
          className="min-w-[900px]"
          selectedKeys={selectedKeys}
          selectionMode="multiple"
          sortDescriptor={sortDescriptor}
          onSelectionChange={setSelectedKeys}
          onSortChange={setSortDescriptor}
        >
          <Table.Header>
            <Table.Column className="pr-0">
              {/* selection checkbox column, optional */}
            </Table.Column>
            <Table.Column allowsSorting isRowHeader className="after:hidden" id="title">
              {({ sortDirection }) => (
                <Table.SortableColumnHeader sortDirection={sortDirection}>
                  Package
                </Table.SortableColumnHeader>
              )}
            </Table.Column>
            <Table.Column allowsSorting id="totalBookings">
              {({ sortDirection }) => (
                <Table.SortableColumnHeader sortDirection={sortDirection}>
                  Total Bookings
                </Table.SortableColumnHeader>
              )}
            </Table.Column>
            <Table.Column>Adults / Children</Table.Column>
            <Table.Column allowsSorting id="totalRevenue">
              {({ sortDirection }) => (
                <Table.SortableColumnHeader sortDirection={sortDirection}>
                  Total Revenue
                </Table.SortableColumnHeader>
              )}
            </Table.Column>
            <Table.Column>Status</Table.Column>
            <Table.Column className="text-end">Last Booked</Table.Column>
          </Table.Header>
          <Table.Body>
            {sortedRows.map((row) => (
              <Table.Row key={row._id} id={row._id}>
                <Table.Cell className="pr-0" />
                <Table.Cell>
                  <div className="flex items-center gap-3">
                    <Avatar size="sm">
                      <Avatar.Image src={row.packageDetails?.coverImage} />
                      <Avatar.Fallback>
                        {row.packageDetails?.title?.slice(0, 2).toUpperCase() ?? "PK"}
                      </Avatar.Fallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-xs font-medium">
                        {row.packageDetails?.title ?? "Deleted package"}
                      </span>
                      <span className="text-xs text-muted">
                        {row.packageDetails?.destination}
                      </span>
                    </div>
                  </div>
                </Table.Cell>
                <Table.Cell className="font-medium">{row.totalBookings}</Table.Cell>
                <Table.Cell>
                  {row.totalAdults} / {row.totalChildren}
                </Table.Cell>
                <Table.Cell>
                  {row.totalRevenue.toLocaleString("en-US", {
                    style: "currency",
                    currency: "USD",
                  })}
                </Table.Cell>
                <Table.Cell>
                  <Chip
                    color={row.packageDetails?.status === "published" ? "success" : "warning"}
                    size="sm"
                    variant="soft"
                  >
                    {row.packageDetails?.status ?? "unknown"}
                  </Chip>
                </Table.Cell>
                <Table.Cell className="text-end text-xs text-muted">
                  {new Date(row.lastBookedAt).toLocaleDateString()}
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Content>
      </Table.ScrollContainer>
    </Table>
  );
}