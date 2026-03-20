import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      contactName,
      contactEmail,
      contactPhone,
      address1,
      address2,
      city,
      state,
      zip,
      country,
      type,
      wallpaperType,
      wallArea,
      rooms,
      specialRequests,
      preferredDate,
      alternativeDate,
    } = body;

    if (!contactName || !contactEmail || !contactPhone || !address1 || !city || !state || !zip) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    const userId = session?.user ? (session.user as any).id : null;

    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const installation = await prisma.installation.create({
      data: {
        userId,
        type: type || 'RESIDENTIAL',
        contactName,
        contactEmail,
        contactPhone,
        address1,
        address2: address2 || null,
        city,
        state,
        country: country || 'US',
        zip,
        rooms: Array.isArray(rooms) ? rooms : [{ count: 1 }],
        wallpaperType: wallpaperType || null,
        wallArea: wallArea || null,
        specialRequests: specialRequests || null,
        preferredDate: preferredDate ? new Date(preferredDate) : null,
        alternativeDate: alternativeDate ? new Date(alternativeDate) : null,
        status: 'REQUESTED',
      },
    });

    return NextResponse.json({ id: installation.id, success: true });
  } catch (error: any) {
    console.error('Error creating installation:', error);
    return NextResponse.json({ error: 'Failed to create installation request' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const isAdmin = (session.user as any).isAdmin || (session.user as any).role === 'ADMIN';

    const installations = await prisma.installation.findMany({
      where: isAdmin ? {} : { userId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(installations);
  } catch (error: any) {
    console.error('Error fetching installations:', error);
    return NextResponse.json({ error: 'Failed to fetch installations' }, { status: 500 });
  }
}
