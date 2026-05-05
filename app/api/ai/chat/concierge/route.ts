import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';

export async function POST(req: Request) {
  try {
    const googleKey = process.env.GOOGLE_AI_STUDIO_API_KEY;
    if (!googleKey) {
      return NextResponse.json(
        { error: 'AI service is not configured (GOOGLE_AI_STUDIO_API_KEY)' },
        { status: 503 }
      );
    }

    const genAI = new GoogleGenerativeAI(googleKey);
    const { messages } = await req.json();

    // 1. Cargar Conocimiento Dinámico (Auto-Aprendizaje)
    let dynamicKnowledge = '';
    try {
      const knowledgePath = path.join(process.cwd(), 'knowledge', 'concierge_faq.md');
      if (fs.existsSync(knowledgePath)) {
        dynamicKnowledge = fs.readFileSync(knowledgePath, 'utf-8');
      }
    } catch (e) {
      console.warn('No se pudo cargar el conocimiento dinámico:', e);
    }

    // 2. Configurar el Modelo
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // 3. Crear el Prompt del Sistema
    const systemPrompt = `
      ROLE: Luxury Concierge for Barrera Wallpaper (Miami).
      NAME: Oscar's Assistant.
      TONE: Sophisticated, helpful, professional, minimalist.
      LANGUAGE: ENGLISH (Default). Adapt to user if they speak Spanish.

      DYNAMIC KNOWLEDGE (UPDATED REAL-TIME):
      ${dynamicKnowledge}

      OBJECTIVES:
      1. Welcome warmly.
      2. Answer questions using the Knowledge Base.
      3. Qualify the client (Residential vs Commercial).
      4. GOAL: Get them to click "Talk to Oscar on WhatsApp" or visit "/design".

      RULES:
      - Short answers (max 3 sentences).
      - Prices start at ~$95/m².
      - Never say "I am an AI" unless asked directly.
    `;

    // 4. Preparar el historial para Gemini
    // Gemini gestiona el historial de forma diferente, aquí simplificamos enviando el contexto + último mensaje
    // o construyendo un chat simple. Para este endpoint stateless, enviamos el prompt + historial reciente.
    
    const lastMessage = messages[messages.length - 1].content;
    const previousContext = messages.slice(0, -1).map((m: any) => `${m.role}: ${m.content}`).join('\n');

    const finalPrompt = `${systemPrompt}\n\nCHAT HISTORY:\n${previousContext}\n\nUSER: ${lastMessage}\nASSISTANT:`;

    const result = await model.generateContent(finalPrompt);
    const response = result.response;
    const text = response.text();

    return NextResponse.json({ role: 'assistant', content: text });

  } catch (error: any) {
    console.error('Concierge Gemini Error:', error);
    // Fallback elegante si falla la API
    return NextResponse.json({ 
      role: 'assistant', 
      content: "I apologize, I'm currently updating my database. Please click the WhatsApp button below to speak with Oscar directly." 
    });
  }
}
