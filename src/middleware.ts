import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Middleware to protect subscription routes
export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // Routes that require authentication
  const authRequiredRoutes = ['/dashboard', '/api/subscription/status', '/api/subscription/subscribe', '/api/subscription/cancel'];
  
  // Routes that require active subscription (not just logged in)
  const subscriptionRequiredRoutes = ['/dashboard'];

  // Check if current path requires auth
  const requiresAuth = authRequiredRoutes.some(route => pathname.startsWith(route));
  
  if (!requiresAuth) {
    return NextResponse.next();
  }

  // Get user ID from session cookie (adapt this based on your auth provider)
  const cookieStore = req.cookies;
  const sessionToken = cookieStore.get('session_token')?.value;

  if (!sessionToken) {
    // Redirect to pricing for unauthenticated users
    const url = req.nextUrl.clone();
    url.pathname = '/pricing';
    return NextResponse.redirect(url);
  }

  // For subscription-protected routes, verify subscription status
  if (subscriptionRequiredRoutes.some(route => pathname.startsWith(route))) {
    try {
      // You would need to verify the subscription here
      // This is a simplified version - adjust based on your actual auth implementation
      // For now, we'll let the API routes handle the subscription verification
    } catch (error) {
      console.error('Subscription verification error:', error);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/subscription/:path*',
  ],
};
