import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/jwt';

export async function middleware(request: NextRequest) {
    const sessionToken = request.cookies.get('session_token')?.value;
    const { pathname } = request.nextUrl;

    // Redirecciones básicas por ausencia de sesión
    if (pathname.startsWith('/dashboard') && !sessionToken) {
        return NextResponse.redirect(new URL('/login', request.url));
    }
    if (pathname.startsWith('/login') && sessionToken) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // VALIDACIÓN DE PERMISOS RBAC EN TIEMPO REAL
    if (sessionToken && pathname.startsWith('/dashboard')) {
        const usuarioDecodificado = await verifyToken(sessionToken);

        if (!usuarioDecodificado) {
            // Token alterado o expirado -> Limpiar sesión
            const response = NextResponse.redirect(new URL('/login', request.url));
            response.cookies.delete('session_token');
            return response;
        }

        // Proteger subrutas específicas según los permisos del JWT
        const permisos = usuarioDecodificado.permisos;

        // Proteger la ruta de identidades para que SOLO ingrese el Administrador
        if (pathname.startsWith('/dashboard/usuarios') && usuarioDecodificado.role !== 'Administrador') {
            return NextResponse.redirect(new URL('/dashboard?error=AccesoDenegado', request.url));
        }

        if (pathname.startsWith('/dashboard/docentes') && !permisos.includes('docentes:write')) {
            return NextResponse.redirect(new URL('/dashboard?error=NoAutorizado', request.url));
        }

        if (pathname.startsWith('/dashboard/asignaciones') && !permisos.includes('asignaciones:write')) {
            return NextResponse.redirect(new URL('/dashboard?error=NoAutorizado', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/dashboard/:path*', '/login'],
};



/*
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // 1. Obtener la cookie de sesión (la llamamos 'session_token')
    const sessionToken = request.cookies.get('session_token')?.value;

    const { pathname } = request.nextUrl;

    // 2. Si el usuario intenta entrar al Dashboard sin estar logueado, redirigir a /login
    if (pathname.startsWith('/dashboard') && !sessionToken) {
        const loginUrl = new URL('/login', request.url);
        return NextResponse.redirect(loginUrl);
    }

    // 3. Si el usuario ya está logueado e intenta ir al login, redirigir al Dashboard
    if (pathname.startsWith('/login') && sessionToken) {
        const dashboardUrl = new URL('/dashboard', request.url);
        return NextResponse.redirect(dashboardUrl);
    }

    return NextResponse.next();
}

// 4. Configurar el Matcher para filtrar qué rutas procesa este Middleware
export const config = {
    matcher: ['/dashboard/:path*', '/login'],
};
*/