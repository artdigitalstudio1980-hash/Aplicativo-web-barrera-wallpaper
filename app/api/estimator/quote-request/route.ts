export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { nextDocumentNumber, computeQuoteTotals, defaultTerms, QuoteItem } from '@/lib/documents';
import { COMPANY } from '@/lib/company';

const ROLL_SIZE_M2 = 25;
const WASTE_FACTOR = 1.15;
const LABOR_PER_ROLL = 95;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      customerName,
      customerEmail,
      customerPhone,
      address1,
      address2,
      city,
      state,
      zip,
      walls,
      unit,
      wallpaperName,
      wallpaperPrice,
      language,
      notes,
    } = body;

    if (!customerName || !customerEmail || !Array.isArray(walls) || walls.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const isInches = unit === 'in';
    let rawArea = 0;
    for (const wall of walls) {
      const w = parseFloat(wall?.width) || 0;
      const h = parseFloat(wall?.height) || 0;
      let area = w * h;
      if (isInches) area = area * 0.00064516;
      rawArea += area;
    }
    if (rawArea <= 0) {
      return NextResponse.json({ error: 'Invalid wall measurements' }, { status: 400 });
    }

    const rollsNeeded = Math.ceil((rawArea * WASTE_FACTOR) / ROLL_SIZE_M2);
    const pricePerRoll = Math.max(0, Number(wallpaperPrice) || 350);

    const items: QuoteItem[] = [
      {
        id: crypto.randomUUID(),
        description: wallpaperName ? `SYSTEXX Wallpaper — ${wallpaperName}` : 'SYSTEXX Wallpaper Roll',
        details: `${rollsNeeded} roll(s) — estimated from ${rawArea.toFixed(2)} m² of walls (+15% waste)`,
        quantity: rollsNeeded,
        unit: 'roll',
        unitPrice: pricePerRoll,
      },
      {
        id: crypto.randomUUID(),
        description: 'Professional Installation (estimate)',
        details: 'Labor, adhesive & wall preparation — final price subject to site visit',
        quantity: rollsNeeded,
        unit: 'roll',
        unitPrice: LABOR_PER_ROLL,
      },
    ];

    const totals = computeQuoteTotals(items, COMPANY.defaultTaxRate);
    const quoteNumber = await nextDocumentNumber('QUOTE');
    const lang = language === 'en' ? 'en' : 'es';
    const session = await getServerSession(authOptions);
    const userId = session?.user ? (session.user as any).id : null;

    let installationId: string | null = null;
    if (userId) {
      const installation = await prisma.installation.create({
        data: {
          userId,
          type: 'RESIDENTIAL',
          status: 'REQUESTED',
          contactName: String(customerName),
          contactEmail: String(customerEmail),
          contactPhone: String(customerPhone || ''),
          address1: String(address1 || ''),
          address2: address2 ? String(address2) : null,
          city: String(city || ''),
          state: String(state || ''),
          country: 'US',
          zip: String(zip || ''),
          rooms: walls.map((w: any, i: number) => ({
            name: `Wall ${i + 1}`,
            width: w.width,
            height: w.height,
            unit,
          })) as any,
          wallpaperType: wallpaperName ? String(wallpaperName) : null,
          wallArea: `${rawArea.toFixed(2)} m²`,
          specialRequests: notes ? String(notes) : null,
        },
      });
      installationId = installation.id;
    }

    const quote = await prisma.quote.create({
      data: {
        quoteNumber,
        customerName: String(customerName),
        customerEmail: String(customerEmail),
        customerPhone: customerPhone ? String(customerPhone) : null,
        address1: address1 ? String(address1) : null,
        address2: address2 ? String(address2) : null,
        city: city ? String(city) : null,
        state: state ? String(state) : null,
        zip: zip ? String(zip) : null,
        country: 'US',
        items: items as any,
        subtotal: totals.subtotal,
        taxRate: COMPANY.defaultTaxRate,
        tax: totals.tax,
        total: totals.total,
        currency: 'USD',
        status: 'DRAFT',
        validUntil: new Date(Date.now() + COMPANY.quoteValidityDays * 86400000),
        notes: notes ? String(notes) : 'Generated from online estimator',
        terms: defaultTerms(lang) as any,
        language: lang,
        installationId,
        userId,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: quote.id,
        quoteNumber: quote.quoteNumber,
        total: quote.total,
        rollsNeeded,
        installationId,
      },
    });
  } catch (error: any) {
    console.error('Quote request error:', error);
    return NextResponse.json({ error: 'Failed to create quote request' }, { status: 500 });
  }
}