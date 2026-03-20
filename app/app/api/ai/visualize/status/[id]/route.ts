import { NextResponse } from 'next/server';

const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  if (!id) {
    return NextResponse.json({ error: 'Missing prediction id' }, { status: 400 });
  }

  if (!REPLICATE_API_TOKEN) {
    return NextResponse.json({ status: 'failed', error: 'REPLICATE_API_TOKEN not configured' }, { status: 500 });
  }

  try {
    const res = await fetch(`https://api.replicate.com/v1/predictions/${id}`, {
      headers: {
        'Authorization': `Token ${REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json({ status: 'failed', error: `Replicate API ${res.status}: ${errText}` }, { status: res.status });
    }

    const prediction = await res.json();

    const output = Array.isArray(prediction.output)
      ? prediction.output[0]
      : prediction.output ?? null;

    return NextResponse.json({
      id: prediction.id,
      status: prediction.status,
      output,
      error: prediction.error ?? null,
      logs: prediction.logs ?? null,
    });
  } catch (err: any) {
    console.error('Prediction status fetch error:', err);
    return NextResponse.json({ status: 'failed', error: err.message }, { status: 500 });
  }
}
