export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { generatePresignedUploadUrl, getFileUrl } from '@/lib/s3';

import { authOptions } from '@/lib/auth-options';

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any)?.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { fileName, contentType } = await req.json();

    if (!fileName || !contentType) {
      return NextResponse.json(
        { error: 'fileName and contentType are required' },
        { status: 400 }
      );
    }

    // Generate presigned URL for upload
    const { uploadUrl, cloudStoragePath } = await generatePresignedUploadUrl(
      fileName,
      contentType,
      true // isPublic
    );

    // Generate public URL for the file
    const fileUrl = await getFileUrl(cloudStoragePath, true);

    return NextResponse.json({
      success: true,
      uploadUrl,
      cloudStoragePath,
      fileUrl
    });
  } catch (error: any) {
    console.error('Upload presigned URL generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate upload URL', details: error.message },
      { status: 500 }
    );
  }
}
