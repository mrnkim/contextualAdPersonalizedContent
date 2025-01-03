import { NextResponse } from 'next/server';
import { Pinecone } from '@pinecone-database/pinecone';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const videoId = searchParams.get('videoId');

  if (!videoId) {
    return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
  }

  try {
    const pc = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!
    });
    const index = pc.index(process.env.PINECONE_INDEX!);

    // Add debug logging for the videoId

    // Fetch vectors using metadata filter instead of direct ID
    const queryResponse = await index.query({
      vector: new Array(1024).fill(0),
      filter: {
        tl_video_id: videoId
      },
      topK: 1,
      includeMetadata: true
    });

    console.log("🚀 > fetchVectors > queryResponse=", queryResponse.matches)

    return NextResponse.json({
      exists: queryResponse.matches.length > 0
    });
  } catch (error) {
    console.error('Error fetching vector:', error);
    return NextResponse.json({ error: 'Failed to fetch vector' }, { status: 500 });
  }
}