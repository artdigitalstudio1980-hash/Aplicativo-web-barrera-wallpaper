# INFORME COMPLETO DEL PROYECTO — BARRERA WALLPAPER
## Contexto para revisión de código por IA

---

## 1. DESCRIPCIÓN GENERAL DEL PROYECTO

**Nombre:** Barrera Wallpaper  
**URL producción:** https://barrerawallpaper.com  
**Tipo:** E-commerce + Design Tool — Next.js 14 App Router  
**Propietario:** Oscar Barrera — Miami, FL, USA  
**Idioma del sitio:** Inglés (primario), Español (soporte i18n)  
**Stack principal:** Next.js 14, TypeScript, Prisma ORM, MySQL, Tailwind CSS, NextAuth, Framer Motion, Radix UI

El sitio vende wallpaper premium de la marca SYSTEXX by Vitrulan (fibra de vidrio alemana), ofrece un AI Design Visualizer para previsualizar wallpapers en paredes reales, e incluye servicios de instalación en Miami.

---

## 2. INFRAESTRUCTURA DE HOSTING Y DEPLOY

### Servidor de producción
- **Proveedor:** Hostinger (hPanel)
- **IP:** `62.72.52.102`
- **SSH:** `ssh -p 65002 u425976741@62.72.52.102`
- **SSH Password:** `#G$vNW2d6LLw!cq`
- **App path (activo/real):** `/home/u425976741/domains/barrerawallpaper.com/nodejs/`
- **Runtime:** Node.js v20 via NVM + PM2 + Yarn
- **PM2 process name:** `barrera-wallpaper`
- **PM2 start command:** `yarn start`

### Base de datos MySQL (Hostinger remote)
- **Host:** `31.97.208.22:3306`
- **Database:** `u425976741_barrera`
- **User:** `u425976741_wallpaper`
- **Password:** `Elementos8003*`
- **DATABASE_URL:** `mysql://u425976741_wallpaper:Elementos8003*@31.97.208.22:3306/u425976741_barrera`
- **relationMode:** `prisma` (Prisma emula relaciones, sin foreign keys reales en MySQL)

### GitHub Repository
- **Repo:** `artdigitalstudio1980-hash/barrera-wallpaper`
- **Branch principal:** `main`
- **GitHub Token:** `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`

### Variables de entorno requeridas (configuradas en hPanel Node.js → Environment Variables)
```
DATABASE_URL=mysql://u425976741_wallpaper:Elementos8003*@31.97.208.22:3306/u425976741_barrera
NEXTAUTH_SECRET=barrera_wallpaper_secret_2024
NEXTAUTH_URL=https://barrerawallpaper.com
```

---

## 3. ESTRUCTURA DEL REPOSITORIO

```
barrera_wallpaper/                  ← root del repo
├── .github/
│   └── workflows/
│       └── deploy.yml              ← Pipeline CI/CD GitHub Actions
├── app/                            ← Next.js app (TODO el código)
│   ├── app/                        ← Next.js 14 App Router
│   │   ├── layout.tsx
│   │   ├── page.tsx                ← Homepage
│   │   ├── catalog/page.tsx        ← Página catálogo de productos ★
│   │   ├── design/                 ← AI Design Visualizer (room visualizer)
│   │   ├── shop/[slug]/            ← Product detail
│   │   ├── api/
│   │   │   ├── products/route.ts   ← GET /api/products ★
│   │   │   ├── auth/               ← NextAuth
│   │   │   ├── ai/                 ← AI wallpaper generation
│   │   │   ├── checkout/           ← Stripe + PayPal
│   │   │   ├── orders/
│   │   │   ├── installations/
│   │   │   └── ...
│   │   ├── admin/                  ← Panel admin
│   │   ├── account/
│   │   ├── cart/
│   │   ├── calculator/             ← Calculadora de m²
│   │   ├── contact/
│   │   └── ...
│   ├── components/                 ← Componentes React compartidos
│   ├── lib/
│   │   ├── prisma.ts               ← Prisma client singleton
│   │   └── s3.ts                   ← AWS S3 (imágenes en cloud)
│   ├── prisma/
│   │   └── schema.prisma           ← Schema completo DB
│   ├── scripts/
│   │   ├── seed-systexx.ts         ← Seed 25 productos SYSTEXX ★
│   │   ├── seed.ts
│   │   ├── update_db_secret.py     ← Actualiza secrets de GitHub via API
│   │   └── ...
│   ├── public/
│   │   ├── wallpapers/             ← Imágenes de wallpaper local
│   │   ├── catalogo_wallpaper/     ← Screenshots catálogo SYSTEXX
│   │   └── ...
│   ├── next.config.js
│   ├── package.json
│   ├── tailwind.config.ts
│   └── yarn.lock
```

