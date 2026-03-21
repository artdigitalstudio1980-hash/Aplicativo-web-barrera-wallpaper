import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';

// Inyección directa de la llave para Hostinger
const GOOGLE_KEY = "AIzaSyCk4k5JhlPP3hJ6TV19lMoCNEuUCRiNPw4";
const genAI = new GoogleGenerativeAI(GOOGLE_KEY);

export async function POST(req: Request) {
  try {
    const { messages, measurements, product } = await req.json();

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const systemPrompt = `
      ROLE: Technical Estimator & Installation Expert for Barrera Wallpaper.
      SPECIALTY: SYSTEXX by Vitrulan technical specifications and professional installation.
      LANGUAGE: ENGLISH (Default).

      TECHNICAL KNOWLEDGE:
      - Fire Rating: A2-s1, d0 (Non-combustible).
      - Durability: Glass fiber is extremely resistant to impact and bridges cracks.
      - Installation: Requires specific high-quality adhesive (like SYSTEXX Glue).
      - Waste Factor: 10% extra is standard for pattern matching and cutting.
      - Environment: Oeko-Tex certified, formaldehyde-free (Active Absorb line actually captures it).

      CONTEXT:
      - Current Product: ${product || 'Standard Wallpaper'}
      - User Measurements: Width ${measurements?.width}m, Height ${measurements?.height}m.

      MISSION:
      Answer technical questions with precision and confidence. Encourage the user that they are making a long-term investment. If they ask about "how many rolls", refer to the automatic calculator on the page.

      TONE:
      Precise, authoritative, helpful, and professional.
    `;

    const lastMessage = messages[messages.length - 1].content;
    const previousContext = messages.slice(0, -1).map((m: any) => `${m.role}: ${m.content}`).join('\n');
    
    const finalPrompt = `${systemPrompt}\n\nCHAT HISTORY:\n${previousContext}\n\nUSER: ${lastMessage}\nASSISTANT:`;

    const result = await model.generateContent(finalPrompt);
    const response = result.response;
    const text = response.text();

    return NextResponse.json({ role: 'assistant', content: text });

  } catch (error: any) {
    console.error('Technical Agent Error:', error);
    return NextResponse.json({ role: 'assistant', content: "Our technical database is being updated. Feel free to proceed with the calculation or contact Oscar via WhatsApp for urgent installation queries." });
  }
}
