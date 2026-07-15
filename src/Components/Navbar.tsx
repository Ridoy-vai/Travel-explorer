"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import {
  Phone,
  Mail,
  Search,
  ChevronDown,
  Menu,
  X,
  User,
  LogOut,
  Settings,
  Globe
} from "lucide-react";
import { FaFacebook, FaInstagram, FaLinkedin, FaTwitter, FaYoutube } from "react-icons/fa";
import { authClient } from "@/lib/auth-client";

interface DropdownItem {
  label: string;
  href: string;
}

interface NavbarProps {
  isLoggedIn?: boolean;
  user?: {
    name: string;
    email: string;
    image?: string;
  };
  onLogout?: () => void;
}

interface SessionUser {
  name?: string;
  email?: string;
  image?: string | null;
  role?: "admin" | "agency" | "traveler";
}

const toursItems: DropdownItem[] = [
  { label: "Machu Picchu Tours", href: "#" },
  { label: "Amazon Tours", href: "#" },
  { label: "Cusco Tours", href: "#" },
];

const destinationItems: DropdownItem[] = [
  { label: "Cusco", href: "#" },
  { label: "Sacred Valley", href: "#" },
  { label: "Huacachina", href: "#" },
];

const sustainabilityItems: DropdownItem[] = [
  { label: "Our Commitment", href: "#" },
  { label: "Community Projects", href: "#" },
];

const languageItems: DropdownItem[] = [
  { label: "🇬🇧 English", href: "#" },
  { label: "🇪🇸 Español", href: "#" },
];

