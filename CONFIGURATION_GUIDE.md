# 🛠️ GUÍA DE CONFIGURACIÓN - BARRERA WALLPAPER

## 📝 INTRODUCCIÓN

Esta guía te ayudará a configurar todas las integraciones necesarias para que el sistema de generación de IA y dropshipping con Pictorem funcione correctamente.

---

## 📑 ESTRUCTURA DE ARCHIVOS

```
barrera_wallpaper/
├── AI_DROPSHIPPING_FLOW.md    # Flujo completo explicado
├── CONFIGURATION_GUIDE.md     # Esta guía
├── app/
│   ├── .env                    # Variables de entorno (NO SUBIR A GIT)
│   ├── .env.example            # Template de variables
│   ├── app/
│   │   ├── ai-studio/          # Página de generación IA
│   │   ├── api/
│   │   │   ├── ai-wallpaper/   # Endpoints de IA
│   │   │   ├── pictorem/       # Endpoints de Pictorem
│   │   │   └── payments/       # Endpoints de pagos
│   ├── lib/
│   │   ├── pictorem.ts         # Cliente de Pictorem API
│   │   └── prisma.ts           # Cliente de base de datos
│   └── prisma/
│       └── schema.prisma       # Schema de base de datos
└── README.md
```

---

## ✅ PASO 1: CONFIGURAR BASE DE DATOS MYSQL

### **1.1 Crear Base de Datos en Hostinger**

1. **Panel de Hostinger** → **Bases de Datos** → **MySQL Databases**
2. Click en **"Crear Nueva Base de Datos"**
3. Completar:
   ```
   Nombre: u425976741_barrera
   Usuario: u425976741_barrera_user
   Contraseña: [Generar segura - mínimo 16 caracteres]
   ```
4. **Guardar credenciales** en un lugar seguro

### **1.2 Construir DATABASE_URL**

**Formato:**
```
mysql://[usuario]:[contraseña]@[host]:[puerto]/[base_datos]
```

**Ejemplo:**
```
mysql://u425976741_barrera_user:MiPassword123@localhost:3306/u425976741_barrera
```

### **1.3 Agregar a Variables de Entorno**

1. **Hostinger Panel** → **Tu App** → **Environment Variables**
2. Agregar:
   ```
   Nombre: DATABASE_URL
   Valor: [tu conexión MySQL completa]
   ```

### **1.4 Ejecutar Migraciones (SSH)**

```bash
# Conectar por SSH
ssh u425976741@chocolate-dragonfly-764893.hostingersite.com -p 65002

# Ir al directorio de la app
cd ~/domains/chocolate-dragonfly-764893.hostingersite.com/public_html/app

# Ejecutar migraciones
yarn prisma migrate deploy

# Sembrar base de datos (primera vez)
yarn prisma db seed

# Reiniciar app
pm2 restart barrera-wallpaper

# Verificar logs
pm2 logs barrera-wallpaper --lines 30
```

**✅ Verificación exitosa:**
```
✓ Prisma Client generated
✓ Database connection successful
✓ Server listening on port 3000
```

---

## ✅ PASO 2: CONFIGURAR AUTENTICACIÓN (NEXTAUTH)

### **2.1 Generar NEXTAUTH_SECRET**

**Opción A: Con OpenSSL (Recomendado)**
```bash
openssl rand -base64 32
```

**Opción B: Con Node.js**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Opción C: Temporal (solo pruebas)**
```
temporalSecretKeyForBarreraWallpaperTestingOnly2025PleaseChangeInProduction
```

### **2.2 Agregar Variables de Entorno**

**Hostinger Panel** → **Environment Variables**:

```bash
NEXTAUTH_SECRET=[el valor generado arriba]
NEXTAUTH_URL=https://barrerawallpaper.com
```

**✅ Verificación:**
- Login debe funcionar en `/login`
- Admin panel accesible en `/admin/products`
- Credenciales del seed: `admin@barrera.com` / `admin123`

---

## ✅ PASO 3: CONFIGURAR OPENAI (GENERACIÓN DE IMÁGENES)

