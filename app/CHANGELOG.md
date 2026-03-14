# 📝 Changelog - Barrera Wallpaper

## [v1.0.1] - 2026-01-02 22:25 (Hotfix para Hostinger)

### 🐛 Correcciones Críticas

#### 1. Error: `ENOENT: no such file or directory, open 'yarn.lock'`
**Problema:** Hostinger no podía instalar dependencias porque `yarn.lock` no estaba en el repositorio.

**Solución:**
- ✅ Removido `yarn.lock` de `.gitignore`
- ✅ Incluido `yarn.lock` real (499KB) en el repositorio
- ✅ Esto asegura versiones consistentes de dependencias en producción

**Archivos modificados:**
- `.gitignore`
- `yarn.lock` (nuevo)

#### 2. Error: Cache path absoluta en `.yarnrc.yml`
**Problema:** La configuración tenía una ruta absoluta que no existe en Hostinger:
```yaml
cacheFolder: /opt/hostedapp/node/yarn/cache
```

**Solución:**
- ✅ Removida la línea `cacheFolder`
- ✅ Yarn ahora usa el cache por defecto del sistema
- ✅ Compatible con cualquier servidor

**Archivos modificados:**
- `.yarnrc.yml`

#### 3. Limpieza: `install-state.gz` innecesario
**Mejora:** El archivo `.yarn/install-state.gz` es generado automáticamente.

**Solución:**
- ✅ Agregado a `.gitignore`
- ✅ Removido del repositorio
- ✅ Reduce tamaño del repositorio en 1.4MB

**Archivos modificados:**
- `.gitignore`
- `.yarn/install-state.gz` (eliminado)

---

## [v1.0.0] - 2026-01-02 22:06 (Release Inicial)

### 🎉 Características Principales

#### Frontend
- ✅ Diseño responsive con Tailwind CSS
- ✅ Componentes UI de shadcn/ui
- ✅ Animaciones con Framer Motion
- ✅ Internacionalización (ES/EN)
- ✅ Modo oscuro/claro

#### Backend
- ✅ Next.js 14 con App Router
- ✅ PostgreSQL con Prisma ORM
- ✅ API Routes para lógica del servidor
- ✅ NextAuth.js para autenticación

#### Integraciones
- ✅ **Google AI Studio** - Generación de imágenes con Nano Banana
- ✅ **OpenAI** - DALL-E 3 como alternativa
- ✅ **Pictorem API** - Dropshipping de wallpapers
- ✅ **Stripe** - Procesamiento de pagos
- ✅ **PayPal** - Pagos alternativos
- ✅ **AWS S3** - Almacenamiento de imágenes

#### Funcionalidades
- ✅ Catálogo de productos con filtros
- ✅ Generador de wallpapers con IA
- ✅ Carrito de compras
- ✅ Sistema de órdenes
- ✅ Panel de administración
- ✅ Gestión de productos
- ✅ Tracking de órdenes

#### Seguridad
- ✅ Validación de formularios con Zod
- ✅ Hashing de contraseñas con bcrypt
- ✅ JWT para sesiones
- ✅ Variables de entorno protegidas

---

## 🚀 Deployment

### Plataformas Soportadas
- ✅ **Hostinger** (Node.js hosting)
- ✅ **Vercel** (recomendado)
- ✅ **Railway**
- ✅ **Render**
- ✅ Cualquier VPS con Node.js 18+

### Base de Datos
- ✅ **Supabase** (PostgreSQL gratuito) - Recomendado
- ✅ AWS RDS
- ✅ DigitalOcean Managed Database
- ⚠️ **NO compatible con MySQL** (requiere PostgreSQL)

---

## 📊 Estadísticas del Proyecto

- **Lenguajes:** TypeScript (95%), CSS (5%)
- **Líneas de código:** ~15,000
- **Componentes React:** 50+
- **API Endpoints:** 25+
- **Modelos de base de datos:** 12
- **Páginas:** 15+

---

## 🔄 Historial de Commits

```
adacad3 Fix: Exclude .yarn/install-state.gz from repository
d85a1bf Fix: Remove absolute cache path from .yarnrc.yml
2cdd127 Fix: Include yarn.lock for Hostinger deployment
86c64df Add: GitHub deployment helper script
8657ece Initial commit: Barrera Wallpaper E-Commerce Platform
```

---

## 📞 Soporte

**Email:** oscarbarrera@barrerawallpaper.com  
**WhatsApp:** +57 311 266 27 09  
**Sitio:** https://barrerawallpaper.com

---

**Mantenido por:** Barrera Wallpaper Team  
**Licencia:** Propietario © 2026