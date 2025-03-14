import { withClerkMiddleware, getAuth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// List of public routes that don't require authentication
const publicPaths = ['/', '/sign-in*', '/sign-up*'];

const isPublic = (path) => {
  return publicPaths.find((x) =>
    path.match(new RegExp(`^${x}$`.replace('*', '.*')))
  );
};

// Comment out the clerk middleware temporarily
export default function middleware(request) {
  return NextResponse.next();
}

export const config = {
  matcher: '/((?!_next/image|_next/static|favicon.ico).*)',
}; 