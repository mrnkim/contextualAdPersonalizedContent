import React, { useState, useEffect, useCallback } from 'react'
import IndexVideos from './IndexVideos';
import UserProfiles from './UserProfiles';
import IndexesDropDown from './IndexesDropDown';
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { fetchIndexes } from '@/hooks/apiHooks';
import { IndexesData, Profile } from '@/app/types'

const PersonalizedContent = ({
  profiles,
  setProfiles
}: {
  profiles: Profile[];
  setProfiles: (profiles: Profile[]) => void;
}) => {
  const [indexId, setIndexId] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const {
		data: indexesData,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		isLoading: isIndexesLoading,
	} = useInfiniteQuery({
		queryKey: ['indexes', indexId],
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
		setIndexId(newIndexId);
		queryClient.invalidateQueries({ queryKey: ['videos'] });
			queryClient.invalidateQueries({ queryKey: ['search'] });
			queryClient.invalidateQueries({ queryKey: ['chapters'] });
			queryClient.invalidateQueries({ queryKey: ['videoDetails'] });
	}, [queryClient]);

  useEffect(() => {
    if (!indexId) {
      handleIndexChange(process.env.NEXT_PUBLIC_ADS_INDEX_ID || '');
    }
  }, [handleIndexChange, indexId]);

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
      selectedIndexId={indexId}
    />
    </div>

   { indexId && <><IndexVideos
      indexId={indexId}
      isIndexIdLoading={!indexId}
    />
    <UserProfiles
      indexId={indexId}
      profiles={profiles}
      setProfiles={setProfiles}
    /></>}

  </div>
  )
}

export default PersonalizedContent
