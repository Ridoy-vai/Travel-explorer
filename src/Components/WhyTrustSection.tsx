"use client";

import {
  ShieldCheck,
  CheckCircle2,
  CalendarCheck,
  Users,
} from "lucide-react";

// ------------------------------------------------------------------
// টাইপ ডেফিনিশন
// ------------------------------------------------------------------
interface Certification {
  icon: string; // emoji অথবা ছোট আইকন হিসেবে ব্যবহার করা হবে
  label: string;
}

interface BookingStep {
  step: number;
  title: string;
  description: string;
}

const certifications: Certification[] = [
  { icon: "🏅", label: "Recognized travel agency" },
  { icon: "🎖️", label: "Excellence TripAdvisor 2026" },
  { icon: "🏆", label: "Winner of public tenders" },
  { icon: "🛡️", label: "Safe Travels" },
];

const commitments: string[] = [
  "Best price guarantee",
  "Tailor made proposals",
  "Official guide in English and Bengali",
  "24/7 personalized assistance",
];

const bookingSteps: BookingStep[] = [
  {
    step: 1,
    title: "Reservation in 2 minutes",
    description: "Simple and secure process with immediate confirmation",
  },
  {
    step: 2,
    title: "Secure payment",
    description: "Multiple payment methods with SSL encryption",
  },
  {
    step: 3,
    title: "Enjoy without worries",
    description: "Everything organized for you, just enjoy the experience",
  },
];

export default function WhyTrustSection({
  brandName = "Travel Buddies",
  peopleBookedToday = 4,
}: {
  brandName?: string;
  peopleBookedToday?: number;
}) {
  return (
    <section className="bg-[#FAF8F3] py-16 px-6">
      <div className="max-w-6xl mx-auto">
        {/* ---------------- হেডার ---------------- */}
        <div className="text-center mb-12">
          <h2
            className="text-3xl sm:text-4xl font-semibold text-[#12332E]"
            style={{ fontFamily: "'Newsreader', Georgia, serif" }}
          >
            Why trust {brandName}?
          </h2>
          <p className="text-[#6B6459] text-sm sm:text-base mt-3">
            We operate with the highest standards of quality and safety.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* ---------------- বাম কলাম ---------------- */}
          <div className="space-y-10">
            {/* Certifications */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <ShieldCheck className="w-5 h-5 text-[#3B7A57]" />
                <h3 className="text-base font-semibold text-[#12332E]">
                  Certifications and Warranties
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {certifications.map((cert, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 rounded-xl border border-[#E7E3D8] bg-white p-4 hover:border-[#C9A227]/50 hover:shadow-sm transition-all"
                  >
                    <span className="text-2xl" aria-hidden>
                      {cert.icon}
                    </span>
                    <span className="text-sm font-medium text-[#12332E] leading-snug">
                      {cert.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Our commitment */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <ShieldCheck className="w-5 h-5 text-[#3B7A57]" />
                <h3 className="text-base font-semibold text-[#12332E]">
                  Our commitment
                </h3>
              </div>

              <ul className="space-y-2.5">
                {commitments.map((item, i) => (
                  <li key={i} className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#3B7A57] flex-shrink-0" />
                    <span className="text-sm text-[#6B6459]">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* ---------------- ডান কলাম ---------------- */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <CalendarCheck className="w-5 h-5 text-[#12332E]" />
              <h3 className="text-base font-semibold text-[#12332E]">
                Book with confidence
              </h3>
            </div>

            <div className="rounded-2xl bg-white border border-[#E7E3D8] p-6 space-y-6">
              {bookingSteps.map((s) => (
                <div key={s.step} className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-[#C9A227]/15 text-[#C9A227] font-semibold text-sm flex items-center justify-center flex-shrink-0">
                    {s.step}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-[#12332E] mb-0.5">
                      {s.title}
                    </h4>
                    <p className="text-sm text-[#6B6459] leading-relaxed">
                      {s.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-2 mt-5 text-sm text-[#6B6459]">
              <Users className="w-4 h-4" />
              <span>{peopleBookedToday} people booked today</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}