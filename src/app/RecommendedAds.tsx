import React, { Suspense, useEffect, useMemo, useState } from 'react'
import { useQuery } from "@tanstack/react-query";
import { generateGist, textToVideoSearch } from '@/hooks/apiHooks';
import RecommendedAd from './RecommendedAd';
import { ErrorBoundary } from 'react-error-boundary';
import LoadingSpinner from './LoadingSpinner';
import ErrorFallback from './ErrorFallback';
import { RecommendedAdsProps, GistData, SearchData } from './types';

export enum SearchOption {
  VISUAL = 'visual',
  CONVERSATION = 'conversation',
  TEXT_IN_VIDEO = 'text_in_video',
  LOGO = 'logo'
}

const RecommendedAdsContent = ({ hashtags, setHashtags, footageVideoId, indexId, selectedFile, setIsRecommendClicked, searchOptionRef, customQueryRef, emotions }: RecommendedAdsProps) => {
  const [searchOptions, setSearchOptions] = useState<SearchOption[]>([]);

  const { data: gistData, error: gistError, isLoading: isGistLoading } = useQuery<GistData, Error>({
    queryKey: ["gist", footageVideoId],
    queryFn: () => generateGist(footageVideoId),
    enabled: hashtags.length === 0 && !selectedFile,
  });

  useEffect(() => {
    if (selectedFile) {
      setHashtags([]);
      setIsRecommendClicked(false);
    } else if (gistData?.hashtags && hashtags.length === 0) {
      setHashtags(gistData.hashtags);
    }
  }, [gistData, setHashtags, hashtags, selectedFile, setIsRecommendClicked]);

  const searchQuery: string = useMemo(() => {
    if ((searchOptionRef.current?.[0] as HTMLInputElement)?.checked || (searchOptionRef.current?.[2] as HTMLInputElement)?.checked || (searchOptionRef.current?.[3] as HTMLInputElement)?.checked) {
      return hashtags.slice(0, 3).join(' ');
    }
    if ((searchOptionRef.current?.[1] as HTMLInputElement)?.checked) {
      return emotions.join(' ');
    }
    if ((searchOptionRef.current?.[4] as HTMLInputElement)?.checked) {
      return customQueryRef.current?.value ?? '';
    }
    return '';
  }, [hashtags, emotions, searchOptionRef]);

  useEffect(() => {
    if ((searchOptionRef.current?.[0] as HTMLInputElement)?.checked || (searchOptionRef.current?.[1] as HTMLInputElement)?.checked || (searchOptionRef.current?.[4] as HTMLInputElement)?.checked) {
      setSearchOptions([
        SearchOption.VISUAL,
        SearchOption.CONVERSATION,
        SearchOption.TEXT_IN_VIDEO,
        SearchOption.LOGO
      ]);
    }
    if ((searchOptionRef.current?.[2] as HTMLInputElement)?.checked) {
      setSearchOptions([SearchOption.VISUAL]);
    }
    if ((searchOptionRef.current?.[3] as HTMLInputElement)?.checked) {
      setSearchOptions([SearchOption.CONVERSATION]);
    }
  }, [searchOptionRef]);

  const { data: searchData, error: searchError, isLoading: isSearchLoading } = useQuery<SearchData, Error>({
    queryKey: ["search", footageVideoId, searchQuery, searchOptions],
    queryFn: () => textToVideoSearch(indexId, searchQuery, searchOptions),
    enabled: searchQuery.length > 0 && searchOptions.length > 0 && !selectedFile,
  });

  return (
    <div className="flex flex-col w-full">
      {isGistLoading && (
        <div className="flex justify-center items-center h-full my-5">
          <LoadingSpinner />
        </div>
      )}
      {gistError && <ErrorFallback error={gistError} />}
      {isSearchLoading && (
        <div className="flex justify-center items-center h-full my-5">
          <LoadingSpinner />
        </div>
      )}
      {searchError && <ErrorFallback error={searchError}/>}
      {searchData?.data && searchData.data.length > 0 ? (
        searchData.data.map((recommendedAd) => (
          <RecommendedAd
            key={recommendedAd.id}
            recommendedAd={{ ...recommendedAd, clips: recommendedAd.clips || [] }}
            indexId={indexId}
          />
        ))
      ) : (
        searchData && <div className='flex justify-center items-center h-full my-5'>No search results found 😿 </div>
      )}
    </div>
  )
}

const RecommendedAds = (props: RecommendedAdsProps) => {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Suspense fallback={<LoadingSpinner />}>
        <RecommendedAdsContent {...props} />
      </Suspense>
    </ErrorBoundary>
  )
}

export default RecommendedAds