### **3.1 Crear Cuenta y Obtener API Key**

1. **Ir a:** https://platform.openai.com
2. **Crear cuenta** o iniciar sesión
3. **API Keys** → **Create new secret key**
4. **Copiar key** (empieza con `sk-proj-...`)
5. **⚠️ NO la compartas** - es como tu contraseña

### **3.2 Agregar Créditos**

1. **Billing** → **Add payment method**
2. Agregar tarjeta de crédito
3. **Recomendado:** Agregar $10-$20 para empezar

**Costos:**
- DALL-E 3 Standard (1024x1024): ~$0.04 por imagen
- DALL-E 3 HD (1024x1024): ~$0.08 por imagen

**Ejemplo de uso:**
- 100 imágenes HD = $8.00
- 250 imágenes Standard = $10.00

### **3.3 Agregar a Variables de Entorno**

**Hostinger Panel** → **Environment Variables**:

```bash
OPENAI_API_KEY=sk-proj-[tu-key-completa-aqui]
```

### **3.4 Verificar Funcionamiento**

1. **Ir a:** https://barrerawallpaper.com/ai-studio
2. **Describir un diseño:** "Modern geometric pattern with gold accents"
3. **Click "Generate Design"**
4. **Esperar 5-10 segundos**
5. **✅ Debe mostrar imagen generada**

**⚠️ Si falla:**
- Revisa que key esté correcta
- Verifica que tengas créditos
- Revisa logs: `pm2 logs barrera-wallpaper | grep OpenAI`

**Sin OpenAI configurada:**
- Sistema usará imágenes de Unsplash (gratis pero limitado)
- Funciona para pruebas pero no es personalizado

---

## ✅ PASO 4: CONFIGURAR PICTOREM (DROPSHIPPING)

### **4.1 Solicitar Cuenta de Dropshipping**

1. **Ir a:** https://www.pictorem.com
2. **Contactar ventas/soporte:**
   - Email: info@pictorem.com
   - Teléfono: (si disponible en su página)
3. **Solicitar:**
   - Cuenta de dropshipping
   - Acceso a API (artFlow)
   - Documentación de API

**Información a proporcionar:**
```
Negocio: Barrera Wallpaper
Website: barrerawallpaper.com
Tipo: Dropshipping de wallpapers personalizados
Volumen estimado: [tu estimación mensual]
```

### **4.2 Obtener Credenciales**

Una vez aprobada tu cuenta, recibirás:
- ✅ **API Key** (artFlowKey)
- ✅ **Shop Code**
- ✅ **Acceso al dashboard**
- ✅ **Documentación de API**

### **4.3 Agregar a Variables de Entorno**

**Hostinger Panel** → **Environment Variables**:

```bash
PICTOREM_API_KEY=[tu-api-key-aqui]
PICTOREM_SHOP_CODE=[tu-shop-code]
PICTOREM_BASE_URL=https://www.pictorem.com/artflow
```

### **4.4 Verificar Funcionamiento**

**Prueba de pricing:**
```bash
# Por SSH
cd ~/domains/.../public_html/app

# Probar endpoint de pricing
curl -X POST https://barrerawallpaper.com/api/pictorem/pricing \
  -H "Content-Type: application/json" \
  -d '{
    "material": "canvas",
    "type": "stretched",
    "orientation": "horizontal",
    "width": 24,
    "height": 36,
    "numCopies": 1
  }'
```

**Respuesta esperada:**
```json
{
  "success": true,
  "data": {
    "customerPrice": 210.00,
    "pictoremCost": 103.68,
    "profit": 106.32,
    "estimatedDeliveryDays": 7
  }
}
```

**Sin Pictorem configurado:**
- Sistema usará pricing de fallback
- `usingFallbackPricing: true` en respuesta
- Funciona para pruebas pero puede no ser exacto

---

## ✅ PASO 5: CONFIGURAR STRIPE (PAGOS)

### **5.1 Crear Cuenta de Stripe**

1. **Ir a:** https://dashboard.stripe.com
2. **Crear cuenta** o iniciar sesión
3. **Completar perfil** del negocio
4. **Activar cuenta** (puede tomar 1-2 días)

