# Barrera Wallpaper - E-Commerce Platform

![Barrera Wallpaper](https://i.pinimg.com/736x/8e/62/60/8e626083d0f446968d86e7b9837176f1.jpg)

## 🎨 Sobre el Proyecto

Plataforma de e-commerce para venta de papel tapiz decorativo con integración de IA para diseño personalizado y sistema de dropshipping automatizado.

**Sitio Web:** https://barrerawallpaper.com

---

## ✨ Características Principales

### 🛍️ E-Commerce Completo
- ✅ Catálogo de productos con filtros y búsqueda
- ✅ Carrito de compras persistente
- ✅ Checkout con múltiples métodos de pago
- ✅ Panel de administración para gestión de productos
- ✅ Sistema de órdenes y tracking

### 🤖 AI Studio
- ✅ Generación de diseños de wallpaper con IA (DALL-E 3)
- ✅ Personalización de dimensiones y materiales
- ✅ Previsualización en tiempo real
- ✅ Galería de ejemplos generados

### 📦 Dropshipping Automatizado
- ✅ Integración con Pictorem para impresión y envío
- ✅ Sincronización automática de órdenes
- ✅ Cálculo dinámico de precios y márgenes
- ✅ Seguimiento de estado de órdenes

### 💳 Procesamiento de Pagos
- ✅ Stripe (tarjetas de crédito/débito)
- ✅ PayPal
- ✅ Webhooks para confirmación automática
- ✅ Soporte para pagos de invitados

### 🔐 Autenticación y Seguridad
- ✅ NextAuth.js con credenciales
- ✅ Panel de administración protegido
- ✅ Gestión de sesiones seguras
- ✅ Encriptación de contraseñas con bcrypt

### 🌐 Internacionalización
- ✅ Soporte multiidioma (Español/Inglés)
- ✅ Traducciones dinámicas en toda la app
- ✅ Selección de idioma persistente

---

## 🛠️ Stack Tecnológico

### Frontend
- **Framework:** Next.js 14.2.28 (App Router)
- **UI Library:** React 18.2
- **Estilos:** Tailwind CSS 3.3
- **Componentes UI:** Radix UI, shadcn/ui
- **Animaciones:** Framer Motion
- **Forms:** React Hook Form + Zod
- **State Management:** Zustand

### Backend
- **Runtime:** Node.js 22.x
- **API:** Next.js API Routes
- **Database:** PostgreSQL (Supabase)
- **ORM:** Prisma 6.7
- **Auth:** NextAuth.js 4.24
- **File Storage:** AWS S3 / Supabase Storage

### Integraciones Externas
- **IA:** OpenAI API (DALL-E 3)
- **Dropshipping:** Pictorem API
- **Pagos:** Stripe, PayPal
- **Email:** (Configuración pendiente)

### DevOps
- **Hosting:** Hostinger (Node.js App)
- **Database:** Supabase (PostgreSQL)
- **Version Control:** Git + GitHub
- **Package Manager:** Yarn 1.22

---

## 📁 Estructura del Proyecto

```
barrera_wallpaper/
├── app/                          # Código fuente principal
│   ├── app/                      # Next.js App Router
│   │   ├── page.tsx             # Página principal
│   │   ├── about/               # Sobre nosotros
│   │   ├── catalog/             # Catálogo de productos
│   │   ├── shop/                # Tienda online
│   │   ├── ai-studio/           # Generador AI
│   │   ├── services/            # Servicios de instalación
│   │   ├── contact/             # Contacto
│   │   ├── cart/                # Carrito de compras
│   │   ├── admin/               # Panel administración
│   │   │   ├── products/        # Gestión productos
│   │   │   └── orders/          # Gestión órdenes
│   │   └── api/                 # API Routes
│   │       ├── auth/            # Autenticación
│   │       ├── products/        # CRUD productos
│   │       ├── orders/          # Gestión órdenes
│   │       ├── payments/        # Stripe/PayPal
│   │       ├── ai-wallpaper/    # Generación IA
│   │       └── pictorem/        # Dropshipping
│   ├── components/              # Componentes React
│   │   ├── ui/                  # Componentes UI base
│   │   ├── header.tsx           # Navegación
│   │   ├── footer.tsx           # Pie de página
│   │   └── whatsapp-float.tsx   # Botón WhatsApp
│   ├── lib/                     # Utilidades
│   │   ├── prisma.ts            # Cliente Prisma
│   │   ├── auth-options.ts      # Config NextAuth
│   │   ├── pictorem.ts          # Cliente Pictorem
│   │   ├── s3.ts                # Config AWS S3
│   │   └── utils.ts             # Helpers
│   ├── prisma/                  # Database
│   │   └── schema.prisma        # Modelos Prisma
│   ├── public/                  # Assets estáticos
│   │   └── images/              # Imágenes
│   └── package.json             # Dependencies
└── README.md                    # Este archivo
```

---

## 🚀 Instalación y Desarrollo Local

### Prerrequisitos

- Node.js 22.x o superior
- Yarn 1.22 o superior
- PostgreSQL 14+ (o cuenta Supabase)
- Cuenta OpenAI (para AI Studio)
- Cuenta Stripe/PayPal (para pagos)

### 1. Clonar el Repositorio

```bash
git clone https://github.com/TU_USUARIO/barrera-wallpaper.git
cd barrera-wallpaper/app
```

### 2. Instalar Dependencias

```bash
yarn install
```

### 3. Configurar Variables de Entorno

Crea un archivo `.env` en la carpeta `app/`:

```env
# Base de Datos (OBLIGATORIO)
DATABASE_URL="postgresql://user:password@host:6543/database"

# Autenticación (OBLIGATORIO)
NEXTAUTH_SECRET="tu_secret_generado"
NEXTAUTH_URL="http://localhost:3000"

# OpenAI API (Opcional - para AI Studio)
OPENAI_API_KEY="sk-proj-xxxxx"

# Stripe (Opcional - para pagos)
STRIPE_SECRET_KEY="sk_test_xxxxx"
STRIPE_PUBLISHABLE_KEY="pk_test_xxxxx"
STRIPE_WEBHOOK_SECRET="whsec_xxxxx"

# PayPal (Opcional - para pagos)
PAYPAL_CLIENT_ID="xxxxx"
PAYPAL_CLIENT_SECRET="xxxxx"
PAYPAL_ENVIRONMENT="sandbox"

# Pictorem (Opcional - para dropshipping)
PICTOREM_API_KEY="xxxxx"
PICTOREM_SECRET="xxxxx"
PICTOREM_BASE_URL="https://www.pictorem.com/artflow"

# AWS S3 (Opcional - para subir imágenes)
AWS_BUCKET_NAME="tu-bucket"
AWS_FOLDER_PREFIX="productos/"
```

### 4. Generar Prisma Client

```bash
yarn prisma generate
```

### 5. Migrar Base de Datos

```bash
yarn prisma db push
```

### 6. Seed de Datos Iniciales (Opcional)

```bash
yarn prisma db seed
```

### 7. Iniciar Servidor de Desarrollo

```bash
yarn dev
```

Abre http://localhost:3000 en tu navegador.

---

## 📦 Despliegue en Producción

### Hostinger (Actual)

1. **Comprimir proyecto:**
   ```bash
   tar czf barrera_wallpaper.tar.gz \
     --exclude=node_modules \
     --exclude=.next \
     --exclude=.build \
     app/
   ```

2. **Subir a Hostinger:**
   - Panel → Setup Node.js App
   - Subir archivo comprimido
   - Descomprimir en servidor

3. **Configurar Variables:**
   - Agregar todas las variables de entorno
   - Usar Session Pooler para DATABASE_URL (puerto 6543)

4. **Configurar App:**
   - Node.js version: 22.x
   - Application root: `/app`
   - Startup file: `.build/standalone/app/server.js`
   - Application mode: Production

5. **Restart y Verificar:**
   - Click en RESTART
   - Esperar 2-3 minutos
   - Abrir dominio

### Vercel (Alternativa)

```bash
vercel --prod
```

---

## 🔑 Credenciales de Administración

**Panel Admin:** https://barrerawallpaper.com/admin/products

```
Email: admin@barrerawallpaper.com
Password: admin123
```

⚠️ **IMPORTANTE:** Cambia estas credenciales en producción.

---

## 📊 Base de Datos

### Modelos Principales

- **User:** Usuarios y administradores
- **Product:** Catálogo de productos
- **Category:** Categorías de productos
- **Order:** Órdenes de compra
- **OrderItem:** Items de cada orden
- **AIWallpaperOrder:** Órdenes AI Studio
- **PaymentTransaction:** Transacciones de pago
- **AIGenerationRequest:** Historial generaciones IA

### Migraciones

Prisma maneja las migraciones automáticamente:

```bash
# Crear migración
yarn prisma migrate dev --name nombre_migracion

# Aplicar migraciones
yarn prisma migrate deploy
```

---

## 🧪 Testing

```bash
# Linting
yarn lint

# Type checking
yarn tsc --noEmit

# Build test
yarn build
```

---

## 📝 Scripts Disponibles

```bash
yarn dev          # Desarrollo
yarn build        # Build producción
yarn start        # Servidor producción
yarn lint         # Linting
yarn prisma generate   # Generar Prisma Client
yarn prisma studio     # Explorador DB
```

---

## 🐛 Troubleshooting

### Error 503 en Producción

✅ **Solución:** Verificar que todas las variables de entorno estén configuradas, especialmente `DATABASE_URL` con Session Pooler (`:6543`).

### Error de Prisma Client

✅ **Solución:** Ejecutar `yarn prisma generate` después de cada cambio en schema.

### Error de Build

✅ **Solución:** Verificar que no haya rutas absolutas en el código. Usar rutas relativas.

### Imágenes no Cargan

✅ **Solución:** Verificar configuración de AWS S3 o Supabase Storage.

---

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

---

## 🚀 Deployment

### Despliegue Automático desde GitHub

Esta aplicación está configurada para despliegue automático continuo (CI/CD) desde GitHub a Hostinger.

**Cómo funciona:**
1. Haces cambios en tu código local
2. Haces `git push` a la rama `main`
3. GitHub Actions ejecuta automáticamente:
   - Tests de compilación
   - Deployment a Hostinger via SSH
   - Reinicio de la aplicación

**Para configurar el despliegue automático, ver:**
📚 **[DEPLOYMENT.md](DEPLOYMENT.md)** - Guía completa de deployment

### Deployment Manual Rápido

Si necesitas hacer deployment manual en Hostinger:

```bash
# Conectar por SSH a Hostinger
ssh u123456789@yourdomain.com -p 65002

# Actualizar código
cd ~/htdocs/barrera-wallpaper
git pull origin main

# Ejecutar script de deployment
cd app
chmod +x ../deploy.sh
../deploy.sh
```

### Comandos Útiles

```bash
# Ver logs en tiempo real
pm2 logs barrera-wallpaper

# Ver estado de la aplicación
pm2 status

# Reiniciar aplicación
pm2 restart barrera-wallpaper

# Actualización rápida
./quick-update.sh
```

### Variables de Entorno Requeridas

Ver `.env.example` para la lista completa de variables de entorno necesarias.

**Mínimas para funcionar:**
- `DATABASE_URL` - Supabase PostgreSQL (Session Pooler)
- `NEXTAUTH_SECRET` - Generado con `openssl rand -base64 32`
- `NEXTAUTH_URL` - URL de tu dominio

---

## 📄 Licencia

Propietario: Barrera Wallpaper  
Todos los derechos reservados © 2024-2025

---

## 📞 Contacto

- **WhatsApp:** +57 3133625858
- **Email:** atencion@barrerawallpaper.com
- **Dirección:** Calle 29# 45-33, Bogotá, Colombia
- **Website:** https://barrerawallpaper.com

---

## 🙏 Agradecimientos

- Next.js Team
- Vercel
- shadcn/ui
- Radix UI
- Prisma Team
- OpenAI
- Pictorem

---

**Desarrollado con ❤️ por Barrera Wallpaper**
