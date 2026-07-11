"use client";

import { Chip, Table, Tabs, Button } from "@heroui/react";
import { useState, useMemo } from "react";

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

// স্ট্যাটাস অনুযায়ী কালার কোড
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

export default function AdminAgencyVerification() {
  // স্যাম্পল ডাটা স্টেট (বাস্তব প্রজেক্টে এটি API থেকে আসবে)
  const [agencies, setAgencies] = useState<Agency[]>([
    {
      _id: { $oid: "6a51413047a97e4de49b1706" },
      name: "programing hero",
      email: "mdsahariyarridoy@gmail.com",
      emailVerified: true,
      role: "agency",
      phone: "+8801310585062",
      tradeLicense: "4154564651649845155",
      operatingRegion: "Bangladesh",
      status: "pending",
      createdAt: { $date: "2026-07-10T19:00:00.605Z" }
    }
  ]);

  // Pagination এবং Tab স্টেট
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState("pending");
  const rowsPerPage = 5;

  // অ্যাডমিন অ্যাকশন হ্যান্ডলার (সরাসরি স্টেট আপডেট করবে যা পরবর্তীতে API-এর সাথে কানেক্ট করা যাবে)
  const handleVerify = (id: string, newStatus: "approved" | "rejected") => {
    setAgencies((prev) =>
      prev.map((agency) => {
        const agencyId = typeof agency._id === "object" ? agency._id.$oid : agency._id;
        if (agencyId === id) {
          return { ...agency, status: newStatus };
        }
        return agency;
      })
    );
    console.log(`Agency ID: ${id} changed status to ${newStatus}`);
  };

  // ট্যাব অনুযায়ী ফিল্টারিং
  const filteredAgencies = useMemo(() => {
    return agencies.filter((agency) => agency.status === activeTab);
  }, [agencies, activeTab]);

  // টোটাল পেজ সংখ্যা
  const pages = Math.ceil(filteredAgencies.length / rowsPerPage);

  // কারেন্ট পেজের আইটেম স্লাইস করা
  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredAgencies.slice(start, end);
  }, [page, filteredAgencies]);

  return (
    <div className="w-full p-6 space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold text-gray-800">Agency Verification Dashboard</h2>
        <p className="text-sm text-gray-500">Review trade licenses and approve or reject travel agencies.</p>
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
              Pending Requests ({agencies.filter(a => a.status === 'pending').length})
              <Tabs.Indicator />
            </Tabs.Tab>
            <Tabs.Tab id="approved">
              Approved Agencies ({agencies.filter(a => a.status === 'approved').length})
              <Tabs.Indicator />
            </Tabs.Tab>
            <Tabs.Tab id="rejected">
              Rejected ({agencies.filter(a => a.status === 'rejected').length})
              <Tabs.Indicator />
            </Tabs.Tab>
          </Tabs.List>
        </Tabs.ListContainer>

        {/* Tab Panel এর ভেতরে Table রেন্ডার */}
        <Tabs.Panel className="pt-4" id={activeTab}>
          <Table 
            aria-label="Admin agency management table"
            bottomContent={
              pages > 1 ? (
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
                    Page {page} of {pages}
                  </span>
                  <Button
                    isDisabled={page === pages}
                    size="sm"
                    variant="flat"
                    onPress={() => setPage((p) => Math.min(p + 1, pages))}
                  >
                    Next
                  </Button>
                </div>
              ) : null
            }
          >
            <Table.ScrollContainer className="overflow-x-auto">
              <Table.Content className="min-w-[900px]">
                <Table.Header>
                  {columns.map((col) => (
                    <Table.Column key={col.id} id={col.id}>
                      {col.name}
                    </Table.Column>
                  ))}
                </Table.Header>

                <Table.Body emptyContent={`No agencies found with '${activeTab}' status.`}>
                  <Table.Collection items={items}>
                    {(agency) => {
                      const agencyId = typeof agency._id === 'object' ? agency._id.$oid : agency._id;
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
                                    color="success" 
                                    className="text-white font-medium"
                                    onPress={() => handleVerify(agencyId, "approved")}
                                  >
                                    Approve
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    color="danger" 
                                    variant="flat"
                                    onPress={() => handleVerify(agencyId, "rejected")}
                                  >
                                    Reject
                                  </Button>
                                </>
                              )}
                              {agency.status === "approved" && (
                                <Button 
                                  size="sm" 
                                  color="danger" 
                                  variant="bordered"
                                  onPress={() => handleVerify(agencyId, "rejected")}
                                >
                                  Suspend / Reject
                                </Button>
                              )}
                              {agency.status === "rejected" && (
                                <Button 
                                  size="sm" 
                                  color="success" 
                                  variant="bordered"
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
            </Table.ScrollContainer>
          </Table>
        </Tabs.Panel>
      </Tabs>
    </div>
  );
}