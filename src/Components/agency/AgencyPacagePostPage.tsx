"use client";
import Link from "next/link";
import { Chip, Table, Tabs, Button } from "@heroui/react";
import { useState, useMemo, useEffect, useCallback } from "react";
import { authClient } from "@/lib/auth-client";
import { toast } from "react-toastify";

// আপনার MongoDB ডাটার স্ট্রাকচার অনুযায়ী টাইপ ডিফাইন করা হয়েছে
interface TourPackage {
    _id: { $oid: string } | string;
    agencyId: string;
    agencyName: string;
    agencyEmail: string;
    agencyPhone: string;
    title: string;
    destination: string;
    category: string;
    basePrice: number;
    discountPrice?: number;
    coverImage: string;
    status: "published" | "draft" | "unpublished";
    durationDays?: number | null;
    durationNights?: number | null;
}

interface StatusCounts {
    published: number;
    unpublished: number;
    draft: number;
}

// স্ট্যাটাস কালার ম্যাপ
const statusColorMap: Record<string, "success" | "warning" | "danger"> = {
    published: "success",
    unpublished: "warning",
    draft: "danger",
};

// টেবিলের কলাম সমূহ
const columns = [
    { id: "coverImage", name: "Image" },
    { id: "title", name: "Package Title" },
    { id: "destination", name: "Destination" },
    { id: "category", name: "Category" },
    { id: "price", name: "Price (Base/Discount)" },
    { id: "status", name: "Status" },
    { id: "actions", name: "Actions" },
];

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:2000";

