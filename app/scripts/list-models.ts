import { GoogleGenerativeAI } from "@google/generative-ai";

async function listAvailableModels() {
  const apiKey = "AIzaSyCk4k5JhlPP3hJ6TV19lMoCNEuUCRiNPw4";
  const genAI = new GoogleGenerativeAI(apiKey);
  
  try {
    console.log("🔍 Consultando modelos disponibles para esta clave...");
    // Intentamos listar modelos (esto requiere la librería pero a veces se bloquea)
    // Usaremos un fetch directo a la API de Google para ser más precisos
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    
    const res = await fetch(url);
    const data = await res.json();
    
    if (data.models) {
      console.log("✅ MODELOS DISPONIBLES:");
      data.models.forEach((m: any) => console.log(`- ${m.name}`));
    } else {
      console.error("❌ No se encontraron modelos o la clave no tiene permisos.");
      console.log(JSON.stringify(data, null, 2));
    }
  } catch (error: any) {
    console.error("❌ Error al consultar la API de Google:", error.message);
  }
}

listAvailableModels();
