"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Plane } from "lucide-react";

interface NavbarProps {
  isLoggedIn?: boolean;
  onLogout?: () => void;
}

const loggedOutLinks = [
  { label: "Home", href: "/" },
  { label: "Explore", href: "/explore" },
];

const loggedInLinks = [
  { label: "Home", href: "/" },
  { label: "Explore", href: "/explore" },
  { label: "Add Listing", href: "/listings/add" },
  { label: "My Listings", href: "/listings/manage" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export default function Navbar({ isLoggedIn = false, onLogout }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const links = isLoggedIn ? loggedInLinks : loggedOutLinks;

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname?.startsWith(href);

  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-sm border-b border-gray-100">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0F6BA8] transition-transform hover:scale-105">
            <Plane className="h-5 w-5 text-white" strokeWidth={2.2} />
          </span>
          <span className="text-lg font-bold text-[#0B4F80]">
            Travel<span className="text-[#F4A340]">Explorer</span>
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive(link.href)
                  ? "text-[#0F6BA8] font-semibold bg-[#E5F1FA]/50"
                  : "text-[#1F2937] hover:text-[#0F6BA8] hover:bg-gray-50"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop Right Side */}
        <div className="hidden items-center gap-3 md:flex">
          {isLoggedIn ? (
            <button
              onClick={onLogout}
              className="rounded-md border border-gray-200 px-4 py-2 text-sm font-medium text-[#6B7280] transition-colors hover:border-[#DC2626] hover:text-[#DC2626]"
            >
              Logout
            </button>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-md px-4 py-2 text-sm font-medium text-[#0F6BA8] transition-colors hover:bg-[#E5F1FA]"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="rounded-md bg-[#F4A340] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#D9861F] shadow-sm"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className="inline-flex items-center justify-center rounded-md p-2 text-[#1F2937] hover:bg-gray-100 hover:text-[#0F6BA8] md:hidden transition-colors"
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {/* ========================================================= */}
      {/* FLOATING DROPDOWN MENU SECTION (MOBILE)                   */}
      {/* ========================================================= */}

      {/* Background Overlay - transparent রাখা হয়েছে যেন ড্রপডাউন ভাইব আসে */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/10 backdrop-blur-[2px] md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Floating Card Panel */}
      <div
        className={`fixed right-4 top-20 z-50 w-[260px] rounded-xl border border-gray-100 bg-white p-4 shadow-xl transition-all duration-300 ease-in-out md:hidden ${
          isOpen
            ? "visible opacity-100 translate-y-0"
            : "invisible opacity-0 -translate-y-4 pointer-events-none"
          }`}
      >
        {/* Links */}
        <div className="flex flex-col gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive(link.href)
                  ? "bg-[#E5F1FA] text-[#0F6BA8] font-semibold"
                  : "text-[#1F2937] hover:bg-gray-50 hover:text-[#0F6BA8]"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Auth Buttons */}
        <div className="mt-3 border-t border-gray-100 pt-3 flex flex-col gap-2">
          {isLoggedIn ? (
            <button
              onClick={() => {
                setIsOpen(false);
                onLogout?.();
              }}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-center text-sm font-medium text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors"
            >
              Logout
            </button>
          ) : (
            <>
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-center text-sm font-medium text-[#0F6BA8] hover:bg-[#E5F1FA] transition-colors"
              >
                Login
              </Link>
              <Link
                href="/register"
                onClick={() => setIsOpen(false)}
                className="w-full rounded-lg bg-[#F4A340] px-3 py-2 text-center text-sm font-semibold text-white hover:bg-[#D9861F] transition-colors shadow-sm"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}