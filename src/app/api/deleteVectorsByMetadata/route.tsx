// src/app/api/deleteVectorsByMetadata/route.tsx 파일 생성

import { NextResponse } from 'next/server';
import { getPineconeIndex } from '@/utils/pinecone';

// Pinecone 쿼리 및 삭제 제한 고려
const QUERY_BATCH_SIZE = 1000; // Pinecone 쿼리 시 topK 제한 고려 (최대 10,000 이지만, 메모리 관리 위해 작게 설정)
const DELETE_BATCH_SIZE = 1000; // Pinecone 삭제 시 ID 개수 제한

export async function POST(request: Request) {
  try {
    const { indexIdsToDelete } = await request.json();

    if (!indexIdsToDelete || !Array.isArray(indexIdsToDelete) || indexIdsToDelete.length === 0) {
      return NextResponse.json(
        { error: 'Missing or invalid required parameter: indexIdsToDelete (must be a non-empty array)' },
        { status: 400 }
      );
    }

    const index = getPineconeIndex();
    const vectorsToDelete: string[] = [];

    console.log(`[API Delete Vectors] Starting deletion for index IDs: ${indexIdsToDelete.join(', ')}`);

    // 각 indexId에 대해 벡터 ID 조회
    for (const indexId of indexIdsToDelete) {
        console.log(`[API Delete Vectors] Querying vectors for indexId: ${indexId}`);
        try {
            // 중요: Pinecone 쿼리는 벡터가 필요합니다. 의미 없는 제로 벡터를 사용합니다.
            // 필터에 맞는 모든 벡터를 가져오기 위해 topK를 크게 설정합니다.
            // 실제로는 더 많은 벡터가 있을 수 있으므로 페이지네이션이 필요할 수 있지만,
            // 우선 최대 1000개 (또는 설정된 QUERY_BATCH_SIZE) 까지만 가져옵니다.
            const queryResponse = await index.query({
                vector: new Array(1024).fill(0), // Pinecone 벡터 차원에 맞게 조정 필요 (예: 1024)
                filter: {
                    tl_index_id: indexId
                },
                topK: QUERY_BATCH_SIZE, // 한 번에 가져올 최대 ID 수
                includeMetadata: false, // 메타데이터는 필요 없으므로 false
                includeValues: false    // 벡터 값도 필요 없으므로 false
            });

            const ids = queryResponse.matches.map(match => match.id);
            vectorsToDelete.push(...ids);
            console.log(`[API Delete Vectors] Found ${ids.length} vectors for indexId: ${indexId}. Total to delete so far: ${vectorsToDelete.length}`);

            // 참고: 만약 queryResponse.matches.length가 topK와 같다면 더 많은 벡터가 있을 수 있습니다.
            // 이 경우, 고급 페이지네이션 로직이 필요합니다.

        } catch (queryError) {
            console.error(`[API Delete Vectors] Error querying vectors for indexId ${indexId}:`, queryError);
            // 특정 인덱스 ID 쿼리 실패 시 계속 진행할지, 아니면 중단할지 결정
            // return NextResponse.json({ error: `Failed to query vectors for indexId ${indexId}` }, { status: 500 });
        }
    }


    if (vectorsToDelete.length === 0) {
      console.log("[API Delete Vectors] No vectors found matching the criteria.");
      return NextResponse.json({ success: true, message: "No matching vectors found to delete.", deletedCount: 0 });
    }

    console.log(`[API Delete Vectors] Attempting to delete ${vectorsToDelete.length} vectors in batches of ${DELETE_BATCH_SIZE}...`);

    let totalDeletedCount = 0;
    for (let i = 0; i < vectorsToDelete.length; i += DELETE_BATCH_SIZE) {
      const batchIds = vectorsToDelete.slice(i, i + DELETE_BATCH_SIZE);
      try {
        console.log(`[API Delete Vectors] Deleting batch ${Math.floor(i / DELETE_BATCH_SIZE) + 1}...`);
        await index.deleteMany(batchIds); // deleteMany 또는 delete1 사용 (delete1은 deprecated 될 수 있음)
        totalDeletedCount += batchIds.length;
        console.log(`[API Delete Vectors] Successfully deleted batch of ${batchIds.length}. Total deleted so far: ${totalDeletedCount}`);
      } catch (deleteError) {
        console.error(`[API Delete Vectors] Error deleting batch:`, deleteError);
        // 삭제 실패 시 처리 로직 (예: 부분 성공 반환, 재시도 등)
        return NextResponse.json({
          error: 'Failed to delete vectors. Some vectors might still exist.',
          details: String(deleteError),
          successfullyDeletedCount: totalDeletedCount
        }, { status: 500 });
      }
    }

    console.log(`[API Delete Vectors] Deletion process completed. Total vectors deleted: ${totalDeletedCount}`);
    return NextResponse.json({ success: true, deletedCount: totalDeletedCount });

  } catch (error) {
    console.error('[API Delete Vectors] General error:', error);
    return NextResponse.json(
      { error: 'Failed to delete vectors by metadata', details: String(error) },
      { status: 500 }
    );
  }
}