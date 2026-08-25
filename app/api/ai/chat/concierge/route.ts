import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const groqKey = process.env.GROQ_API_KEY;
    if (!groqKey) {
      return NextResponse.json(
        { error: 'AI service is not configured (GROQ_API_KEY)' },
        { status: 503 }
      );
    }

    const { messages, lead } = await req.json();

    let dynamicKnowledge = '';
    try {
      const knowledgePath = path.join(process.cwd(), 'knowledge', 'concierge_faq.md');
      if (fs.existsSync(knowledgePath)) {
        dynamicKnowledge = fs.readFileSync(knowledgePath, 'utf-8');
      }
    } catch (e) {
      console.warn('Could not load knowledge base:', e);
    }

    let catalogSummary = '';
    try {
      const products = await prisma.product.findMany({
        take: 50,
        select: { name: true, nameEs: true, category: true, price: true, slug: true }
      });
      if (products.length > 0) {
        const byCat: Record<string, { names: string[], minPrice: number, count: number }> = {};
        for (const p of products) {
          const cat = p.category || 'other';
          if (!byCat[cat]) byCat[cat] = { names: [], minPrice: Infinity, count: 0 };
          byCat[cat].count++;
          byCat[cat].minPrice = Math.min(byCat[cat].minPrice, p.price || Infinity);
          if (byCat[cat].names.length < 5) byCat[cat].names.push(p.name || p.nameEs || '');
        }
        catalogSummary = Object.entries(byCat)
          .map(([cat, info]) => {
            const price = info.minPrice === Infinity ? 'N/A' : `$${info.minPrice}/roll`;
            return `${cat}: ${info.count} designs, from ${price} — ${info.names.join(', ')}`;
          })
          .join('\n');
      }
    } catch (e) {
      console.warn('Could not load catalog from DB:', e);
      try {
        const jsonPath = path.join(process.cwd(), 'prisma', 'catalog_master.json');
        if (fs.existsSync(jsonPath)) {
          const raw = fs.readFileSync(jsonPath, 'utf-8');
          catalogSummary = `Product catalog loaded with ${raw.split('"slug"').length - 1} items. Refer user to /catalog for full details.`;
        }
      } catch (e2) {}
    }

    if (lead?.name || lead?.phone) {
      try {
        await prisma.contactSubmission.create({
          data: {
            name: lead.name || 'Chat Lead',
            email: lead.email || null,
            phone: lead.phone || null,
            message: lead.message || 'Captured via AI Sales Chat',
          }
        });
      } catch (e) {
        console.warn('Could not save lead:', e);
      }
    }

    const systemPrompt = `
      ROLE: Senior Sales Concierge for Barrera Wallpaper (Miami, FL).
      NAME: Oscar's Assistant.
      TONE: Warm, confident, persuasive, luxury but not pushy.
      LANGUAGE: ENGLISH preferred. Switch to Spanish if user writes in Spanish.

      COMPANY INFO:
      ${dynamicKnowledge}

      LIVE CATALOG (current products & pricing):
      ${catalogSummary || 'Products available at /catalog — prices start at $350/roll.'}

      YOUR SALES PROCESS:
      1. GREET warmly and ask about their project.
      2. QUALIFY: Residential or Commercial? Room type? Dimensions?
      3. RECOMMEND: Match their need to the right collection.
      4. HANDLE OBJECTIONS with the talking points from your knowledge base.
      5. CLOSE with a clear next step: register for 15% off, schedule a consultation, visit catalog, or WhatsApp.

      RULES:
      - Be concise (2-3 sentences max per response).
      - Always steer toward a specific product or next action.
      - If they mention a room type, recommend a specific collection and design.
      - If they hesitate, offer the 15% off registration incentive.
      - Never say "I am an AI" unless they ask directly.
      - For complex installations or pricing, offer to connect them with Oscar on WhatsApp.
    `;

    const lastMessage = messages[messages.length - 1].content;
    const previousContext = messages.slice(0, -1).map((m: any) => `${m.role}: ${m.content}`).join('\n');

    const finalPrompt = `${systemPrompt}\n\nCHAT HISTORY:\n${previousContext}\n\nUSER: ${lastMessage}\nASSISTANT:`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${groqKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-120b",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages
        ],
        temperature: 0.7,
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
    console.error('Concierge Groq Error:', error);
    return NextResponse.json({
      role: 'assistant',
      content: "I apologize, I'm currently updating my database. Please click the WhatsApp button below to speak with Oscar directly."
    });
  }
}
