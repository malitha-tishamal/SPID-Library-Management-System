import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request });
  const path = request.nextUrl.pathname;

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => request.cookies.getAll(),
          setAll: (cookiesToSet) => {
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          }
        }
      }
    );

    const { data: { user } } = await supabase.auth.getUser();

    // Protect dashboard routes
    if (!user && (path === '/' || path.startsWith('/admin') || path.startsWith('/librarian') || path.startsWith('/student'))) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Role-based routing
    if (user) {
      // If the user goes to the root path `/`, redirect to their dashboard
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      const role = profile?.role;

      if (path === '/') {
        if (role) {
          return NextResponse.redirect(new URL(`/${role}`, request.url));
        }
      }

      if (path.startsWith('/admin') && role !== 'admin') {
        return NextResponse.redirect(new URL(`/${role || 'student'}`, request.url));
      }
      if (path.startsWith('/librarian') && !['admin', 'librarian'].includes(role!)) {
        return NextResponse.redirect(new URL('/student', request.url));
      }
    }
  } catch (error) {
    console.error('Middleware Supabase request failed: Check your API keys.', error);
    // Gracefully handle failed Supabase key connection
    if (path === '/' || path.startsWith('/admin') || path.startsWith('/librarian') || path.startsWith('/student')) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ['/', '/admin/:path*', '/librarian/:path*', '/student/:path*', '/login', '/register', '/forgot-password', '/verify-email']
};
