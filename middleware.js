import { authMiddleware } from "@clerk/nextjs";

// This example protects all routes including api/trpc routes
// Please edit this to allow other routes to be public as needed.
export default authMiddleware({
  publicRoutes: [
    "/",                         // Home page
    "/sign-in(.*)",              // All sign in routes
    "/sign-up(.*)",              // All sign up routes
    "/api/webhooks(.*)",          // Webhook endpoints
    "/privacy",                  // Privacy policy
    "/terms"                     // Terms and conditions
  ],
  ignoredRoutes: [
    "/((?!api|trpc))(_next.*|.+.[w]+$)", // Ignore static files
  ]
});

export const config = {
  matcher: [
    "/((?!.+\\.[\\w]+$|_next).*)", // Match all paths except static files
    "/",                           // Match root
    "/(api|trpc)(.*)",             // Match API routes
  ],
}; 