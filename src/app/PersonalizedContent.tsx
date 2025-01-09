import React, { useCallback, useState, useEffect } from 'react'
import IndexVideos from './IndexVideos';
import UserProfiles from './UserProfiles';
import IndexesDropDown from './IndexesDropDown';
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { checkVectorExists, fetchVideos, fetchIndexes, getAndStoreEmbeddings } from '@/hooks/apiHooks';
import { IndexesData, Profile } from '@/app/types'
import LoadingSpinner from './LoadingSpinner';

const adsIndexId = process.env.NEXT_PUBLIC_ADS_INDEX_ID;


const PersonalizedContent = ({
  profiles,
  setProfiles,
  selectedIndexId,
  setSelectedIndexId,
  hasProcessedAds,
  setHasProcessedAds,
  useEmbeddings
}: {
  profiles: Profile[];
  setProfiles: (profiles: Profile[]) => void;
  selectedIndexId: string;
  setSelectedIndexId: (id: string) => void;
  hasProcessedAds: boolean;
  setHasProcessedAds: (hasProcessedAds: boolean) => void;
  useEmbeddings: boolean;
}) => {
  const [processingAdsInPersonalizedContent, setProcessingAdsInPersonazliedContent] = useState(false);
  const queryClient = useQueryClient();

  const {
		data: indexesData,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		isLoading: isIndexesLoading,
	} = useInfiniteQuery({
		queryKey: ['indexes', selectedIndexId],
		queryFn: ({ pageParam }) => fetchIndexes(pageParam),
		initialPageParam: 1,
		getNextPageParam: (lastPage) => {
			if (lastPage.page_info.page < lastPage.page_info.total_page) {
				return lastPage.page_info.page + 1;
			}
			return undefined;
		},
	});

  const handleIndexChange = useCallback((newIndexId: string) => {
		setSelectedIndexId(newIndexId);
		queryClient.invalidateQueries({ queryKey: ['videos'] });
			queryClient.invalidateQueries({ queryKey: ['search'] });
			queryClient.invalidateQueries({ queryKey: ['chapters'] });
			queryClient.invalidateQueries({ queryKey: ['videoDetails'] });
	}, [queryClient, setSelectedIndexId]);

  const processAdVideos = useCallback(async () => {
    if (!adsIndexId) return;
    setProcessingAdsInPersonazliedContent(true);
    try {
      const firstPageData = await fetchVideos(1, adsIndexId);
      const totalPages = firstPageData.page_info?.total_page || 1;

      for (let currentPage = 1; currentPage <= totalPages; currentPage++) {
        const pageData = await fetchVideos(currentPage, adsIndexId);
        if (pageData.data) {
          for (const video of pageData.data) {
            const vectorExists = await checkVectorExists(video._id);
            if (!vectorExists) {
              await getAndStoreEmbeddings(adsIndexId, video._id, "ad");
            }
          }
        }
      }
      if (typeof setHasProcessedAds === 'function') {
        setHasProcessedAds(true);
      }
    } catch (error) {
      console.error("Error processing videos:", error);
    } finally {
      setProcessingAdsInPersonazliedContent(false);
    }
  }, [adsIndexId, setHasProcessedAds]);

  useEffect(() => {
    console.log('Ads conditions:', {
      indexId: !!adsIndexId,
      hasProcessedAds,
      useEmbeddings,
      willProcess: adsIndexId && !hasProcessedAds && useEmbeddings
    });

    if (adsIndexId && !hasProcessedAds && useEmbeddings) {
      processAdVideos();
    }
  }, [adsIndexId, hasProcessedAds, processAdVideos, useEmbeddings]);

  return (
    <div className="w-full max-w-7xl mx-auto">
    <h1 className="text-3xl font-bold text-center mb-16">Personalized Content</h1>
    <div className="flex-grow mr-4 mb-6">
    <IndexesDropDown
      handleIndexChange={handleIndexChange}
      indexesData={indexesData as IndexesData}
      fetchNextPage={fetchNextPage}
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
      isLoading={isIndexesLoading}
      selectedIndexId={selectedIndexId}
    />
    </div>
    {processingAdsInPersonalizedContent && (
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
          <LoadingSpinner size="sm" color="default" />
          Processing video embeddings...
        </div>
      )}

   { selectedIndexId && <><IndexVideos
      indexId={selectedIndexId}
      isIndexIdLoading={!selectedIndexId}
    />
    <UserProfiles
      indexId={selectedIndexId}
      profiles={profiles}
      setProfiles={setProfiles}
      useEmbeddings={useEmbeddings}
    /></>}

  </div>
  )
}

export default PersonalizedContent
