
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { prompt, style, room } = await request.json();

    if (!prompt || prompt.trim().length === 0) {
      return new Response(JSON.stringify({ error: 'Prompt is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Create enhanced prompt for wallpaper generation
    const enhancedPrompt = `Create a seamless wallpaper pattern design: ${prompt}. Style: ${style || 'realistic'}. Optimized for ${room || 'interior'} spaces. High-resolution, repeatable pattern, professional interior design quality.`;

    const messages = [
      {
        role: "user",
        content: enhancedPrompt
      }
    ];

    const response = await fetch('https://apps.abacus.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ABACUSAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        messages: messages,
        stream: true,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`LLM API error: ${response.status}`);
    }

    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        const encoder = new TextEncoder();
        
        try {
          while (true) {
            const { done, value } = await reader?.read() || { done: true, value: undefined };
            if (done) break;
            const chunk = decoder.decode(value);
            controller.enqueue(encoder.encode(chunk));
          }
        } catch (error) {
          console.error('Stream error:', error);
          controller.error(error);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Error generating wallpaper:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate wallpaper design' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
