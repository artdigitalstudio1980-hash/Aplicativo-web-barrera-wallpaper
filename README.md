# 🎨 Barrera Wallpaper - Premium Wallpaper E-Commerce Platform

## 📋 Descripción

Plataforma web completa para venta de papeles tapiz premium con:
- ✅ Catálogo de diseños exclusivos
- ✅ Panel de administración
- ✅ Procesamiento de pagos (Stripe + PayPal)
- ✅ Sistema de cotizaciones y contacto

## 🚀 Tech Stack

- **Framework:** Next.js 14 (App Router)
- **UI:** React 18, Tailwind CSS, shadcn/ui
- **Base de Datos:** PostgreSQL (Supabase)
- **ORM:** Prisma 6.7
- **Autenticación:** NextAuth.js 4.24
- **Pagos:** Stripe + PayPal
- **Almacenamiento:** MYsql hostinger


## 📦 Instalación Local

### Prerequisitos
- Node.js 18+ o 20+
- Yarn
- MYsql hostinger

### Pasos

1. **Clonar el repositorio:**
```bash
git clone <your-repo-url>
cd app
```

2. **Instalar dependencias:**
```bash
yarn install
```

3. **Configurar variables de entorno:**
```bash
cp .env.example .env
```
Edita `.env` con tus credenciales reales.

4. **Generar Prisma Client:**
```bash
yarn prisma generate
```

5. **Ejecutar migraciones (opcional si ya tienes DB):**
```bash
yarn prisma db push
```

6. **Seed de datos (opcional):**
```bash
yarn prisma db seed
```

7. **Iniciar servidor de desarrollo:**
```bash
yarn dev
```

Abre [http://localhost:3000](http://localhost:3000)

## 🔐 Variables de Entorno Requeridas

Ver `.env.example` para la lista completa. Las variables críticas son:

- `DATABASE_URL` - Connection string de PostgreSQL (usa Session Pooler en Supabase)
- `NEXTAUTH_SECRET` - Secret key para autenticación (min 32 caracteres)
- `NEXTAUTH_URL` - URL de tu aplicación
- `GOOGLE_AI_STUDIO_API_KEY` - Para generación de imágenes con IA
- `AWS_BUCKET_NAME` - Bucket de S3 para almacenar imágenes
- `STRIPE_SECRET_KEY` - Para procesamiento de pagos
- `PAYPAL_CLIENT_ID` - Para procesamiento de pagos con PayPal

## 🌐 Despliegue en Hostinger

### Opción 1: Deployment Manual

1. Comprimir el proyecto (excluyendo node_modules, .next, etc)
2. Subir a Hostinger vía FTP
3. Configurar variables de entorno en Hostinger
4. Ejecutar `npm install --legacy-peer-deps` en Hostinger

### Opción 2: Deployment Automático con Git (Recomendado)

1. **En GitHub:**
   - Crear repositorio privado
   - Push del código

2. **En Hostinger:**
   - Panel → "Aplicaciones web" → Tu app
   - Scroll hasta "Implementación de Git"
   - Conectar con GitHub
   - Seleccionar repositorio y rama (main/master)
   - Configurar variables de entorno
   - Habilitar "Deploy automático"

3. **Cada push a la rama main desplegará automáticamente**

## 📁 Estructura del Proyecto

```
app/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   ├── admin/        # Admin endpoints
│   │   ├── ai-wallpaper/ # IA generation
│   │   ├── payments/     # Stripe/PayPal
│   │   └── pictorem/     # Dropshipping
│   ├── admin/            # Admin panel
│   ├── ai-studio/        # AI wallpaper generator
│   ├── catalog/          # Product catalog
│   └── ...
├── components/           # React components
│   ├── ui/              # shadcn/ui components
│   ├── header.tsx
│   └── footer.tsx
├── lib/                 # Utilities
│   ├── auth-options.ts  # NextAuth config
│   ├── db.ts           # Database utilities
│   ├── prisma.ts       # Prisma client
│   └── s3.ts           # AWS S3 utilities
├── prisma/
│   └── schema.prisma   # Database schema
├── public/
│   └── images/         # Static images
└── package.json
```

## 👤 Usuario Admin por Defecto

**Email:** admin@barrera.com  
**Password:** admin123  

⚠️ **Cambiar en producción**

## 🔧 Scripts Disponibles

```bash
yarn dev          # Servidor de desarrollo
yarn build        # Build de producción
yarn start        # Servidor de producción
yarn lint         # Linting
yarn prisma generate  # Generar Prisma Client
```

## 📞 Soporte

- **Email:** oscarbarrera@barrerawallpaper.com
- **WhatsApp:** +57 311 266 27 09
- **Sitio Web:** https://barrerawallpaper.com

## 📄 Licencia

Propietario - Barrera Wallpaper © 2026

---

**Desarrollado por:** Barrera Wallpaper Team  
**Año:** 2026