"use client";

import { Chip, Table, Tabs, Button, Input } from "@heroui/react";
import { useState, useEffect, useCallback } from "react";

// অ্যাডমিন প্যানেলের জন্য এজেন্সির টাইপ ডিফাইন
interface Agency {
    _id: { $oid: string } | string;
    name: string;
    email: string;
    emailVerified: boolean;
    role: string;
    phone: string;
    tradeLicense: string;
    operatingRegion: string;
    status: "pending" | "approved" | "rejected";
    createdAt: { $date: string } | string;
}

interface StatusCounts {
    pending: number;
    approved: number;
    rejected: number;
}

// স্ট্যাটাস অনুযায়ী কালার কোড
const statusColorMap: Record<string, "warning" | "success" | "danger"> = {
    pending: "warning",
    approved: "success",
    rejected: "danger",
};

// অ্যাডমিন টেবিলের কলামসমূহ
const columns = [
    { id: "name", name: "Agency Name" },
    { id: "email", name: "Email" },
    { id: "phone", name: "Phone" },
    { id: "tradeLicense", name: "Trade License" },
    { id: "region", name: "Region" },
    { id: "status", name: "Status" },
    { id: "actions", name: "Verification Actions" },
];

const API_BASE = process.env.NEXT_PUBLIC_API_URL; // ডিফল্টভাবে লোকালহোস্ট ব্যবহার করা হবে যদি এনভায়রনমেন্ট ভেরিয়েবল না থাকে

