import { NextResponse } from 'next/server';
import { Pinecone } from '@pinecone-database/pinecone';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const indexId = searchParams.get('indexId');
  const videoId = searchParams.get('videoId');

  if (!indexId || !videoId) {
    return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
  }

  try {
    const pc = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!
    });
    const index = pc.index(process.env.PINECONE_INDEX!);

    // Fetch the vector by ID
    const fetchResponse = await index.fetch([videoId]);
    console.log("🚀 > GET > fetchResponse=", fetchResponse)

    return NextResponse.json({
      exists: Object.keys(fetchResponse.records || {}).length > 0
    });
  } catch (error) {
    console.error('Error fetching vector:', error);
    return NextResponse.json({ error: 'Failed to fetch vector' }, { status: 500 });
  }
}