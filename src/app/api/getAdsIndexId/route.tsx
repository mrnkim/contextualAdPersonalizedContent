import { NextResponse } from 'next/server';

export async function GET() {
  const adsIndexId = process.env.TWELVELABS_ADS_INDEX_ID;
  return NextResponse.json({ adsIndexId });
}
