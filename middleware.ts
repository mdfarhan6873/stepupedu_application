import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  // Get the token from the request
  const token = await getToken({ req, secret: process.env.AUTH_SECRET });
  const isAuthenticated = !!token;
  const userRole = token?.role as "admin" | "student" | "teacher" | undefined;

  // Public routes that don't require authentication
  const publicRoutes = ["/", "/login", "/api/auth", "/api/register"];
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  // Protected dashboard routes
  const isDashboardRoute = pathname.startsWith("/dashboard");
  const isApiRoute = pathname.startsWith("/api") && !pathname.startsWith("/api/auth");

  // If not authenticated and trying to access any protected route
  if (!isAuthenticated && !isPublicRoute) {
    console.log(`Unauthenticated access attempt to: ${pathname}`);
    if (isApiRoute) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // If authenticated, check role-based access
  if (isAuthenticated) {
    // Redirect from login page to appropriate dashboard
    if (pathname === "/login" || pathname === "/") {
      switch (userRole) {
        case "admin":
          return NextResponse.redirect(new URL("/dashboard/admin", req.url));
        case "student":
          return NextResponse.redirect(new URL("/dashboard/student", req.url));
        case "teacher":
          return NextResponse.redirect(new URL("/dashboard/teacher", req.url));
      }
    }

    // Check role-based access to specific dashboard routes and all their child routes
    if (isDashboardRoute) {
      if (pathname.startsWith("/dashboard/admin") && userRole !== "admin") {
        console.log(`Admin route access denied for user role: ${userRole}`);
        return NextResponse.redirect(new URL(`/dashboard/${userRole}`, req.url));
      }
      if (pathname.startsWith("/dashboard/student") && userRole !== "student") {
        console.log(`Student route access denied for user role: ${userRole}`);
        return NextResponse.redirect(new URL(`/dashboard/${userRole}`, req.url));
      }
      if (pathname.startsWith("/dashboard/teacher") && userRole !== "teacher") {
        console.log(`Teacher route access denied for user role: ${userRole}`);
        return NextResponse.redirect(new URL(`/dashboard/${userRole}`, req.url));
      }
    }

    // Check role-based access to admin API routes
    if (pathname.startsWith("/api/admin") && userRole !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all routes except static files, _next, and auth API routes
    "/((?!.+\\.[\\w]+$|_next|api/auth).*)", 
    "/", 
    // Match API routes except auth
    "/api/((?!auth).+)"
  ],
};
