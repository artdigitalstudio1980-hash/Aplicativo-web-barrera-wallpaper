import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';

// Inicializar Google AI con la clave directa para asegurar funcionamiento en Hostinger
const GOOGLE_KEY = "AIzaSyCk4k5JhlPP3hJ6TV19lMoCNEuUCRiNPw4";
const genAI = new GoogleGenerativeAI(GOOGLE_KEY);

export async function POST(req: Request) {
  try {
    const { messages, currentStep, selectedProduct } = await req.json();

    // 1. Cargar Tendencias Dinámicas
    let dynamicTrends = '';
    try {
      const knowledgePath = path.join(process.cwd(), 'knowledge', 'design_trends.md');
      if (fs.existsSync(knowledgePath)) {
        dynamicTrends = fs.readFileSync(knowledgePath, 'utf-8');
      }
    } catch (e) { console.warn(e); }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const systemPrompt = `
      ROLE: Expert Design Consultant for Barrera Wallpaper.
      SPECIALTY: Interior Design & SYSTEXX Technology.
      LANGUAGE: ENGLISH (Miami Standard).

      DYNAMIC TRENDS (LEARNED):
      ${dynamicTrends}

      CONTEXT:
      - Step: ${currentStep}
      - Selected Product: ${selectedProduct || 'None'}

      MISSION:
      Inspire the user. Help them write prompts for the AI image generator.
      Suggest "SYSTEXX Active" for functionality, "Phantasy" for luxury, "Pure" for minimalism.

      INSTRUCTION:
      Be creative. If they are in "Paint Walls" step, tell them precision matters.
      Keep it brief and inspiring.
    `;

    const lastMessage = messages[messages.length - 1].content;
    const previousContext = messages.slice(0, -1).map((m: any) => `${m.role}: ${m.content}`).join('\n');
    
    const finalPrompt = `${systemPrompt}\n\nCHAT HISTORY:\n${previousContext}\n\nUSER: ${lastMessage}\nASSISTANT:`;

    const result = await model.generateContent(finalPrompt);
    const response = result.response;
    const text = response.text();

    return NextResponse.json({ role: 'assistant', content: text });

  } catch (error: any) {
    console.error('Design Gemini Error:', error);
    return NextResponse.json({ role: 'assistant', content: "I'm analyzing the latest trends... Ask me about our Phantasy collection!" });
  }
}