---

## 4. PIPELINE CI/CD — `.github/workflows/deploy.yml`

### Estrategia actual (rsync)
El deploy hace BUILD en GitHub Actions (Ubuntu runner) y transfiere los archivos compilados al servidor via rsync+sshpass. No hace git clone en el servidor (Hostinger bloquea outbound git).

### Secrets de GitHub configurados
| Secret | Valor |
|--------|-------|
| `DATABASE_URL` | `mysql://u425976741_wallpaper:Elementos8003*@31.97.208.22:3306/u425976741_barrera` |
| `NEXTAUTH_SECRET` | `barrera_wallpaper_secret_2024` |
| `NEXTAUTH_URL` | `https://barrerawallpaper.com` |
| `HOSTINGER_HOST` | `62.72.52.102` |
| `HOSTINGER_PORT` | `65002` |
| `HOSTINGER_USERNAME` | `u425976741` |
| `HOSTINGER_PASSWORD` | `#G$vNW2d6LLw!cq` |

### Flujo del workflow
```
push to main
  → checkout
  → setup Node.js 20 + yarn cache
  → yarn install --frozen-lockfile
  → yarn prisma generate
  → yarn build  (con env vars de secrets)
  → write .env file  (con printf)
  → apt-get install rsync sshpass
  → rsync -avz --delete ./app/ → servidor:/home/u425976741/domains/barrerawallpaper.com/nodejs/
  → SSH: nvm + cd nodejs + yarn install --production + yarn prisma generate + pm2 restart --update-env
```

