"use client";

import { useState, useEffect } from "react";
import { Star, ArrowRight, ShieldCheck, Users, Briefcase, Compass } from "lucide-react";

// কক্সবাজার, রাঙামাটি, বান্দরবান সহ বাংলাদেশের আকর্ষণীয় প্লেসের ইমেজ অবজেক্ট
const bdDestinations: { title: string; tagline: string; url: string }[] = [
  {
    title: "Cox's Bazar",
    tagline: "The World's Longest Natural Sandy Sea Beach",
    url: "https://images.unsplash.com/photo-1583212292454-1fe6229603b7?auto=format&fit=crop&w=1600&q=80", 
  },
  {
    title: "Rangamati",
    tagline: "The Scenic Beauty of Kaptai Lake & Sajek Valley",
    url: "https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?auto=format&fit=crop&w=1600&q=80",
  },
  {
    title: "Bandarban",
    tagline: "The Misty Peaks of Nilgiri & Thanchi Hills",
    url: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1600&q=80",
  },
  {
    title: "Sylhet",
    tagline: "Lush Green Tea Gardens & Floating Forests",
    url: "https://images.unsplash.com/photo-1599930113854-d6d7fd521f10?auto=format&fit=crop&w=1600&q=80",
  },
  {
    title: "Sundarbans",
    tagline: "The Mysterious Home of Royal Bengal Tiger",
    url: "https://images.unsplash.com/photo-1608958416715-bc440fb37307?auto=format&fit=crop&w=1600&q=80",
  },
];

// Marquee-র জন্য ট্রেন্ডিং বাংলাদেশি স্পট
const trendingSpots = [
  "Cox's Bazar 🏖️", "Rangamati Kaptai ⛵", "Bandarban Nilgiri ⛰️", 
  "Sajek Valley ☁️", "Sylhet Jaflong 💎", "Sundarbans Forest 🐅", 
  "Sreemangal Tea Estate 🍃", "Saint Martin Island 🏝️"
];

