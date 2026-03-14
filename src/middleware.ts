import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Dans une configuration Supabase standard, un cookie d'authentification est stocké.
  // Remarque : L'approche recommandée officielle de Supabase utilise le package @supabase/ssr.
  // Ceci est une vérification basique des cookies pour l'exemple.
  const hasSession = request.cookies.getAll().some(cookie => cookie.name.includes('supabase-auth'));

  // Si l'utilisateur veut accéder au /dashboard client sans session
  if (request.nextUrl.pathname.startsWith('/dashboard') && !hasSession) {
    // On le redirige vers la page de login
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Définissez ici les routes qui doivent déclencher le middleware
  matcher: ['/dashboard/:path*'],
};