### **5.2 Obtener API Keys (Modo Test)**

1. **Developers** → **API keys**
2. **Asegurarse de estar en "Test mode"** (switch arriba a la derecha)
3. **Copiar:**
   - Secret key: `sk_test_...`
   - Publishable key: `pk_test_...`

### **5.3 Configurar Webhook**

1. **Developers** → **Webhooks** → **Add endpoint**
2. **Endpoint URL:**
   ```
   https://barrerawallpaper.com/api/payments/stripe/webhook
   ```
3. **Descripción:** "Barrera Wallpaper Payment Webhook"
4. **Events to send:**
   - ☑️ `checkout.session.completed`
   - ☑️ `payment_intent.succeeded`
   - ☑️ `payment_intent.payment_failed`
5. **Add endpoint**
6. **Copiar Signing secret** (empieza con `whsec_...`)

### **5.4 Agregar a Variables de Entorno**

**Hostinger Panel** → **Environment Variables**:

```bash
STRIPE_SECRET_KEY=sk_test_[tu-secret-key]
STRIPE_PUBLISHABLE_KEY=pk_test_[tu-publishable-key]
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_[tu-publishable-key]
STRIPE_WEBHOOK_SECRET=whsec_[tu-webhook-secret]
```

### **5.5 Probar Pago con Tarjeta de Prueba**

1. **Ir a AI Studio:** https://barrerawallpaper.com/ai-studio
2. **Generar diseño** y completar configuración
3. **Llegar a paso de pago**
4. **Click "Pay with Stripe"**
5. **Usar tarjeta de prueba:**
   ```
   Número: 4242 4242 4242 4242
   Fecha: 12/34 (cualquier fecha futura)
   CVC: 123
   ZIP: 12345
   ```
6. **✅ Pago debe completar**
7. **Verificar webhook ejecutado:**
   ```bash
   pm2 logs barrera-wallpaper | grep "checkout.session.completed"
   ```

### **5.6 Activar Modo Live (Producción)**

**Cuando estés listo para aceptar pagos reales:**

1. **Completar activación de cuenta** (verificaciones de Stripe)
2. **Cambiar a "Live mode"** en dashboard
3. **Obtener nuevas keys:** `sk_live_...` y `pk_live_...`
4. **Crear nuevo webhook** para producción
5. **Actualizar variables de entorno** con keys live
6. **Reiniciar app**

**Costos:**
- 2.9% + $0.30 por transacción exitosa
- Ejemplo: Orden de $200 = $5.80 + $0.30 = $6.10 en fees

---

## ✅ PASO 6: CONFIGURAR PAYPAL (OPCIONAL)

### **6.1 Crear Cuenta de Developer**

1. **Ir a:** https://developer.paypal.com
2. **Crear cuenta** o iniciar sesión
3. **Dashboard** → **Apps & Credentials**

### **6.2 Crear App de Sandbox**

1. **Sandbox** tab
2. **Create App**
3. **Nombre:** "Barrera Wallpaper Sandbox"
4. **Tipo:** Merchant
5. **Create App**
6. **Copiar:**
   - Client ID
   - Secret

### **6.3 Agregar a Variables de Entorno**

**Hostinger Panel** → **Environment Variables**:

```bash
PAYPAL_CLIENT_ID=[tu-client-id]
PAYPAL_CLIENT_SECRET=[tu-secret]
PAYPAL_MODE=sandbox
```

### **6.4 Probar con Cuenta Sandbox**

1. **Crear cuenta de prueba:**
   - Dashboard → Sandbox → Accounts
   - Usar credenciales de cuenta "Personal" para probar
2. **Completar pago en AI Studio**
3. **Login con cuenta sandbox de PayPal**
4. **Confirmar pago**

### **6.5 Activar Live (Producción)**

1. **Crear App Live** en dashboard
2. **Obtener credenciales Live**
3. **Cambiar `PAYPAL_MODE=live`**
4. **Reiniciar app**