export default function Navbar({
}: NavbarProps) {
  // Mobile & Desktop State Management
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [profileOpen, setProfileOpen] = useState<boolean>(false);

  // Desktop Hover States
  const [sustainOpen, setSustainOpen] = useState<boolean>(false);
  const [toursOpen, setToursOpen] = useState<boolean>(false);
  const [destOpen, setDestOpen] = useState<boolean>(false);
  const [langOpen, setLangOpen] = useState<boolean>(false);

  // Mobile Accordion States
  const [mobileToursOpen, setMobileToursOpen] = useState<boolean>(false);
  const [mobileDestOpen, setMobileDestOpen] = useState<boolean>(false);

  const pathname = usePathname();
  const isActive = (href: string) => pathname === href;
  const { data: session } = authClient.useSession();
  const user = session?.user as SessionUser | undefined;
  // console.log("Navbar session user:", user);

  const HandleSignOut = async () => {
    try {
      await authClient.signOut();
      setIsMobileMenuOpen(false);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };
  if (pathname.includes("dashboard")) {
    return null;
  }

  return (
    <div className="w-full font-sans sticky top-0 z-50 shadow-sm bg-white">

      {/* ---------- 1. TOP UTILITY BAR (Hidden on Mobile) ---------- */}
      <div className="w-full bg-blue-600 text-white text-sm hidden lg:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-2">
          {/* Contact info */}
          <div className="flex items-center gap-6">
            <a href="https://wa.me/51980538470" className="flex items-center gap-2 hover:opacity-80 transition">
              <Phone size={14} />
              <span>+01324193768</span>
            </a>
            <a href="mailto:info@travelbuddiesperu.com" className="flex items-center gap-2 hover:opacity-80 transition">
              <Mail size={14} />
              <span>info@mdshahriyarridoy@gmail.com</span>
            </a>
          </div>

          {/* Links + socials */}
          <div className="flex items-center gap-6">
            <Link href="#" className="hover:opacity-80 transition">About</Link>
            <Link href="#" className="hover:opacity-80 transition">Blog</Link>
            <Link href="#" className="hover:opacity-80 transition">Reviews</Link>
            <Link href="#" className="hover:opacity-80 transition">Contact Us</Link>

            {/* Sustainability dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setSustainOpen(true)}
              onMouseLeave={() => setSustainOpen(false)}
            >
              <button className="flex items-center gap-1 hover:opacity-80 transition">
                Sustainability <ChevronDown size={14} />
              </button>
              {sustainOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white text-gray-700 rounded-md shadow-lg py-2 z-50 border border-gray-100">
                  {sustainabilityItems.map((item) => (
                    <Link key={item.label} href={item.href} className="block px-4 py-2 text-sm hover:bg-gray-50 transition-colors">
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <button aria-label="Search" className="hover:opacity-80 transition">
              <Search size={16} />
            </button>

            <div className="flex items-center gap-3">
              <a href="#" aria-label="Instagram" className="hover:opacity-80 transition"><FaInstagram size={16} /></a>
              <a href="#" aria-label="TikTok" className="hover:opacity-80 transition"><span className="text-[13px] font-bold">TT</span></a>
              <a href="#" aria-label="Facebook" className="hover:opacity-80 transition"><FaFacebook size={16} /></a>
              <a href="#" aria-label="YouTube" className="hover:opacity-80 transition"><FaYoutube size={16} /></a>
              <a href="#" aria-label="LinkedIn" className="hover:opacity-80 transition"><FaLinkedin size={16} /></a>
              <a href="#" aria-label="X" className="hover:opacity-80 transition"><FaTwitter size={16} /></a>
            </div>
          </div>
        </div>
      </div>

      {/* ---------- 2. MAIN NAVBAR ---------- */}
      <nav className="w-full bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center shrink-0">
            <span className="text-2xl sm:text-3xl font-extrabold text-blue-600 select-none" style={{ fontFamily: "'Comic Sans MS', cursive" }}>
              Travel Buddies
            </span>
          </Link>

          {/* Desktop Nav Links (Hidden on Mobile) */}
          <div className="hidden lg:flex items-center gap-8 text-gray-800 font-medium">

            {/* Tours dropdown */}
            <div className="relative" onMouseEnter={() => setToursOpen(true)} onMouseLeave={() => setToursOpen(false)}>
              <Link href="/tours" className="flex items-center gap-1 hover:text-blue-600 transition py-2">
                Tours In <ChevronDown size={16} />
              </Link>
              {toursOpen && (
                <div className="absolute left-0 top-full mt-0 w-56 bg-white rounded-md shadow-lg py-2 z-50 border border-gray-100 animate-in fade-in slide-in-from-top-2 duration-200">
                  {toursItems.map((item) => (
                    <Link key={item.label} href={item.href} className="block px-4 py-2 text-sm hover:bg-gray-50 text-gray-700 hover:text-blue-600 transition-colors">
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link href="/Packages" className="hover:text-blue-600 transition">Tours Packages</Link>

            {/* Destination dropdown */}
            <div className="relative" onMouseEnter={() => setDestOpen(true)} onMouseLeave={() => setDestOpen(false)}>
              <button className="flex items-center gap-1 hover:text-blue-600 transition py-2">
                Destination <ChevronDown size={16} />
              </button>
              {destOpen && (
                <div className="absolute left-0 top-full mt-0 w-56 bg-white rounded-md shadow-lg py-2 z-50 border border-gray-100 animate-in fade-in slide-in-from-top-2 duration-200">
                  {destinationItems.map((item) => (
                    <Link key={item.label} href={item.href} className="block px-4 py-2 text-sm hover:bg-gray-50 text-gray-700 hover:text-blue-600 transition-colors">
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Language selector */}
            <div className="relative" onMouseEnter={() => setLangOpen(true)} onMouseLeave={() => setLangOpen(false)}>
              <button className="flex items-center gap-2 hover:text-blue-600 transition py-2">
                English <ChevronDown size={16} />
              </button>
              {langOpen && (
                <div className="absolute left-0 top-full mt-0 w-36 bg-white rounded-md shadow-lg py-2 z-50 border border-gray-100 animate-in fade-in slide-in-from-top-2 duration-200">
                  {languageItems.map((item) => (
                    <Link key={item.label} href={item.href} className="block px-4 py-2 text-sm hover:bg-gray-50 text-gray-700 transition-colors">
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Desktop Right Side Actions (Auth + CTA) */}
          <div className="hidden lg:flex items-center gap-4">
            <Link href="#plan-trip" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2.5 rounded-lg transition text-sm shadow-sm">
              Plan A Trip Here
            </Link>

            {/* CONDITIONAL AUTH SECTION */}
            {user ? (
              /* Profile Image & Dropdown */
              <div className="relative" onMouseEnter={() => setProfileOpen(true)} onMouseLeave={() => setProfileOpen(false)}>
                <button className="flex items-center gap-1 focus:outline-none py-2">
                  {user.image ? (
                    <img src={user.image} alt={user.name} className="h-9 w-9 rounded-full object-cover border-2 border-blue-500" />
                  ) : (
                    <div className="h-9 w-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold border-2 border-blue-500">
                      {user.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                  )}
                </button>

                {profileOpen && (
                  <div className="absolute right-0 top-full mt-0 w-56 bg-white rounded-xl shadow-xl py-2 z-50 border border-gray-100 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-2 border-b border-gray-100 flex items-center gap-3">
                      {user.image ? (
                        <img
                          src={user.image}
                          alt={user.name || "User"}
                          className="w-9 h-9 rounded-full object-cover border border-gray-200 flex-shrink-0"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold text-sm flex-shrink-0">
                          {user.name?.charAt(0)?.toUpperCase() || "U"}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{user.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                    </div>
                    <Link
                      href={
                        user?.role === "admin"
                          ? "/dashboard/admin"
                          : user?.role === "agency"
                            ? "/dashboard/agency"
                            : "/dashboard/traveler"
                      }
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors"
                    >
                      Dashboard
                    </Link>
                    <Link href="/profile" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors">
                      <User size={16} /> My Profile
                    </Link>
                    <Link href="/settings" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors">
                      <Settings size={16} /> Settings
                    </Link>
                    <div className="border-t border-gray-100 my-1"></div>
                    <button onClick={HandleSignOut} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium transition-colors">
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Auth Action Buttons */
              <div className="flex items-center gap-2 border-l border-gray-200 pl-4">
                <Link href="/login" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
                  Login
                </Link>
                <Link href="/register" className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition shadow-sm">
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex items-center gap-3 lg:hidden">
            {user ? (
              /* Logged in on mobile: hide hamburger, show profile avatar instead.
                 Clicking it opens the same floating dropdown, which now also
                 contains the nav links inside it (see section 3 below). */
              <button
                onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                className="focus:outline-none"
                aria-label="Toggle profile menu"
              >
                {user.image ? (
                  <img src={user.image} alt={user.name} className="h-9 w-9 rounded-full object-cover border-2 border-blue-500" />
                ) : (
                  <div className="h-9 w-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold border-2 border-blue-500">
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
              </button>
            ) : (
              /* Logged out on mobile: show hamburger menu bar */
              <button
                onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                className="inline-flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-gray-100 hover:text-blue-600 transition-colors"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* ========================================================= */}
      {/* 3. MOBILE FLOATING DROPDOWN CARD                           */}
      {/* ========================================================= */}
      {isMobileMenuOpen && (
        <>
          {/* Transparent backdrop layer to close on outer click */}
          <div className="fixed inset-0 z-40 bg-black/10 backdrop-blur-[1px] lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />

          {/* Floating Dropdown Box */}
          <div className="fixed right-4 top-16 z-50 w-[290px] max-h-[80vh] overflow-y-auto rounded-xl border border-gray-100 bg-white p-4 shadow-xl transition-all duration-300 ease-in-out lg:hidden animate-in fade-in slide-in-from-top-4 duration-200">

            {/* Profile card + account links shown at the top ONLY when logged in */}
            {user && (
              <div className="bg-gray-50 rounded-xl p-2.5 mb-3 border border-gray-100">
                <div className="flex items-center gap-2 mb-2 px-1">
                  {user.image ? (
                    <img src={user.image} alt={user.name} className="h-8 w-8 rounded-full object-cover" />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                      {user.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                  )}
                  <div className="truncate">
                    <p className="text-xs font-semibold text-gray-800 truncate">{user.name}</p>
                    <p className="text-[10px] text-gray-500 truncate">{user.email}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-0.5">
                  <Link
                    href={
                      user?.role === "admin"
                        ? "/dashboard/admin"
                        : user?.role === "agency"
                          ? "/dashboard/agency"
                          : "/dashboard/traveler"
                    }
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="rounded-md px-2 py-1.5 text-xs text-gray-700 hover:bg-white hover:text-blue-600 transition-colors"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-gray-700 hover:bg-white hover:text-blue-600 transition-colors"
                  >
                    <User size={14} /> My Profile
                  </Link>
                  <Link
                    href="/settings"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-gray-700 hover:bg-white hover:text-blue-600 transition-colors"
                  >
                    <Settings size={14} /> Settings
                  </Link>
                </div>

                <button
                  onClick={HandleSignOut}
                  className="mt-1.5 w-full flex items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-red-50 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100 transition-colors"
                >
                  <LogOut size={14} /> Logout
                </button>
              </div>
            )}

            {/* Mobile Nav Links Group (visible for everyone, logged in or not) */}
            <div className="flex flex-col gap-1">

              {/* Accordion 1: Tours */}
              <div>
                <button
                  onClick={() => setMobileToursOpen(!mobileToursOpen)}
                  className="w-full flex items-center justify-between rounded-lg px-3 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50"
                >
                  <span>Tours in</span>
                  <ChevronDown size={16} className={`transition-transform duration-200 ${mobileToursOpen ? "rotate-180 text-blue-600" : ""}`} />
                </button>
                {mobileToursOpen && (
                  <div className="pl-4 mt-1 flex flex-col gap-1 border-l-2 border-blue-100 ml-3">
                    {toursItems.map((item) => (
                      <Link key={item.label} href={item.href} onClick={() => setIsMobileMenuOpen(false)} className="rounded-md px-3 py-1.5 text-xs text-gray-600 hover:text-blue-600 hover:bg-gray-50">
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <Link href="/Packages" onClick={() => setIsMobileMenuOpen(false)} className="rounded-lg px-3 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50 transition-colors">
                Tours Packages
              </Link>

              {/* Accordion 2: Destination */}
              <div>
                <button
                  onClick={() => setMobileDestOpen(!mobileDestOpen)}
                  className="w-full flex items-center justify-between rounded-lg px-3 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50"
                >
                  <span>Destination</span>
                  <ChevronDown size={16} className={`transition-transform duration-200 ${mobileDestOpen ? "rotate-180 text-blue-600" : ""}`} />
                </button>
                {mobileDestOpen && (
                  <div className="pl-4 mt-1 flex flex-col gap-1 border-l-2 border-blue-100 ml-3">
                    {destinationItems.map((item) => (
                      <Link key={item.label} href={item.href} onClick={() => setIsMobileMenuOpen(false)} className="rounded-md px-3 py-1.5 text-xs text-gray-600 hover:text-blue-600 hover:bg-gray-50">
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Essential Top Bar Links Moved Here for Mobile Screen */}
              <div className="border-t border-gray-100 my-2 pt-2 flex flex-col gap-1">
                <Link href="#" onClick={() => setIsMobileMenuOpen(false)} className="rounded-lg px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-50">About Us</Link>
                <Link href="#" onClick={() => setIsMobileMenuOpen(false)} className="rounded-lg px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-50">Blog</Link>
                <Link href="#" onClick={() => setIsMobileMenuOpen(false)} className="rounded-lg px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-50">Reviews</Link>
                <Link href="#" onClick={() => setIsMobileMenuOpen(false)} className="rounded-lg px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-50">Contact Us</Link>
              </div>

            </div>

            {/* Mobile Action Buttons Footer — only shown when logged OUT */}
            {!user && (
              <div className="mt-3 border-t border-gray-100 pt-3 flex flex-col gap-2">
                <Link href="#plan-trip" onClick={() => setIsMobileMenuOpen(false)} className="w-full bg-blue-600 text-white text-center text-xs font-semibold py-2 rounded-lg hover:bg-blue-700 transition">
                  Plan A Trip Here
                </Link>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="rounded-lg border border-gray-200 py-2 text-center text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                    Login
                  </Link>
                  <Link href="/register" onClick={() => setIsMobileMenuOpen(false)} className="rounded-lg bg-orange-500 py-2 text-center text-xs font-semibold text-white hover:bg-orange-600 transition-colors shadow-sm">
                    Sign Up
                  </Link>
                </div>
              </div>
            )}

            {/* "Plan A Trip" CTA still shown for logged-in users too */}
            {user && (
              <Link href="#plan-trip" onClick={() => setIsMobileMenuOpen(false)} className="mt-3 w-full block bg-blue-600 text-white text-center text-xs font-semibold py-2 rounded-lg hover:bg-blue-700 transition">
                Plan A Trip Here
              </Link>
            )}

          </div>
        </>
      )}
    </div>
  );
}