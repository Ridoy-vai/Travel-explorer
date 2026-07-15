"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Users,
  FileText,
  DollarSign,
  Plus,
  ClipboardList,
  Menu,
  X,
  ChevronRight,
  LogOut,
  SearchCheck,
  MonitorDot,
  ChartSpline,
  UserRoundPen,
  ShieldCheck,
  MapPinned,
  Heart,
  Star,
  MessageSquare,
  Building2,
  type LucideIcon,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";

// ---------------------------------------------------------
// Role-based Dashboard Layout — Travel Platform
// Roles: admin | agency | traveler
// Stack: Next.js (App Router) + TypeScript + Tailwind CSS + lucide-react + Better Auth
// Usage:
//   import DashboardLayout from "@/components/DashboardLayout";
//   export default function Layout({ children }) { return <DashboardLayout>{children}</DashboardLayout>; }
// ---------------------------------------------------------

type Role = "admin" | "agency" | "traveler";

interface MenuItem {
  id: string;
  name: string;
  icon: LucideIcon;
  href: string;
  role: Role;
}

interface ThemeColors {
  bg: string;
  text: string;
  light: string;
  border: string;
}

interface SessionUser {
  name?: string;
  email?: string;
  image?: string | null;
  role?: Role;
}

const menuConfig: MenuItem[] = [
  // ---------- admin ----------
  { id: "admin-overview", name: "Overview", icon: ChartSpline, href: "/dashboard/admin", role: "admin" },
  { id: "admin-agencies", name: "Agency Verification", icon: ShieldCheck, href: "/dashboard/admin/agencies", role: "admin" },
  { id: "admin-users", name: "Users", icon: Users, href: "/dashboard/admin/users", role: "admin" },
  { id: "admin-packages", name: "Packages", icon: FileText, href: "/dashboard/admin/packages", role: "admin" },
  { id: "admin-bookings", name: "Bookings", icon: ClipboardList, href: "/dashboard/admin/bookings", role: "admin" },
  { id: "admin-finance", name: "Finance", icon: DollarSign, href: "/dashboard/admin/finance", role: "admin" },

  // ---------- agency ----------
  { id: "agency-overview", name: "Overview", icon: ChartSpline, href: "/dashboard/agency", role: "agency" },
  { id: "agency-add-package", name: "Add Package", icon: Plus, href: "/dashboard/agency/packages/new", role: "agency" },
  { id: "agency-packages", name: "My Packages", icon: MapPinned, href: "/dashboard/agency/packages", role: "agency" },
  { id: "agency-bookings", name: "Bookings", icon: ClipboardList, href: "/dashboard/agency/bookings", role: "agency" },
  { id: "agency-inquiries", name: "Inquiries", icon: MessageSquare, href: "/dashboard/agency/inquiries", role: "agency" },
  { id: "agency-earnings", name: "Earnings", icon: DollarSign, href: "/dashboard/agency/earnings", role: "agency" },
  { id: "agency-profile", name: "Agency Profile", icon: Building2, href: "/dashboard/agency/profile", role: "agency" },

  // ---------- traveler ----------
  { id: "traveler-overview", name: "Dashboard", icon: ChartSpline, href: "/dashboard/traveler", role: "traveler" },
  { id: "traveler-browse", name: "Browse Tours", icon: SearchCheck, href: "/dashboard/traveler/browse", role: "traveler" },
  { id: "traveler-bookings", name: "My Bookings", icon: MonitorDot, href: "/dashboard/traveler/bookings", role: "traveler" },
  { id: "traveler-wishlist", name: "Wishlist", icon: Heart, href: "/dashboard/traveler/wishlist", role: "traveler" },
  { id: "traveler-reviews", name: "My Reviews", icon: Star, href: "/dashboard/traveler/reviews", role: "traveler" },
  { id: "traveler-profile", name: "Edit Profile", icon: UserRoundPen, href: "/dashboard/traveler/profile", role: "traveler" },
];

const themeConfig: Record<Role, ThemeColors> = {
  admin: { bg: "bg-slate-800", text: "text-slate-800", light: "bg-slate-100", border: "border-slate-800" },
  agency: { bg: "bg-blue-600", text: "text-blue-600", light: "bg-blue-50", border: "border-blue-600" },
  traveler: { bg: "bg-orange-500", text: "text-orange-500", light: "bg-orange-50", border: "border-orange-500" },
};