**Costos:**
- 2.99% + $0.49 por transacción

---

## 📦 PASO 7: VERIFICAR TODO FUNCIONANDO

### **7.1 Checklist de Integraciones**

```bash
# Conectar por SSH
ssh u425976741@chocolate-dragonfly-764893.hostingersite.com -p 65002

# Ver variables de entorno configuradas
cd ~/domains/.../public_html/app
cat .env | grep -E "(DATABASE_URL|NEXTAUTH|OPENAI|PICTOREM|STRIPE|PAYPAL)"
```

**Debe mostrar:**
- ✅ DATABASE_URL configurada
- ✅ NEXTAUTH_SECRET y NEXTAUTH_URL
- ✅ OPENAI_API_KEY (opcional)
- ✅ PICTOREM_API_KEY y PICTOREM_SHOP_CODE (opcional)
- ✅ STRIPE_* keys (4 variables)
- ✅ PAYPAL_* variables (opcional)

### **7.2 Probar Flujo End-to-End**

**Orden de prueba completa:**

1. **Ir a AI Studio:**
   ```
   https://barrerawallpaper.com/ai-studio
   ```

2. **PASO 1 - Generar Diseño:**
   - Prompt: "Elegant marble texture with gold veins, luxury design"
   - Style: "Modern"
   - Click "Generate Design"
   - ✅ Imagen debe generarse

3. **PASO 2 - Configurar Producto:**
   - Material: "Canvas"
   - Type: "Gallery Wrapped"
   - Size: 24" x 36"
   - Copies: 1
   - ✅ Precio debe calcularse automáticamente
   - Click "Continue"

4. **PASO 3 - Completar Detalles:**
   - Nombre: "Test Customer"
   - Email: "test@example.com"
   - Teléfono: "555-0123"
   - Dirección: "123 Main St"
   - Ciudad: "New York"
   - Estado: "NY"
   - ZIP: "10001"
   - País: "USA"
   - Click "Continue"

5. **PASO 4 - Pagar:**
   - Click "Pay with Stripe"
   - Tarjeta: 4242 4242 4242 4242
   - Fecha: 12/34
   - CVC: 123
   - Click "Pay"
   - ✅ Debe redirigir a página de éxito

### **7.3 Verificar en Logs**

```bash
# Ver logs de PM2
pm2 logs barrera-wallpaper --lines 100

# Buscar confirmación de orden
pm2 logs barrera-wallpaper | grep "Order.*sent to Pictorem"

# Buscar ID de Pictorem
pm2 logs barrera-wallpaper | grep "pictoremOrderId"
```

**Logs esperados:**
```
✅ Order BW-AI-xxx created successfully
✅ Payment completed for order xxx
✅ Order BW-AI-xxx sent to Pictorem: [pictorem_order_id]
✅ AI order status updated to SENT_TO_PICTOREM
```

### **7.4 Verificar en Admin Panel**

1. **Login como admin:**
   ```
   https://barrerawallpaper.com/login
   Email: admin@barrera.com
   Password: admin123
   ```

2. **Ir a Órdenes:**
   ```
   https://barrerawallpaper.com/admin/orders
   ```

3. **Verificar orden de prueba:**
   - ✅ Aparece en lista
   - ✅ Estado: "PROCESSING"
   - ✅ `pictoremOrderId` presente
   - ✅ Detalles de AI order visibles

### **7.5 Verificar en Pictorem Dashboard**

1. **Login en Pictorem:**
   ```
   https://www.pictorem.com/login
   ```

2. **Ver órdenes:**
   - ✅ Orden de prueba debe aparecer
   - ✅ Imagen debe estar visible
   - ✅ Detalles de producto correctos
   - ✅ Dirección de envío correcta

---

## 🔄 PASO 8: MANEJO DE ERRORES COMUNES

### **Error: Orden no se envía a Pictorem**

**Síntomas:**
- Estado queda en "CONFIRMED" o "PAID"
- No aparece `pictoremOrderId`
- AI order tiene estado "ERROR"

