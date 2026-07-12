"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { Chip, Button } from "@heroui/react";

// ------------------------------------------------------------------
// টাইপ ডেফিনিশন
// ------------------------------------------------------------------
interface ItineraryDay {
  day: number;
  title: string;
  description: string;
}

interface TourPackageDetails {
  _id: { $oid: string } | string;
  agencyId: string;
  agencyName: string;
  agencyEmail: string;
  agencyPhone: string;
  title: string;
  destination: string;
  category: string;
  shortDescription?: string;
  description?: string;
  durationDays?: number | null;
  durationNights?: number | null;
  minGroupSize?: number | null;
  maxGroupSize?: number | null;
  basePrice: number;
  discountPrice?: number;
  childPrice?: number;
  coverImage: string;
  galleryImages?: string[];
  itinerary?: ItineraryDay[];
  inclusions?: string[];
  exclusions?: string[];
  departureLocation?: string;
  transportation?: string;
  accommodation?: string;
  tags?: string[];
  status: "published" | "draft" | "unpublished";
  createdAt?: { $date: string } | string;
  updatedAt?: { $date: string } | string;
}

interface BookingData {
  packageId: string;
  packageTitle: string;
  travelers: {
    adultCount: number;
    childCount: number;
    maleCount: number;
    femaleCount: number;
    totalTravelers: number;
  };
  pricing: {
    pricePerAdult: number;
    pricePerChild: number;
    adultsSubtotal: number;
    childrenSubtotal: number;
    totalPrice: number;
  };
  agency: {
    agencyName: string;
    agencyEmail: string;
    agencyPhone: string;
  };
  bookedAt: string;
}

const API_BASE = "http://localhost:2000";

const statusColorMap: Record<string, "success" | "warning" | "danger"> = {
  published: "success",
  unpublished: "warning",
  draft: "danger",
};

