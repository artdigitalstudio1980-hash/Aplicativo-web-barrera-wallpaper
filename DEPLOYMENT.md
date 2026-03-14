# 🚀 Guía de Despliegue en Hostinger

Esta guía te ayudará a desplegar la aplicación Barrera Wallpaper en Hostinger con despliegue automático desde GitHub.

---

## 📚 Índice

1. [Requisitos Previos](#requisitos-previos)
2. [Configurar Hostinger](#configurar-hostinger)
3. [Configurar GitHub Secrets](#configurar-github-secrets)
4. [Despliegue Inicial](#despliegue-inicial)
5. [Despliegue Automático](#despliegue-automatico)
6. [Variables de Entorno](#variables-de-entorno)
7. [Comandos Útiles](#comandos-utiles)
8. [Solución de Problemas](#solucion-de-problemas)

---

## 📋 Requisitos Previos

- ✅ Cuenta de Hostinger con plan de hosting Node.js
- ✅ Repositorio GitHub configurado (ya lo tienes: `jorpat/barrera-wallpaper`)
- ✅ Base de datos MySQL en Hostinger (incluida en el hosting)
- ✅ OpenAI API key (para generación de imágenes)
- ✅ Pictorem API key (para dropshipping)

---

## 🏗️ Configurar Hostinger

### Paso 1: Crear Aplicación Node.js

1. **Inicia sesión en Hostinger:**
   - Ve a: https://hpanel.hostinger.com/
   - Inicia sesión con tus credenciales

2. **Crear Nueva Aplicación:**
   - Navega a **"Aplicaciones Web"** o **"Website"**
   - Selecciona **"App web de Node.js"** (NO "Sitio web PHP/HTML")
   - Click en **"Crear Aplicación"**

3. **Configurar la Aplicación:**
   ```
   Nombre: barrera-wallpaper
   Versión Node.js: 22.x
   Documento Raíz: /app
   ```

### Paso 2: Conectar con GitHub

#### Opción A: Usar Interfaz de Hostinger (Recomendado)

1. **Busca la opción "GitHub" o "Git" en Hostinger:**
   - Algunos planes tienen integración directa con GitHub
   - Autoriza a Hostinger a acceder a tu repositorio
   - Selecciona: `jorpat/barrera-wallpaper`
   - Rama: `main`

2. **Configurar Auto-Deploy:**
   - Activa "Despliegue automático" si está disponible
   - Esto hará que cada push a `main` se despliegue automáticamente

#### Opción B: Usar SSH Manual

1. **Conectarse por SSH:**
   ```bash
   ssh u123456789@yourdomain.com -p 65002
   ```

2. **Clonar el Repositorio:**
   ```bash
   cd ~/htdocs
   git clone https://github.com/jorpat/barrera-wallpaper.git
   cd barrera-wallpaper/app
   ```

3. **Instalar Dependencias:**
   ```bash
   yarn install
   yarn prisma generate
   ```

### Paso 3: Configurar Base de Datos MySQL

1. **Ve a Hostinger Panel → Bases de Datos → MySQL**

2. **Crear nueva base de datos:**
   ```
   Nombre: u425976741_barrera (o similar)
   Usuario: Se crea automáticamente
   Contraseña: Genera una segura
   ```

3. **Anotar los datos de conexión:**
   - Host: `localhost` (o la IP del servidor)
   - Puerto: `3306`
   - Usuario: `u425976741_barrera`
   - Contraseña: La que generaste
   - Base de datos: `u425976741_barrera`

4. **Formato de DATABASE_URL:**
   ```
   mysql://usuario:contraseña@localhost:3306/nombre_base_datos
   ```

   **Ejemplo real:**
   ```
   mysql://u425976741_barrera:MiPassword123@localhost:3306/u425976741_barrera
   ```

### Paso 4: Configurar Variables de Entorno en Hostinger

1. **Navega a la configuración de tu aplicación en Hostinger**
2. **Busca "Variables de Entorno" o "Environment Variables"**
3. **Agrega las siguientes variables:**

```bash
# Database - MySQL Hostinger
DATABASE_URL=mysql://u425976741_barrera:TuPassword@localhost:3306/u425976741_barrera

# NextAuth
NEXTAUTH_SECRET=tu-secret-generado-con-openssl
NEXTAUTH_URL=https://barrerawallpaper.com

# OpenAI
OPENAI_API_KEY=sk-proj-...

# Pictorem
PICTOREM_API_KEY=tu-api-key
PICTOREM_API_URL=https://api.pictorem.com

# Stripe (opcional)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...

# PayPal (opcional)
NEXT_PUBLIC_PAYPAL_CLIENT_ID=tu-client-id
PAYPAL_CLIENT_SECRET=tu-secret
PAYPAL_MODE=live

# App
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://barrerawallpaper.com
```

### Paso 4: Configurar Dominio

1. **Apuntar tu dominio a Hostinger:**
   - En tu registrador de dominios (ej: GoDaddy, Namecheap)
   - Cambia los nameservers a los de Hostinger:
     ```
     ns1.dns-parking.com
     ns2.dns-parking.com
     ```

2. **Configurar SSL:**
   - En Hostinger, navega a "SSL"
   - Activa "SSL Gratuito" (Let's Encrypt)
   - Espera 10-15 minutos para que se active

---

## 🔐 Configurar GitHub Secrets

Para que GitHub Actions pueda desplegar automáticamente, necesitas configurar secrets.

### Paso 1: Ir a GitHub Secrets

1. **Ve a tu repositorio:**
   ```
   https://github.com/jorpat/barrera-wallpaper
   ```

2. **Navega a Settings → Secrets and variables → Actions**

3. **Click en "New repository secret"**

### Paso 2: Agregar Secrets

Agrega estos secrets uno por uno:

#### Secrets de Hostinger (para SSH deployment)

```bash
# SSH Connection
HOSTINGER_HOST=ssh.yourdomain.com
HOSTINGER_USERNAME=u123456789
HOSTINGER_PASSWORD=tu-password-ssh
HOSTINGER_PORT=65002
HOSTINGER_APP_PATH=/home/u123456789/htdocs/barrera-wallpaper

# Application Environment
DATABASE_URL=mysql://u425976741_barrera:TuPassword@localhost:3306/u425976741_barrera
NEXTAUTH_SECRET=tu-secret-aqui
NEXTAUTH_URL=https://barrerawallpaper.com
```

#### Cómo Obtener los Datos de Hostinger:

1. **HOSTINGER_HOST, HOSTINGER_USERNAME, HOSTINGER_PORT:**
   - Ve a Hostinger Panel → Avanzado → Acceso SSH
   - Copia los datos mostrados

2. **HOSTINGER_PASSWORD:**
   - Si no la recuerdas, puedes restablecerla en el panel de Hostinger
   - O usar SSH keys (más seguro)

3. **HOSTINGER_APP_PATH:**
   - Usualmente es: `/home/u123456789/htdocs/barrera-wallpaper`
   - Reemplaza `u123456789` con tu username de Hostinger

---

## 🎯 Despliegue Inicial

### Opción 1: Desde Hostinger Panel (Más Fácil)

1. **Si Hostinger tiene integración con GitHub:**
   - Click en "Deploy" o "Actualizar desde GitHub"
   - Espera a que termine el proceso

2. **Ejecutar Migraciones de Base de Datos:**
   - Conecta por SSH:
     ```bash
     ssh u123456789@yourdomain.com -p 65002
     cd ~/htdocs/barrera-wallpaper/app
     yarn prisma migrate deploy
     yarn prisma db seed
     ```

3. **Reiniciar la Aplicación:**
   - En Hostinger Panel, busca "Reiniciar" o "Restart"

### Opción 2: Desde SSH Manual

```bash
# 1. Conectar por SSH
ssh u123456789@yourdomain.com -p 65002

# 2. Ir al directorio de la app
cd ~/htdocs/barrera-wallpaper/app

# 3. Instalar dependencias
yarn install --frozen-lockfile

# 4. Generar Prisma Client
yarn prisma generate

# 5. Ejecutar migraciones
yarn prisma migrate deploy

# 6. Sembrar base de datos (opcional)
yarn prisma db seed

# 7. Construir la aplicación
yarn build

# 8. Iniciar la aplicación
pm2 start yarn --name barrera-wallpaper -- start
# O si ya está corriendo:
pm2 restart barrera-wallpaper
```

---

## 🔄 Despliegue Automático

### Cómo Funciona

Cada vez que hagas cambios y los subas a GitHub, el despliegue se ejecutará automáticamente:

```bash
# 1. Hacer cambios en tu código local
# (edita archivos...)

# 2. Guardar y hacer commit
git add .
git commit -m "Descripción de los cambios"

# 3. Subir a GitHub
git push origin main

# 4. GitHub Actions se ejecutará automáticamente
# - Ejecutará tests
# - Construirá la aplicación
# - Desplegará a Hostinger via SSH
```

### Monitorear el Despliegue

1. **Ver el progreso en GitHub:**
   ```
   https://github.com/jorpat/barrera-wallpaper/actions
   ```

2. **Ver logs en tiempo real:**
   - Click en el workflow que está corriendo
   - Ver cada paso del deployment

3. **Si el deployment falla:**
   - Revisa los logs en GitHub Actions
   - Corrige el error
   - Vuelve a hacer push

---

## 📝 Variables de Entorno

### Variables Requeridas (Mínimo para que funcione)

```bash
DATABASE_URL              # MySQL connection string de Hostinger
NEXTAUTH_SECRET           # Generado con: openssl rand -base64 32
NEXTAUTH_URL              # https://tudominio.com
```

### Variables Opcionales

```bash
# AI Generation
OPENAI_API_KEY            # Para generar imágenes con IA

# Dropshipping
PICTOREM_API_KEY          # Para impresión y envío
PICTOREM_API_URL

# Payments
STRIPE_SECRET_KEY         # Pagos con tarjeta
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
PAYPAL_CLIENT_SECRET      # Pagos con PayPal
NEXT_PUBLIC_PAYPAL_CLIENT_ID
```

### Cómo Generar NEXTAUTH_SECRET

```bash
openssl rand -base64 32
```

O en Node.js:
```javascript
require('crypto').randomBytes(32).toString('base64')
```

---

## 🛠️ Comandos Útiles

### Comandos Locales

```bash
# Ver estado del repositorio
cd /home/ubuntu/barrera_wallpaper
git status

# Ver cambios
git diff

# Hacer commit
git add .
git commit -m "Descripción"
git push

# Ver historial
git log --oneline -10

# Ver repositorio en navegador
gh repo view --web
```

### Comandos en Hostinger (SSH)

```bash
# Ver logs de la aplicación
pm2 logs barrera-wallpaper

# Ver estado de la aplicación
pm2 status

# Reiniciar aplicación
pm2 restart barrera-wallpaper

# Ver uso de memoria
pm2 monit

# Actualizar desde GitHub
cd ~/htdocs/barrera-wallpaper
git pull origin main
yarn install
yarn build
pm2 restart barrera-wallpaper

# Ver logs de base de datos
yarn prisma studio  # Abre interfaz web para ver datos
```

---

## 🚫 Solución de Problemas

### Error: ENOENT no such file or directory - yarn.lock

**Causa:** Hostinger no puede encontrar el archivo `yarn.lock` durante el proceso de build.

**Solución:**
✅ **Ya está solucionado en el repositorio.** El `yarn.lock` ahora es un archivo real (no symlink).

Si sigues viendo este error:
1. Asegúrate de que Hostinger esté usando la versión más reciente del repositorio
2. Ve a Hostinger Panel → Tu Aplicación → "Reconstruir" o "Rebuild"
3. Espera a que termine el proceso de build (puede tomar 2-5 minutos)
4. Si persiste, intenta:
   ```bash
   # En Hostinger SSH
   cd ~/htdocs/barrera-wallpaper/app
   ls -la yarn.lock  # Debe mostrar un archivo, NO un symlink
   ```

### Error: EACCES permission denied, mkdir '/home/ubuntu'

**Causa:** Prisma intentando crear un directorio con ruta absoluta que no existe en Hostinger.

**Solución:**
✅ **Ya está solucionado en el repositorio.** El `schema.prisma` ahora usa rutas relativas.

Si sigues viendo este error:
1. Verifica que el archivo `app/prisma/schema.prisma` NO tenga línea `output` con ruta absoluta
2. Debe tener solo:
   ```prisma
   generator client {
       provider = "prisma-client-js"
       binaryTargets = ["native", "linux-musl-openssl-3.0.x"]
   }
   ```
3. Reconstruir en Hostinger:
   ```bash
   cd ~/domains/tu-dominio/public_html/app
   yarn prisma generate
   ```

### Error 503: Service Unavailable

**Causa:** La aplicación no está corriendo o hay error en variables de entorno.

**Solución:**

1. **Verificar variables de entorno en Hostinger:**
   - DATABASE_URL debe ser formato MySQL: `mysql://user:pass@localhost:3306/db`
   - NEXTAUTH_SECRET debe estar configurado
   - NEXTAUTH_URL debe ser `https://tudominio.com`

2. **Reiniciar la aplicación:**
   ```bash
   ssh u123456789@yourdomain.com -p 65002
   pm2 restart barrera-wallpaper
   pm2 logs barrera-wallpaper --lines 50
   ```

3. **Ver logs para identificar el error:**
   ```bash
   pm2 logs barrera-wallpaper --err
   ```

### Error: Cannot find module 'prisma'

**Solución:**
```bash
ssh u123456789@yourdomain.com -p 65002
cd ~/htdocs/barrera-wallpaper/app
yarn install
yarn prisma generate
pm2 restart barrera-wallpaper
```

### Error: Database connection failed

**Causa:** DATABASE_URL incorrecta o base de datos no accesible.

**Solución:**

1. **Verificar DATABASE_URL:**
   - Debe usar formato MySQL correcto
   - Host normalmente es `localhost` en Hostinger
   - Puerto es `3306` (por defecto)
   - Formato correcto:
     ```
     mysql://usuario:contraseña@localhost:3306/nombre_base_datos
     ```
   - Ejemplo:
     ```
     mysql://u425976741_barrera:MiPassword@localhost:3306/u425976741_barrera
     ```

2. **Probar conexión:**
   ```bash
   cd ~/htdocs/barrera-wallpaper
   node test-db.js
   ```

### GitHub Actions Falla

**Ver logs:**
1. Ve a: https://github.com/jorpat/barrera-wallpaper/actions
2. Click en el workflow que falló
3. Ver el paso que falló

**Errores comunes:**

1. **Secret no configurado:**
   - Settings → Secrets → Verificar que todos los secrets estén agregados

2. **SSH connection failed:**
   - Verificar HOSTINGER_HOST, HOSTINGER_USERNAME, HOSTINGER_PASSWORD
   - Verificar que el puerto es correcto (usualmente 65002)

3. **Build failed:**
   - Verificar que DATABASE_URL está en GitHub Secrets
   - Verificar que todas las dependencias están en package.json

---

## 📞 Soporte

Si necesitas ayuda:

1. **Hostinger Support:**
   - Chat en vivo: https://hpanel.hostinger.com/
   - Email: support@hostinger.com

2. **MySQL / Hostinger Support:**
   - Hostinger Knowledge Base: https://support.hostinger.com/
   - MySQL Docs: https://dev.mysql.com/doc/

3. **GitHub Actions:**
   - Documentación: https://docs.github.com/en/actions

---

## ✅ Checklist de Deployment

### Antes del Primer Despliegue:

- [ ] Repositorio GitHub configurado
- [ ] Base de datos MySQL creada en Hostinger
- [ ] Variables de entorno configuradas en Hostinger
- [ ] GitHub Secrets configurados
- [ ] Dominio apuntado a Hostinger
- [ ] SSL activado

### Primer Despliegue:

- [ ] Código desplegado en Hostinger
- [ ] `yarn install` ejecutado
- [ ] `yarn prisma generate` ejecutado
- [ ] `yarn prisma migrate deploy` ejecutado
- [ ] `yarn prisma db seed` ejecutado (opcional)
- [ ] `yarn build` ejecutado
- [ ] PM2 iniciado
- [ ] Aplicación accesible en https://tudominio.com

### Despliegues Futuros:

- [ ] Hacer cambios en código
- [ ] `git add .`
- [ ] `git commit -m "Descripción"`
- [ ] `git push origin main`
- [ ] GitHub Actions se ejecuta automáticamente
- [ ] Verificar deployment en https://github.com/jorpat/barrera-wallpaper/actions
- [ ] Verificar sitio en https://tudominio.com

---

¡Listo! Tu aplicación ahora se desplegará automáticamente cada vez que hagas push a GitHub. 🎉
