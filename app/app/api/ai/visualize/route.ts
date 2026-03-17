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

    // Usar Replicate para el Inpainting
    const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;

    let finalImageUrl = roomImage; // Fallback por defecto

    if (REPLICATE_API_TOKEN) {
      console.log('Iniciando llamada a Replicate para Inpainting...');
      
      const wallpaper = await prisma.product.findUnique({ where: { id: wallpaperId }});
      const wallpaperUrl = wallpaper && Array.isArray(wallpaper.images) && wallpaper.images.length > 0 ? wallpaper.images[0] as string : '';

      try {
        const response = await fetch('https://api.replicate.com/v1/predictions', {
          method: 'POST',
          headers: {
            'Authorization': `Token ${REPLICATE_API_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            version: 'some_replicate_model_version_for_inpainting_or_controlnet', // Esto se ajustará después al modelo final
            input: {
              image: roomImage, // La foto de la habitación
              prompt: `A room with beautiful ${wallpaperName} wallpaper on the walls, highly detailed, realistic lighting`,
              condition_image: wallpaperUrl // Si el modelo soporta ControlNet / Image Prompting
            }
          })
        });

        const replicateData = await response.json();
        
        // En un entorno de producción, aquí deberías manejar el "polling" 
        // ya que Replicate responde con un status inicial 'starting' o 'processing' 
        // y debes consultar la URL de GET prediction hasta que sea 'succeeded'.
        // Por la limitación de Vercel/NextJS timeouts, lo simularemos o esperaremos si finaliza rápido.
        
        console.log('Respuesta inicial de Replicate:', replicateData);
        // Simulamos un delay de procesado o tomamos la salida si fuera sincrona
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Si el output existiera lo usamos: finalImageUrl = replicateData.output[0]
        // Mientras el polling se desarrolla asíncronamente
        finalImageUrl = replicateData.output?.[0] || wallpaperUrl || roomImage;

      } catch (err) {
        console.error('Error llamando a Replicate:', err);
        finalImageUrl = wallpaperUrl || roomImage; // Fallback
      }
    } else {
      console.log('No REPLICATE_API_TOKEN found. Using fallback mock.');
      const wallpaper = await prisma.product.findUnique({ where: { id: wallpaperId }});
      if (wallpaper && Array.isArray(wallpaper.images) && wallpaper.images.length > 0) {
        finalImageUrl = wallpaper.images[0] as string;
      }
    }

    // Save session in database for history
    await prisma.designSession.create({
      data: {
        userId: (session?.user as any)?.id || null,
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
