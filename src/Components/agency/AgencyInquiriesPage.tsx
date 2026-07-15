"use client";

import { Button, Chip, Table } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";

const BACKEND_BASE = process.env.NEXT_PUBLIC_API_URL;

const statusColorMap: Record<string, "success" | "danger" | "warning"> = {
    new: "warning",
    contacted: "success",
    closed: "danger",
};

interface Inquiry {
    _id: string;
    name: string;
    email: string;
    phone: string;
    message: string;
    packageTitle: string;
    status: "new" | "contacted" | "closed";
    createdAt: string;
}

export function AgencyInquiriesPage({ agencyId }: { agencyId: string }) {
    const [inquiries, setInquiries] = useState<Inquiry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<string>("all");

    const fetchInquiries = async () => {
        try {
            setLoading(true);
            const query = filter !== "all" ? `?status=${filter}` : "";
            const res = await fetch(`${BACKEND_BASE}/api/agency/${agencyId}/inquiries${query}`, {
                cache: "no-store",
            });
            if (!res.ok) throw new Error(`Request failed: ${res.status}`);
            const json = await res.json();
            setInquiries(json.data ?? []);
        } catch (err) {
            console.error("Failed to load inquiries:", err);
            setError("Failed to load inquiries.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!agencyId) return;
        fetchInquiries();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [agencyId, filter]);

    const updateStatus = async (id: string, status: string) => {
        try {
            const res = await fetch(`${BACKEND_BASE}/api/inquiries/${id}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status }),
            });
            if (!res.ok) throw new Error("Failed to update status");
            setInquiries((prev) =>
                prev.map((i) => (i._id === id ? { ...i, status: status as Inquiry["status"] } : i))
            );
        } catch (err) {
            console.error("Status update failed:", err);
        }
    };

    if (loading) return <p className="text-sm text-muted p-6">Loading inquiries…</p>;
    if (error) return <p className="text-sm text-danger p-6">{error}</p>;

    return (
        <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-semibold">Inquiries</h1>
                    <p className="text-sm text-muted">Customer questions about your tour packages.</p>
                </div>
                <div className="flex gap-2">
                    {["all", "new", "contacted", "closed"].map((s) => (
                        <button
                            key={s}
                            onClick={() => setFilter(s)}
                            className={`text-xs px-3 py-1.5 rounded-full border capitalize ${
                                filter === s
                                    ? "bg-[#12332E] text-white border-[#12332E]"
                                    : "border-default-200 text-muted"
                            }`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {inquiries.length === 0 ? (
                <p className="text-sm text-muted p-4">No inquiries found.</p>
            ) : (
                <Table>
                    <Table.ScrollContainer>
                        <Table.Content aria-label="Inquiries" className="min-w-[900px]">
                            <Table.Header>
                                <Table.Column isRowHeader>Customer</Table.Column>
                                <Table.Column>Package</Table.Column>
                                <Table.Column>Message</Table.Column>
                                <Table.Column>Status</Table.Column>
                                <Table.Column>Date</Table.Column>
                                <Table.Column className="text-end">Actions</Table.Column>
                            </Table.Header>
                            <Table.Body>
                                {inquiries.map((inq) => (
                                    <Table.Row key={inq._id} id={inq._id}>
                                        <Table.Cell>
                                            <div className="flex flex-col">
                                                <span className="text-xs font-medium">{inq.name}</span>
                                                <span className="text-xs text-muted">{inq.email}</span>
                                                <span className="text-xs text-muted">{inq.phone}</span>
                                            </div>
                                        </Table.Cell>
                                        <Table.Cell className="text-xs">{inq.packageTitle}</Table.Cell>
                                        <Table.Cell className="text-xs max-w-64 truncate">
                                            {inq.message || "—"}
                                        </Table.Cell>
                                        <Table.Cell>
                                            <Chip color={statusColorMap[inq.status]} size="sm" variant="soft">
                                                {inq.status}
                                            </Chip>
                                        </Table.Cell>
                                        <Table.Cell className="text-xs text-muted">
                                            {new Date(inq.createdAt).toLocaleDateString()}
                                        </Table.Cell>
                                        <Table.Cell>
                                            <div className="flex justify-end gap-1">
                                                {inq.status !== "contacted" && (
                                                    <Button
                                                        isIconOnly
                                                        size="sm"
                                                        variant="tertiary"
                                                        onPress={() => updateStatus(inq._id, "contacted")}
                                                    >
                                                        <Icon className="size-4" icon="gravity-ui:check" />
                                                    </Button>
                                                )}
                                                {inq.status !== "closed" && (
                                                    <Button
                                                        isIconOnly
                                                        size="sm"
                                                        variant="danger-soft"
                                                        onPress={() => updateStatus(inq._id, "closed")}
                                                    >
                                                        <Icon className="size-4" icon="gravity-ui:xmark" />
                                                    </Button>
                                                )}
                                                <a href={`mailto:${inq.email}`}>
                                                    <Button isIconOnly size="sm" variant="tertiary">
                                                        <Icon className="size-4" icon="gravity-ui:envelope" />
                                                    </Button>
                                                </a>
                                            </div>
                                        </Table.Cell>
                                    </Table.Row>
                                ))}
                            </Table.Body>
                        </Table.Content>
                    </Table.ScrollContainer>
                </Table>
            )}
        </div>
    );
}