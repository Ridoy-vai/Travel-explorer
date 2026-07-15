import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import DashboardLayout from "@/Components/DashboardLayout";
// import DashboardLayout from "@/components/DashboardLayout";

// Route prefixes that require a specific role.
// Add an entry here whenever a new role-restricted section is added.
const ROLE_ROUTES: Record<string, string[]> = {
  "/dashboard/admin": ["admin"],
  "/dashboard/agency": ["agency"],
  "/dashboard/traveler": ["traveler"],
};

const VALID_ROLES = ["admin", "agency", "traveler"];

export default async function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const hdrs = await headers();
  const pathname = hdrs.get("x-pathname") ?? "/dashboard";

  // Full DB-verified session check.
  // Safe here because this runs as a Server Component (Node.js runtime),
  // not inside proxy.ts — so the adapter bug doesn't apply here.
  const session = await auth.api.getSession({ headers: hdrs });

  if (!session) {
    redirect(`/login?redirect=${pathname}`);
  }

  // Fallback to "traveler" if role is missing/invalid,
  // so we never redirect to a nonsensical /dashboard/undefined
  const rawRole = session.user?.role;
  const role = VALID_ROLES.includes(rawRole as string)
    ? (rawRole as string)
    : "traveler";

  const ownDashboard = `/dashboard/${role}`;

  for (const [prefix, allowedRoles] of Object.entries(ROLE_ROUTES)) {
    const isThisRouteRoleRestricted = pathname.startsWith(prefix);
    const roleNotAllowed = !allowedRoles.includes(role);

    if (isThisRouteRoleRestricted && roleNotAllowed) {
      // Guard against redirect loop
      if (pathname === ownDashboard) {
        redirect("/");
      }
      redirect(ownDashboard);
    }
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}