export default function AdminAgencyVerification({ token }: { token: string | null }) {
    // মূল ডাটা + মেটা স্টেট
    const [agencies, setAgencies] = useState<Agency[]>([]);
    const [statusCounts, setStatusCounts] = useState<StatusCounts>({
        pending: 0,
        approved: 0,
        rejected: 0,
    });
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(false);

    // Pagination, Tab এবং Search স্টেট
    const [page, setPage] = useState(1);
    const [activeTab, setActiveTab] = useState("pending");
    const [searchInput, setSearchInput] = useState(""); // ইউজার যা টাইপ করছে
    const [search, setSearch] = useState(""); // ডিবাউন্স হওয়ার পর আসল সার্চ টার্ম যেটা API তে যাবে
    const rowsPerPage = 5;

    // সার্চ ইনপুট ডিবাউন্স করা (৪০০ms), যাতে প্রতিটা কি-স্ট্রোকে API কল না হয়
    useEffect(() => {
        const timer = setTimeout(() => {
            setSearch(searchInput.trim());
            setPage(1); // নতুন সার্চ করলে পেজ ১ এ রিসেট
        }, 400);

        return () => clearTimeout(timer);
    }, [searchInput]);

    // এজেন্সিদের তালিকা fetch করা
    const fetchAgencies = useCallback(async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams({
                role: "agency", // এখানে সবসময় শুধু agency আসবে, traveler আসবে না
                status: activeTab,
                page: page.toString(),
                limit: rowsPerPage.toString(),
            });

            if (search) {
                params.append("search", search); // email অথবা _id দিয়ে সার্চ
            }

            const res = await fetch(`${API_BASE}/api/admin/users?${params}`, {
                headers: {
                    //   "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            const result = await res.json();

            if (result.success) {
                setAgencies(result.data);
                setStatusCounts(result.statusCounts);
                setTotalPages(result.meta?.totalPages || 1);
            } else {
                setAgencies([]);
            }
        } catch (error) {
            console.error("Failed to fetch agencies:", error);
            setAgencies([]);
        } finally {
            setIsLoading(false);
        }
    }, [activeTab, page, search]);

    useEffect(() => {
        fetchAgencies();
    }, [fetchAgencies]);

    // অ্যাডমিন অ্যাকশন হ্যান্ডলার — API কল করে status আপডেট করে, তারপর লিস্ট রিফ্রেশ করে
    const handleVerify = async (id: string, newStatus: "approved" | "rejected") => {
        try {
            const res = await fetch(`${API_BASE}/api/admin/users/${id}/status`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ status: newStatus }),
            });
            const result = await res.json();

            if (result.success) {
                // সফল হলে স্থানীয়ভাবে ডাটা রিফ্রেশ করা (তালিকা থেকে আইটেমটা বর্তমান ট্যাব থেকে সরে যাবে)
                fetchAgencies();
            } else {
                console.error("Failed to update status:", result.message);
            }
        } catch (error) {
            console.error("Error updating status:", error);
        }
    };

    return (
        <div className="w-full p-6 space-y-6">
            <div className="flex flex-col gap-1">
                <h2 className="text-2xl font-bold text-gray-800">Agency Verification Dashboard</h2>
                <p className="text-sm text-gray-500">Review trade licenses and approve or reject travel agencies.</p>
            </div>

            {/* সার্চ বার — email অথবা agency id দিয়ে খোঁজার জন্য */}
            <div className="max-w-sm">
                <Input
                    placeholder="Search by email or agency ID..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                />
            </div>

            {/* HeroUI Tabs ব্যবহার করে স্ট্যাটাস ফিল্টার */}
            <Tabs
                className="w-full"
                selectedKey={activeTab}
                onSelectionChange={(key) => {
                    setActiveTab(key as string);
                    setPage(1); // ট্যাব বদলালে পেজ ১ এ যাবে
                }}
            >
                <Tabs.ListContainer>
                    <Tabs.List aria-label="Agency verification tabs">
                        <Tabs.Tab id="pending">
                            Pending Requests ({statusCounts.pending})
                            <Tabs.Indicator />
                        </Tabs.Tab>
                        <Tabs.Tab id="approved">
                            Approved Agencies ({statusCounts.approved})
                            <Tabs.Indicator />
                        </Tabs.Tab>
                        <Tabs.Tab id="rejected">
                            Rejected ({statusCounts.rejected})
                            <Tabs.Indicator />
                        </Tabs.Tab>
                    </Tabs.List>
                </Tabs.ListContainer>

                {/* Tab Panel এর ভেতরে Table রেন্ডার */}
                <Tabs.Panel className="pt-4" id={activeTab}>
                    <Table aria-label="Admin agency management table">
                        <Table.ScrollContainer className="overflow-x-auto">
                            <Table.Content className="min-w-[900px]">
                                <Table.Header>
                                    {columns.map((col) => (
                                        <Table.Column key={col.id} id={col.id}>
                                            {col.name}
                                        </Table.Column>
                                    ))}
                                </Table.Header>

                                <Table.Body>
                                    <Table.Collection items={agencies}>
                                        {(agency) => {
                                            const agencyId = typeof agency._id === "object" ? agency._id.$oid : agency._id;
                                            return (
                                                <Table.Row key={agencyId}>
                                                    {/* Name */}
                                                    <Table.Cell className="font-semibold text-gray-900 capitalize">
                                                        {agency.name}
                                                    </Table.Cell>

                                                    {/* Email */}
                                                    <Table.Cell>
                                                        <div className="flex flex-col">
                                                            <span>{agency.email}</span>
                                                            {agency.emailVerified && (
                                                                <span className="text-[10px] text-success font-semibold">Verified Email</span>
                                                            )}
                                                        </div>
                                                    </Table.Cell>

                                                    {/* Phone */}
                                                    <Table.Cell>{agency.phone}</Table.Cell>

                                                    {/* Trade License */}
                                                    <Table.Cell className="font-mono text-xs text-gray-600 bg-gray-50 p-1.0 rounded border border-gray-100 max-w-[150px] truncate">
                                                        {agency.tradeLicense}
                                                    </Table.Cell>

                                                    {/* Region */}
                                                    <Table.Cell>{agency.operatingRegion}</Table.Cell>

                                                    {/* Status */}
                                                    <Table.Cell>
                                                        <Chip color={statusColorMap[agency.status]} size="sm" variant="soft" className="capitalize">
                                                            {agency.status}
                                                        </Chip>
                                                    </Table.Cell>

                                                    {/* Action Buttons */}
                                                    <Table.Cell>
                                                        <div className="flex items-center gap-2">
                                                            {agency.status === "pending" && (
                                                                <>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="primary"
                                                                        className="text-white font-medium"
                                                                        onPress={() => handleVerify(agencyId, "approved")}
                                                                    >
                                                                        Approve
                                                                    </Button>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="danger"
                                                                        onPress={() => handleVerify(agencyId, "rejected")}
                                                                    >
                                                                        Reject
                                                                    </Button>
                                                                </>
                                                            )}
                                                            {agency.status === "approved" && (
                                                                <Button
                                                                    size="sm"
                                                                    variant="danger"
                                                                    onPress={() => handleVerify(agencyId, "rejected")}
                                                                >
                                                                    Suspend / Reject
                                                                </Button>
                                                            )}
                                                            {agency.status === "rejected" && (
                                                                <Button
                                                                    size="sm"
                                                                    variant="primary"
                                                                    onPress={() => handleVerify(agencyId, "approved")}
                                                                >
                                                                    Re-Approve
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </Table.Cell>
                                                </Table.Row>
                                            );
                                        }}
                                    </Table.Collection>
                                </Table.Body>
                            </Table.Content>
                            {totalPages > 1 && (
                                <Table.Footer className="px-4 py-3">
                                    <div className="flex w-full justify-center gap-2">
                                        <Button
                                            isDisabled={page === 1}
                                            size="sm"
                                            variant="secondary"
                                            onPress={() => setPage((p) => Math.max(p - 1, 1))}
                                        >
                                            Previous
                                        </Button>
                                        <span className="flex items-center text-sm text-gray-600">
                                            Page {page} of {totalPages}
                                        </span>
                                        <Button
                                            isDisabled={page === totalPages}
                                            size="sm"
                                            variant="secondary"
                                            onPress={() => setPage((p) => Math.min(p + 1, totalPages))}
                                        >
                                            Next
                                        </Button>
                                    </div>
                                </Table.Footer>
                            )}
                        </Table.ScrollContainer>
                    </Table>
                </Tabs.Panel>
            </Tabs>
        </div>
    );
}