export default function AgencyPackagesManager() {
    const { data: session } = authClient.useSession();
    const user = session?.user;
    console.log("Logged-in user: vvvvvv", user);
    const agencyId = user?.id; // আপনার dynamic agencyId বসাবেন
    // --- সব state আগে ডিক্লেয়ার করা হয়েছে, useEffect এর আগে ---
    const [packages, setPackages] = useState<TourPackage[]>([]);
    const [statusCounts, setStatusCounts] = useState<StatusCounts>({
        published: 0,
        unpublished: 0,
        draft: 0,
    });
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

    const [page, setPage] = useState(1);
    const [activeTab, setActiveTab] = useState("published");
    const rowsPerPage = 5;

    // সার্ভার থেকে ডাটা ফেচ করা (status + page দুটোই সার্ভারেই হ্যান্ডেল হচ্ছে)
    const fetchPackages = useCallback(async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams({
                agencyId: agencyId || "",
                status: activeTab,
                page: page.toString(),
                limit: rowsPerPage.toString(),
            });

            const res = await fetch(
                `${API_BASE}/api/agency/packages?${params}`
            );
            const result = await res.json();

            if (result.success) {
                setPackages(result.data);
                setStatusCounts(result.statusCounts);
                setTotalPages(result.meta?.totalPages || 1);
            } else {
                setPackages([]);
            }
        } catch (error) {
            console.error("Failed to fetch packages:", error);
            setPackages([]);
        } finally {
            setIsLoading(false);
        }
    }, [activeTab, page]);

    useEffect(() => {
        fetchPackages();
    }, [fetchPackages]);

    // সার্ভার থেকেই ফিল্টার ও পেজিনেট করা ডাটা আসছে, তাই এখানে আর আলাদা করে
    // filter/slice করার দরকার নেই — সরাসরি packages ব্যবহার করা হলো
    const items = useMemo(() => packages, [packages]);

    // --- Publish / Unpublish টগল করার আসল ফাংশন — এখন API কল করছে ---
    const handleStatusChange = async (
        id: string,
        newStatus: "published" | "unpublished" | "draft"
    ) => {
        setActionLoadingId(id);
        try {
            const res = await fetch(
                `${API_BASE}/api/agency/packages/${id}/status`,
                {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        newStatus: newStatus,
                        userid: user?.id, // শুধু এটাই যথেষ্ট, backend নিজে DB থেকে status verify করবে
                    })
                }
            );
            const result = await res.json();

            if (result.success == false && result.message) {
                toast.error(`${result.message}`);
            }
            if (result.success) {
                // স্ট্যাটাস পরিবর্তনের পর আইটেমটা বর্তমান ট্যাব থেকে সরে যাবে,
                // তাই লিস্টটা আবার fetch করে নেওয়া হচ্ছে
                fetchPackages();
            } else {
                console.error("Failed to update status:", result.message);
            }
        } catch (error) {
            console.error("Error updating status:", error);
        } finally {
            setActionLoadingId(null);
        }
    };

    const handleEdit = (id: string) => console.log("Edit Package ID:", id);

    const handleDelete = async (id: string) => {
        setActionLoadingId(id);
        try {
            const res = await fetch(`${API_BASE}/api/agency/packages/${id}`, {
                method: "DELETE",
            });
            const result = await res.json();

            if (result.success) {
                fetchPackages();
            } else {
                console.error("Failed to delete package:", result.message);
            }
        } catch (error) {
            console.error("Error deleting package:", error);
        } finally {
            setActionLoadingId(null);
        }
    };

    return (
        <div className="w-full p-6 space-y-6">
            <div className="flex flex-col gap-2">
                <h2 className="text-2xl font-bold">Manage Tour Packages</h2>
                <p className="text-sm text-gray-500">
                    View, edit, or remove your registered agency packages.
                </p>
            </div>

            {/* HeroUI Tabs ব্যবহার করে ক্যাটাগরি ফিল্টার */}
            <Tabs
                className="w-full"
                selectedKey={activeTab}
                onSelectionChange={(key) => {
                    setActiveTab(key as string);
                    setPage(1); // ট্যাব পরিবর্তন করলে পেজ ১ এ রিসেট হবে
                }}
            >
                <Tabs.ListContainer>
                    <Tabs.List aria-label="Package status filters">
                        <Tabs.Tab id="published">
                            Published ({statusCounts.published})
                            <Tabs.Indicator />
                        </Tabs.Tab>
                        <Tabs.Tab id="unpublished">
                            Unpublished ({statusCounts.unpublished})
                            <Tabs.Indicator />
                        </Tabs.Tab>
                        <Tabs.Tab id="draft">
                            Drafts ({statusCounts.draft})
                            <Tabs.Indicator />
                        </Tabs.Tab>
                    </Tabs.List>
                </Tabs.ListContainer>

                {/* Tab Panel এর ভেতরে Table লোড করা */}
                <Tabs.Panel className="pt-4" id={activeTab}>
                    <Table
                        aria-label="Agency tour packages dashboard table"
                        bottomContent={
                            totalPages > 1 ? (
                                <div className="flex w-full justify-center gap-2">
                                    <Button
                                        isDisabled={page === 1}
                                        size="sm"
                                        variant="flat"
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
                                        variant="flat"
                                        onPress={() =>
                                            setPage((p) => Math.min(p + 1, totalPages))
                                        }
                                    >
                                        Next
                                    </Button>
                                </div>
                            ) : null
                        }
                    >
                        <Table.ScrollContainer className="overflow-x-auto">
                            <Table.Content className="min-w-[800px]">
                                <Table.Header>
                                    {columns.map((col) => (
                                        <Table.Column key={col.id} id={col.id}>
                                            {col.name}
                                        </Table.Column>
                                    ))}
                                </Table.Header>

                                <Table.Body
                                    emptyContent={
                                        isLoading
                                            ? "Loading..."
                                            : "No packages found for this status."
                                    }
                                >
                                    <Table.Collection items={items}>
                                        {(item) => {
                                            const packageId =
                                                typeof item._id === "object"
                                                    ? item._id.$oid
                                                    : item._id;
                                            const isBusy = actionLoadingId === packageId;
                                            return (
                                                <Table.Row key={packageId}>
                                                    {/* Image Column */}
                                                    <Table.Cell>
                                                        <img
                                                            src={item.coverImage}
                                                            alt={item.title}
                                                            className="w-16 h-10 object-cover rounded-md border"
                                                        />
                                                    </Table.Cell>

                                                    {/* Title Column */}
                                                    <Table.Cell className="font-medium text-gray-900">
                                                        {item.title}
                                                    </Table.Cell>

                                                    {/* Destination Column */}
                                                    <Table.Cell>{item.destination}</Table.Cell>

                                                    {/* Category Column */}
                                                    <Table.Cell>
                                                        <Chip size="sm" variant="flat">
                                                            {item.category}
                                                        </Chip>
                                                    </Table.Cell>

                                                    {/* Price Column */}
                                                    <Table.Cell>
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-semibold">
                                                                ${item.basePrice}
                                                            </span>
                                                            {item.discountPrice && (
                                                                <span className="text-xs text-gray-400 line-through">
                                                                    ${item.discountPrice}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </Table.Cell>

                                                    {/* Status Column */}
                                                    <Table.Cell>
                                                        <Chip
                                                            color={statusColorMap[item.status]}
                                                            size="sm"
                                                            variant="soft"
                                                            className="capitalize"
                                                        >
                                                            {item.status}
                                                        </Chip>
                                                    </Table.Cell>

                                                    {/* Actions Column */}
                                                    <Table.Cell>
                                                        <div className="flex items-center gap-2">
                                                            <Link
                                                                href={`/tours/Tourpackagedetailspage/${item._id}`}
                                                                className="text-blue-600 hover:underline text-sm"
                                                            >
                                                                <Button
                                                                    size="sm"
                                                                    color="primary"
                                                                    variant="flat"
                                                                    isDisabled={isBusy}
                                                                    onPress={() => handleEdit(packageId)}
                                                                    onClick={() => console.log("rrrrrrrrrfe", packageId)}
                                                                >
                                                                    Edit
                                                                </Button>
                                                            </Link>

                                                            {/* status অনুযায়ী Publish বা Unpublish বাটন দেখানো হচ্ছে */}
                                                            {item.status === "published" ? (
                                                                <Button
                                                                    size="sm"
                                                                    color="warning"
                                                                    variant="flat"
                                                                    isLoading={isBusy}
                                                                    onPress={() =>
                                                                        handleStatusChange(packageId, "unpublished")
                                                                    }
                                                                >
                                                                    Unpublish
                                                                </Button>
                                                            ) : (
                                                                <Button
                                                                    size="sm"
                                                                    color="success"
                                                                    variant="flat"
                                                                    isLoading={isBusy}
                                                                    onPress={() =>
                                                                        handleStatusChange(packageId, "published")
                                                                    }
                                                                >
                                                                    Publish
                                                                </Button>
                                                            )}

                                                            <Button
                                                                size="sm"
                                                                color="danger"
                                                                variant="flat"
                                                                isLoading={isBusy}
                                                                onPress={() => handleDelete(packageId)}
                                                            >
                                                                Delete
                                                            </Button>
                                                        </div>
                                                    </Table.Cell>
                                                </Table.Row>
                                            );
                                        }}
                                    </Table.Collection>
                                </Table.Body>
                            </Table.Content>
                        </Table.ScrollContainer>
                    </Table>
                </Tabs.Panel>
            </Tabs>
        </div>
    );
}