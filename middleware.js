import { clerkMiddleware } from "@clerk/nextjs/server";

// This middleware protects all routes including api/trpc routes
export default clerkMiddleware();

export const config = {
  // Matcher config for Next.js middleware
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
