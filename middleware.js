import { NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';

// Define public routes that don't require authentication
const publicRoutes = [
  "/",
  "/sign-in",
  "/sign-up", 
  "/api/webhooks/clerk",
  "/privacy",
  "/terms"
];

// Check if a given path matches our public routes
const isPublicRoute = (path) => {
  return publicRoutes.some(route => {
    return path === route || 
           path.startsWith(`${route}/`) || 
           path.startsWith('/api/') ||
           path.startsWith('/_next/') ||
           path.includes('.') // Static files like .js, .css, etc.
  });
};

export default async function middleware(req) {
  const { pathname } = req.nextUrl;
  
  // Check if it's a public route
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }
  
  // Get auth state
  const { userId } = getAuth(req);
  
  // If user is not authenticated, redirect to sign-in
  if (!userId) {
    const signInUrl = new URL('/sign-in', req.url);
    signInUrl.searchParams.set('redirect_url', pathname);
    return NextResponse.redirect(signInUrl);
  }
  
  // User is authenticated, allow access
  return NextResponse.next();
}

// Match all routes except static files
export const config = {
  matcher: [
    /*
     * Match all routes except:
     * 1. /api/webhooks routes (for incoming webhooks)
     * 2. /_next routes (for static assets)
     * 3. /_vercel routes (for Vercel system files)
     * 4. /favicon.ico, /sitemap.xml, etc. (common static files)
     */
    '/((?!api/webhooks|_next|_vercel|favicon.ico|sitemap.xml).*)',
  ],
}; 