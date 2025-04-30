import { NextResponse } from 'next/server';
import { Pinecone } from '@pinecone-database/pinecone';

export async function POST(req: Request) {
  try {
    const { indexName } = await req.json();

    if (!indexName) {
      return NextResponse.json(
        { error: 'Missing indexName parameter' },
        { status: 400 }
      );
    }

    console.log(`[API deleteAllVectors] Attempting to delete all vectors from index: ${indexName}`);

    // Pinecone 클라이언트 초기화
    const pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!
    });

    // 요청에서 받은 인덱스 이름으로 인덱스 접근
    const index = pinecone.Index(indexName);

    // 모든 네임스페이스의 모든 벡터 삭제
    await index.deleteAll();

    console.log(`[API deleteAllVectors] Successfully deleted all vectors from index: ${indexName}`);

    return NextResponse.json({
      success: true,
      message: `All vectors deleted from index: ${indexName}`
    });

  } catch (error) {
    console.error('Error in deleteAllVectors:', error);
    return NextResponse.json(
      {
        error: 'Failed to delete all vectors',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}