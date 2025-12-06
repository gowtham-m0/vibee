import { clerkMiddleware , createRouteMatcher } from '@clerk/nextjs/server';


const isPublicRoute = createRouteMatcher([
  "/",
  '/sign-in(.*)',
  "/sign-up(.*)",
  "/api/(.*)",
  "/pricing(.*)"
])

export default clerkMiddleware(async (auth,req)=>{
  if(!isPublicRoute(req)){
    await auth.protect();
  }
});

export const config = {
  matcher: [
    '/((?!_next|.*\\..*).*)', // everything except static
    '/api/(?!trpc).*',        // run for API but NOT trpc
  ],
};