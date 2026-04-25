export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import Replicate from "replicate";
import fs from 'fs';
import path from 'path';
import { ratelimit } from '@/lib/ratelimit';

interface GenerateRequest {
  prompt: string;
  style?: string;
  colors?: string[];
  width?: number;
  height?: number;
  userId?: string;
}

const sanitizePrompt = (prompt: string): string => {
  return prompt
    .replace(/[<>]/g, '') // Remove HTML tags
    .substring(0, 500);   // Limit length
};

export async function POST(req: NextRequest) {
  try {
    // 1. Rate Limiting (Opcional, si Upstash está configurado)
    const ip = req.ip ?? '127.0.0.1';
    try {
      const { success } = await ratelimit.limit(ip);
      if (!success) {
        return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
      }
    } catch (e) {
      console.warn('Rate limiting skipped due to missing config');
    }

    const body: GenerateRequest = await req.json();
    const rawPrompt = body.prompt;
    const userId = body.userId;

    if (!rawPrompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // 2. Preparar el Prompt Mejorado para Flux
    const prompt = sanitizePrompt(rawPrompt);
    let enhancedPrompt = `A luxurious and high-end wallpaper design, ${prompt}`;
    if (body.style) enhancedPrompt += `, ${sanitizePrompt(body.style)} style`;
    if (body.colors && body.colors.length > 0) {
      enhancedPrompt += `, featuring colors: ${body.colors.map(c => sanitizePrompt(c)).join(', ')}`;
    }
    enhancedPrompt += `, 8k resolution, professional interior design, architectural pattern, hyperrealistic, elegant texture.`;

    const replicateToken = process.env.REPLICATE_API_TOKEN;
    if (!replicateToken) {
      return NextResponse.json({ error: 'AI service token missing' }, { status: 503 });
    }

    // 4. Crear registro inicial en la DB de Hostinger
    const generationRequest = await prisma.aIGenerationRequest.create({
      data: {
        userId,
        prompt: enhancedPrompt,
        style: body.style,
        colors: body.colors || [],
        status: 'PROCESSING',
        aiProvider: 'replicate'
      }
    });

    const startTime = Date.now();

    try {
      const replicate = new Replicate({ auth: replicateToken });
      
      console.log('Using Replicate (Flux Schnell) for generation...');
      
      // Ejecutar el modelo Flux Schnell (Rápido y de Alta Calidad)
      const output = await replicate.run(
        "black-forest-labs/flux-schnell",
        {
          input: {
            prompt: enhancedPrompt,
            aspect_ratio: "1:1",
            output_format: "webp",
            output_quality: 90,
          }
        }
      );

      // Replicate devuelve una URL temporal o un array de URLs
      const remoteImageUrl = Array.isArray(output) ? output[0] : output as string;
      
      if (!remoteImageUrl) {
        throw new Error('No image URL received from Replicate');
      }

      // 5. Descargar la imagen y guardarla LOCALMENTE en Hostinger
      const response = await fetch(remoteImageUrl);
      const buffer = Buffer.from(await response.arrayBuffer());
      
      const fileName = `flux-${Date.now()}-${Math.random().toString(36).substring(7)}.webp`;
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'ai-generated');
      
      // Asegurar que el directorio existe
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const localFilePath = path.join(uploadDir, fileName);
      fs.writeFileSync(localFilePath, buffer);

      // La URL que usará el navegador
      const finalImageUrl = `/uploads/ai-generated/${fileName}`;
      
      console.log('Image saved locally on Hostinger:', finalImageUrl);

      const processingTime = Math.round((Date.now() - startTime) / 1000);

      // 6. Actualizar la DB de Hostinger con el resultado final
      await prisma.aIGenerationRequest.update({
        where: { id: generationRequest.id },
        data: {
          generatedImageUrl: finalImageUrl,
          status: 'COMPLETED',
          processingTime,
          cost: 0.01 // Costo aproximado por uso de Flux Schnell
        }
      });

      return NextResponse.json({
        success: true,
        data: {
          id: generationRequest.id,
          imageUrl: finalImageUrl,
          prompt: enhancedPrompt,
          processingTime
        }
      });

    } catch (aiError: any) {
      await prisma.aIGenerationRequest.update({
        where: { id: generationRequest.id },
        data: {
          status: 'FAILED',
          errorMessage: aiError.message,
          processingTime: Math.round((Date.now() - startTime) / 1000)
        }
      });

      console.error('AI Generation error:', aiError);
      return NextResponse.json(
        { error: 'Failed to generate wallpaper', details: aiError.message },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('Global API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
