import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
    const url = req.nextUrl.clone();
    const hostname = req.headers.get('host') || '';

    // Détection stricte du domaine NutriAfro
    if (hostname.includes('nutriafro.app')) {
        // Si on est à la racine de nutriafro.app, on affiche la landing page
        if (url.pathname === '/') {
            url.pathname = '/solutions/onyx-nutritionafricaine';
            return NextResponse.rewrite(url);
        }
        // Si l'utilisateur tape /login manuellement, on le force vers notre login dédié
        if (url.pathname === '/login') {
            url.pathname = '/nutriafro-login';
            return NextResponse.rewrite(url);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