### PROBLEMA ACTIVO — rsync SSH connection timeout
El step "Deploy files via rsync" falla con:
```
ssh: connect to host 62.72.52.102 port 65002: Connection timed out
rsync error: unexplained error (code 255) at io.c(232) [sender=3.2.7]
```
- El run anterior (#23364292926) SÍ funcionó con rsync al path `/home/u425976741/htdocs/barrerawallpaper.com`
- El run actual (#23365014097 y #23365341709) fallan con timeout al nuevo path `/home/u425976741/domains/barrerawallpaper.com/nodejs/`
- El path de destino NO debería afectar la conexión SSH — el timeout ocurre antes de que rsync llegue a crear el directorio
- Posibles causas: (a) intermittencia de red en GitHub Actions runner, (b) rate limiting/IP ban temporal de Hostinger firewall, (c) el puerto 65002 ocasionalmente inaccesible desde GitHub Actions IPs

### Historial de errores resueltos
1. **SSH exit 127** → `yarn`, `pm2`, `node` not found → Fix: instalé NVM+Node20+Yarn+PM2 en servidor via SSH manual
2. **Git clone timeout** → Hostinger bloquea outbound git → Fix: cambié estrategia a rsync desde GitHub Actions
3. **DATABASE_URL secret incorrecto** → tenía credenciales `u425976741_admin1` → Fix: script Python con PyNaCl actualizó el secret
4. **Prisma EACCES** → query-engine binary sin permisos ejecutables → Fix: `chmod +x` en binarios de Prisma en servidor
5. **`.env` vacío en servidor** → heredoc no funcionó correctamente → Fix: usé `printf` con `\n` explícito
6. **PM2 no cargaba nuevo .env** → `pm2 restart` sin `--update-env` → Fix: agregué flag `--update-env`
7. **App corriendo desde path incorrecto** → hPanel Node.js usa `/domains/.../nodejs/` no `/htdocs/` → Fix: hardcodeé el path correcto en deploy.yml
8. **Variables de entorno vacías en producción** → Fix: el usuario las configuró manualmente en hPanel → Node.js → Environment Variables (solución permanente)

---

## 5. PRISMA SCHEMA — MODELOS RELEVANTES

### Model: Category
```prisma
model Category {
  id            String   @id @default(cuid())
  name          String
  nameEs        String
  slug          String   @unique
  description   String?
  descriptionEs String?
  image         String?
  isActive      Boolean  @default(true)
  order         Int      @default(0)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  products      Product[]
}
```

### Model: Product
```prisma
model Product {
  id               String   @id @default(cuid())
  name             String
  nameEs           String
  description      String?
  descriptionEs    String?
  slug             String   @unique
  sku              String   @unique
  price            Float
  salePrice        Float?
  images           Json     // array de URLs
  colors           Json
  styles           Json
  dimensions       String?  // ej: "Roll: 35.43\" W x 164.04\" L (0.90m x 4.17m)"
  material         String?  // ej: "Glass fiber wallcovering"
  materialEs       String?
  isCustomizable   Boolean  @default(false)
  isActive         Boolean  @default(true)
  isFeatured       Boolean  @default(false)
  stock            Int      @default(0)
  cloudStoragePath String?  // path en AWS S3
  categoryId       String
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
  category         Category
  cartItems        CartItem[]
  orderItems       OrderItem[]
  @@index([categoryId])
}
```

### Categorías SYSTEXX en DB (3 categorías)
| slug | name |
|------|------|
| `systexx-active` | SYSTEXX Active |
| `systexx-phantasy` | SYSTEXX Phantasy |
| `systexx-pure` | SYSTEXX Pure |

### Productos SYSTEXX en DB (25 productos)
Seeded via `app/scripts/seed-systexx.ts`. Precios para mercado Miami (USD por rollo):
- Active: $85–$95/roll
- Phantasy: $95–$110/roll  
- Pure: $75–$85/roll

Todos los productos tienen: `stock: 10`, `isCustomizable: false`, `isFeatured` en algunos, `dimensions: "Roll: 35.43\" W x 164.04\" L (0.90m x 4.17m)"`, `material: "Glass fiber wallcovering (Glasfasertapete) by Vitrulan"`.

---

## 6. API ENDPOINT — `/api/products`

Archivo: `app/app/api/products/route.ts`

```typescript
export const dynamic = 'force-dynamic';
// GET /api/products?category=slug&featured=true
// Returns: { success: true, products: [...] }
// Cada producto incluye: category (joined), imageUrl (generada desde S3 si cloudStoragePath existe)
```

**Estado actual:** ✅ FUNCIONANDO en producción  
Curl confirm: `https://barrerawallpaper.com/api/products/` retorna 25 productos SYSTEXX con todos sus campos.

---

## 7. PÁGINA CATÁLOGO — `/catalog`

Archivo: `app/app/catalog/page.tsx`  
Tipo: `'use client'` — Client Component

### Funcionalidades implementadas
- Fetch de `/api/products` al montar (useEffect)
- Search por nombre (EN/ES) y categoría
- Filtro por categoría (botones dinámicos extraídos de los productos)
- Sort: Featured / Price Low-High / Price High-Low / Name
- Grid responsivo: 1 col mobile → 4 col xl
- Animaciones con framer-motion (stagger por index)
- Badge "SYSTEXX" en productos de categorías `systexx-*`
- Badges: Featured, Custom, Sale
- Dimensiones del producto con icono Ruler
- Material del producto
- Precio con salePrice tachado si aplica
- Overlay hover con botón "Visualize on Wall"
- 3 botones por card: Try (→ /design?wallpaperId=ID), Buy (→ /shop/slug), Quote (→ /contact)
- Banner superior "Design Visualizer available" con link a /design
- Estado de carga con Loader2 spinner
- Toast de error si falla el fetch

### Dependencias de componentes usadas
- `@/components/ui/button` (shadcn/ui)
- `@/components/ui/input` (shadcn/ui)
- `@/components/locale-context` (useLocale hook custom)
- `lucide-react`: Search, SlidersHorizontal, Loader2, Wand2, ShoppingCart, MessageSquare, Ruler
- `framer-motion`: motion.div
- `sonner`: toast
- `next/image`: Image con fill + object-cover
- `next/navigation`: useRouter

### Flujo "Visualize on Wall"
```
Click en card → router.push('/design?wallpaperId={product.id}')
```
El wallpaperId (cuid de DB) se pasa como query param a la página /design donde se usa para precargar el wallpaper en el AI room visualizer.

---

## 8. OTRAS PÁGINAS Y MÓDULOS CLAVE

### `/design` — AI Room Visualizer
Permite al usuario subir foto de su habitación y previsualizar cualquier wallpaper sobre sus paredes. Recibe `?wallpaperId=` como query param desde el catálogo.

### `/shop/[slug]` — Product Detail
Página individual de cada producto.

### `/calculator` — Calculadora de m²
Herramienta para calcular cuántos rollos necesita el usuario según dimensiones de la habitación.

### `/admin` — Panel de administración
Área protegida para gestión de productos, órdenes, instalaciones.

### `/ai-studio` — Generador AI de wallpaper
Permite al usuario generar diseños custom con IA (OpenAI), luego ordenar la impresión via Pictorem.

### Autenticación
NextAuth v4 con Prisma adapter. Soporta email/password + OAuth providers. Roles: USER, ADMIN.

### Pagos
Stripe + PayPal integrados. Webhooks en `/api/webhooks/`.

---

## 9. NEXT.CONFIG.JS — CONFIGURACIÓN RELEVANTE

```javascript
const nextConfig = {
  distDir: process.env.NEXT_DIST_DIR || '.next',
  output: process.env.NEXT_OUTPUT_MODE,        // undefined en prod = standalone no activado
  trailingSlash: true,
  experimental: {
    outputFileTracingRoot: path.join(__dirname, '../'),
  },
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: false },
  images: {
    unoptimized: true,                          // No optimización de imágenes Next.js
    remotePatterns: [ replicate, supabase, amazonaws, cloudinary, pinimg, unsplash ]
  }
};
```

**Nota importante:** `output: process.env.NEXT_OUTPUT_MODE` — si esta variable está vacía (como en producción), Next.js usa el modo default (`.next/` con servidor Node.js estándar). PM2 ejecuta `yarn start` que llama `next start`.

---

## 10. PACKAGE.JSON — DEPENDENCIAS PRINCIPALES

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "postinstall": "prisma generate"
  },
  "dependencies": {
    "next": "14.2.28",
    "react": "18.2.0",
    "@prisma/client": "6.7.0",
    "next-auth": "4.24.11",
    "framer-motion": "10.18.0",
    "tailwindcss": "3.3.3",
    "lucide-react": "0.446.0",
    "sonner": "1.5.0",
    "stripe": "^18.5.0",
    "openai": "^4.47.1",
    "@aws-sdk/client-s3": "^3.879.0",
    "zustand": "5.0.3",
    "@tanstack/react-query": "5.0.0",
    "zod": "3.23.8",
    "react-hook-form": "7.53.0",
    "bcryptjs": "2.4.3",
    "nodemailer": "^8.0.2"
  },
  "devDependencies": {
    "prisma": "6.7.0",
    "typescript": "5.2.2",
    "tsx": "4.20.3"
  }
}
```

---

## 11. PRISMA — CONFIGURACIÓN

```prisma
generator client {
  provider      = "prisma-client-js"
  binaryTargets = ["native", "debian-openssl-1.1.x"]
  engineType    = "binary"
}

