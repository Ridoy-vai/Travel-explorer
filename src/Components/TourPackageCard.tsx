"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Chip } from "@heroui/react";

// ------------------------------------------------------------------
// টাইপ ডেফিনিশন
// ------------------------------------------------------------------
interface TourPackageCardData {
  _id: { $oid: string } | string;
  title: string;
  destination: string;
  category: string;
  shortDescription?: string;
  basePrice: number;
  discountPrice?: number;
  coverImage: string;
  galleryImages?: string[];
  durationDays?: number | null;
  durationNights?: number | null;
  status: "published" | "draft" | "unpublished";
}

const AUTO_SLIDE_INTERVAL = 3000; // প্রতি ৩ সেকেন্ডে ছবি পাল্টাবে

export default function TourPackageCard({
  pkg,
}: {
  pkg: TourPackageCardData;
}) {
  const id = typeof pkg._id === "object" ? pkg._id.$oid : pkg._id;

  // কভার ইমেজ + গ্যালারি ইমেজ একসাথে মিলিয়ে স্লাইডশো তৈরি
  const images = useMemo(() => {
    const gallery = pkg.galleryImages ?? [];
    const combined = [pkg.coverImage, ...gallery].filter(Boolean);
    // ডুপ্লিকেট থাকলে বাদ
    return Array.from(new Set(combined));
  }, [pkg.coverImage, pkg.galleryImages]);

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return; // একটাই ছবি থাকলে অটো-স্লাইড দরকার নেই

    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % images.length);
    }, AUTO_SLIDE_INTERVAL);

    return () => clearInterval(timer);
  }, [images.length]);

  const hasDiscount =
    typeof pkg.discountPrice === "number" &&
    pkg.discountPrice > 0 &&
    pkg.discountPrice < pkg.basePrice;

  const duration =
    pkg.durationDays || pkg.durationNights
      ? `${pkg.durationDays ?? "?"}D / ${pkg.durationNights ?? "?"}N`
      : null;

  return (
    <Link
      href={`/Packages/Tourpackagedetailspage/${id}`}
      className="group block relative w-full max-w-sm rounded-3xl overflow-hidden shadow-[0_10px_30px_-12px_rgba(18,51,46,0.35)] border border-[#E7E3D8] bg-[#12332E] transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_-12px_rgba(18,51,46,0.45)]"
    >
      {/* ---------------- ইমেজ স্লাইডশো ---------------- */}
      <div className="relative w-full aspect-[4/5] overflow-hidden">
        {images.map((img, i) => (
          <img
            key={img + i}
            src={img}
            alt={`${pkg.title} photo ${i + 1}`}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
              i === activeIndex ? "opacity-100" : "opacity-0"
            } group-hover:scale-105 transition-transform`}
          />
        ))}

        {/* গ্র্যাডিয়েন্ট ওভারলে যাতে টেক্সট পড়া যায় */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B241F] via-[#0B241F]/40 to-transparent pointer-events-none" />

        {/* স্লাইড ইন্ডিকেটর ডট */}
        {images.length > 1 && (
          <div className="absolute top-4 right-4 flex gap-1.5">
            {images.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === activeIndex
                    ? "w-4 bg-[#C9A227]"
                    : "w-1.5 bg-white/40"
                }`}
              />
            ))}
          </div>
        )}

        {/* ক্যাটাগরি + স্ট্যাটাস চিপ */}
        <div className="absolute top-4 left-4 flex flex-wrap gap-2">
          <Chip
            size="sm"
            variant="flat"
            className="bg-[#C9A227]/90 text-[#12332E] font-semibold capitalize"
          >
            {pkg.category}
          </Chip>
          {hasDiscount && (
            <Chip
              size="sm"
              variant="flat"
              className="bg-[#B4453D] text-white font-semibold"
            >
              Sale
            </Chip>
          )}
        </div>

        {/* কার্ডের টেক্সট কন্টেন্ট (ইমেজের উপরে বসানো) */}
        <div className="absolute inset-x-0 bottom-0 px-6 pb-6">
          <h3
            className="text-2xl font-semibold text-white leading-tight mb-1"
            style={{ fontFamily: "'Newsreader', Georgia, serif" }}
          >
            {pkg.title}
          </h3>
          <p className="text-[#E8E3D5] text-sm flex items-center gap-1.5 mb-2">
            <span aria-hidden>📍</span> {pkg.destination}
          </p>

          {pkg.shortDescription && (
            <p className="text-[#D8D3C4] text-sm leading-snug line-clamp-2 mb-3">
              {pkg.shortDescription}
            </p>
          )}

          <div className="flex items-end justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-white text-lg font-semibold font-mono">
                ${hasDiscount ? pkg.discountPrice : pkg.basePrice}
              </span>
              {hasDiscount && (
                <span className="text-xs text-[#A8AFC0] line-through font-mono">
                  ${pkg.basePrice}
                </span>
              )}
              <span className="text-xs text-[#A8AFC0]">/ person</span>
            </div>

            {duration && (
              <span className="text-xs text-[#E8E3D5] font-medium">
                {duration}
              </span>
            )}
          </div>

          {/* "See package" ইঙ্গিত — বাটন না, শুধু hover এ arrow */}
          <div className="mt-3 flex items-center gap-1.5 text-[#C9A227] text-sm font-semibold opacity-0 group-hover:opacity-100 translate-x-0 group-hover:translate-x-1 transition-all duration-300">
            View package
            <span aria-hidden>→</span>
          </div>
        </div>
      </div>
    </Link>
  );
}