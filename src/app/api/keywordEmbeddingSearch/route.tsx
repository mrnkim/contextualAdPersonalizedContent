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

    const { data: embedData } = await axios.post(url, formData, {
      headers: {
        'accept': 'application/json',
        'Content-Type': 'multipart/form-data',
        'x-api-key': API_KEY,
      },
    });

    // extract embedding vector from text_embedding object
    const textEmbedding = embedData.text_embedding.segments[0].float;

    if (!textEmbedding) {
      throw new Error('Failed to generate embedding');
    }

    // Get index and search
    const searchResults = await index.query({
      vector: textEmbedding,
      filter: {
        // video_type: 'ad',
        tl_index_id: indexId,
        scope: 'clip'
      },
      topK: 10,
      includeMetadata: true,
    });

    // Remove duplicates (keep only the highest score for each video)
    interface SearchResult {
      metadata?: Record<string, string | number | boolean | string[]>;
      score: number;  // score를 필수 필드로 지정
    }

    const uniqueResults = Object.values(
      searchResults.matches.reduce((acc: Record<string, SearchResult>, current) => {
        const videoId = current.metadata?.tl_video_id as string;
        if (!videoId) return acc;

        if (!acc[videoId] || acc[videoId].score < (current.score || 0)) {
          acc[videoId] = {
            metadata: current.metadata,
            score: current.score || 0
          };
        }
        return acc;
      }, {})
    );

    // Sort by score
    const sortedResults = uniqueResults.sort((a, b) => b.score - a.score);

    return NextResponse.json(sortedResults);

  } catch (error) {
    console.error('Error in keyword embedding search:', error);
    return NextResponse.json(
      { error: 'Failed to process keyword embedding search' },
      { status: 500 }
    );
  }
}