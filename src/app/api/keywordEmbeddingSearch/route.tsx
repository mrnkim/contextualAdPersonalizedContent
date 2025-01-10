import { NextResponse } from 'next/server';
import { Pinecone } from '@pinecone-database/pinecone';

const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX;

export async function POST(req: Request) {
  try {
    const { searchTerm } = await req.json();

    if (!PINECONE_API_KEY || !PINECONE_INDEX_NAME) {
      throw new Error('Required environment variables are not defined');
    }

    // Initialize Pinecone
    const pinecone = new Pinecone({ apiKey: PINECONE_API_KEY });

    // Generate embedding using Pinecone's Inference API
    const embedResponse = await pinecone.inference.embed(
      'multilingual-e5-large',
      [searchTerm],
      { inputType: 'passage', truncate: 'END' }
    );
    console.log("🚀 > POST > embedResponse=", embedResponse)

    const searchEmbedding = embedResponse.data[0].values;

    if (!searchEmbedding) {
      throw new Error('Failed to generate embedding');
    }

    // Get index and search
    const index = pinecone.Index(PINECONE_INDEX_NAME);
    const searchResults = await index.query({
      vector: searchEmbedding,
      filter: {
        video_type: 'ad',
        scope: 'clip'
      },
      topK: 10,
      includeMetadata: true,
    });

    // Remove duplicates (keep only the highest score for each video)
    const uniqueResults = Object.values(
      searchResults.matches.reduce((acc: Record<string, {
        metadata?: Record<string, string | number | boolean | string[]>;
        score?: number;
      }>, current) => {
        const videoId = current.metadata?.tl_video_id as string;
        if (!videoId) return acc;

        if (!acc[videoId] || (acc[videoId].score ?? 0) < (current.score ?? 0)) {
          acc[videoId] = current;
        }
        return acc;
      }, {})
    );

    // Sort by score
    const sortedResults = uniqueResults.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));

    return NextResponse.json(sortedResults);

  } catch (error) {
    console.error('Error in keyword embedding search:', error);
    return NextResponse.json(
      { error: 'Failed to process keyword embedding search' },
      { status: 500 }
    );
  }
}