import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const ABACUS_API_KEY = process.env.ABACUS_API_KEY || '99e8655f67fa4bc9aec1827e7995feb9';

// stable-diffusion-inpainting by stability-ai — well tested on Replicate
const REPLICATE_MODEL_VERSION = '95b7223104132402a9ae91cc677285bc5eb997834bd2349fa486f53910fd68b3';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();
    const { roomImage, maskImage, wallpaperId, wallpaperName, wallpaperImageUrl } = body;

    if (!roomImage || !wallpaperId) {
      return NextResponse.json({ success: false, error: 'roomImage and wallpaperId are required' }, { status: 400 });
    }

    const wallpaper = await prisma.product.findUnique({ where: { id: wallpaperId } });
    const wpImageUrl = wallpaperImageUrl ||
      (wallpaper && Array.isArray(wallpaper.images) && wallpaper.images.length > 0 ? wallpaper.images[0] as string : null);
    const wpName = wallpaperName || wallpaper?.name || 'premium decorative wallpaper';

    // ── REPLICATE PATH ──────────────────────────────────────────────────────────
    if (REPLICATE_API_TOKEN) {
      const hasMask = !!maskImage;

      const prompt = hasMask
        ? `Interior room with ${wpName} wallpaper applied to the masked wall area, photorealistic, professional interior design photography, high detail, consistent lighting`
        : `Interior room where all walls are covered with beautiful ${wpName} wallpaper pattern, photorealistic render, professional interior design, high detail`;

      const inputPayload: Record<string, unknown> = {
        prompt,
        negative_prompt: 'blurry, low quality, distorted, cartoon, painting, unrealistic, watermark',
        num_inference_steps: 30,
        guidance_scale: 7.5,
        image: roomImage,
      };

      if (hasMask) {
        inputPayload.mask = maskImage;
      } else {
        // No mask — use img2img inpainting with a full-white mask (repaint everything)
        inputPayload.mask = await buildFullWhiteMaskBase64(roomImage);
      }

      const replicateRes = await fetch('https://api.replicate.com/v1/predictions', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${REPLICATE_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          version: REPLICATE_MODEL_VERSION,
          input: inputPayload,
        }),
      });

      if (!replicateRes.ok) {
        const errText = await replicateRes.text();
        console.error('Replicate API error:', errText);
        throw new Error(`Replicate responded ${replicateRes.status}: ${errText}`);
      }

      const prediction = await replicateRes.json();

      // Persist design session (async, non-blocking)
      saveDesignSession(session, roomImage, wallpaperId, prediction.id || 'pending').catch(console.error);

      // Return predictionId so the client can poll /api/ai/visualize/status/[id]
      return NextResponse.json({
        success: true,
        predictionId: prediction.id,
        status: prediction.status,
      });
    }

    // ── ABACUS AI / OPENAI FALLBACK ─────────────────────────────────────────────
    const apiKey = OPENAI_API_KEY || ABACUS_API_KEY;
    if (apiKey && wpImageUrl) {
      try {
        const baseUrl = OPENAI_API_KEY ? 'https://api.openai.com' : 'https://apps.abacus.ai';
        const generatedUrl = await callGPTImageEdit(baseUrl, apiKey, roomImage, wpName, wpImageUrl);

        await saveDesignSession(session, roomImage, wallpaperId, 'abacus-fallback', generatedUrl);

        return NextResponse.json({ success: true, generatedImage: generatedUrl });
      } catch (fallbackErr) {
        console.error('OpenAI/Abacus fallback failed:', fallbackErr);
      }
    }

    // ── DEMO FALLBACK ────────────────────────────────────────────────────────────
    const demoImage = wpImageUrl || roomImage;
    await saveDesignSession(session, roomImage, wallpaperId, 'demo-fallback', demoImage);

    return NextResponse.json({
      success: true,
      generatedImage: demoImage,
      demo: true,
      message: 'Demo mode: configure REPLICATE_API_TOKEN for real AI visualization',
    });

  } catch (error: any) {
    console.error('AI Visualize Error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500 });
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────

async function saveDesignSession(
  session: any,
  roomImage: string,
  wallpaperId: string,
  predictionId: string,
  generatedImage?: string
) {
  try {
    await prisma.designSession.create({
      data: {
        userId: (session?.user as any)?.id || null,
        originalImage: roomImage.substring(0, 500),
        generatedImage: generatedImage || predictionId,
        wallpaperId,
        status: generatedImage ? 'COMPLETED' : 'PROCESSING',
      },
    });
  } catch (e) {
    console.error('saveDesignSession failed (non-fatal):', e);
  }
}

async function buildFullWhiteMaskBase64(imageBase64: string): Promise<string> {
  // Returns a minimal 512x512 all-white PNG as base64 (acts as "repaint entire image")
  // In production this should match the uploaded image dimensions
  const whitePixelPng =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAYAAABccqhmAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEgAACxIB0t1+/AAAABV0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAGUSURBVHic7cExAQAAAMKg9U9tCi+gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAeAMBuAABITEJlgAAAABJRU5ErkJggg==';
  return whitePixelPng;
}

async function callGPTImageEdit(
  baseUrl: string,
  apiKey: string,
  roomImageBase64: string,
  wallpaperName: string,
  _wallpaperImageUrl: string
): Promise<string> {
  const prompt = `Transform this room by applying a beautiful ${wallpaperName} wallpaper pattern on all walls. Keep furniture, floors, and lighting exactly the same. Photorealistic, professional interior design.`;

  const imageData = roomImageBase64.replace(/^data:image\/\w+;base64,/, '');
  const imageBuffer = Buffer.from(imageData, 'base64');

  const formData = new FormData();
  formData.append('model', 'gpt-image-1');
  formData.append('prompt', prompt);
  formData.append('image', new Blob([imageBuffer], { type: 'image/png' }), 'room.png');
  formData.append('size', '1024x1024');

  const res = await fetch(`${baseUrl}/v1/images/edits`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}` },
    body: formData,
  });

  if (!res.ok) throw new Error(`Image edit API ${res.status}`);
  const data = await res.json();
  const b64 = data?.data?.[0]?.b64_json;
  if (b64) return `data:image/png;base64,${b64}`;
  const url = data?.data?.[0]?.url;
  if (url) return url;
  throw new Error('No image in response');
}