**Diagnóstico:**
```bash
# Ver logs de error
pm2 logs barrera-wallpaper --err | grep -A 10 "Pictorem"

# Buscar mensaje de error específico
pm2 logs barrera-wallpaper | grep -A 5 "Error sending order to Pictorem"
```

**Causas comunes:**

1. **URL de imagen expiró (OpenAI URLs expiran en 1 hora)**
   ```
   Error: Image URL no longer accessible
   ```
   **Solución:** Implementar almacenamiento permanente (AWS S3)

2. **Credenciales de Pictorem incorrectas**
   ```
   Error: Invalid API key
   ```
   **Solución:** Verificar `PICTOREM_API_KEY` y `PICTOREM_SHOP_CODE`

3. **Código de preorden inválido**
   ```
   Error: Invalid preorder code
   ```
   **Solución:** Verificar formato del preorder code

**Reintentar manualmente:**

1. **Admin Panel** → **Orders**
2. **Buscar orden con error**
3. **Click "Retry"**
4. **Verificar logs**

---

### **Error: Webhook no se ejecuta**

**Síntomas:**
- Pago completa en Stripe
- Orden queda en "PENDING"
- No se actualiza a "CONFIRMED"

**Diagnóstico:**
```bash
# Ver logs de webhook
pm2 logs barrera-wallpaper | grep "webhook"

# Verificar firma de webhook
pm2 logs barrera-wallpaper | grep "signature"
```

**Soluciones:**

1. **Verificar webhook configurado en Stripe:**
   - Dashboard → Developers → Webhooks
   - URL debe ser: `https://barrerawallpaper.com/api/payments/stripe/webhook`
   - Estado debe ser "Enabled"

2. **Verificar STRIPE_WEBHOOK_SECRET:**
   ```bash
   echo $STRIPE_WEBHOOK_SECRET
   # Debe mostrar: whsec_...
   ```

3. **Probar webhook manualmente:**
   - Stripe Dashboard → Webhooks → Tu webhook
   - Click "Send test webhook"
   - Elegir "checkout.session.completed"
   - Ver respuesta

---

## 📊 MONITOREO Y MANTENIMIENTO

### **Revisar Logs Diariamente**

```bash
# Ver errores del día
pm2 logs barrera-wallpaper --err --lines 100

# Ver órdenes procesadas
pm2 logs barrera-wallpaper | grep "sent to Pictorem"

# Ver pagos completados
pm2 logs barrera-wallpaper | grep "Payment completed"
```

### **Verificar Créditos de OpenAI**

1. **Dashboard:** https://platform.openai.com/usage
2. **Ver uso diario/mensual**
3. **Agregar créditos si es necesario**

### **Revisar Transacciones de Stripe**

1. **Dashboard:** https://dashboard.stripe.com/payments
2. **Ver pagos recientes**
3. **Verificar disputas/reembolsos**

### **Revisar Órdenes de Pictorem**

1. **Dashboard de Pictorem**
2. **Ver estado de órdenes**
3. **Verificar tracking numbers**

---

## 🎉 COMPLETADO

**Si llegaste aquí y todo funciona:**

- ✅ Base de datos configurada y funcionando
- ✅ Autenticación funcionando
- ✅ OpenAI generando imágenes
- ✅ Pictorem calculando precios
- ✅ Stripe procesando pagos
- ✅ Webhooks ejecutándose
- ✅ Órdenes enviándose a Pictorem automáticamente
- ✅ Sistema completo end-to-end operativo

**🎉 ¡Felicidades! Tu sistema de AI + Dropshipping está funcionando.**

---

## 📞 CONTACTO Y SOPORTE

**Para problemas técnicos:**
- Revisa `AI_DROPSHIPPING_FLOW.md` para entender el flujo
- Revisa logs con `pm2 logs barrera-wallpaper`
- Busca errores específicos en la documentación

**Para problemas con integraciones:**
- OpenAI: https://help.openai.com
- Pictorem: info@pictorem.com
- Stripe: https://support.stripe.com
- PayPal: https://developer.paypal.com/support

---

**Última actualización:** 2 de enero de 2025
**Versión:** 1.0
