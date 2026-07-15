"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Button, Input } from "@heroui/react";

// এজেন্সি ডাটার ইন্টারফেস
interface AgencyProfile {
  _id: { $oid: string } | string;
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

const API_BASE = "http://localhost:2000";
const AGENCY_ID = "6a51413047a97e4de49b1706"; // আপনার dynamic agencyId / auth session থেকে বসাবেন

// ImgBB API কী — .env এ NEXT_PUBLIC_IMGBB_API_KEY হিসেবে রাখুন, imgbb.com থেকে ফ্রি কী নেওয়া যায়
const IMGBB_API_KEY = process.env.NEXT_PUBLIC_IMGBB_API_KEY || "";

const statusMeta: Record<
  string,
  { label: string; ring: string; dot: string; text: string }
> = {
  approved: {
    label: "Verified Agency",
    ring: "ring-[#C9A227]/40",
    dot: "bg-[#3B7A57]",
    text: "text-[#3B7A57]",
  },
  pending: {
    label: "Verification Pending",
    ring: "ring-white/10",
    dot: "bg-[#C9A227]",
    text: "text-[#C9A227]",
  },
  rejected: {
    label: "Verification Rejected",
    ring: "ring-white/10",
    dot: "bg-[#B4453D]",
    text: "text-[#B4453D]",
  },
};

export default function AgencyProfilePage() {
  const [profile, setProfile] = useState<AgencyProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<AgencyProfile>>({});
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // সার্ভার থেকে প্রোফাইল ফেচ করা
  const fetchProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/agency/profile/${AGENCY_ID}`);
      const result = await res.json();
      if (result.success) {
        setProfile(result.data);
        setFormData(result.data);
      } else {
        setError(result.message || "Failed to load profile");
      }
    } catch (err) {
      setError("Could not reach the server");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleChange = (key: keyof AgencyProfile, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  // ---------- ImgBB তে লোগো আপলোড ----------
  const handleLogoFileSelect = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!IMGBB_API_KEY) {
      setError(
        "ImgBB API key configured নেই — .env এ NEXT_PUBLIC_IMGBB_API_KEY বসান"
      );
      return;
    }

    // শুধু ইমেজ ফাইল, ৩২MB এর নিচে (ImgBB এর লিমিট)
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    setIsUploadingLogo(true);
    setError(null);
    try {
      const body = new FormData();
      body.append("image", file);

      const res = await fetch(
        `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
        {
          method: "POST",
          body,
        }
      );
      const result = await res.json();

