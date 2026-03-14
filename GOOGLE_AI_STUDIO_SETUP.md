# Configuración de Google AI Studio para Generación de Imágenes con Nano Banana

Esta guía te ayudará a configurar la API de Google AI Studio para generar imágenes con Nano Banana en tu aplicación Barrera Wallpaper.

## 🎯 ¿Qué es Nano Banana?

**Nano Banana** es el nombre comercial del modelo **Gemini 2.5 Flash Image** de Google. Es un modelo de inteligencia artificial que genera imágenes de alta calidad a partir de descripciones de texto.

### Características principales:
- ✅ Generación rápida de imágenes (segundos)
- ✅ Alta calidad visual
- ✅ Costo económico (~$0.02 por imagen)
- ✅ Comprensión avanzada de prompts en español e inglés
- ✅ Excelente para diseños de wallpapers

## 📋 Paso 1: Crear una Cuenta en Google AI Studio

1. Ve a **[Google AI Studio](https://aistudio.google.com/)**
2. Haz clic en **"Get API key"** o **"Obtener clave de API"**
3. Inicia sesión con tu cuenta de Google
4. Acepta los términos y condiciones

## 🔑 Paso 2: Generar tu API Key

1. En Google AI Studio, ve a la sección **"API keys"**
2. Haz clic en **"Create API key"** o **"Crear clave de API"**
3. Selecciona o crea un proyecto de Google Cloud
   - Si no tienes un proyecto, el sistema creará uno automáticamente
4. Copia la API key que se genera
   - **IMPORTANTE**: Guarda esta clave en un lugar seguro
   - No la compartas públicamente

### Ejemplo de API Key:
```
AIzaSyBq8X9Y0Z1A2B3C4D5E6F7G8H9I0J1K2L3
```

## ⚙️ Paso 3: Configurar la Variable de Entorno

### En tu servidor local (desarrollo):

1. Abre el archivo `.env` en la carpeta `app/`
2. Busca la línea:
   ```
   GOOGLE_AI_STUDIO_API_KEY=your_google_ai_studio_api_key_here
   ```
3. Reemplaza `your_google_ai_studio_api_key_here` con tu API key:
   ```
   GOOGLE_AI_STUDIO_API_KEY=AIzaSyBq8X9Y0Z1A2B3C4D5E6F7G8H9I0J1K2L3
   ```
4. Guarda el archivo

### En Hostinger (producción):

1. Inicia sesión en tu panel de Hostinger
2. Ve a tu aplicación de Node.js
3. Busca la sección **"Variables de entorno"** o **"Environment Variables"**
4. Agrega una nueva variable:
   - **Nombre**: `GOOGLE_AI_STUDIO_API_KEY`
   - **Valor**: Tu API key de Google AI Studio
5. Guarda los cambios
6. Reinicia la aplicación

## 🧪 Paso 4: Probar la Generación de Imágenes

1. Abre tu aplicación web
2. Ve a la página **"AI Studio"** (`/ai-studio`)
3. Escribe un prompt de prueba, por ejemplo:
   ```
   Un diseño moderno de wallpaper con patrones geométricos en colores azul y dorado
   ```
4. Haz clic en **"Generar Diseño"**
5. Espera unos segundos (15-30 segundos aproximadamente)
6. La imagen generada aparecerá en la pantalla

## 💰 Costos y Límites

### Precios de Google AI Studio:
- **Nano Banana (Gemini 2.5 Flash Image)**: ~$0.02 USD por imagen
- **Cuota gratuita**: Google ofrece créditos gratuitos para nuevos usuarios
- **Límites de uso**: Consulta tu cuota en Google AI Studio

### Comparación con otros servicios:
- OpenAI DALL-E 3: ~$0.04-$0.08 por imagen (2-4x más caro)
- Stability AI: ~$0.002-$0.02 por imagen (similar)
- Nano Banana ofrece excelente relación calidad-precio

## 🔧 Solución de Problemas

### Error: "Google AI Studio API key not configured"
**Solución**: Verifica que la variable de entorno esté configurada correctamente y reinicia el servidor.

### Error: "Google AI Studio API error: 401"
**Solución**: Tu API key es inválida o ha expirado. Genera una nueva en Google AI Studio.

### Error: "Google AI Studio API error: 429"
**Solución**: Has excedido el límite de solicitudes. Espera unos minutos o actualiza tu cuota.

### Error: "No image data received from Google AI Studio"
**Solución**: El modelo no pudo generar la imagen. Intenta con un prompt diferente o más específico.

### La imagen no se carga después de generarse
**Solución**: Verifica que las credenciales de AWS S3 estén configuradas correctamente para el almacenamiento de imágenes.

## 🎨 Consejos para Mejores Resultados

### Prompts efectivos:
✅ **Bueno**: "Diseño de wallpaper minimalista con formas geométricas en tonos pastel, estilo escandinavo, alta resolución"

❌ **Malo**: "Wallpaper bonito"

### Elementos a incluir en tus prompts:
1. **Estilo**: moderno, clásico, minimalista, abstracto, etc.
2. **Colores**: específicos o paleta de colores
3. **Elementos**: patrones, formas, texturas
4. **Calidad**: alta resolución, 8k, profesional
5. **Uso**: para impresión, decoración de interiores

### Ejemplos de prompts efectivos:

```
"Wallpaper elegante con patrón de mármol en tonos grises y dorados, 
textura realista, alta definición, adecuado para impresión en gran formato"

"Diseño tropical moderno con hojas de monstera estilizadas, 
paleta de verdes y amarillos, fondo blanco, estilo minimalista"

"Patrón geométrico abstracto con círculos y líneas, 
colores azul marino y cobre, diseño repetitivo, profesional"
```

## 📚 Recursos Adicionales

- [Documentación oficial de Google AI Studio](https://ai.google.dev/)
- [Guía de Nano Banana](https://ai.google.dev/gemini-api/docs/nanobanana)
- [Ejemplos de prompts para imágenes](https://ai.google.dev/gemini-api/docs/image-generation)
- [Google Cloud Console](https://console.cloud.google.com/) (para gestionar proyectos y facturación)

## ✅ Verificación de Configuración

Para verificar que todo está configurado correctamente:

1. ✅ API key obtenida de Google AI Studio
2. ✅ Variable de entorno `GOOGLE_AI_STUDIO_API_KEY` configurada
3. ✅ Servidor reiniciado después de la configuración
4. ✅ Generación de imagen de prueba exitosa

## 🎉 ¡Listo!

Ahora tu aplicación puede generar imágenes de wallpapers usando **Nano Banana de Google AI Studio**. 

Las imágenes generadas se almacenarán automáticamente en AWS S3 y estarán disponibles para que tus clientes las ordenen a través de Pictorem.

---

**¿Tienes preguntas?** Contacta al equipo de soporte técnico.
