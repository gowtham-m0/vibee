import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/pricing(.*)',
  // TRPC is public (no middleware)
  '/api/trpc(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  const url = req.nextUrl.pathname;

  if (url.startsWith('/api/trpc')) {
    return;
  }

  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
    '/api/:path*',
  ],
};
