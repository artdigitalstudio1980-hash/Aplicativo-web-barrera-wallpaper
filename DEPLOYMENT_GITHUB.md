# 🚀 Guía Completa: Deploy Automático desde GitHub a Hostinger

## 📌 Resumen

Esta guía te ayudará a:
1. ✅ Subir tu código a GitHub
2. ✅ Conectar GitHub con Hostinger
3. ✅ Configurar deployment automático

Cada vez que hagas `git push`, Hostinger desplegará automáticamente los cambios.

---

## 📝 Paso 1: Crear Repositorio en GitHub

### 1.1 Ir a GitHub

1. Abre tu navegador y ve a: **https://github.com**
2. Inicia sesión con tu cuenta (o crea una si no tienes)

### 1.2 Crear Nuevo Repositorio

1. Click en el botón verde **"+"** (arriba a la derecha)
2. Selecciona **"New repository"**
3. Completa la información:

```
Repository name: barrera-wallpaper
Description: Premium Wallpaper E-Commerce Platform with AI Generation
Visibility: ✅ Private (recomendado para evitar exponer tu código)

❌ NO marques:
- Add a README file
- Add .gitignore
- Choose a license

(Ya los tenemos en nuestro proyecto)
```

4. Click en **"Create repository"**

### 1.3 Copiar la URL del Repositorio

Después de crear el repositorio, GitHub te mostrará una pantalla con instrucciones.  
Copia la URL que termina en `.git`, por ejemplo:

```
https://github.com/TU-USUARIO/barrera-wallpaper.git
```

---

## 💾 Paso 2: Subir Código a GitHub

### 2.1 Conectar Repositorio Local con GitHub

En tu terminal, ejecuta:

```bash
cd /home/ubuntu/barrera_wallpaper/app

# Agregar repositorio remoto (reemplaza con TU URL)
git remote add origin https://github.com/TU-USUARIO/barrera-wallpaper.git

# Verificar que se agregó correctamente
git remote -v
```

Deberías ver algo como:
```
origin  https://github.com/TU-USUARIO/barrera-wallpaper.git (fetch)
origin  https://github.com/TU-USUARIO/barrera-wallpaper.git (push)
```

### 2.2 Renombrar Rama a "main"

```bash
git branch -M main
```

### 2.3 Subir Código a GitHub

```bash
git push -u origin main
```

⚠️ **Si GitHub te pide autenticación:**

**Opción A - Personal Access Token (Recomendado):**
1. Ve a GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Selecciona scopes: `repo` (todos los permisos de repositorio)
4. Copia el token generado
5. Cuando Git te pida password, usa el token en lugar de tu contraseña

**Opción B - SSH Key:**
Sigue la guía oficial: https://docs.github.com/es/authentication/connecting-to-github-with-ssh

### 2.4 Verificar en GitHub

1. Refresca la página de tu repositorio en GitHub
2. Deberías ver todos los archivos del proyecto
3. ✅ ¡Código subido exitosamente!

---

## 🌐 Paso 3: Configurar Deployment Automático en Hostinger

### 3.1 Acceder al Panel de Hostinger

1. Ve a: **https://hpanel.hostinger.com**
2. Inicia sesión
3. En el menú lateral, click en **"Aplicaciones web"**
4. Selecciona tu aplicación de Node.js

### 3.2 Configurar Implementación de Git

1. Dentro de tu aplicación, scroll hacia abajo hasta encontrar:
   **"📦 Implementación de Git"** o **"Git Deployment"**

2. Click en **"Configurar"** o **"Connect to Git"**

3. Selecciona **"GitHub"** como proveedor

4. **Autorizar Hostinger en GitHub:**
   - Se abrirá una ventana de GitHub
   - Click en **"Authorize Hostinger"**
   - Selecciona tu repositorio `barrera-wallpaper`

5. **Configurar Rama:**
   ```
   Branch: main
   ```

6. **Habilitar Deploy Automático:**
   - ✅ Marca la casilla: **"Enable automatic deployment"**
   - Esto hará que cada push a la rama `main` despliegue automáticamente

7. Click en **"Save"** o **"Guardar"**

### 3.3 Configurar Variables de Entorno

**IMPORTANTE:** Las variables de entorno NO se suben a GitHub (están en `.gitignore`).  
Debes configurarlas manualmente en Hostinger:

1. En tu aplicación de Hostinger, busca la sección:
   **"🔑 Variables de entorno"** o **"Environment Variables"**

2. Agrega las siguientes **15 variables** (una por una):

