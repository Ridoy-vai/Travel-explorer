"use client";

import { Chip, Table, Tabs, Button } from "@heroui/react";
import { useState, useMemo } from "react";

// আপনার MongoDB ডাটার স্ট্রাকচার অনুযায়ী টাইপ ডিফাইন করা হয়েছে
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
  status: "published" | "draft" | "unpublished"; // পরবর্তীতে ব্যবহারের জন্য
  durationDays?: number | null;
  durationNights?: number | null;
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
  { id: "actions", name: "Actions" }, // Edit, Delete, Unpublish এর জন্য
];

export default function AgencyPackagesManager() {
  // বাস্তব প্রজেক্টে এই ডাটাটি আপনি useEffect দিয়ে `http://localhost:2000/api/agency/packages?agencyId=...` থেকে fetch করে আনবেন।
  // এখানে আপনার দেওয়া স্যাম্পল ডাটাটি স্টেট হিসেবে রাখা হলো।
  const [packages, setPackages] = useState<TourPackage[]>([
    {
      _id: { $oid: "6a51f185f8fee32d48a019ff" },
      agencyId: "6a51413047a97e4de49b1706",
      agencyName: "programming hero",
      agencyEmail: "mdsahariyarridoy@gmail.com",
      agencyPhone: "+8801310585062",
      title: "3 day 2 night Cox's Bazar",
      destination: "Cox's Bazar",
      category: "Beach",
      basePrice: 32332,
      discountPrice: 34234,
      coverImage: "https://i.ibb.co/pBCXxY5b/610954616-1300947615386471-5115642471006224147-n.jpg",
      status: "published",
    }
  ]);

  // Pagination এবং Tab কন্ট্রোল করার জন্য স্টেট
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState("published");
  const rowsPerPage = 5; // প্রতি পেজে ৫টি করে ডাটা দেখাবে

  // ফিল্টারিং: ট্যাব অনুযায়ী ডাটা আলাদা করা
  const filteredPackages = useMemo(() => {
    return packages.filter((pkg) => pkg.status === activeTab);
  }, [packages, activeTab]);

  // কতগুলো টোটাল পেজ লাগবে তা হিসাব করা
  const pages = Math.ceil(filteredPackages.length / rowsPerPage);

  // কারেন্ট পেজের ডাটা স্লাইস করা
  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredPackages.slice(start, end);
  }, [page, filteredPackages]);

  // অ্যাকশন হ্যান্ডলার (ভবিষ্যতে API এর সাথে যুক্ত করার জন্য প্রস্তুত রাখা হলো)
  const handleEdit = (id: string) => console.log("Edit Package ID:", id);
  const handleUnpublish = (id: string) => console.log("Unpublish Package ID:", id);
  const handleDelete = (id: string) => console.log("Delete Package ID:", id);

  return (
    <div className="w-full p-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold">Manage Tour Packages</h2>
        <p className="text-sm text-gray-500">View, edit, or remove your registered agency packages.</p>
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
              Published ({packages.filter(p => p.status === 'published').length})
              <Tabs.Indicator />
            </Tabs.Tab>
            <Tabs.Tab id="unpublished">
              Unpublished (0)
              <Tabs.Indicator />
            </Tabs.Tab>
            <Tabs.Tab isDisabled id="draft">
              Drafts (Disabled)
              <Tabs.Indicator />
            </Tabs.Tab>
          </Tabs.List>
        </Tabs.ListContainer>

        {/* Tab Panel এর ভেতরে Table লোড করা */}
        <Tabs.Panel className="pt-4" id={activeTab}>
          <Table 
            aria-label="Agency tour packages dashboard table"
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
              <Table.Content className="min-w-[800px]">
                <Table.Header>
                  {columns.map((col) => (
                    <Table.Column key={col.id} id={col.id}>
                      {col.name}
                    </Table.Column>
                  ))}
                </Table.Header>

                <Table.Body emptyContent={"No packages found for this status."}>
                  <Table.Collection items={items}>
                    {(item) => {
                      const packageId = typeof item._id === 'object' ? item._id.$oid : item._id;
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
                          <Table.Cell className="font-medium text-gray-900">{item.title}</Table.Cell>
                          
                          {/* Destination Column */}
                          <Table.Cell>{item.destination}</Table.Cell>
                          
                          {/* Category Column */}
                          <Table.Cell>
                            <Chip size="sm" variant="flat">{item.category}</Chip>
                          </Table.Cell>
                          
                          {/* Price Column */}
                          <Table.Cell>
                            <div className="flex flex-col">
                              <span className="text-sm font-semibold">${item.basePrice}</span>
                              {item.discountPrice && (
                                <span className="text-xs text-gray-400 line-through">${item.discountPrice}</span>
                              )}
                            </div>
                          </Table.Cell>
                          
                          {/* Status Column */}
                          <Table.Cell>
                            <Chip color={statusColorMap[item.status]} size="sm" variant="soft" className="capitalize">
                              {item.status}
                            </Chip>
                          </Table.Cell>
                          
                          {/* Actions Column (Edit, Unpublish, Delete বাটন) */}
                          <Table.Cell>
                            <div className="flex items-center gap-2">
                              <Button 
                                size="sm" 
                                color="primary" 
                                variant="flat"
                                onPress={() => handleEdit(packageId)}
                              >
                                Edit
                              </Button>
                              <Button 
                                size="sm" 
                                color="warning" 
                                variant="flat"
                                onPress={() => handleUnpublish(packageId)}
                              >
                                Unpublish
                              </Button>
                              <Button 
                                size="sm" 
                                color="danger" 
                                variant="flat"
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