export default function TourPackageDetailsPage({
  packageId: propPackageId,
}: {
  packageId?: string;
}) {
  const params = useParams();
  const packageId =
    propPackageId ??
    (params?.id as string) ??
    (params?.packageId as string);

  const [pkg, setPkg] = useState<TourPackageDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);

  // ---------------- বুকিং ফর্ম স্টেট ----------------
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [adultCount, setAdultCount] = useState(1);
  const [childCount, setChildCount] = useState(0);
  const [maleCount, setMaleCount] = useState(0);
  const [femaleCount, setFemaleCount] = useState(0);
  const [genderError, setGenderError] = useState<string | null>(null);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  const fetchPackage = useCallback(async () => {
    if (!packageId) {
      setError("Package ID পাওয়া যায়নি (URL params চেক করুন)");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/agency/packages/${packageId}`);
      const result = await res.json();
      if (result.success) {
        setPkg(result.data);
      } else {
        setError(result.message || "Failed to load package");
      }
    } catch (err) {
      setError("Could not reach the server");
    } finally {
      setIsLoading(false);
    }
  }, [packageId]);

  useEffect(() => {
    fetchPackage();
  }, [fetchPackage]);

  // Esc দিয়ে lightbox বন্ধ করার সুবিধা
  useEffect(() => {
    if (!lightboxImg) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxImg(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxImg]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-[#FAF8F3]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#12332E]/20 border-t-[#12332E] rounded-full animate-spin" />
          <p className="text-sm text-[#6B6459] tracking-wide">
            Loading package details…
          </p>
        </div>
      </div>
    );
  }

  if (!pkg) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-[#FAF8F3]">
        <p className="text-sm text-[#B4453D]">
          {error || "Package could not be found."}
        </p>
      </div>
    );
  }

  const id = typeof pkg._id === "object" ? pkg._id.$oid : pkg._id;

  const hasDiscount =
    typeof pkg.discountPrice === "number" &&
    pkg.discountPrice > 0 &&
    pkg.discountPrice < pkg.basePrice;

  const discountPercent = hasDiscount
    ? Math.round(
      ((pkg.basePrice - (pkg.discountPrice as number)) / pkg.basePrice) * 100
    )
    : 0;

  const duration =
    pkg.durationDays || pkg.durationNights
      ? `${pkg.durationDays ?? "?"}D / ${pkg.durationNights ?? "?"}N`
      : "Not specified";

  const groupSize =
    pkg.minGroupSize || pkg.maxGroupSize
      ? `${pkg.minGroupSize ?? "—"}–${pkg.maxGroupSize ?? "—"} people`
      : "Not specified";

  const galleryImages = pkg.galleryImages ?? [];

  // ---------------- বুকিং প্রাইস ক্যালকুলেশন ----------------
  const pricePerAdult = hasDiscount ? (pkg.discountPrice as number) : pkg.basePrice;
  const pricePerChild = pkg.childPrice ?? 0;
  const totalTravelers = adultCount + childCount;
  const adultsSubtotal = adultCount * pricePerAdult;
  const childrenSubtotal = childCount * pricePerChild;
  const totalPrice = adultsSubtotal + childrenSubtotal;

  const incDec = (
    setter: React.Dispatch<React.SetStateAction<number>>,
    delta: number,
    min = 0
  ) => {
    setter((prev) => Math.max(min, prev + delta));
  };

  // adult/child count কমানো হলে male+female যদি নতুন total ছাড়িয়ে যায়,
  // আগে female থেকে কমাবে, তারপর প্রয়োজনে male থেকে কমাবে
  const trimGenderCountsTo = (newTotal: number) => {
    setFemaleCount((prevFemale) => {
      const excessAfterFemale = maleCount + prevFemale - newTotal;
      if (excessAfterFemale <= 0) return prevFemale;
      const femaleReduction = Math.min(excessAfterFemale, prevFemale);
      return prevFemale - femaleReduction;
    });
    setMaleCount((prevMale) => {
      const remainingFemale = Math.max(
        0,
        femaleCount - Math.max(0, maleCount + femaleCount - newTotal)
      );
      const excessAfterMale = prevMale + remainingFemale - newTotal;
      if (excessAfterMale <= 0) return prevMale;
      return Math.max(0, prevMale - excessAfterMale);
    });
    setGenderError(null);
  };

  const handleConfirmBooking = () => {
    if (maleCount + femaleCount !== totalTravelers) {
      setGenderError(
        `Male + Female count (${maleCount + femaleCount}) must equal total travelers (${totalTravelers})`
      );
      return;
    }
    setGenderError(null);

    const bookingData: BookingData = {
      packageId: id,
      packageTitle: pkg.title,
      travelers: {
        adultCount,
        childCount,
        maleCount,
        femaleCount,
        totalTravelers,
      },
      pricing: {
        pricePerAdult,
        pricePerChild,
        adultsSubtotal,
        childrenSubtotal,
        totalPrice,
      },
      agency: {
        agencyName: pkg.agencyName,
        agencyEmail: pkg.agencyEmail,
        agencyPhone: pkg.agencyPhone,
      },
      bookedAt: new Date().toISOString(),
    };

    console.log("Booking Data:", bookingData);
    setBookingConfirmed(true);

    // পরে API কল করার জায়গা:
    // await fetch(`${API_BASE}/api/bookings`, { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify(bookingData) })
  };

  return (
    <div className="min-h-screen bg-[#FAF8F3] pb-16">
      {/* ---------------- HERO ---------------- */}
      <div className="relative w-full h-[380px] sm:h-[460px] overflow-hidden">
        <img
          src={pkg.coverImage}
          alt={pkg.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B241F] via-[#0B241F]/30 to-transparent" />

        <div className="absolute inset-x-0 bottom-0 px-6 sm:px-10 pb-8 max-w-5xl mx-auto w-full left-0 right-0">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <Chip
              size="sm"
              variant="flat"
              className="bg-[#C9A227]/90 text-[#12332E] font-semibold capitalize"
            >
              {pkg.category}
            </Chip>
            <Chip
              size="sm"
              color={statusColorMap[pkg.status]}
              variant="flat"
              className="capitalize font-medium"
            >
              {pkg.status}
            </Chip>
            {hasDiscount && (
              <Chip
                size="sm"
                variant="flat"
                className="bg-[#B4453D] text-white font-semibold"
              >
                {discountPercent}% OFF
              </Chip>
            )}
          </div>

          <h1
            className="text-3xl sm:text-5xl font-medium text-white leading-tight max-w-3xl"
            style={{ fontFamily: "'Newsreader', Georgia, serif" }}
          >
            {pkg.title}
          </h1>
          <p className="text-[#E8E3D5] text-sm sm:text-base mt-2 flex items-center gap-1.5">
            <span aria-hidden>📍</span> {pkg.destination}
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 -mt-8 relative z-10">
        {/* ---------------- QUICK FACTS STRIP ---------------- */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 bg-white rounded-2xl border border-[#E7E3D8] shadow-[0_10px_30px_-15px_rgba(18,51,46,0.25)] p-5">
          <Fact label="Duration" value={duration} />
          <Fact label="Group size" value={groupSize} />
          <Fact label="Transportation" value={pkg.transportation || "—"} />
          <Fact label="Accommodation" value={pkg.accommodation || "—"} />
          <Fact label="Departs from" value={pkg.departureLocation || "—"} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {/* ---------------- MAIN CONTENT ---------------- */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            {(pkg.shortDescription || pkg.description) && (
              <Section title="About this trip">
                {pkg.shortDescription && (
                  <p className="text-[15px] text-[#12332E] font-medium leading-relaxed mb-2">
                    {pkg.shortDescription}
                  </p>
                )}
                {pkg.description && (
                  <p className="text-sm text-[#6B6459] leading-relaxed">
                    {pkg.description}
                  </p>
                )}
              </Section>
            )}

            {/* Itinerary */}
            {pkg.itinerary && pkg.itinerary.length > 0 && (
              <Section title="Itinerary">
                <div className="relative pl-8">
                  <div className="absolute left-[11px] top-2 bottom-2 w-px bg-[#E7E3D8]" />
                  <div className="space-y-6">
                    {pkg.itinerary
                      .slice()
                      .sort((a, b) => a.day - b.day)
                      .map((day) => (
                        <div key={day.day} className="relative">
                          <div className="absolute -left-8 top-0.5 w-6 h-6 rounded-full bg-[#12332E] text-[#F5F1E8] text-[11px] font-semibold flex items-center justify-center">
                            {day.day}
                          </div>
                          <p className="text-[13px] font-semibold uppercase tracking-wide text-[#C9A227] mb-0.5">
                            Day {day.day}
                          </p>
                          <h4 className="text-[15px] font-semibold text-[#12332E] mb-1">
                            {day.title}
                          </h4>
                          <p className="text-sm text-[#6B6459] leading-relaxed">
                            {day.description}
                          </p>
                        </div>
                      ))}
                  </div>
                </div>
              </Section>
            )}

            {/* Inclusions & Exclusions */}
            {((pkg.inclusions && pkg.inclusions.length > 0) ||
              (pkg.exclusions && pkg.exclusions.length > 0)) && (
                <Section title="What's included">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {pkg.inclusions && pkg.inclusions.length > 0 && (
                      <ul className="space-y-2">
                        {pkg.inclusions.map((item, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2 text-sm text-[#12332E]"
                          >
                            <span className="text-[#3B7A57] font-bold mt-0.5">✓</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    {pkg.exclusions && pkg.exclusions.length > 0 && (
                      <ul className="space-y-2">
                        {pkg.exclusions.map((item, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2 text-sm text-[#8A8478]"
                          >
                            <span className="text-[#B4453D] font-bold mt-0.5">✕</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </Section>
              )}

            {/* Gallery */}
            {galleryImages.length > 0 && (
              <Section title="Gallery">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {galleryImages.map((img, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setLightboxImg(img)}
                      className="aspect-[4/3] rounded-xl overflow-hidden border border-[#E7E3D8] group relative focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
                    >
                      <img
                        src={img}
                        alt={`${pkg.title} photo ${i + 1}`}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                    </button>
                  ))}
                </div>
              </Section>
            )}

            {/* Tags */}
            {pkg.tags && pkg.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {pkg.tags.map((tag, i) => (
                  <Chip
                    key={i}
                    size="sm"
                    variant="flat"
                    className="bg-[#EFEBDD] text-[#6B6459] capitalize"
                  >
                    #{tag}
                  </Chip>
                ))}
              </div>
            )}
          </div>

          {/* ---------------- SIDEBAR ---------------- */}
          <div className="space-y-6">
            {/* ---------------- Price card + বুকিং ফর্ম ---------------- */}
            <div className="rounded-2xl bg-[#12332E] text-[#F5F1E8] p-6 sticky top-6">
              <p className="text-[11px] uppercase tracking-[0.2em] text-[#C9A227] font-semibold mb-3">
                Package price
              </p>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-3xl font-semibold font-mono">
                  ${hasDiscount ? pkg.discountPrice : pkg.basePrice}
                </span>
                {hasDiscount && (
                  <span className="text-sm text-[#A8AFC0] line-through font-mono">
                    ${pkg.basePrice}
                  </span>
                )}
              </div>
              <p className="text-xs text-[#A8AFC0]">per person</p>

              {typeof pkg.childPrice === "number" && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10 text-sm">
                  <span className="text-[#A8AFC0]">Child price</span>
                  <span className="font-mono font-medium">${pkg.childPrice}</span>
                </div>
              )}

              {!showBookingForm ? (
                <Button
                  className="w-full mt-5 bg-[#C9A227] text-[#12332E] font-semibold hover:bg-[#DBB53B]"
                  radius="sm"
                  onPress={() => setShowBookingForm(true)}
                >
                  Contact agency to book
                </Button>
              ) : (
                <div className="mt-5 space-y-4 border-t border-white/10 pt-5">
                  {typeof pkg.maxGroupSize === "number" && (
                    <p className="text-[11px] uppercase tracking-[0.15em] text-[#A8AFC0] font-medium">
                      Travelers ({totalTravelers} / {pkg.maxGroupSize} max)
                    </p>
                  )}

                  {/* Adults */}
                  <Counter
                    label="Adults"
                    value={adultCount}
                    onIncrement={() => incDec(setAdultCount, 1, 1)}
                    onDecrement={() => {
                      const newAdultCount = Math.max(1, adultCount - 1);
                      const newTotal = newAdultCount + childCount;
                      trimGenderCountsTo(newTotal);
                      setAdultCount(newAdultCount);
                    }}
                    incrementDisabled={
                      typeof pkg.maxGroupSize === "number" &&
                      totalTravelers >= pkg.maxGroupSize
                    }
                  />

                  {/* Children */}
                  <Counter
                    label="Children"
                    value={childCount}
                    onIncrement={() => incDec(setChildCount, 1, 0)}
                    onDecrement={() => {
                      const newChildCount = Math.max(0, childCount - 1);
                      const newTotal = adultCount + newChildCount;
                      trimGenderCountsTo(newTotal);
                      setChildCount(newChildCount);
                    }}
                    incrementDisabled={
                      typeof pkg.maxGroupSize === "number" &&
                      totalTravelers >= pkg.maxGroupSize
                    }
                  />

                  {typeof pkg.maxGroupSize === "number" &&
                    totalTravelers >= pkg.maxGroupSize && (
                      <p className="text-xs text-[#C9A227] bg-[#C9A227]/10 rounded-lg px-3 py-2">
                        Maximum group size reached ({pkg.maxGroupSize} people)
                      </p>
                    )}

                  <div className="h-px bg-white/10" />

                  <div className="h-px bg-white/10" />

                  <p className="text-[11px] uppercase tracking-[0.15em] text-[#A8AFC0] font-medium">
                    Gender breakdown ({maleCount + femaleCount} / {totalTravelers} assigned)
                  </p>

                  {/* Male */}
                  <Counter
                    label="Male"
                    value={maleCount}
                    onIncrement={() => {
                      if (maleCount + femaleCount < totalTravelers) {
                        setMaleCount((prev) => prev + 1);
                        setGenderError(null);
                      }
                    }}
                    onDecrement={() => incDec(setMaleCount, -1, 0)}
                    incrementDisabled={maleCount + femaleCount >= totalTravelers}
                  />

                  {/* Female */}
                  <Counter
                    label="Female"
                    value={femaleCount}
                    onIncrement={() => {
                      if (maleCount + femaleCount < totalTravelers) {
                        setFemaleCount((prev) => prev + 1);
                        setGenderError(null);
                      }
                    }}
                    onDecrement={() => incDec(setFemaleCount, -1, 0)}
                    incrementDisabled={maleCount + femaleCount >= totalTravelers}
                  />

                  {maleCount + femaleCount < totalTravelers && (
                    <p className="text-xs text-[#C9A227] bg-[#C9A227]/10 rounded-lg px-3 py-2">
                      {totalTravelers - maleCount - femaleCount} more traveler(s) need a gender assigned
                    </p>
                  )}

                  {genderError && (
                    <p className="text-xs text-[#E88C7D] bg-[#B4453D]/20 rounded-lg px-3 py-2">
                      {genderError}
                    </p>
                  )}

                  {/* প্রাইস ব্রেকডাউন */}
                  <div className="rounded-xl bg-white/5 p-4 space-y-2 text-sm">
                    <div className="flex justify-between text-[#D8D3C4]">
                      <span>
                        Adults ({adultCount} × ${pricePerAdult})
                      </span>
                      <span className="font-mono">${adultsSubtotal}</span>
                    </div>
                    <div className="flex justify-between text-[#D8D3C4]">
                      <span>
                        Children ({childCount} × ${pricePerChild})
                      </span>
                      <span className="font-mono">${childrenSubtotal}</span>
                    </div>
                    <div className="flex justify-between text-base font-semibold pt-2 border-t border-white/10">
                      <span>Total</span>
                      <span className="font-mono text-[#C9A227]">${totalPrice}</span>
                    </div>
                  </div>

                  <form action={`/api/checkout-sessions`} method="POST">
                    <input type="hidden" name="packageId" value={id} />
                    <input type="hidden" name="totalAmount" value={totalPrice} />
                    <input type="hidden" name="tourName" value={pkg.title} />
                    <input type="hidden" name="tourDescription" value={pkg.description} />
                    <input type="hidden" name="childCount" value={childCount} />
                    <input type="hidden" name="totalChildPrice" value={childrenSubtotal} />
                    <input type="hidden" name="adultCount" value={adultCount} />
                    <input type="hidden" name="totalFemale" value={femaleCount} />
                    <input type="hidden" name="totalMale" value={maleCount} />
                    <Button
                      type="submit"
                      className="w-full bg-[#C9A227] text-[#12332E] font-semibold hover:bg-[#DBB53B]"
                      radius="sm"
                    >
                      Confirm & Contact Agency
                    </Button>
                  </form>

                  <button
                    type="button"
                    onClick={() => setShowBookingForm(false)}
                    className="w-full text-center text-xs text-[#A8AFC0] hover:text-white transition-colors"
                  >
                    Cancel
                  </button>

                  {bookingConfirmed && (
                    <p className="text-xs text-[#8FD4A8] text-center">
                      ✓ Booking details saved — check console
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Agency contact card */}
            <div className="rounded-2xl bg-white border border-[#E7E3D8] p-6">
              <p className="text-[11px] uppercase tracking-[0.2em] text-[#9A9484] font-semibold mb-3">
                Hosted by
              </p>
              <h4 className="text-[16px] font-semibold text-[#12332E] capitalize mb-3">
                {pkg.agencyName}
              </h4>
              <div className="space-y-1.5 text-sm text-[#6B6459]">
                <p className="break-words">{pkg.agencyEmail}</p>
                <p className="font-mono">{pkg.agencyPhone}</p>
              </div>
            </div>

            {/* Meta */}
            <div className="text-[11px] text-[#9A9484] font-mono px-1 space-y-1">
              <p>Package ID: {id.slice(-10)}</p>
              {pkg.createdAt && (
                <p>
                  Listed:{" "}
                  {new Date(
                    typeof pkg.createdAt === "object"
                      ? pkg.createdAt.$date
                      : pkg.createdAt
                  ).toLocaleDateString()}
                </p>
              )}
              {pkg.updatedAt && (
                <p>
                  Updated:{" "}
                  {new Date(
                    typeof pkg.updatedAt === "object"
                      ? pkg.updatedAt.$date
                      : pkg.updatedAt
                  ).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ---------------- GALLERY LIGHTBOX ---------------- */}
      {lightboxImg && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-6"
          onClick={() => setLightboxImg(null)}
        >
          <button
            type="button"
            onClick={() => setLightboxImg(null)}
            className="absolute top-5 right-5 text-white/80 hover:text-white text-2xl w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20"
            aria-label="Close"
          >
            ✕
          </button>
          <img
            src={lightboxImg}
            alt="Gallery preview"
            className="max-h-[85vh] max-w-[90vw] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}

// ------------------------------------------------------------------
// ছোট রিইউজেবল কম্পোনেন্ট
// ------------------------------------------------------------------
function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 min-w-0">
      <span className="text-[10px] font-semibold text-[#9A9484] uppercase tracking-[0.1em]">
        {label}
      </span>
      <span className="text-sm font-medium text-[#12332E] break-words">
        {value}
      </span>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-white border border-[#E7E3D8] p-6">
      <h3
        className="text-lg font-medium text-[#12332E] mb-4"
        style={{ fontFamily: "'Newsreader', Georgia, serif" }}
      >
        {title}
      </h3>
      {children}
    </div>
  );
}

function Counter({
  label,
  value,
  onIncrement,
  onDecrement,
  incrementDisabled = false,
}: {
  label: string;
  value: number;
  onIncrement: () => void;
  onDecrement: () => void;
  incrementDisabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-[#D8D3C4]">{label}</span>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onDecrement}
          className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-sm font-medium transition-colors"
        >
          −
        </button>
        <span className="w-6 text-center font-mono text-sm">{value}</span>
        <button
          type="button"
          onClick={onIncrement}
          disabled={incrementDisabled}
          className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white/10 flex items-center justify-center text-sm font-medium transition-colors"
        >
          +
        </button>
      </div>
    </div>
  );
}