import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
    const url = req.nextUrl;
    const hostname = req.headers.get('host') || '';

    // Si on est sur le domaine NutriAfro
    if (hostname.includes('nutriafro.app')) {
        if (url.pathname === '/') {
            return NextResponse.rewrite(new URL('/solutions/onyx-nutritionafricaine', req.url));
        }
        if (url.pathname === '/login') {
            return NextResponse.rewrite(new URL('/nutriafro-login', req.url));
        }
    }
    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};