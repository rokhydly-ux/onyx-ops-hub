import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
    const url = req.nextUrl.clone();

    // Récupération stricte du domaine
    const hostname = req.headers.get('host')?.split(':')[0].replace(/^www\./, '') || '';

    // 🚨 DEBUG VERCEL : Regarde tes logs Vercel pour vérifier ce qui s'affiche ici
    console.log(`[Middleware] Host: ${hostname} | Path: ${url.pathname}`);

    // 👑 RÈGLE NUTRIAFRO : PRIORITÉ ABSOLUE (DOIT ÊTRE EN PREMIER)
    if (hostname === 'nutriafro.app') {
        if (url.pathname === '/') {
            url.pathname = '/solutions/onyx-nutritionafricaine';
            return NextResponse.rewrite(url); // LE RETURN ARRÊTE LE MIDDLEWARE ICI
        }

        // (Règle ajoutée précédemment pour le login)
        if (url.pathname === '/login') {
            url.pathname = '/nutriafro-login';
            return NextResponse.rewrite(url);
        }
    }

    // 👇 --- TES AUTRES RÈGLES ONYXLINKS COMMENCENT SEULEMENT ICI --- 👇

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
