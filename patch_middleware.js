const fs = require('fs');
const content = fs.readFileSync('middleware.ts', 'utf8');

const replacement = `import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
    const url = req.nextUrl;
    // Récupérer le host de manière sécurisée (avec ou sans port, vercel, etc.)
    const hostname = req.headers.get('host') || '';

    // Nettoyage du hostname pour éviter les bugs (ex: www.nutriafro.app:3000)
    const cleanHostname = hostname.split(':')[0].replace('www.', '');

    // Si on est sur le domaine NutriAfro
    if (cleanHostname === 'nutriafro.app') {
        // Racine du domaine -> Affiche la landing page
        if (url.pathname === '/') {
            return NextResponse.rewrite(new URL('/solutions/onyx-nutritionafricaine', req.url));
        }
        // Login -> Affiche la page de connexion dédiée
        if (url.pathname === '/login') {
            return NextResponse.rewrite(new URL('/nutriafro-login', req.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};`;

fs.writeFileSync('middleware.ts', replacement);
