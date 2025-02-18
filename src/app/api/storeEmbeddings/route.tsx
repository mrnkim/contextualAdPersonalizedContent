import { NextResponse } from 'next/server';
import { Segment, Vector } from '@/app/types';
import { getPineconeIndex } from '@/utils/pinecone';

function sanitizeVectorId(str: string) {
  const sanitized = str
    .replace(/[^\x00-\x7F]/g, '') // Remove non-ASCII characters
    .replace(/[^a-zA-Z0-9-_]/g, '_') // Replace other special characters with underscore
    .replace(/_{2,}/g, '_'); // Replace multiple consecutive underscores with single underscore
  return sanitized;
}

export async function POST(request: Request) {
  try {
    const { videoId, videoName, embedding, indexId } = await request.json();

    if (!videoId || !embedding) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const vectors = embedding.video_embedding.segments.map((segment: Segment, index: number) => ({
      id: `${videoName}_${index}`,
      values: segment.float,
      metadata: {
        video_file: videoName,
        video_segment: index,
        start_time: segment.start_offset_sec,
        end_time: segment.end_offset_sec,
        scope: segment.embedding_scope,
        tl_video_id: videoId,
        tl_index_id: indexId
      },
    }));


    try {
      console.log('Initializing Pinecone client...');
      const index = getPineconeIndex();

      // Sanitize vector IDs first
      const sanitizedVectors = vectors.map((vector: Vector) => ({
        ...vector,
        id: sanitizeVectorId(vector.id)
      }));

      // Check if the vectors already exist in pinecone
      const vectorIds = sanitizedVectors.map((v: Vector) => v.id);
      console.log('Checking for existing vectors in batches...');
      const fetchBatchSize = 100; // Renamed from batchSize
      const existingVectorsMap = new Map();

      for (let i = 0; i < vectorIds.length; i += fetchBatchSize) {
        const batchIds = vectorIds.slice(i, i + fetchBatchSize);
        console.log(`Fetching batch ${Math.floor(i/fetchBatchSize) + 1} of ${Math.ceil(vectorIds.length/fetchBatchSize)}`);

        try {
          const batchResponse = await index.fetch(batchIds);
          // Merge results into our map
          Object.entries(batchResponse.records).forEach(([id, record]) => {
            existingVectorsMap.set(id, record);
          });
        } catch (error) {
          console.error('Error fetching batch:', error);
          throw error;
        }
      }

      // Filter vectors using the map
      const vectorsToUpsert = sanitizedVectors.filter(
        (vector: Vector) => !existingVectorsMap.has(vector.id)
      );

      if (vectorsToUpsert.length === 0) {
        console.log('All vectors already exist in Pinecone. Skipping upsert.');
        return NextResponse.json({ success: true, message: 'All vectors already exist' });
      }

      console.log(`Found ${vectorsToUpsert.length} new vectors to upsert`);

      // Upsert the vectors to pinecone
      const upsertBatchSize = 5; // Renamed from batchSize
      for (let i = 0; i < vectorsToUpsert.length; i += upsertBatchSize) {
        const batch = vectorsToUpsert.slice(i, i + upsertBatchSize);
        console.log(`Upserting batch ${Math.floor(i/upsertBatchSize) + 1} of ${Math.ceil(vectorsToUpsert.length/upsertBatchSize)}`);

        try {
          const upsertResponse = await index.upsert(batch);
          console.log('Upsert response:', upsertResponse);
        } catch (error) {
          console.error('Error in batch:', error);
          console.error('Problematic batch data:', JSON.stringify(batch, null, 2));
          throw error;
        }
      }

      // Final verification
      console.log('Verifying upsert...');
      const describeStats = await index.describeIndexStats();
      console.log('Index stats after upsert:', describeStats);

      // Randomly select 5 vectors to verify if they exist
      const sampleIds = vectorsToUpsert
        .map((v: Vector) => v.id)
        .sort(() => 0.5 - Math.random())
        .slice(0, 5);

      console.log('Performing final verification with random samples...');
      const fetchResponse = await index.fetch(sampleIds);
      sampleIds.forEach((id: string) => {
        console.log(`Vector ${id}: ${fetchResponse.records[id] ? 'exists' : 'not found'}`);
      });

      console.log('Upsert operation completed successfully');
    } catch (error) {
      console.error('Error in upsertToPinecone:', error);
      if (error instanceof Error && 'response' in error && error.response) {
        console.error('Pinecone API Error Response:', {
        error: error.response
        });
      }
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error storing embeddings:', error);
    return NextResponse.json(
      { error: 'Failed to store embeddings' },
      { status: 500 }
    );
  }
}