```bash
# Base de Datos
DATABASE_URL=postgresql://postgres.[TU-PROJECT]:[TU-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1

# NextAuth
NEXTAUTH_SECRET=[Genera uno con: openssl rand -base64 32]
NEXTAUTH_URL=https://barrerawallpaper.com

# OpenAI (DALL-E 3)
OPENAI_API_KEY=sk-...

# Google AI Studio (Nano Banana)
GOOGLE_AI_STUDIO_API_KEY=AIza...

# Pictorem
PICTOREM_API_KEY=tu-api-key
PICTOREM_API_URL=https://api.pictorem.com/v1

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...

# PayPal
PAYPAL_CLIENT_ID=tu-client-id
PAYPAL_CLIENT_SECRET=tu-client-secret
PAYPAL_MODE=live

# AWS S3
AWS_BUCKET_NAME=tu-bucket
AWS_FOLDER_PREFIX=barrera-wallpaper/
```

3. Click en **"Guardar"** después de cada variable

### 3.4 Trigger del Primer Deployment

1. Una vez configuradas las variables, vuelve a la sección de **"Implementación de Git"**
2. Click en **"Deploy Now"** o **"Desplegar Ahora"**
3. Espera a que termine (puede tardar 5-10 minutos)
4. ✅ ¡Tu sitio estará en vivo en https://barrerawallpaper.com!

---

## 🔄 Paso 4: Workflow de Desarrollo Continuo

Ahora que está configurado, tu workflow será:

### 4.1 Hacer Cambios Localmente

```bash
cd /home/ubuntu/barrera_wallpaper/app

# Editar archivos...
# Ejemplo: vim app/page.tsx

# Ver cambios
git status
```

### 4.2 Commit y Push

```bash
# Agregar cambios
git add .

# Commit con mensaje descriptivo
git commit -m "Fix: Corrected payment processing bug"

# Push a GitHub
git push origin main
```

### 4.3 Deployment Automático

- 🚀 Hostinger detectará el push automáticamente
- 📦 Comenzará a compilar y desplegar
- ⌚ Espera 5-10 minutos
- ✅ Los cambios estarán en vivo en https://barrerawallpaper.com

### 4.4 Ver Logs de Deployment

1. Ve a Hostinger → Aplicaciones web → Tu app
2. Click en **"Logs"** o **"Registros"**
3. Podrás ver:
   - Build logs (compilación)
   - Runtime logs (errores en producción)
   - Deployment history

---

## ✅ Checklist Final

### Antes del Primer Deployment
- ☐ Código subido a GitHub
- ☐ GitHub conectado con Hostinger
- ☐ Variables de entorno configuradas (15 variables)
- ☐ Rama configurada: `main`
- ☐ Deploy automático habilitado

### Después del Deployment
- ☐ Sitio accesible en https://barrerawallpaper.com
- ☐ Login funciona (admin@barrera.com / admin123)
- ☐ Catálogo de productos carga correctamente
- ☐ Generador de IA funciona
- ☐ Pagos funcionan (Stripe + PayPal)
- ☐ Panel de admin accesible

---

## 👍 Ventajas del Deploy Automático

✅ **Rapidez:** Push y olvídate, Hostinger se encarga del resto  
✅ **Seguridad:** No necesitas subir archivos manualmente vía FTP  
✅ **Historial:** GitHub guarda todo el historial de cambios  
✅ **Rollback:** Puedes volver a versiones anteriores fácilmente  
✅ **Colaboración:** Múltiples desarrolladores pueden trabajar juntos  
✅ **CI/CD:** Despliegue continuo profesional  

---

## 🔧 Comandos Útiles de Git

```bash
# Ver estado
git status

# Ver commits recientes
git log --oneline -10

# Deshacer cambios locales (sin commit)
git checkout -- archivo.tsx

# Volver a commit anterior (CUIDADO)
git reset --hard HEAD~1

# Ver branches
git branch -a

# Crear nueva rama para feature
git checkout -b feature/nueva-funcionalidad

# Push de nueva rama
git push -u origin feature/nueva-funcionalidad
```

---

## ⚠️ Troubleshooting

### Problema: "Permission denied" al hacer push
**Solución:** Usa Personal Access Token en lugar de contraseña

### Problema: Deployment falla en Hostinger
**Solución:**
1. Revisa los logs en Hostinger
2. Verifica que todas las variables de entorno estén configuradas
3. Asegúrate que DATABASE_URL usa Session Pooler (:6543)

### Problema: Cambios no se reflejan después de push
**Solución:**
1. Ve a Hostinger → Implementación de Git
2. Verifica que el último deployment fue exitoso
3. Si falló, revisa los logs
4. Puedes hacer click en "Redeploy" manualmente

### Problema: "EACCES: permission denied, mkdir '/home/ubuntu'"
**Solución:** Este error ya fue corregido en el último commit. Asegúrate de hacer push del código más reciente.

---

## 📞 Soporte

¿Necesitas ayuda? Contacta:
- **Email:** oscarbarrera@barrerawallpaper.com
- **WhatsApp:** +57 311 266 27 09

---

**¡Éxito con tu deployment! 🚀**