export default function Hero() {
  const [bgIndex, setBgIndex] = useState<number>(0);

  // ৪.৫ সেকেন্ড পর পর ব্যাকগ্রাউন্ড ইমেজ স্মুথ পরিবর্তন করার জন্য ইফেক্ট
  useEffect(() => {
    const interval = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % bdDestinations.length);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative w-full min-h-[850px] lg:min-h-screen flex flex-col justify-between overflow-hidden bg-slate-950 text-white">
      
      {/* 3D Cinematic Background Slider */}
      <div className="absolute inset-0 z-0">
        {bdDestinations.map((dest, idx) => (
          <div
            key={dest.url}
            className={`absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out transform ${
              idx === bgIndex ? "opacity-100 scale-105" : "opacity-0 scale-100"
            }`}
            style={{
              backgroundImage: `linear-gradient(to right, rgba(15, 23, 42, 0.85) 40%, rgba(15, 23, 42, 0.4)), url('${dest.url}')`,
            }}
          />
        ))}
        {/* Depth Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.12),transparent_50%)]" />
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-32 lg:pt-40 pb-16 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center my-auto">
        
        {/* Left Side: Text and Badges */}
        <div className="lg:col-span-7 max-w-2xl">
          {/* Dynamic Active Tag Badge (ইমেজের সাথে সাথে নাম ও ট্যাগলাইনও চেঞ্জ হবে) */}
          <div className="inline-flex flex-col sm:flex-row sm:items-center gap-2 bg-blue-500/10 backdrop-blur-md border border-blue-400/30 px-4 py-2 rounded-xl text-blue-400 text-xs sm:text-sm font-semibold mb-6 animate-pulse">
            <div className="flex items-center gap-1.5 font-bold">
              <Compass size={16} />
              <span>{bdDestinations[bgIndex].title}</span>
            </div>
            <span className="hidden sm:inline text-slate-400">|</span>
            <span className="text-slate-300 font-normal text-[11px] sm:text-xs">{bdDestinations[bgIndex].tagline}</span>
          </div>

          <h1 className="text-white text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.15] mb-6 tracking-tight">
            Discover Bangladesh <br className="hidden sm:inline" />
            Like A Local Buddy
          </h1>

          <p className="text-slate-300 text-base sm:text-lg mb-8 leading-relaxed">
            Whether you want to relax at <span className="text-blue-400 font-semibold">Cox's Bazar</span>, witness clouds in <span className="text-sky-400 font-semibold">Rangamati</span>, or hike the hills of <span className="text-orange-400 font-semibold">Bandarban</span>—our unified platform connects Travelers, trusted Agencies, and Admins seamlessly.
          </p>

          {/* User Reviews */}
          <div className="flex items-center gap-4 mb-8 bg-slate-900/40 backdrop-blur-sm p-3 rounded-xl border border-slate-800 w-fit">
            <div className="flex -space-x-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-blue-600 bg-slate-800 flex items-center justify-center font-bold text-xs text-blue-400">
                  BD
                </div>
              ))}
            </div>
            <div>
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} className="fill-yellow-400 text-yellow-400" />
                ))}
                <span className="font-bold ml-2 text-sm">4.9/5</span>
              </div>
              <p className="text-slate-400 text-xs font-medium">Trusted by 10,000+ Bangladeshi Explorers</p>
            </div>
          </div>

          {/* CTA Group */}
          <div className="flex flex-wrap items-center gap-4">
            <a href="#packages" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3.5 rounded-xl transition shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 hover:-translate-y-0.5">
              Explore BD Packages <ArrowRight size={18} />
            </a>
            <a href="#agency-register" className="flex items-center gap-2 bg-slate-900/80 hover:bg-slate-800 text-white border border-slate-700 font-semibold px-6 py-3.5 rounded-xl transition hover:-translate-y-0.5">
              Agency Registration
            </a>
          </div>
        </div>

        {/* Right Side: 3D Layered Roles (Traveler, Agency, Admin) */}
        <div className="lg:col-span-5 relative w-full h-[380px] sm:h-[420px] flex items-center justify-center lg:justify-end perspective-[1000px]">
          
          {/* Layer 1: Traveler Card */}
          <div className="absolute left-4 top-12 w-[240px] bg-gradient-to-br from-slate-900/90 to-slate-800/95 backdrop-blur-md p-5 rounded-2xl border border-slate-700 shadow-2xl transform rotate-y-12 -rotate-x-6 rotate-3 hover:translate-z-10 transition-transform duration-300 group">
            <div className="h-10 w-10 bg-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center mb-3">
              <Users size={20} />
            </div>
            <h3 className="font-bold text-base text-white">Traveler Portal</h3>
            <p className="text-slate-400 text-xs mt-1">Book Cox's Bazar or Hill Tracts group tours easily.</p>
            <span className="inline-block mt-4 text-xs font-bold text-blue-400 group-hover:underline cursor-pointer">Explore Trips →</span>
          </div>

          {/* Layer 2: Travel Agency Card */}
          <div className="absolute right-4 bottom-12 w-[250px] bg-gradient-to-br from-slate-900/90 to-slate-800/95 backdrop-blur-md p-5 rounded-2xl border border-slate-700 shadow-2xl transform -rotate-y-12 rotate-x-6 -rotate-3 hover:translate-z-20 transition-transform duration-300 group z-20">
            <div className="h-10 w-10 bg-orange-500/20 text-orange-400 rounded-xl flex items-center justify-center mb-3">
              <Briefcase size={20} />
            </div>
            <h3 className="font-bold text-base text-white">Agency Dashboard</h3>
            <p className="text-slate-400 text-xs mt-1">Post custom Bangladeshi itineraries & tracking grid.</p>
            <span className="inline-block mt-4 text-xs font-bold text-orange-400 group-hover:underline cursor-pointer">Partner Portal →</span>
          </div>

          {/* Layer 3: Central Admin Core */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[210px] bg-gradient-to-tr from-emerald-600/90 to-teal-500/90 p-4 rounded-xl shadow-[0_25px_50px_-12px_rgba(16,185,129,0.4)] z-30 transform hover:scale-105 transition-transform duration-300 border border-emerald-400/30 text-center">
            <div className="mx-auto h-9 w-9 bg-white text-emerald-600 rounded-full flex items-center justify-center mb-2 shadow">
              <ShieldCheck size={20} />
            </div>
            <h4 className="font-extrabold text-sm text-white">Admin Verified</h4>
            <p className="text-emerald-100 text-[11px] mt-0.5 font-medium">Safe & Secured Payments</p>
            <div className="mt-2.5 bg-slate-950/30 py-1 px-2 rounded-md text-[10px] font-mono tracking-wider">
              GOVT REGULATED
            </div>
          </div>

        </div>
      </div>

      {/* ---------- 4. INFINITE SMOOTH MARQUEE ---------- */}
      <div className="relative z-10 w-full bg-slate-900/80 backdrop-blur-md border-t border-slate-800 py-4 overflow-hidden select-none">
        <div className="flex w-[200%] animate-[marquee_25s_linear_infinite]">
          {/* Loop 1 */}
          <div className="flex justify-around w-1/2 text-xs sm:text-sm font-semibold tracking-wider text-slate-400 uppercase">
            {trendingSpots.map((spot, i) => (
              <span key={i} className="mx-4 flex items-center gap-2 whitespace-nowrap hover:text-white transition-colors cursor-default">
                {spot}
              </span>
            ))}
          </div>
          {/* Loop 2 (Seamless loop connector) */}
          <div className="flex justify-around w-1/2 text-xs sm:text-sm font-semibold tracking-wider text-slate-400 uppercase">
            {trendingSpots.map((spot, i) => (
              <span key={`dup-${i}`} className="mx-4 flex items-center gap-2 whitespace-nowrap hover:text-white transition-colors cursor-default">
                {spot}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Inline Keyframe Animation Injector */}
      <style jsx global>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
}