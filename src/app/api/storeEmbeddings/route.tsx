import { NextResponse } from 'next/server';
import { Pinecone } from '@pinecone-database/pinecone';

function sanitizeVectorId(str: string) {
  const sanitized = str
    .replace(/[^\x00-\x7F]/g, '') // Remove non-ASCII characters
    .replace(/[^a-zA-Z0-9-_]/g, '_') // Replace other special characters with underscore
    .replace(/_{2,}/g, '_'); // Replace multiple consecutive underscores with single underscore

  console.log('Original vector ID:', str);
  console.log('Sanitized vector ID:', sanitized);
  return sanitized;
}

export async function POST(request: Request) {
  try {
    const { videoId, videoName, embedding, type } = await request.json();

    if (!videoId || !embedding || !type) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const vectors = embedding.video_embedding.segments.map((segment, index) => ({
      id: `${videoName}_${index}`,
      values: segment.float,
      metadata: {
        video_file: videoName,
        video_segment: index,
        start_time: segment.start_offset_sec,
        end_time: segment.end_offset_sec,
        scope: segment.embedding_scope,
        video_type: type,
        tl_video_id: videoId,
      },
    }));
    console.log("🚀 > vectors > vectors=", vectors)


    try {
      console.log('Initializing Pinecone client...');
    const pc = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!
    });
    const index = pc.index(process.env.PINECONE_INDEX!);

      console.log(`Found ${vectors.length} vectors to upsert`);

      // 벡터 데이터 로깅
      console.log('Sample vector data:', {
        id: vectors[0].id,
        metadata: vectors[0].metadata,
        valuesLength: vectors[0].values.length,
        sampleValues: vectors[0].values.slice(0, 5)
      });

      // Sanitize vector IDs
      const sanitizedVectors = vectors.map(vector => ({
        ...vector,
        id: sanitizeVectorId(vector.id)
      }));

      // 벡터 형식 검증
      const isValidVector = sanitizedVectors.every(vector =>
        vector.id &&
        Array.isArray(vector.values) &&
        vector.values.length === 1024 &&
        vector.values.every(v => typeof v === 'number')
      );
      console.log('Vector validation:', { isValid: isValidVector });

      // 배치 크기를 더 작게 조정
      const batchSize = 5;
      console.log('Starting upsert operation in smaller batches...');

      // for (let i = 0; i < sanitizedVectors.length; i += batchSize) {
      //   const batch = sanitizedVectors.slice(i, i + batchSize);
      //   console.log(`Upserting batch ${Math.floor(i/batchSize) + 1} of ${Math.ceil(sanitizedVectors.length/batchSize)}`);
      //   console.log('Batch vector IDs:', batch.map(v => v.id));

      //   try {
      //     const upsertResponse = await index.upsert(batch);
      //     console.log('Upsert response:', upsertResponse);

      //     // 각 벡터가 실제로 업로드되었는지 즉시 확인
      //     const fetchResponse = await index.fetch(batch.map(v => v.id));
      //     console.log('Fetch verification:', {
      //       attempted: batch.length,
      //       found: Object.keys(fetchResponse.records).length
      //     });
      //   } catch (error) {
      //     console.error('Error in batch:', error);
      //     console.error('Problematic batch data:', JSON.stringify(batch, null, 2));
      //     throw error;
      //   }
      // }

      // 최종 확인
      console.log('Verifying upsert...');
      const describeStats = await index.describeIndexStats();
      console.log('Index stats after upsert:', describeStats);

      // 무작위로 5개 벡터를 선택해서 실제로 존재하는지 확인
      const sampleIds = sanitizedVectors
        .map(v => v.id)
        .sort(() => 0.5 - Math.random())
        .slice(0, 5);

      console.log('Performing final verification with random samples...');
      const fetchResponse = await index.fetch(sampleIds);
      sampleIds.forEach(id => {
        console.log(`Vector ${id}: ${fetchResponse.records[id] ? 'exists' : 'not found'}`);
      });

      console.log('Upsert operation completed successfully');
    } catch (error) {
      console.error('Error in upsertToPinecone:', error);
      if (error.response) {
        console.error('Pinecone API Error Response:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
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

