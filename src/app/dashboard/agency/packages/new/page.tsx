"use client";

import React, { useMemo, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { authClient } from "@/lib/auth-client";
import type { DateValue } from "@internationalized/date";
import { Time, getLocalTimeZone, today } from "@internationalized/date";
import {
  DateField,
  DateRangePicker,
  Description,
  FieldError,
  Label,
  RangeCalendar,
  TimeField,
} from "@heroui/react";
import {
  Image as ImageIcon,
  X,
  Plus,
  Trash2,
  Loader2,
  UploadCloud,
  MapPin,
  Calendar as CalendarIcon,
  Users,
  Tag,
  Info,
} from "lucide-react";

// ---------------------------------------------------------
// Add Package Form — Agency Dashboard
// Stack: Next.js (App Router) + TypeScript + Tailwind CSS + lucide-react
// Image hosting: ImgBB
// Notifications: react-toastify
// Theme: Agency (blue-600) — matches DashboardLayout
//
// Trip dates and pickup time are picked separately:
// - DateRangePicker: date-only (no time), drives durationDays/durationNights
// - TimeField: pickup time on the start date, does NOT affect duration
// Duration is NEVER manually entered — always auto-calculated from
// the picked date range, so it can never mismatch the actual dates.
// ---------------------------------------------------------

const IMGBB_API_KEY = process.env.NEXT_PUBLIC_IMGBB_API_KEY || "";

type TripDateRange = {
  start: DateValue;
  end: DateValue;
};

interface ItineraryDay {
  day: number;
  title: string;
  description: string;
}

interface PackageFormData {
  title: string;
  destination: string;
  category: string;
  shortDescription: string;
  description: string;
  minGroupSize: string;
  maxGroupSize: string;
  basePrice: string;
  discountPrice: string;
  childPrice: string;
  departureLocation: string;
  transportation: string;
  accommodation: string;
}

const CATEGORIES = [
  "Adventure",
  "Beach",
  "Hill & Mountain",
  "Honeymoon",
  "Family",
  "Corporate",
  "Historical & Cultural",
  "Wildlife",
];

const TRANSPORT_OPTIONS = ["Bus", "Flight", "Train", "Private Car", "Mixed"];

const emptyFormData: PackageFormData = {
  title: "",
  destination: "",
  category: "",
  shortDescription: "",
  description: "",
  minGroupSize: "",
  maxGroupSize: "",
  basePrice: "",
  discountPrice: "",
  childPrice: "",
  departureLocation: "",
  transportation: "",
  accommodation: "",
};

// Pure date-based duration — pickup time never affects this.
function computeDuration(range: TripDateRange | null) {
  if (!range) return null;

  const startMs = range.start.toDate(getLocalTimeZone()).setHours(0, 0, 0, 0);
  const endMs = range.end.toDate(getLocalTimeZone()).setHours(0, 0, 0, 0);
  const diffMs = endMs - startMs;

  if (diffMs <= 0) return null;

  const nights = Math.round(diffMs / (1000 * 60 * 60 * 24));
  const days = nights + 1;

  return { nights, days };
}

// ---- Reusable field wrapper ----
function Field({
  label,
  required,
  children,
  hint,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-slate-700">
        {label}
        {required && <span className="text-blue-600 ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

function SectionCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-5 sm:p-6 shadow-sm">
      <div className="mb-5">
        <h3 className="text-base font-bold text-slate-800">{title}</h3>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

const inputClass =
  "w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition";

async function uploadToImgBB(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("image", file);

  const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) throw new Error("Image upload failed");
  const data = await res.json();
  return data?.data?.url as string;
}

export default function AddPackageForm() {
  const { data: session } = authClient.useSession();
  const user = session?.user;

  const [form, setForm] = useState<PackageFormData>(emptyFormData);

  const [coverImage, setCoverImage] = useState<string>("");
  const [coverUploading, setCoverUploading] = useState(false);

  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [galleryUploading, setGalleryUploading] = useState(false);

  const [itinerary, setItinerary] = useState<ItineraryDay[]>([
    { day: 1, title: "", description: "" },
  ]);

  const [inclusions, setInclusions] = useState<string[]>([""]);
  const [exclusions, setExclusions] = useState<string[]>([""]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  // --- Trip dates (date-only) and pickup time (separate, doesn't affect duration) ---
  const [tripRange, setTripRange] = useState<TripDateRange | null>(null);
  const [pickupTime, setPickupTime] = useState<Time | null>(null);

  const [submitting, setSubmitting] = useState(false);

  const todayDate = today(getLocalTimeZone());

  const rangeIsInvalid =
    tripRange != null &&
    (tripRange.start.compare(todayDate) < 0 || tripRange.end.compare(tripRange.start) <= 0);

  const duration = useMemo(
    () => (rangeIsInvalid ? null : computeDuration(tripRange)),
    [tripRange, rangeIsInvalid]
  );

  const updateField = (field: keyof PackageFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverUploading(true);
    try {
      const url = await uploadToImgBB(file);
      setCoverImage(url);
      toast.success("Cover image uploaded");
    } catch {
      toast.error("Cover image upload failed. Please try again.");
    } finally {
      setCoverUploading(false);
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setGalleryUploading(true);
    try {
      const urls = await Promise.all(files.map(uploadToImgBB));
      setGalleryImages((prev) => [...prev, ...urls]);
      toast.success(`${urls.length} image(s) uploaded`);
    } catch {
      toast.error("Gallery image upload failed. Please try again.");
    } finally {
      setGalleryUploading(false);
    }
  };

  const removeGalleryImage = (idx: number) => {
    setGalleryImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const addItineraryDay = () => {
    setItinerary((prev) => [
      ...prev,
      { day: prev.length + 1, title: "", description: "" },
    ]);
  };

  const updateItineraryDay = (
    idx: number,
    field: keyof ItineraryDay,
    value: string
  ) => {
    setItinerary((prev) =>
      prev.map((d, i) => (i === idx ? { ...d, [field]: value } : d))
    );
  };

  const removeItineraryDay = (idx: number) => {
    setItinerary((prev) =>
      prev.filter((_, i) => i !== idx).map((d, i) => ({ ...d, day: i + 1 }))
    );
  };

  const updateListItem = (
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>,
    idx: number,
    value: string
  ) => {
    setList(list.map((item, i) => (i === idx ? value : item)));
  };

  const addListItem = (setList: React.Dispatch<React.SetStateAction<string[]>>) => {
    setList((prev) => [...prev, ""]);
  };

  const removeListItem = (
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>,
    idx: number
  ) => {
    setList(list.filter((_, i) => i !== idx));
  };

  const addTag = () => {
    const value = tagInput.trim();
    if (value && !tags.includes(value)) {
      setTags((prev) => [...prev, value]);
    }
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  };

  const resetForm = () => {
    setForm(emptyFormData);
    setCoverImage("");
    setGalleryImages([]);
    setItinerary([{ day: 1, title: "", description: "" }]);
    setInclusions([""]);
    setExclusions([""]);
    setTags([]);
    setTripRange(null);
    setPickupTime(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("You must be logged in as an agency to add a package.");
      return;
    }

    if (!form.title || !form.destination || !form.category || !form.basePrice) {
      toast.error("Please fill in all required (*) fields.");
      return;
    }
    if (!coverImage) {
      toast.error("Please upload a cover image.");
      return;
    }
    if (!tripRange || rangeIsInvalid || !duration) {
      toast.error("Please select a valid trip start and end date.");
      return;
    }
    if (!pickupTime) {
      toast.error("Please select a pickup time.");
      return;
    }

    const status = user.status === "approved" ? "published" : "unpublished";

    const payload = {
      ...form,
      status,
      coverImage,
      galleryImages,
      itinerary,
      inclusions: inclusions.filter((i) => i.trim() !== ""),
      exclusions: exclusions.filter((i) => i.trim() !== ""),
      tags,
      tourStartDate: tripRange.start.toString(), // date only, e.g. "2026-08-01"
      tourEndDate: tripRange.end.toString(),
      pickupTime: `${pickupTime.hour.toString().padStart(2, "0")}:${pickupTime.minute
        .toString()
        .padStart(2, "0")}`, // "07:30"
      durationDays: duration.days,     // auto-calculated, sent for display convenience
      durationNights: duration.nights, // server re-derives & verifies this anyway
      agencyId: user.id,
      agencyName: user.name,
      agencyEmail: user.email,
      agencyPhone: (user as any).phone,
    };

    setSubmitting(true);
    const toastId = toast.loading("Publishing package...");
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/agency/packages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || "Failed to save package");
      }

      toast.update(toastId, {
        render:
          data.status === "published"
            ? `Package ${data.status} successfully!`
            : `Package ${data.status} — waiting for admin to approve your agency!`,
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });
      resetForm();
    } catch (err) {
      toast.update(toastId, {
        render: err instanceof Error ? err.message : "Could not save the package.",
        type: "error",
        isLoading: false,
        autoClose: 4000,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <ToastContainer position="top-right" theme="light" />
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto pb-16">
        <div className="mb-7">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            Add New Package
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Fill in the package details below — you can edit this later.
          </p>
        </div>

        <div className="flex flex-col gap-6">
          <SectionCard title="Basic Info" subtitle="Package name, location and description">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Package Title" required>
                <input
                  className={inputClass}
                  placeholder="e.g. Saint Martin 3 Days 2 Nights"
                  value={form.title}
                  onChange={(e) => updateField("title", e.target.value)}
                />
              </Field>
              <Field label="Destination" required>
                <div className="relative">
                  <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    className={`${inputClass} pl-10`}
                    placeholder="e.g. Cox's Bazar, Bangladesh"
                    value={form.destination}
                    onChange={(e) => updateField("destination", e.target.value)}
                  />
                </div>
              </Field>
              <Field label="Category" required>
                <select
                  className={inputClass}
                  value={form.category}
                  onChange={(e) => updateField("category", e.target.value)}
                >
                  <option value="">Select category</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </Field>
              <Field label="Departure Location">
                <input
                  className={inputClass}
                  placeholder="e.g. Dhaka"
                  value={form.departureLocation}
                  onChange={(e) => updateField("departureLocation", e.target.value)}
                />
              </Field>
            </div>

            <div className="mt-4 flex flex-col gap-4">
              <Field label="Short Description" hint="Shown on the package card, 1-2 lines">
                <textarea
                  className={`${inputClass} resize-none`}
                  rows={2}
                  placeholder="A brief summary of the package"
                  value={form.shortDescription}
                  onChange={(e) => updateField("shortDescription", e.target.value)}
                />
              </Field>
              <Field label="Full Description">
                <textarea
                  className={`${inputClass} resize-none`}
                  rows={5}
                  placeholder="Write the complete package description"
                  value={form.description}
                  onChange={(e) => updateField("description", e.target.value)}
                />
              </Field>
            </div>
          </SectionCard>

          <SectionCard
            title="Duration & Group Size"
            subtitle="Pick trip dates and pickup time — days & nights are calculated automatically"
          >
            <div className="flex flex-col gap-4">
              <DateRangePicker
                isRequired
                endName="tourEndDate"
                startName="tourStartDate"
                isInvalid={rangeIsInvalid}
                minValue={todayDate}
                value={tripRange}
                onChange={setTripRange}
              >
                <Label className="text-sm font-semibold text-slate-700">
                  Trip Start & End Date <span className="text-blue-600">*</span>
                </Label>
                <DateField.Group fullWidth>
                  <DateField.Input slot="start">
                    {(segment) => <DateField.Segment segment={segment} />}
                  </DateField.Input>
                  <DateRangePicker.RangeSeparator />
                  <DateField.Input slot="end">
                    {(segment) => <DateField.Segment segment={segment} />}
                  </DateField.Input>
                  <DateField.Suffix>
                    <DateRangePicker.Trigger>
                      <DateRangePicker.TriggerIndicator />
                    </DateRangePicker.Trigger>
                  </DateField.Suffix>
                </DateField.Group>
                {rangeIsInvalid ? (
                  <FieldError>Please choose a valid future date range.</FieldError>
                ) : (
                  <Description>Select trip start and end date.</Description>
                )}
                <DateRangePicker.Popover>
                  <RangeCalendar aria-label="Trip dates">
                    <RangeCalendar.Header>
                      <RangeCalendar.YearPickerTrigger>
                        <RangeCalendar.YearPickerTriggerHeading />
                        <RangeCalendar.YearPickerTriggerIndicator />
                      </RangeCalendar.YearPickerTrigger>
                      <RangeCalendar.NavButton slot="previous" />
                      <RangeCalendar.NavButton slot="next" />
                    </RangeCalendar.Header>
                    <RangeCalendar.Grid>
                      <RangeCalendar.GridHeader>
                        {(day) => <RangeCalendar.HeaderCell>{day}</RangeCalendar.HeaderCell>}
                      </RangeCalendar.GridHeader>
                      <RangeCalendar.GridBody>
                        {(date) => <RangeCalendar.Cell date={date} />}
                      </RangeCalendar.GridBody>
                    </RangeCalendar.Grid>
                    <RangeCalendar.YearPickerGrid>
                      <RangeCalendar.YearPickerGridBody>
                        {({ year }) => <RangeCalendar.YearPickerCell year={year} />}
                      </RangeCalendar.YearPickerGridBody>
                    </RangeCalendar.YearPickerGrid>
                  </RangeCalendar>
                </DateRangePicker.Popover>
              </DateRangePicker>

              {/* Separate pickup time field — independent of the date range */}
              <TimeField
                isRequired
                name="pickupTime"
                value={pickupTime}
                onChange={setPickupTime}
              >
                <Label className="text-sm font-semibold text-slate-700">
                  Pickup Time <span className="text-blue-600">*</span>
                </Label>
                <DateField.Group fullWidth>
                  <DateField.Input>
                    {(segment) => <DateField.Segment segment={segment} />}
                  </DateField.Input>
                </DateField.Group>
                <Description>What time will travelers be picked up on the start date?</Description>
              </TimeField>

              {/* Auto-calculated duration — read-only, date-based only */}
              {duration && (
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3">
                  <CalendarIcon size={16} className="text-slate-400 shrink-0" />
                  <span className="text-sm">
                    <span className="text-slate-500">Duration: </span>
                    <span className="font-semibold text-slate-800">
                      {duration.days} Day{duration.days !== 1 ? "s" : ""} / {duration.nights} Night
                      {duration.nights !== 1 ? "s" : ""}
                    </span>
                  </span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <Field label="Min Group Size">
                  <div className="relative">
                    <Users size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="number"
                      min={1}
                      className={`${inputClass} pl-10`}
                      placeholder="2"
                      value={form.minGroupSize}
                      onChange={(e) => updateField("minGroupSize", e.target.value)}
                    />
                  </div>
                </Field>
                <Field label="Max Group Size">
                  <input
                    type="number"
                    min={1}
                    className={inputClass}
                    placeholder="30"
                    value={form.maxGroupSize}
                    onChange={(e) => updateField("maxGroupSize", e.target.value)}
                  />
                </Field>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Pricing" subtitle="All prices in BDT">
            <div className="grid sm:grid-cols-3 gap-4">
              <Field label="Base Price (per person)" required>
                <input
                  type="number"
                  min={0}
                  className={inputClass}
                  placeholder="5000"
                  value={form.basePrice}
                  onChange={(e) => updateField("basePrice", e.target.value)}
                />
              </Field>
              <Field label="Discount Price" hint="Optional">
                <input
                  type="number"
                  min={0}
                  className={inputClass}
                  placeholder="4500"
                  value={form.discountPrice}
                  onChange={(e) => updateField("discountPrice", e.target.value)}
                />
              </Field>
              <Field label="Child Price" hint="Optional">
                <input
                  type="number"
                  min={0}
                  className={inputClass}
                  placeholder="2500"
                  value={form.childPrice}
                  onChange={(e) => updateField("childPrice", e.target.value)}
                />
              </Field>
            </div>
          </SectionCard>

          <SectionCard title="Images" subtitle="Cover image and gallery (uploaded via ImgBB)">
            <div className="flex flex-col gap-5">
              <div>
                <p className="text-sm font-semibold text-slate-700 mb-2">
                  Cover Image <span className="text-blue-600">*</span>
                </p>
                {coverImage ? (
                  <div className="relative w-full sm:w-72 aspect-video rounded-2xl overflow-hidden border border-slate-200 group">
                    <img src={coverImage} alt="cover" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setCoverImage("")}
                      className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-lg shadow hover:bg-red-50"
                    >
                      <X size={14} className="text-red-500" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center gap-2 w-full sm:w-72 aspect-video rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 cursor-pointer hover:border-blue-400 hover:bg-blue-50/40 transition">
                    {coverUploading ? (
                      <Loader2 size={22} className="animate-spin text-blue-500" />
                    ) : (
                      <>
                        <UploadCloud size={22} className="text-slate-400" />
                        <span className="text-xs text-slate-400 font-medium">Upload cover image</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleCoverUpload}
                      disabled={coverUploading}
                    />
                  </label>
                )}
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-700 mb-2">
                  Gallery Images <span className="text-slate-400 font-normal">(multiple)</span>
                </p>
                <div className="flex flex-wrap gap-3">
                  {galleryImages.map((url, idx) => (
                    <div key={idx} className="relative w-24 h-24 rounded-xl overflow-hidden border border-slate-200 group">
                      <img src={url} alt={`gallery-${idx}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeGalleryImage(idx)}
                        className="absolute top-1 right-1 p-1 bg-white/90 rounded-md shadow hover:bg-red-50"
                      >
                        <X size={12} className="text-red-500" />
                      </button>
                    </div>
                  ))}
                  <label className="flex flex-col items-center justify-center gap-1 w-24 h-24 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 cursor-pointer hover:border-blue-400 hover:bg-blue-50/40 transition">
                    {galleryUploading ? (
                      <Loader2 size={18} className="animate-spin text-blue-500" />
                    ) : (
                      <>
                        <ImageIcon size={18} className="text-slate-400" />
                        <span className="text-[10px] text-slate-400 font-medium">Add</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleGalleryUpload}
                      disabled={galleryUploading}
                    />
                  </label>
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Day-wise Itinerary">
            <div className="flex flex-col gap-4">
              {itinerary.map((day, idx) => (
                <div key={idx} className="relative bg-slate-50 border border-slate-100 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold">
                      <CalendarIcon size={13} /> Day {day.day}
                    </span>
                    {itinerary.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItineraryDay(idx)}
                        className="p-1.5 rounded-lg hover:bg-red-50"
                      >
                        <Trash2 size={15} className="text-red-500" />
                      </button>
                    )}
                  </div>
                  <div className="flex flex-col gap-3">
                    <input
                      className={inputClass}
                      placeholder="Title (e.g. Arrival at Saint Martin & beach visit)"
                      value={day.title}
                      onChange={(e) => updateItineraryDay(idx, "title", e.target.value)}
                    />
                    <textarea
                      className={`${inputClass} resize-none`}
                      rows={2}
                      placeholder="Describe the day's activities in detail"
                      value={day.description}
                      onChange={(e) => updateItineraryDay(idx, "description", e.target.value)}
                    />
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addItineraryDay}
                className="self-start flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 px-1"
              >
                <Plus size={16} /> Add another day
              </button>
            </div>
          </SectionCard>

          <div className="grid sm:grid-cols-2 gap-6">
            <SectionCard title="Inclusions">
              <div className="flex flex-col gap-2.5">
                {inclusions.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      className={inputClass}
                      placeholder="e.g. Accommodation, meals, guide"
                      value={item}
                      onChange={(e) => updateListItem(inclusions, setInclusions, idx, e.target.value)}
                    />
                    {inclusions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeListItem(inclusions, setInclusions, idx)}
                        className="shrink-0 p-2 rounded-lg hover:bg-red-50"
                      >
                        <Trash2 size={15} className="text-red-500" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addListItem(setInclusions)}
                  className="self-start flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 mt-1"
                >
                  <Plus size={16} /> Add item
                </button>
              </div>
            </SectionCard>

            <SectionCard title="Exclusions">
              <div className="flex flex-col gap-2.5">
                {exclusions.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      className={inputClass}
                      placeholder="e.g. Personal expenses, visa fee"
                      value={item}
                      onChange={(e) => updateListItem(exclusions, setExclusions, idx, e.target.value)}
                    />
                    {exclusions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeListItem(exclusions, setExclusions, idx)}
                        className="shrink-0 p-2 rounded-lg hover:bg-red-50"
                      >
                        <Trash2 size={15} className="text-red-500" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addListItem(setExclusions)}
                  className="self-start flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 mt-1"
                >
                  <Plus size={16} /> Add item
                </button>
              </div>
            </SectionCard>
          </div>

          <SectionCard title="Transport & Accommodation">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Transportation">
                <select
                  className={inputClass}
                  value={form.transportation}
                  onChange={(e) => updateField("transportation", e.target.value)}
                >
                  <option value="">Select</option>
                  {TRANSPORT_OPTIONS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </Field>
              <Field label="Accommodation" hint="e.g. 3-Star Hotel">
                <input
                  className={inputClass}
                  placeholder="Enter hotel/accommodation standard"
                  value={form.accommodation}
                  onChange={(e) => updateField("accommodation", e.target.value)}
                />
              </Field>
            </div>
          </SectionCard>

          <SectionCard title="Tags" subtitle="Keywords to help travelers find this package">
            <div className="flex items-center gap-2 mb-3">
              <div className="relative flex-1">
                <Tag size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  className={`${inputClass} pl-10`}
                  placeholder="Type a tag and press Enter"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                />
              </div>
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition"
              >
                Add
              </button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold">
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)}>
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </SectionCard>

          <div className="flex items-start gap-2.5 bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs text-slate-500">
            <Info size={15} className="shrink-0 mt-0.5 text-slate-400" />
            Once submitted, this package becomes visible to travelers immediately.
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={submitting || !user}
              className="px-6 py-3 rounded-2xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting && <Loader2 size={16} className="animate-spin" />}
              Publish Package
            </button>
          </div>
        </div>
      </form>
    </>
  );
}