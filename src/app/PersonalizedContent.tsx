import React, { useState, useEffect, useCallback } from 'react'
import IndexVideos from './IndexVideos';
import UserProfiles from './UserProfiles';
import IndexesDropDown from './IndexesDropDown';
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { fetchIndexes } from '@/hooks/apiHooks';
import { IndexesData, Profile } from '@/app/types'

const PersonalizedContent = ({
  profiles,
  setProfiles,
  selectedIndexId,
  setSelectedIndexId
}: {
  profiles: Profile[];
  setProfiles: (profiles: Profile[]) => void;
  selectedIndexId: string;
  setSelectedIndexId: (id: string) => void;
}) => {
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

   { selectedIndexId && <><IndexVideos
      indexId={selectedIndexId}
      isIndexIdLoading={!selectedIndexId}
    />
    <UserProfiles
      indexId={selectedIndexId}
      profiles={profiles}
      setProfiles={setProfiles}
    /></>}

  </div>
  )
}

export default PersonalizedContent
