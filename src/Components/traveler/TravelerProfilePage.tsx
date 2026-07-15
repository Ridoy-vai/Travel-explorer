"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Button, Input } from "@heroui/react";

// ট্রাভেলার ডাটার ইন্টারফেস
interface TravelerProfile {
    _id: { $oid: string } | string;
    name: string;
    email: string;
    emailVerified: boolean;
    role: string;
    phone: string;
    status: "active" | "suspended" | "inactive";
    avatarUrl?: string; // ঐচ্ছিক — backend এ ফিল্ড না থাকলে upload অংশ বাদ দিতে পারো
    createdAt: { $date: string } | string;
    updatedAt?: { $date: string } | string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:2000";

// ImgBB API কী — .env এ NEXT_PUBLIC_IMGBB_API_KEY হিসেবে রাখুন
const IMGBB_API_KEY = process.env.NEXT_PUBLIC_IMGBB_API_KEY || "";

const statusMeta: Record<
    string,
    { label: string; dot: string; text: string }
> = {
    active: {
        label: "Active Traveler",
        dot: "bg-[#3B7A57]",
        text: "text-[#3B7A57]",
    },
    suspended: {
        label: "Account Suspended",
        dot: "bg-[#B4453D]",
        text: "text-[#B4453D]",
    },
    inactive: {
        label: "Account Inactive",
        dot: "bg-[#C9A227]",
        text: "text-[#C9A227]",
    },
};

function formatDate(value?: { $date: string } | string) {
    if (!value) return null;
    const raw = typeof value === "object" ? value.$date : value;
    const d = new Date(raw);
    if (isNaN(d.getTime())) return null;
    return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export default function TravelerProfilePage({ travelerId: usertravelerId   }: { travelerId: string }) {
    // const TRAVELER_ID = travelerId // আপনার dynamic travelerId / auth session থেকে বসাবেন
    const [profile, setProfile] = useState<TravelerProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<Partial<TravelerProfile>>({});
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // সার্ভার থেকে প্রোফাইল ফেচ করা
    const fetchProfile = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API_BASE}/api/traveler/profile/${usertravelerId}`);
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

    const handleChange = (key: keyof TravelerProfile, value: string) => {
        setFormData((prev) => ({ ...prev, [key]: value }));
    };

    // ---------- ImgBB তে অ্যাভাটার আপলোড ----------
    const handleAvatarFileSelect = async (
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

        if (!file.type.startsWith("image/")) {
            setError("Please select an image file");
            return;
        }

        setIsUploadingAvatar(true);
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
                handleChange("avatarUrl", uploadedUrl);
            } else {
                setError(result.error?.message || "Image upload failed");
            }
        } catch (err) {
            setError("Could not upload image");
        } finally {
            setIsUploadingAvatar(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        setError(null);
        try {
            const res = await fetch(`${API_BASE}/api/traveler/profile/${usertravelerId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: formData.name,
                    phone: formData.phone,
                    avatarUrl: formData.avatarUrl,
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
                        Loading traveler record…
                    </p>
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center bg-[#FAF9F5]">
                <p className="text-sm text-[#B4453D]">
                    {error || "Traveler profile could not be found."}
                </p>
            </div>
        );
    }

    const meta = statusMeta[profile.status];
    const travelerId =
        typeof profile._id === "object" ? profile._id.$oid : profile._id;
    const displayAvatar = isEditing ? formData.avatarUrl : profile.avatarUrl;
    const memberSince = formatDate(profile.createdAt);

    return (
        <div className="min-h-screen bg-[#FAF9F5] py-10">
            <div className="max-w-4xl mx-auto px-6 space-y-6">
                {/* ---------- ID CARD HERO ---------- */}
                <div className="relative rounded-2xl bg-[#14213D] text-[#F5F1E8] overflow-hidden shadow-[0_20px_50px_-15px_rgba(20,33,61,0.5)]">
                    <div
                        className="absolute inset-0 opacity-[0.06] pointer-events-none"
                        style={{
                            backgroundImage:
                                "repeating-linear-gradient(115deg, #F5F1E8 0px, #F5F1E8 1px, transparent 1px, transparent 14px)",
                        }}
                    />

                    {/* verification stamp for verified/active accounts */}
                    {profile.status === "active" && profile.emailVerified && (
                        <div className="absolute top-6 right-6 sm:top-8 sm:right-10 rotate-[10deg] select-none">
                            <div className="w-20 h-20 rounded-full border-2 border-[#C9A227] flex items-center justify-center">
                                <span className="text-[9px] tracking-[0.15em] text-[#C9A227] font-semibold text-center leading-tight uppercase">
                                    Verified
                                    <br />
                                    Traveler
                                </span>
                            </div>
                        </div>
                    )}

                    <div className="relative px-8 py-9 sm:px-10 sm:py-10">
                        <p className="text-[11px] tracking-[0.25em] uppercase text-[#C9A227] font-semibold mb-6">
                            Traveler ID · No. {travelerId.slice(-8).toUpperCase()}
                        </p>

                        <div className="flex flex-col sm:flex-row sm:items-end gap-6">
                            <div className="flex items-end gap-5">
                                {/* অ্যাভাটার + আপলোড ওভারলে */}
                                <div className="relative w-20 h-20 flex-shrink-0 group">
                                    <div className="w-20 h-20 rounded-full overflow-hidden border border-[#F5F1E8]/20 bg-[#1E2C4F]">
                                        {displayAvatar ? (
                                            <img
                                                src={displayAvatar}
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
                                                name="avatarFile"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={handleAvatarFileSelect}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => fileInputRef.current?.click()}
                                                disabled={isUploadingAvatar}
                                                className="absolute inset-0 rounded-full flex items-center justify-center bg-[#14213D]/70 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-medium tracking-wide text-[#F5F1E8]"
                                            >
                                                {isUploadingAvatar ? (
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
                                        {memberSince ? `Member since ${memberSince}` : "Member"}
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
                                    className="ml-auto rounded-sm bg-[#C9A227] text-[#14213D] font-semibold px-5 hover:bg-[#DBB53B]"
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
                            Account details
                        </h3>
                        <span className="text-[11px] font-mono uppercase tracking-wider text-[#9A9484]">
                            record #{travelerId.slice(-6)}
                        </span>
                    </div>

                    <div className="p-8 space-y-6">
                        {isEditing ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {/* ১. Name */}
                                <span>
                                    <label htmlFor="name" className="text-[11px] font-semibold text-[#9A9484] uppercase tracking-[0.12em] block mb-2">
                                        Full name
                                    </label>
                                    <Input
                                        required
                                        id="name"
                                        name="name"
                                        autoComplete="name"
                                        placeholder="Enter your full name"
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

                                {/* ৪. Member Since (read-only) */}
                                <span>
                                    <label className="text-[11px] font-semibold text-[#9A9484] uppercase tracking-[0.12em] block mb-2">
                                        Member since
                                    </label>
                                    <Input disabled value={memberSince || "—"} />
                                </span>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
                                <DataRow label="Full name" value={profile.name} />
                                <DataRow label="Email address" value={profile.email} />
                                <DataRow label="Phone number" value={profile.phone} mono />
                                <DataRow label="Member since" value={memberSince || undefined} />
                                <DataRow
                                    label="Account status"
                                    value={meta.label}
                                />
                                <DataRow label="Role" value={profile.role} />
                            </div>
                        )}
                    </div>

                    {isEditing && (
                        <div className="flex items-center justify-end gap-3 px-8 py-5 border-t border-[#EEEAE0] bg-[#FCFBF8] rounded-b-2xl">
                            <Button
                                variant="tertiary"
                                className="font-medium text-[#6B6459] rounded-sm"
                                onPress={handleCancel}
                                isDisabled={isSaving}
                            >
                                Cancel
                            </Button>
                            <Button
                                className="bg-[#14213D] text-white font-medium px-6 hover:bg-[#1E2C4F] rounded-sm"
                                onPress={handleSave}
                                isDisabled={isSaving || isUploadingAvatar}
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
}: {
    label: string;
    value?: string;
    placeholder?: string;
    mono?: boolean;
}) {
    return (
        <div className="flex flex-col gap-1.5 min-w-0">
            <span className="block text-[11px] font-semibold text-[#9A9484] uppercase tracking-[0.12em]">
                {label}
            </span>
            <span
                className={`block text-[15px] break-words capitalize ${mono ? "font-mono tracking-tight" : "font-normal"
                    } ${value ? "text-[#14213D]" : "text-[#B3ADA0] italic"}`}
            >
                {value || placeholder}
            </span>
        </div>
    );
}