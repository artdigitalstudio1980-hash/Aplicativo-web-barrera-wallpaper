import { GoogleGenerativeAI } from "@google/generative-ai";

async function testGemini() {
  const apiKey = process.env.GOOGLE_AI_STUDIO_API_KEY;
  if (!apiKey) {
    console.error("Set GOOGLE_AI_STUDIO_API_KEY in the environment.");
    process.exit(1);
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  
  try {
    console.log("🔍 Verificando conexión con Google AI Studio...");
    
    // Usamos el modelo 2.0 que es el más avanzado y estable en tu lista
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    const prompt = "Di: 'Conexión exitosa con Barrera Wallpaper. Gemini está listo para diseñar.'";
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log("-----------------------------------------");
    console.log("✅ RESPUESTA DE LA IA:");
    console.log(text);
    console.log("-----------------------------------------");
    console.log("🚀 ¡La API Key funciona perfectamente!");
    
  } catch (error: any) {
    console.error("❌ ERROR AL CONECTAR CON GEMINI:");
    console.error(error.message);
    if (error.message.includes("API_KEY_INVALID")) {
      console.error("👉 La clave proporcionada no es válida o ha expirado.");
    } else if (error.message.includes("location is not supported")) {
      console.error("👉 Tu región actual no tiene acceso a este modelo sin VPN/Proxy.");
    }
  }
}

testGemini();
