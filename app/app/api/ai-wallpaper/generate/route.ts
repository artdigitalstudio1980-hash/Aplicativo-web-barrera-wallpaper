
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createS3Client, getBucketConfig } from '@/lib/aws-config';
import { PutObjectCommand } from '@aws-sdk/client-s3';

interface GenerateRequest {
  prompt: string;
  style?: string;
  colors?: string[];
  width?: number;
  height?: number;
  userId?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: GenerateRequest = await req.json();
    const { prompt, style, colors = [], width = 1024, height = 1024, userId } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Enhanced prompt with style and color preferences
    let enhancedPrompt = prompt;
    if (style) {
      enhancedPrompt += `, ${style} style`;
    }
    if (colors.length > 0) {
      enhancedPrompt += `, featuring colors: ${colors.join(', ')}`;
    }
    enhancedPrompt += `, high quality wallpaper design, 8k resolution, professional interior design, suitable for large wall printing, seamless pattern`;

    // Create AI generation request record
    const generationRequest = await prisma.aIGenerationRequest.create({
      data: {
        userId,
        prompt: enhancedPrompt,
        style,
        colors,
        status: 'PROCESSING'
      }
    });

    const startTime = Date.now();

    try {
      let imageUrl: string;

      // Check if Google AI Studio API key is configured
      const googleApiKey = process.env.GOOGLE_AI_STUDIO_API_KEY;
      
      if (!googleApiKey || googleApiKey === 'your_google_ai_studio_api_key_here') {
        // Fallback to demo images if API key not configured
        console.log('Google AI Studio API key not configured, using demo mode');
        console.log('Prompt:', enhancedPrompt);
        
        const hash = prompt.length % 5;
        const demoImages = [
          'https://images.unsplash.com/photo-1618220179428-22790b461013?w=1024&h=1024&fit=crop',
          'https://images.unsplash.com/photo-1615529182904-14819c35db37?w=1024&h=1024&fit=crop',
          'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1024&h=1024&fit=crop',
          'https://images.unsplash.com/photo-1663162221489-385e5d75d29f?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8c3F1YXJlJTIwaW1hZ2V8ZW58MHx8MHx8fDA%3D',
          'https://images.unsplash.com/photo-1615874694520-474822394e73?w=1024&h=1024&fit=crop'
        ];
        
        imageUrl = demoImages[hash];
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const processingTime = Math.round((Date.now() - startTime) / 1000);

        await prisma.aIGenerationRequest.update({
          where: { id: generationRequest.id },
          data: {
            generatedImageUrl: imageUrl,
            status: 'COMPLETED',
            processingTime,
            cost: 0
          }
        });

        return NextResponse.json({
          success: true,
          data: {
            id: generationRequest.id,
            imageUrl,
            prompt: enhancedPrompt,
            processingTime,
            usingDemo: true
          }
        });
      }

      // Use Google AI Studio with Nano Banana
      console.log('Using Google AI Studio (Nano Banana) for image generation');
      console.log('Prompt:', enhancedPrompt);

      const apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent';
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': googleApiKey
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: enhancedPrompt
            }]
          }]
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Google AI Studio API error:', errorText);
        throw new Error(`Google AI Studio API error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('Google AI Studio response received');

      // Extract image from response
      // The response contains the image in base64 format in the parts array
      const imagePart = result.candidates?.[0]?.content?.parts?.find((part: any) => part.inlineData);
      
      if (!imagePart || !imagePart.inlineData) {
        throw new Error('No image data received from Google AI Studio');
      }

      const base64Image = imagePart.inlineData.data;
      const mimeType = imagePart.inlineData.mimeType || 'image/jpeg';
      
      // Upload image to S3
      console.log('Uploading generated image to S3...');
      const s3Client = createS3Client();
      const { bucketName, folderPrefix } = getBucketConfig();
      const fileName = `ai-generated-${Date.now()}.jpg`;
      const s3Key = `${folderPrefix}public/uploads/${fileName}`;

      // Convert base64 to buffer
      const imageBuffer = Buffer.from(base64Image, 'base64');

      await s3Client.send(new PutObjectCommand({
        Bucket: bucketName,
        Key: s3Key,
        Body: imageBuffer,
        ContentType: mimeType
      }));

      // Generate public URL
      const region = process.env.AWS_REGION || 'us-west-2';
      imageUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${s3Key}`;
      
      console.log('Image uploaded successfully:', imageUrl);

      const processingTime = Math.round((Date.now() - startTime) / 1000);

      // Update generation request with result
      await prisma.aIGenerationRequest.update({
        where: { id: generationRequest.id },
        data: {
          generatedImageUrl: imageUrl,
          status: 'COMPLETED',
          processingTime,
          cost: 0.02 // Nano Banana cost is approximately $0.02 per image
        }
      });

      return NextResponse.json({
        success: true,
        data: {
          id: generationRequest.id,
          imageUrl,
          prompt: enhancedPrompt,
          processingTime,
          usingDemo: false
        }
      });

    } catch (aiError: any) {
      // Update generation request with error
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
        { error: 'Failed to generate wallpaper design', details: aiError.message },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('Generate wallpaper error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
