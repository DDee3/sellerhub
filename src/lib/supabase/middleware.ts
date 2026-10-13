import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from '@/types/database'

/**
 * Refresh Supabase auth session and enforce route protection.
 *
 * - If the user is unauthenticated and tries to access a protected route,
 *   they are redirected to `/login`.
 * - If the user is authenticated and accesses `/login` or `/signup`, they are
 *   redirected to `/dashboard`.
 */
export async function updateSession(request: NextRequest) {
  // Start with a neutral response that will be returned unless we need a redirect.
  let response = NextResponse.next({ request })

  // Initialise Supabase client with cookie handling.
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Update request‑side cookies (SSR) and propagate to the response.
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // Refresh the auth session – this also populates `user`.
  const { data: { user } } = await supabase.auth.getUser()

  const protectedRoutes = [
    '/dashboard',
    '/products',
    '/orders',
    '/shipments',
    '/customers',
    '/settings',
  ]

  const { pathname } = request.nextUrl

  // Unauthenticated access to a protected route → login.
  if (!user && protectedRoutes.some((r) => pathname.startsWith(r))) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Authenticated user visiting login or signup → dashboard.
  if (user && (pathname.startsWith('/login') || pathname.startsWith('/signup'))) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  // No redirect needed – return the response (with refreshed cookies if any).
  return response
}
