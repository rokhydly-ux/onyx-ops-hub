import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
    const url = req.nextUrl;

    // Vercel standard pour lire le domaine exact
    const hostname = req.headers.get('x-forwarded-host') || req.headers.get('host') || '';
    const cleanHostname = hostname.replace(/^www\./, '').split(':')[0];

    console.log(`[Middleware Executed] Detected Host: ${cleanHostname} | Path: ${url.pathname}`);

    // 👑 RÈGLE NUTRIAFRO : PRIORITÉ ABSOLUE
    if (cleanHostname === 'nutriafro.app') {
        if (url.pathname === '/') {
            // On utilise new URL pour garantir une réécriture absolue et forcer le routage côté serveur
            return NextResponse.rewrite(new URL('/solutions/onyx-nutritionafricaine', req.url));
        }

        // (Règle ajoutée précédemment pour le login)
        if (url.pathname === '/login') {
            return NextResponse.rewrite(new URL('/nutriafro-login', req.url));
        }
    }

    // 👇 --- TES AUTRES RÈGLES ONYXLINKS (S'IL Y EN A) --- 👇

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
