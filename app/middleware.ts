import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Rutas que requieren autenticación de administrador
  const isAdminPath = pathname.startsWith('/admin') || pathname.startsWith('/api/admin');

  if (isAdminPath) {
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    });

    // Si no hay token o no es administrador, bloquear acceso
    if (!token || !token.isAdmin) {
      console.warn(`Intento de acceso no autorizado a ${pathname} desde ${request.ip}`);
      
      // Si es una ruta de API, devolver JSON
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { error: 'Forbidden: Admin access required' },
          { status: 403 }
        );
      }
      
      // Si es una ruta de interfaz, redirigir al login
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Protege todas las rutas admin y api/admin
     */
    '/admin/:path*',
    '/api/admin/:path*',
  ],
};
