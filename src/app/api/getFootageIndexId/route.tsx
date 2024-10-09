import { NextResponse } from 'next/server';

export async function GET() {
  const footageIndexId = process.env.TWELVELABS_FOOTAGE_INDEX_ID;
  return NextResponse.json({ footageIndexId });
}
