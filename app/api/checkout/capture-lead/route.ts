import { NextRequest, NextResponse } from 'next/server';
import { SalesService } from '@/lib/sales-service';

export async function POST(req: NextRequest) {
  try {
    const { email, whatsapp } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const lead = await SalesService.captureLead(email, whatsapp);

    return NextResponse.json({
      success: true,
      data: lead
    });
  } catch (error: any) {
    console.error('Lead capture error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
