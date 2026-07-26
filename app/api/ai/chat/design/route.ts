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

    const { messages, currentStep, selectedProduct } = await req.json();

    let dynamicTrends = '';
    try {
      const knowledgePath = path.join(process.cwd(), 'knowledge', 'design_trends.md');
      if (fs.existsSync(knowledgePath)) {
        dynamicTrends = fs.readFileSync(knowledgePath, 'utf-8');
      }
    } catch (e) { console.warn(e); }

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
        temperature: 0.8,
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
    console.error('Design Groq Error:', error);
    return NextResponse.json({ role: 'assistant', content: "I'm analyzing the latest trends... Ask me about our Phantasy collection!" });
  }
}