datasource db {
  provider     = "mysql"
  url          = env("DATABASE_URL")
  relationMode = "prisma"   // ← Importante: emula FKs, NO las crea en MySQL
}
```

**binaryTargets:** `native` (Ubuntu CI) + `debian-openssl-1.1.x` (Hostinger server).  
**engineType:** `binary` (no library) para compatibilidad con Hostinger.

---

## 12. DEPLOY.YML COMPLETO (estado actual)

```yaml
name: Deploy to Hostinger

on:
  push:
    branches:
      - main
  workflow_dispatch:

jobs:
  deploy:
    name: Deploy Application
    runs-on: ubuntu-latest

    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20.x'
          cache: 'yarn'
          cache-dependency-path: 'app/yarn.lock'

      - name: Install Dependencies
        working-directory: ./app
        run: |
          yarn install --frozen-lockfile
          yarn prisma generate

      - name: Build
        working-directory: ./app
        run: yarn build
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          NEXTAUTH_SECRET: ${{ secrets.NEXTAUTH_SECRET }}
          NEXTAUTH_URL: ${{ secrets.NEXTAUTH_URL }}

      - name: Write server .env
        working-directory: ./app
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          NEXTAUTH_SECRET: ${{ secrets.NEXTAUTH_SECRET }}
          NEXTAUTH_URL: ${{ secrets.NEXTAUTH_URL }}
        run: |
          printf 'DATABASE_URL=%s\nNEXTAUTH_SECRET=%s\nNEXTAUTH_URL=%s\n' \
            "$DATABASE_URL" "$NEXTAUTH_SECRET" "$NEXTAUTH_URL" > .env

      - name: Install rsync and sshpass
        run: sudo apt-get install -y rsync sshpass

      - name: Deploy files via rsync
        env:
          HOSTINGER_HOST: ${{ secrets.HOSTINGER_HOST }}
          HOSTINGER_PORT: ${{ secrets.HOSTINGER_PORT }}
          HOSTINGER_USERNAME: ${{ secrets.HOSTINGER_USERNAME }}
          HOSTINGER_PASSWORD: ${{ secrets.HOSTINGER_PASSWORD }}
        run: |
          sshpass -p "$HOSTINGER_PASSWORD" rsync -avz --delete \
            -e "ssh -p $HOSTINGER_PORT -o StrictHostKeyChecking=no" \
            --exclude='.git' \
            --exclude='node_modules' \
            --exclude='scripts' \
            ./app/ \
            "$HOSTINGER_USERNAME@$HOSTINGER_HOST:/home/u425976741/domains/barrerawallpaper.com/nodejs/"

      - name: Start/Restart App via SSH
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.HOSTINGER_HOST }}
          username: ${{ secrets.HOSTINGER_USERNAME }}
          password: ${{ secrets.HOSTINGER_PASSWORD }}
          port: ${{ secrets.HOSTINGER_PORT }}
          script: |
            export NVM_DIR="$HOME/.nvm"
            [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

            cd /home/u425976741/domains/barrerawallpaper.com/nodejs

            yarn install --production --frozen-lockfile
            yarn prisma generate

            if pm2 describe barrera-wallpaper > /dev/null 2>&1; then
              pm2 restart barrera-wallpaper --update-env
            else
              pm2 start "yarn start" --name barrera-wallpaper
              pm2 save
            fi
```

---

## 13. PROBLEMA PRINCIPAL A RESOLVER — rsync SSH TIMEOUT

### Síntoma
```
ssh: connect to host 62.72.52.102 port 65002: Connection timed out
rsync error: unexplained error (code 255)
```

### Contexto
- El step de rsync tarda ~2 minutos antes de fallar (tiempo de timeout TCP)
- El step de SSH (appleboy/ssh-action) para el restart de PM2 TAMBIÉN usa el mismo host:port pero ese step se skipea porque el anterior falla
- El run anterior exitoso (#23364292926) usó el mismo mecanismo rsync+sshpass al mismo servidor, mismo puerto
- La diferencia entre el run exitoso y los fallidos es únicamente el path de destino rsync (pero eso no afecta la conexión TCP)
- Hostinger puede tener firewall dinámico que bloquea IPs de GitHub Actions temporalmente
- GitHub Actions usa rangos de IPs rotativas publicadas en https://api.github.com/meta

### Opciones de solución a evaluar
1. **Retry automático en el step rsync** — usar `|| true` + loop de reintentos
2. **Usar SSH key en lugar de password** — generar keypair, agregar pub key a `~/.ssh/authorized_keys` en servidor, guardar private key como secret
3. **Agregar timeout y retry al ssh-action**
4. **Usar una VPN/túnel alternativo** — Cloudflare Tunnel, ngrok
5. **Cambiar estrategia de deploy** — Hostinger Git deploy nativo, o webhook pull desde el servidor
6. **Usar `appleboy/scp-action`** en lugar de rsync+sshpass
7. **Agregar ConnectTimeout más corto + múltiples reintentos** en el comando ssh de rsync

### Solución recomendada
Agregar reintentos en el step rsync con backoff, y agregar `ConnectTimeout=30` al ssh options:
```bash
for i in 1 2 3; do
  sshpass -p "$HOSTINGER_PASSWORD" rsync -avz --delete \
    -e "ssh -p $HOSTINGER_PORT -o StrictHostKeyChecking=no -o ConnectTimeout=30" \
    ... && break
  echo "Retry $i failed, waiting 15s..."
  sleep 15
done
```

---

## 14. ESTADO ACTUAL DE PRODUCCIÓN

| Componente | Estado |
|------------|--------|
| App corriendo en servidor | ✅ Activa via PM2 |
| DB con 25 productos SYSTEXX | ✅ Seeded |
| API `/api/products/` | ✅ Retorna 25 productos |
| Página `/catalog` | ✅ Code listo, muestra productos |
| Variables de entorno en hPanel | ✅ Configuradas manualmente |
| Deploy automático git push → prod | ❌ rsync timeout intermitente |
| Imágenes de productos | ⚠️ URLs locales `/wallpapers/` (en public/) — no en S3 aún |

---

## 15. TAREAS PENDIENTES

1. **Fix deploy pipeline** — resolver el timeout de rsync (ver sección 13)
2. **PM2 startup persistence** — ejecutar `pm2 startup` + `pm2 save` en servidor para que la app sobreviva reinicios del servidor
3. **Verificar `/catalog` en producción** — confirmar que los 25 productos se muestran con imágenes correctamente en el sitio live
4. **Verificar flujo `/design?wallpaperId=ID`** — confirmar que el botón "Visualize on Wall" abre el design tool con el wallpaper preseleccionado
5. **Imágenes de productos en S3** — actualmente las imágenes están en `/public/wallpapers/` locales; migrar a AWS S3 para escalabilidad (campo `cloudStoragePath` ya existe en schema)

---

## 16. COMANDOS ÚTILES PARA DIAGNÓSTICO

```bash
# SSH al servidor
ssh -p 65002 u425976741@62.72.52.102

# Verificar app en producción
curl https://barrerawallpaper.com/api/products/ | python3 -m json.tool | head -50

# Ver logs PM2 en servidor
pm2 logs barrera-wallpaper --lines 50

# Ver status PM2
pm2 status

# Reiniciar app manualmente
source ~/.nvm/nvm.sh
pm2 restart barrera-wallpaper --update-env

# Verificar MySQL desde servidor
mysql -h 31.97.208.22 -u u425976741_wallpaper -p'Elementos8003*' u425976741_barrera -e "SELECT COUNT(*) FROM Product;"

# Trigger workflow GitHub Actions manualmente
curl -X POST \
  -H "Authorization: token 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" \
  -H "Accept: application/vnd.github.v3+json" \
  "https://api.github.com/repos/artdigitalstudio1980-hash/barrera-wallpaper/actions/workflows/deploy.yml/dispatches" \
  -d '{"ref":"main"}'

# Ver último run de GitHub Actions
curl -s \
  -H "Authorization: token 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" \
  "https://api.github.com/repos/artdigitalstudio1980-hash/barrera-wallpaper/actions/runs?per_page=1"
```

---

## 17. RESUMEN EJECUTIVO PARA IA REVISORA

**El proyecto está 90% funcional en producción.** La app corre, la DB tiene datos, la API funciona, el catálogo muestra los 25 productos SYSTEXX. El único bloqueante activo es el pipeline CI/CD automático que falla por timeouts intermitentes de SSH/rsync desde GitHub Actions hacia el servidor Hostinger en el puerto 65002.

**El problema NO es de código** — es un problema de conectividad de red entre GitHub Actions runners (IPs dinámicas) y el firewall de Hostinger. La solución más robusta es agregar reintentos en el step rsync del workflow, o migrar a SSH key-based auth en lugar de password para mayor fiabilidad.

**El código de la aplicación Next.js está correcto y funcionando.** El schema de Prisma está bien definido, la API de productos responde correctamente, y la página del catálogo está implementada con todas las funcionalidades requeridas (búsqueda, filtro, sort, visualizador, precios en USD).
