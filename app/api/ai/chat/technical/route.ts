import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: Request) {
  try {
    const groqKey = process.env.GROQ_API_KEY;
    if (!groqKey) {
      return NextResponse.json(
        { error: 'AI service is not configured (GROQ_API_KEY)' },
        { status: 503 }
      );
    }

    const { messages, measurements, product } = await req.json();

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

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${groqKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages
        ],
        temperature: 0.5,
        max_tokens: 1024
      })
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Groq API error:', response.status, errorBody);
      throw new Error(`Groq API returned ${response.status}`);
    }

    const data = await response.json();
    const text = data.choices[0].message.content;

    return NextResponse.json({ role: 'assistant', content: text });

  } catch (error: any) {
    console.error('Technical Groq Error:', error);
    return NextResponse.json({ role: 'assistant', content: "Our technical database is being updated. Feel free to proceed with the calculation or contact Oscar via WhatsApp for urgent installation queries." });
  }
}
