import { NextResponse } from 'next/server';
import { getPineconeIndex } from '@/utils/pinecone';
import axios from 'axios';

const API_KEY = process.env.TWELVELABS_API_KEY;
const TWELVELABS_API_BASE_URL = process.env.TWELVELABS_API_BASE_URL;

export async function POST(req: Request) {
  try {
    const { searchTerm, indexId } = await req.json();
    const index = getPineconeIndex();

    const url = `${TWELVELABS_API_BASE_URL}/embed`;

    const formData = new FormData();
    formData.append('text', searchTerm);
    formData.append('text_truncate', 'end');
    formData.append('model_name', 'Marengo-retrieval-2.7');

    console.log("🚀 > POST > formData=", formData)

    const { data: embedData } = await axios.post(url, formData, {
      headers: {
        'accept': 'application/json',
        'Content-Type': 'multipart/form-data',
        'x-api-key': API_KEY,
      },
    });
    console.log("🚀 > POST > embedData=", embedData);
    console.log("🚀 > Segments length:", embedData.text_embedding.segments.length);

    // text_embedding 객체에서 embedding 벡터 추출
    const searchEmbedding = embedData.text_embedding.segments[0].float;
    console.log("🚀 > POST > searchEmbedding =", searchEmbedding )

    if (!searchEmbedding) {
      throw new Error('Failed to generate embedding');
    }

    // Get index and search
    const searchResults = await index.query({
      vector: searchEmbedding,
      filter: {
        // video_type: 'ad',
        tl_index_id: indexId,
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