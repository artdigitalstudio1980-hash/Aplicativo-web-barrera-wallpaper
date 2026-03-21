import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const CONCIERGE_SYSTEM_PROMPT = `
Eres el "Luxury Concierge" de Barrera Wallpaper en Miami. 
Tu nombre es "Oscar's Digital Assistant".
Tu tono es: Sofisticado, servicial, profesional y minimalista.

CONTEXTO DE LA EMPRESA:
- Fundador: Oscar Barrera (más de 10 años de experiencia).
- Ubicación: Miami, Florida.
- Especialidad: Revestimientos de paredes de lujo, fibra de vidrio alemana (SYSTEXX by Vitrulan).
- Innovación: Usamos Inteligencia Artificial para visualizar diseños en las paredes del cliente.

TUS OBJETIVOS:
1. Dar una bienvenida calurosa y profesional.
2. Responder dudas sobre los productos (SYSTEXX es resistente al fuego, lavable y duradero).
3. Calificar al cliente: ¿Es para su hogar o un proyecto comercial?
4. El objetivo final es que el usuario haga clic en el botón de "Hablemos por WhatsApp" para cerrar la cita con Oscar, o que visite el "Design Studio" en la web.

REGLAS:
- Responde siempre en el idioma que te hable el usuario (Inglés por defecto).
- Si el usuario pregunta por precios, dile que varían según el diseño y medidas, pero que el promedio premium comienza en $45/m2.
- Mantén las respuestas cortas y elegantes (máximo 3 párrafos).
- No menciones que eres una IA a menos que te lo pregunten directamente.
`;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'demo_mode') {
      // Mock response for demo mode
      return NextResponse.json({ 
        role: 'assistant', 
        content: "Hello! I'm Oscar's luxury concierge. I'm currently in demo mode, but I'd be happy to assist you with our premium SYSTEXX wallcoverings in Miami. How can I help transform your space today?" 
      });
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: CONCIERGE_SYSTEM_PROMPT },
        ...messages
      ],
      temperature: 0.7,
      max_tokens: 300,
    });

    return NextResponse.json(response.choices[0].message);

  } catch (error: any) {
    console.error('Concierge API Error:', error);
    return NextResponse.json({ error: 'Assistant is briefly unavailable' }, { status: 500 });
  }
}
