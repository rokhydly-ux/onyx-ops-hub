import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
    const url = req.nextUrl.clone();

    // Récupération propre du hostname (gère les cas avec ou sans port, et www)
    let hostname = req.headers.get('host') || '';
    hostname = hostname.split(':')[0].replace(/^www\./, '');

    // RÈGLE 1 : DOMAINE NUTRIAFRO.APP
    if (hostname === 'nutriafro.app') {
        // Si on est à la racine exacte du domaine
        if (url.pathname === '/') {
            // On réécrit l'URL en interne vers la bonne page, SANS changer l'URL du navigateur
            return NextResponse.rewrite(new URL('/solutions/onyx-nutritionafricaine', req.url));
        }

        // (Règle ajoutée précédemment pour le login)
        if (url.pathname === '/login') {
            return NextResponse.rewrite(new URL('/nutriafro-login', req.url));
        }
    }

    // --- TES AUTRES RÈGLES ONYXLINKS RESTENT ICI EN DESSOUS ---

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
