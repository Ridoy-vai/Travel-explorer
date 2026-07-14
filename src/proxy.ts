import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth"; // adjust path to your better-auth instance

// Route prefixes that require login, and which roles are allowed on each.
// Add an entry here whenever a new role-restricted section is added.
const ROLE_ROUTES: Record<string, string[]> = {
  "/dashboard/admin": ["admin"],
  "/dashboard/agency": ["agency"],
  "/dashboard/traveler": ["traveler"],
};

// Any path starting with one of these requires a logged-in session.
const PROTECTED_PREFIXES = ["/dashboard", "/profile", "/settings"];

const AUTH_ROUTES = ["/login", "/register"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const session = await auth.api.getSession({
    headers: request.headers,
  });

  // Logged-in users shouldn't see /login or /register
  if (AUTH_ROUTES.includes(pathname)) {
    if (session) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );
  if (!isProtected) {
    return NextResponse.next();
  }

  if (!session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const userRole = session.user?.role ?? null;
  if (userRole) {
    for (const [routePrefix, allowedRoles] of Object.entries(ROLE_ROUTES)) {
      const isThisRouteRoleRestricted = pathname.startsWith(routePrefix);
      const roleNotAllowed = !allowedRoles.includes(userRole);
      if (isThisRouteRoleRestricted && roleNotAllowed) {
        const ownDashboard = `/dashboard/${userRole}`;
        return NextResponse.redirect(new URL(ownDashboard, request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile",
    "/settings",
    "/login",
    "/register",
  ],
};