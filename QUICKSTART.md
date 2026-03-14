# 🚀 INICIO RÁPIDO - 5 Minutos

## ✅ ¿Qué ya está hecho?

- ✅ Repositorio Git inicializado
- ✅ Primer commit creado
- ✅ `.gitignore` configurado
- ✅ `.env.example` con todas las variables
- ✅ `README.md` con documentación completa
- ✅ Script helper para push (`push-to-github.sh`)

## 🎯 Lo que DEBES hacer ahora (3 pasos)

### 1️⃣ Crear Repositorio en GitHub (2 minutos)

```
1. Ve a https://github.com/new
2. Repository name: barrera-wallpaper
3. Visibility: Private ✅
4. NO marques nada más
5. Click "Create repository"
6. Copia la URL que termina en .git
```

### 2️⃣ Conectar y Subir (1 minuto)

```bash
cd /home/ubuntu/barrera_wallpaper/app

# Reemplaza TU-URL con la que copiaste de GitHub
git remote add origin https://github.com/TU-USUARIO/barrera-wallpaper.git

# Renombrar rama a main
git branch -M main

# Subir código
git push -u origin main
```

Si te pide autenticación:
- Username: tu usuario de GitHub
- Password: usa un **Personal Access Token** (no tu contraseña)
  - Créalo en: https://github.com/settings/tokens
  - Scope necesario: `repo`

### 3️⃣ Configurar Hostinger (2 minutos)

```
1. Ve a https://hpanel.hostinger.com
2. Aplicaciones web → Tu app Node.js
3. Scroll a "Implementación de Git"
4. Click "Configurar" → Conectar GitHub
5. Selecciona: barrera-wallpaper
6. Branch: main
7. ✅ Enable automatic deployment
8. Save
```

**Configurar Variables de Entorno:**
```
Aplicaciones web → Tu app → Variables de entorno
Agrega las 15 variables del archivo .env
```

**Primer Deployment:**
```
Implementación de Git → "Deploy Now"
Espera 5-10 minutos ⏳
```

## ✨ ¡Listo!

Ahora cada vez que hagas:
```bash
./push-to-github.sh
```

El código se subirá a GitHub y Hostinger lo desplegará automáticamente.

---

📖 **Guía completa:** `DEPLOYMENT_GITHUB.md`