const roleLogoLabel: Record<Role, string> = {
  admin: "Admin Panel",
  agency: "Agency Panel",
  traveler: "Traveler",
};

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { data: session } = authClient.useSession();
  const pathname = usePathname();

  const [role, setRole] = useState<Role | null>(null);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  useEffect(() => {
    const fetchSession = async () => {
      const { data } = await authClient.getSession();
      const sessionUser = data?.user as SessionUser | undefined;
      setUser(sessionUser ?? null);
      setRole((sessionUser?.role as Role) || "traveler"); // Fallback for testing
      setLoading(false);
    };
    fetchSession();
  }, [session]);

  if (loading || !role) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-slate-900" />
      </div>
    );
  }

  const menu = menuConfig.filter((item) => item.role === role);
  const theme = themeConfig[role];

  return (
    <div className="h-dvh flex flex-col lg:flex-row bg-[#F9FAFB] overflow-hidden">
      {/* --- MOBILE + TABLET TOP BAR (visible below lg) --- */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b shrink-0 z-30">
        <Link href="/" className="flex items-center gap-3 group shrink-0">
          <div className="relative h-9 w-9 sm:h-10 sm:w-10 overflow-hidden rounded-xl border border-slate-200 bg-white p-0.5 shadow-sm transition-transform group-hover:scale-105">
            <img src="/logo.png" alt="Logo" className="h-full w-full object-cover rounded-lg" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-black tracking-tighter text-slate-900 leading-none">
              Travel Buddies
            </h1>
            <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.15em] text-orange-600">
              {roleLogoLabel[role]}
            </p>
          </div>
        </Link>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Toggle menu"
          className="p-2 bg-slate-100 rounded-lg shrink-0"
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* --- OVERLAY BACKDROP (mobile + tablet only) --- */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* --- SIDEBAR --- */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-[80vw] max-w-72 bg-white border-r transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:z-auto lg:w-72 lg:shrink-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="h-full flex flex-col p-5 sm:p-6">
          <Link href="/" className="hidden lg:flex items-center gap-3 group shrink-0 mb-5">
            <div className="relative h-10 w-10 overflow-hidden rounded-xl border border-slate-200 bg-white p-0.5 shadow-sm transition-transform group-hover:scale-105">
              <img src="/logo.png" alt="Logo" className="h-full w-full object-cover rounded-lg" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter text-slate-900 leading-none">
                Travel Buddies
              </h1>
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-orange-600">
                {roleLogoLabel[role]}
              </p>
            </div>
          </Link>

          <nav className="flex-1 space-y-1.5 overflow-y-auto no-scrollbar mt-2 lg:mt-0">
            {menu.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center justify-between px-4 py-3.5 rounded-2xl group transition-all ${
                    isActive
                      ? `${theme.light} ${theme.text} font-bold`
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                    <span className="text-[15px]">{item.name}</span>
                  </div>
                  {isActive && <ChevronRight size={16} />}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto pt-4 p-4 bg-slate-50 rounded-3xl border border-slate-100 shrink-0">
            <div className="flex items-center justify-between gap-3">
              {/* User Info */}
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-200 border-2 border-white shadow-sm flex items-center justify-center shrink-0">
                  {user?.image ? (
                    <img src={user.image} alt="user" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs font-bold text-slate-500">
                      {user?.name?.charAt(0)?.toUpperCase() || "U"}
                    </span>
                  )}
                </div>

                <div className="overflow-hidden">
                  <p className="text-sm font-bold text-slate-800 truncate">
                    {user?.name || "User"}
                  </p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest">
                    {role}
                  </p>
                </div>
              </div>

              <button
                onClick={async () => {
                  await authClient.signOut();
                  window.location.href = "/";
                }}
                className="p-2 rounded-xl hover:bg-red-50 transition shrink-0"
                title="Logout"
              >
                <LogOut size={18} className="text-red-500" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
        <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6 md:p-8 lg:p-12">
          <div className="max-w-7xl mx-auto">{children}</div>
        </div>
      </main>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}