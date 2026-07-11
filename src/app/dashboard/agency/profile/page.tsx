"use client";

import { useState } from "react";
import { Card, Button, Input, Avatar, Chip } from "@heroui/react";

// এজেন্সি ডাটার ইন্টারফেস
interface AgencyProfile {
  _id: { $oid: string };
  name: string;
  email: string;
  emailVerified: boolean;
  role: string;
  phone: string;
  tradeLicense: string;
  operatingRegion: string;
  status: "pending" | "approved" | "rejected";
  logoUrl?: string;
  address?: string;
  website?: string;
  description?: string;
}

export default function AgencyProfilePage() {
  // ১. ইনিশিয়াল ডাটা (আপনার দেওয়া অবজেক্ট + খালি ফিল্ড)
  const [profile, setProfile] = useState<AgencyProfile>({
    _id: { $oid: "6a51413047a97e4de49b1706" },
    name: "programming hero",
    email: "mdsahariyarridoy@gmail.com",
    emailVerified: true,
    role: "agency",
    phone: "+8801310585062",
    tradeLicense: "4154564651649845155",
    operatingRegion: "Bangladesh",
    status: "pending",
    logoUrl: "", 
    address: "",
    website: "",
    description: "",
  });

  // স্টেট ম্যানেজমেন্ট
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<AgencyProfile>({ ...profile });

  // ইনপুট চেঞ্জ হ্যান্ডলার
  const handleChange = (key: keyof AgencyProfile, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  // সেভ অ্যাকশন
  const handleSave = () => {
    setProfile(formData);
    setIsEditing(false);
  };

  // ক্যানসেল অ্যাকশন
  const handleCancel = () => {
    setFormData({ ...profile });
    setIsEditing(false);
  };

  const statusColors: Record<string, "warning" | "success" | "danger"> = {
    pending: "warning",
    approved: "success",
    rejected: "danger",
  };

  // ভিউ মোডের জন্য একটি সুন্দর রেন্ডার কম্পোনেন্ট
  const DataRow = ({ label, value, placeholder = "Not Provided Yet" }: { label: string, value?: string, placeholder?: string }) => (
    <div className="flex flex-col space-y-1 p-3 rounded-lg bg-gray-50/50 border border-gray-100">
      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</span>
      <span className={`text-sm font-medium ${value ? "text-gray-800" : "text-gray-400 italic"}`}>
        {value || placeholder}
      </span>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* প্রোফাইল হেডার কার্ড */}
      <Card className="p-6 border border-gray-100 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            <Avatar
              src={profile.logoUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150"} 
              className="w-24 h-24 border-3 border-primary shadow-sm"
              isBordered
            />
            <div>
              <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                <h1 className="text-2xl font-bold capitalize text-gray-800">{profile.name}</h1>
                <Chip size="sm" color={statusColors[profile.status]} variant="flat" className="capitalize font-semibold">
                  {profile.status}
                </Chip>
              </div>
              <p className="text-gray-500 text-sm mt-1">
                Role: <span className="capitalize font-semibold text-primary">{profile.role}</span>
              </p>
              <p className="text-xs text-gray-400 mt-0.5">ID: {profile._id.$oid}</p>
            </div>
          </div>

          {!isEditing && (
            <Button color="primary" radius="md" variant="solid" className="font-medium shadow-sm" onPress={() => setIsEditing(true)}>
              Edit Profile
            </Button>
          )}
        </div>
      </Card>

      {/* প্রোফাইল ডিটেইলস সেকশন */}
      <Card className="p-6 border border-gray-100 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b pb-3">
          <h3 className="text-lg font-bold text-gray-800">Agency Information</h3>
          {profile.emailVerified && !isEditing && (
            <Chip size="sm" color="success" variant="dot" className="font-medium">Verified Account</Chip>
          )}
        </div>
        
        {/* ফর্ম অথবা টেক্সট ভিউ গ্রিড */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {isEditing ? (
            <>
              <Input
                isRequired
                label="Agency Name"
                labelPlacement="outside"
                placeholder="Enter agency name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
              />
              <Input
                isDisabled
                label="Email Address (Fixed)"
                labelPlacement="outside"
                value={formData.email}
              />
              <Input
                isRequired
                label="Phone Number"
                labelPlacement="outside"
                placeholder="Enter phone number"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
              />
              <Input
                isRequired
                label="Trade License Number"
                labelPlacement="outside"
                placeholder="Enter trade license"
                value={formData.tradeLicense}
                onChange={(e) => handleChange("tradeLicense", e.target.value)}
              />
              <Input
                label="Operating Region"
                labelPlacement="outside"
                placeholder="e.g. Bangladesh"
                value={formData.operatingRegion}
                onChange={(e) => handleChange("operatingRegion", e.target.value)}
              />
              <Input
                label="Website URL"
                labelPlacement="outside"
                placeholder="https://example.com"
                value={formData.website || ""}
                onChange={(e) => handleChange("website", e.target.value)}
              />
              <Input
                label="Logo Image URL"
                labelPlacement="outside"
                placeholder="https://image-link.com/logo.png"
                value={formData.logoUrl || ""}
                onChange={(e) => handleChange("logoUrl", e.target.value)}
              />
              <Input
                label="Office Address"
                labelPlacement="outside"
                placeholder="Enter office full address"
                value={formData.address || ""}
                onChange={(e) => handleChange("address", e.target.value)}
              />
            </>
          ) : (
            <>
              <DataRow label="Agency Name" value={profile.name} />
              <DataRow label="Email Address" value={profile.email} />
              <DataRow label="Phone Number" value={profile.phone} />
              <DataRow label="Trade License" value={profile.tradeLicense} />
              <DataRow label="Operating Region" value={profile.operatingRegion} />
              <DataRow label="Website URL" value={profile.website} placeholder="No website linked" />
              <DataRow label="Logo URL" value={profile.logoUrl} placeholder="No custom logo link" />
              <DataRow label="Office Address" value={profile.address} placeholder="Address details not added yet" />
            </>
          )}
        </div>

        {/* Description বাটন বা টেক্সট এরিয়া */}
        <div className="w-full space-y-1">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
            About Agency / Description
          </label>
          {isEditing ? (
            <textarea
              className="w-full p-3 rounded-xl border text-sm transition-all outline-none min-h-[120px] bg-white border-gray-300 focus:border-primary"
              placeholder="Write something about your agency..."
              value={formData.description || ""}
              onChange={(e) => handleChange("description", e.target.value)}
            />
          ) : (
            <div className="p-4 rounded-lg bg-gray-50/50 border border-gray-100 min-h-[80px]">
              <p className={`text-sm leading-relaxed ${profile.description ? "text-gray-700" : "text-gray-400 italic"}`}>
                {profile.description || "Write a summary about your travel packages, agency history, and specialities..."}
              </p>
            </div>
          )}
        </div>

        {/* বটম সেভ ও ক্যানসেল বাটন (এডিট মোডে দৃশ্যমান) */}
        {isEditing && (
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <Button color="danger" variant="flat" radius="md" className="font-medium" onPress={handleCancel}>
              Cancel
            </Button>
            <Button color="success" variant="solid" radius="md" className="text-white font-medium shadow-sm" onPress={handleSave}>
              Save Changes
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}