      if (result.success) {
        const uploadedUrl: string = result.data.url;
        handleChange("logoUrl", uploadedUrl);
      } else {
        setError(result.error?.message || "Image upload failed");
      }
    } catch (err) {
      setError("Could not upload image");
    } finally {
      setIsUploadingLogo(false);
      // একই ফাইল আবার সিলেক্ট করলেও যাতে onChange ফায়ার হয়
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/agency/profile/${AGENCY_ID}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          tradeLicense: formData.tradeLicense,
          operatingRegion: formData.operatingRegion,
          website: formData.website,
          logoUrl: formData.logoUrl,
          address: formData.address,
          description: formData.description,
        }),
      });
      const result = await res.json();
      if (result.success) {
        setProfile(result.data);
        setFormData(result.data);
        setIsEditing(false);
      } else {
        setError(result.message || "Failed to save changes");
      }
    } catch (err) {
      setError("Could not reach the server");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(profile || {});
    setIsEditing(false);
    setError(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-[#FAF9F5]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#14213D]/20 border-t-[#14213D] rounded-full animate-spin" />
          <p className="text-sm text-[#6B7280] tracking-wide">
            Loading agency record…
          </p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-[#FAF9F5]">
        <p className="text-sm text-[#B4453D]">
          {error || "Agency profile could not be found."}
        </p>
      </div>
    );
  }

  const meta = statusMeta[profile.status];
  const agencyId =
    typeof profile._id === "object" ? profile._id.$oid : profile._id;
  const displayLogo = isEditing ? formData.logoUrl : profile.logoUrl;

  return (
    <div className="min-h-screen bg-[#FAF9F5] py-10">
      <div className="max-w-4xl mx-auto px-6 space-y-6">
        {/* ---------- ID CARD HERO ---------- */}
        <div className="relative rounded-2xl bg-[#14213D] text-[#F5F1E8] overflow-hidden shadow-[0_20px_50px_-15px_rgba(20,33,61,0.5)]">
          {/* subtle guilloché-style background texture, like a document security pattern */}
          <div
            className="absolute inset-0 opacity-[0.06] pointer-events-none"
            style={{
              backgroundImage:
                "repeating-linear-gradient(115deg, #F5F1E8 0px, #F5F1E8 1px, transparent 1px, transparent 14px)",
            }}
          />

          {/* verification stamp, rotated like an official seal */}
          {profile.status === "approved" && (
            <div className="absolute top-6 right-6 sm:top-8 sm:right-10 rotate-[10deg] select-none">
              <div className="w-20 h-20 rounded-full border-2 border-[#C9A227] flex items-center justify-center">
                <span className="text-[9px] tracking-[0.15em] text-[#C9A227] font-semibold text-center leading-tight uppercase">
                  Verified
                  <br />
                  Partner
                </span>
              </div>
            </div>
          )}

          <div className="relative px-8 py-9 sm:px-10 sm:py-10">
            <p className="text-[11px] tracking-[0.25em] uppercase text-[#C9A227] font-semibold mb-6">
              Agency Credential · No. {agencyId.slice(-8).toUpperCase()}
            </p>

            <div className="flex flex-col sm:flex-row sm:items-end gap-6">
              <div className="flex items-end gap-5">
                {/* লোগো + আপলোড ওভারলে */}
                <div className="relative w-20 h-20 flex-shrink-0 group">
                  <div className="w-20 h-20 rounded-xl overflow-hidden border border-[#F5F1E8]/20 bg-[#1E2C4F]">
                    {displayLogo ? (
                      <img
                        src={displayLogo}
                        alt={profile.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl font-serif text-[#C9A227]">
                        {profile.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  {isEditing && (
                    <>
                      <input
                        ref={fileInputRef}
                        type="file"
                        name="logoFile"
                        accept="image/*"
                        className="hidden"
                        onChange={handleLogoFileSelect}
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploadingLogo}
                        className="absolute inset-0 rounded-xl flex items-center justify-center bg-[#14213D]/70 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-medium tracking-wide text-[#F5F1E8]"
                      >
                        {isUploadingLogo ? (
                          <span className="w-4 h-4 border-2 border-[#F5F1E8]/40 border-t-[#F5F1E8] rounded-full animate-spin" />
                        ) : (
                          "Change"
                        )}
                      </button>
                    </>
                  )}
                </div>

                <div>
                  <h1
                    className="text-3xl sm:text-4xl font-medium capitalize leading-tight"
                    style={{ fontFamily: "'Newsreader', Georgia, serif" }}
                  >
                    {profile.name}
                  </h1>
                  <p className="text-[13px] text-[#A8AFC0] mt-1 font-mono tracking-wide">
                    {profile.operatingRegion || "Region not set"}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-6 pt-6 border-t border-white/10">
              <span className={`flex items-center gap-2 text-sm font-medium ${meta.text}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                {meta.label}
              </span>
              {profile.emailVerified && (
                <span className="text-sm text-[#A8AFC0]">Email confirmed</span>
              )}
              {!isEditing && (
                <Button
                  size="sm"
                  variant="primary"
                  className="ml-auto bg-[#C9A227] text-[#14213D] font-semibold px-5 hover:bg-[#DBB53B]"
                  onPress={() => setIsEditing(true)}
                >
                  Edit profile
                </Button>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-[#B4453D]/30 bg-[#B4453D]/5 px-4 py-3 text-sm text-[#B4453D]">
            {error}
          </div>
        )}

        {/* ---------- DETAILS RECORD ---------- */}
        <div className="rounded-2xl bg-white border border-[#E7E3D8] shadow-sm">
          <div className="px-8 py-5 border-b border-[#EEEAE0] flex items-center justify-between">
            <h3
              className="text-lg font-medium text-[#14213D]"
              style={{ fontFamily: "'Newsreader', Georgia, serif" }}
            >
              Registration details
            </h3>
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#9A9484]">
              record #{agencyId.slice(-6)}
            </span>
          </div>

          <div className="p-8 space-y-6">
            {isEditing ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* ১. Agency Name */}
                <span>
                  <label htmlFor="name" className="text-[11px] font-semibold text-[#9A9484] uppercase tracking-[0.12em] block mb-2">
                    Agency name
                  </label>
                  <Input
                    required
                    id="name"
                    name="name"
                    autoComplete="organization"
                    placeholder="Enter agency name"
                    value={formData.name || ""}
                    onChange={(e) => handleChange("name", e.target.value)}
                  />
                </span>

                {/* ২. Email (Fixed) */}
                <span>
                  <label htmlFor="email" className="text-[11px] font-semibold text-[#9A9484] uppercase tracking-[0.12em] block mb-2">
                    Email address (fixed)
                  </label>
                  <Input
                    disabled
                    id="email"
                    name="email"
                    autoComplete="email"
                    type="email"
                    value={formData.email || ""}
                  />
                </span>

                {/* ৩. Phone Number */}
                <span>
                  <label htmlFor="phone" className="text-[11px] font-semibold text-[#9A9484] uppercase tracking-[0.12em] block mb-2">
                    Phone number
                  </label>
                  <Input
                    required
                    id="phone"
                    name="phone"
                    autoComplete="tel"
                    type="tel"
                    placeholder="Enter phone number"
                    value={formData.phone || ""}
                    onChange={(e) => handleChange("phone", e.target.value)}
                  />
                </span>

                {/* ৪. Trade License */}
                <span>
                  <label htmlFor="tradeLicense" className="text-[11px] font-semibold text-[#9A9484] uppercase tracking-[0.12em] block mb-2">
                    Trade license number
                  </label>
                  <Input
                    required
                    id="tradeLicense"
                    name="tradeLicense"
                    autoComplete="off"
                    placeholder="Enter trade license"
                    className="font-mono"
                    value={formData.tradeLicense || ""}
                    onChange={(e) => handleChange("tradeLicense", e.target.value)}
                  />
                </span>

                {/* ৫. Operating Region */}
                <span>
                  <label htmlFor="operatingRegion" className="text-[11px] font-semibold text-[#9A9484] uppercase tracking-[0.12em] block mb-2">
                    Operating region
                  </label>
                  <Input
                    id="operatingRegion"
                    name="operatingRegion"
                    autoComplete="address-level1"
                    placeholder="e.g. Bangladesh"
                    value={formData.operatingRegion || ""}
                    onChange={(e) => handleChange("operatingRegion", e.target.value)}
                  />
                </span>

                {/* ৬. Website URL */}
                <span>
                  <label htmlFor="website" className="text-[11px] font-semibold text-[#9A9484] uppercase tracking-[0.12em] block mb-2">
                    Website URL
                  </label>
                  <Input
                    id="website"
                    name="website"
                    autoComplete="url"
                    type="url"
                    placeholder="https://example.com"
                    value={formData.website || ""}
                    onChange={(e) => handleChange("website", e.target.value)}
                  />
                </span>

                {/* ৭. Office Address */}
                <span>
                  <label htmlFor="address" className="text-[11px] font-semibold text-[#9A9484] uppercase tracking-[0.12em] block mb-2">
                    Office address
                  </label>
                  <Input
                    id="address"
                    name="address"
                    autoComplete="street-address"
                    placeholder="Enter office full address"
                    value={formData.address || ""}
                    onChange={(e) => handleChange("address", e.target.value)}
                  />
                </span>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
                <DataRow label="Agency name" value={profile.name} />
                <DataRow label="Email address" value={profile.email} />
                <DataRow label="Phone number" value={profile.phone} mono />
                <DataRow label="Trade license" value={profile.tradeLicense} mono />
                <DataRow label="Operating region" value={profile.operatingRegion} />
                <DataRow label="Website" value={profile.website} placeholder="No website linked" isLink />
                <DataRow label="Office address" value={profile.address} placeholder="Not added yet" wide />
              </div>
            )}

            {/* Description */}
            <div className="pt-2">
              <label
                htmlFor="description"
                className="text-[11px] font-semibold text-[#9A9484] uppercase tracking-[0.12em] block mb-2"
              >
                About the agency
              </label>
              {isEditing ? (
                <textarea
                  id="description"
                  name="description"
                  autoComplete="off"
                  className="w-full p-4 rounded-xl border text-sm leading-relaxed transition-colors outline-none min-h-[120px] bg-[#FAF9F5] border-[#E7E3D8] focus:border-[#14213D]"
                  placeholder="Write a summary about your travel packages, agency history, and specialities…"
                  value={formData.description || ""}
                  onChange={(e) => handleChange("description", e.target.value)}
                />
              ) : (
                <p
                  className={`text-sm leading-relaxed rounded-xl bg-[#FAF9F5] border border-[#EEEAE0] p-4 ${
                    profile.description ? "text-[#3E3B34]" : "text-[#9A9484] italic"
                  }`}
                >
                  {profile.description ||
                    "No description added yet — tell travelers what makes your packages worth booking."}
                </p>
              )}
            </div>
          </div>

          {isEditing && (
            <div className="flex items-center justify-end gap-3 px-8 py-5 border-t border-[#EEEAE0] bg-[#FCFBF8] rounded-b-2xl">
              <Button
                variant="secondary"
                className="font-medium text-[#6B6459]"
                onPress={handleCancel}
                isDisabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                className="bg-[#14213D] text-white font-medium px-6 hover:bg-[#1E2C4F]"
                onPress={handleSave}
                isDisabled={isSaving || isUploadingLogo}
              >
                {isSaving ? "Saving…" : "Save changes"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ভিউ মোডের জন্য একটি রেকর্ড-স্টাইল রো
function DataRow({
  label,
  value,
  placeholder = "Not provided yet",
  mono = false,
  wide = false,
  isLink = false,
}: {
  label: string;
  value?: string;
  placeholder?: string;
  mono?: boolean;
  wide?: boolean;
  isLink?: boolean;
}) {
  return (
    <div className={`flex flex-col gap-1.5 min-w-0 ${wide ? "sm:col-span-2" : ""}`}>
      <span className="block text-[11px] font-semibold text-[#9A9484] uppercase tracking-[0.12em]">
        {label}
      </span>
      {isLink && value ? (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-[15px] text-[#14213D] underline decoration-[#C9A227] decoration-2 underline-offset-2 break-all hover:text-[#1E2C4F]"
        >
          {value}
        </a>
      ) : (
        <span
          className={`block text-[15px] break-words ${
            mono ? "font-mono tracking-tight" : "font-normal"
          } ${value ? "text-[#14213D]" : "text-[#B3ADA0] italic"}`}
        >
          {value || placeholder}
        </span>
      )}
    </div>
  );
}