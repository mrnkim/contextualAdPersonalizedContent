import { NextResponse } from 'next/server';
import { Pinecone } from '@pinecone-database/pinecone';

const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX;

export async function POST(req: Request) {
  try {
    const { videoId, indexId } = await req.json();

    if (!PINECONE_API_KEY || !PINECONE_INDEX_NAME) {
        throw new Error('PINECONE_API_KEY or PINECONE_INDEX_NAME is not defined');
    }
    const pinecone = new Pinecone({ apiKey: PINECONE_API_KEY });
    const index = pinecone.Index(PINECONE_INDEX_NAME);

    // Retrieve clip and video embeddings of the original video
    const originalVideoEmbeddings = await Promise.all([
      // Search in clip scope
      index.query({
        filter: {
          tl_video_id: videoId,
          scope: 'clip'
        },
        topK: 100,
        includeMetadata: true,
        includeValues: true,
        vector: new Array(1024).fill(0)
      }),
      // Search in video scope
    //   index.query({
    //     filter: {
    //       tlVideoId: videoId,
    //       scope: 'video'
    //     },
    //     topK: 1,
    //     includeMetadata: true,
    //     includeValues: true,
    //     vector: new Array(1024).fill(0)
    //   })
    ]);

    // Search for similar ads for each scope
    const similarResults = await Promise.all(
      originalVideoEmbeddings.map(async (original) => {
        if (!original.matches.length) return [];

        const match = original.matches[0];
        if (!match) return [];

        console.log("Original match metadata:", match.metadata);

        const scope = match.metadata?.scope;
        const vector = match.values;

        const queryResult = await index.query({
          vector,
          filter: {
            tl_index_id: indexId,
            scope: scope
          },
          topK: 5,
          includeMetadata: true,
        });

        console.log("Query result:", queryResult);
        return queryResult;
      })
    );

    // Merge and organize results
    const allResults = [
      ...(('matches' in similarResults[0] ? similarResults[0].matches : []) || []).map(result => ({
        ...result,
        resultType: 'clip'
      }))
    //   ,
    //   ...(('matches' in similarResults[1] ? similarResults[1].matches : []) || []).map(result => ({
    //     ...result,
    //     resultType: 'video'
    //   }))
    ];

    // Remove duplicates (keep only the highest score for each tlVideoId)
    const uniqueResults = Object.values(
      allResults.reduce((acc: Record<string, typeof current>, current) => {
        const tlVideoId = current.metadata?.tl_video_id as string;
        if (!tlVideoId) return acc;

        if (!acc[tlVideoId] || (acc[tlVideoId].score ?? 0) < (current.score ?? 0)) {
          acc[tlVideoId] = current;
        }
        return acc;
      }, {})
    );

    // Sort by score
    const sortedResults = uniqueResults.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
    console.log("🚀 > POST > sortedResults=", sortedResults)

    return NextResponse.json(sortedResults);

  } catch (error) {
    console.error('Error in embedding search:', error);
    return NextResponse.json(
      { error: 'Failed to process embedding search' },
      { status: 500 }
    );
  }
}