
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    // Get completed AI generation requests to show as examples
    const examples = await prisma.aIGenerationRequest.findMany({
      where: {
        status: 'COMPLETED',
        generatedImageUrl: {
          not: null
        }
      },
      select: {
        id: true,
        prompt: true,
        generatedImageUrl: true,
        style: true,
        colors: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 6 // Limit to 6 examples
    });

    const formattedExamples = examples.map(example => ({
      id: example.id,
      prompt: example.prompt,
      imageUrl: example.generatedImageUrl,
      style: example.style || 'Custom',
      colors: example.colors,
      createdAt: example.createdAt.toISOString()
    }));

    return NextResponse.json({
      success: true,
      data: formattedExamples
    });

  } catch (error: any) {
    console.error('Get AI examples error:', error);
    
    // Return fallback examples if database query fails
    const fallbackExamples = [
      {
        id: 'fallback-1',
        prompt: 'Modern geometric pattern with gold accents and navy blue background',
        imageUrl: '/images/ai-example-1.jpg',
        style: 'Modern',
        colors: ['gold', 'navy blue'],
        createdAt: new Date().toISOString()
      },
      {
        id: 'fallback-2',
        prompt: 'Tropical botanical leaves in watercolor style with emerald tones',
        imageUrl: '/images/ai-example-2.jpg',
        style: 'Botanical',
        colors: ['green', 'emerald'],
        createdAt: new Date().toISOString()
      },
      {
        id: 'fallback-3',
        prompt: 'Abstract marble texture with rose gold veining and white base',
        imageUrl: '/images/ai-example-3.jpg',
        style: 'Abstract',
        colors: ['white', 'rose gold'],
        createdAt: new Date().toISOString()
      }
    ];

    return NextResponse.json({
      success: true,
      data: fallbackExamples
    });
  }
}
