import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedRoutes = ['/', '/api/invoices'];

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Check if the path is in the protected routes list
    // or starts with a protected route (e.g. /api/invoices/...)
    const isProtected = protectedRoutes.some(route =>
        pathname === route || pathname.startsWith(`${route}/`)
    );

    if (isProtected && pathname !== '/login') {
        const sessionCookie = request.cookies.get('better-auth.session_token')?.value ||
            request.cookies.get('__Secure-better-auth.session_token')?.value;

        if (!sessionCookie) {
            // Redirect to login if no token is found
            const loginUrl = new URL('/login', request.url);
            return NextResponse.redirect(loginUrl);
        }

        // We assume the better-auth session is valid if the cookie is present
        // This removes the manual JWT verification as requested
        return NextResponse.next();
    }

    return NextResponse.next();
}

// Ensure middleware only runs for specific paths
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api/auth (auth route)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - login (login page)
         */
        '/((?!api/auth|_next/static|_next/image|favicon.ico|login).*)',
    ],
};
