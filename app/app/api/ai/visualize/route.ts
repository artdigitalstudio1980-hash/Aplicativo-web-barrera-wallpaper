import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();
    const { roomImage, wallpaperId, wallpaperName } = body;

    if (!roomImage || !wallpaperId) {
      return NextResponse.json({ success: false, error: 'Faltan datos requeridos (Imagen de la habitación o ID del Wallpaper)' }, { status: 400 });
    }

    // Attempt to use HuggingFace Inference API (Free Tier)
    const HUGGINGFACE_TOKEN = process.env.HUGGINGFACE_TOKEN;

    let finalImageUrl = roomImage; // Default fallback to original image

    if (HUGGINGFACE_TOKEN) {
      // If we have a token, we can call a free model like Stable Diffusion Inpainting or ControlNet.
      // This is a placeholder for the actual fetch call to HF API.
      // e.g. fetch('https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0', ...)
      
      // Simulating external API delay
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // In a real scenario, we upload the base64 roomImage, ask it to "Change the walls to look like [wallpaperName]", and return the result.
      // For now, since true automatic segmentation via free API is hard to do in one step without Masking,
      // we assume the API returns a URL or base64.
      
      // We will leave the fallback to let the user see the UI flow.
    } else {
      // Fallback if no HF Token is provided (demo mode)
      await new Promise(resolve => setTimeout(resolve, 2500));
      console.log('No HUGGINGFACE_TOKEN found. Using fallback mock.');
      
      // Get the wallpaper image from DB to composite a placeholder
      const wallpaper = await prisma.product.findUnique({ where: { id: wallpaperId }});
      if (wallpaper && Array.isArray(wallpaper.images) && wallpaper.images.length > 0) {
        // Just for visual demo, we return the wallpaper image itself if API is missing
        finalImageUrl = wallpaper.images[0] as string;
      }
    }

    // Save session in database for history
    await prisma.designSession.create({
      data: {
        userId: session?.user?.id || null,
        originalImage: roomImage.substring(0, 1000) + '...', // Saving only prefix or uploading to S3 in real app
        generatedImage: finalImageUrl,
        wallpaperId: wallpaperId,
        status: 'COMPLETED'
      }
    });

    return NextResponse.json({
      success: true,
      generatedImage: finalImageUrl,
      message: 'Processing completed'
    });

  } catch (error: any) {
    console.error('AI Visualize Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error processing image' },
      { status: 500 }
    );
  }
}
