import React, { Suspense, useEffect, useMemo } from 'react'
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { generateGist, textToVideoSearch } from '@/hooks/apiHooks';
import RecommendedAd from './RecommendedAd';
import { ErrorBoundary } from 'react-error-boundary';
import LoadingSpinner from './LoadingSpinner';
import ErrorFallback from './ErrorFallback';

const RecommendedAdsContent = ({ hashtags, setHashtags, footageVideoId, indexId, selectedFile, setIsRecommendClicked }: RecommendedAdsProps) => {

  const { data: gistData, error: gistError, isLoading: isGistLoading } = useQuery<GistData, Error>({
    queryKey: ["gist", footageVideoId],
    queryFn: () => generateGist(footageVideoId),
    enabled: hashtags.length === 0 && !selectedFile,
  });

  console.log("🚀 > RecommendedAdsContent > gistData=", gistData)
  useEffect(() => {
    if (selectedFile) {
      setHashtags([]);
      setIsRecommendClicked(false);
    } else if (gistData?.hashtags && hashtags.length === 0) {
      setHashtags(gistData.hashtags);
    }
  }, [gistData, setHashtags, hashtags, selectedFile, setIsRecommendClicked]);

  const hashtagQuery = useMemo(() => {
    return hashtags.slice(0, 3).join(' ');
  }, [hashtags]);

  const { data: searchData, error: searchError, isLoading: isSearchLoading } = useQuery<SearchData, Error>({
    queryKey: ["search", footageVideoId, hashtagQuery],
    queryFn: () => textToVideoSearch(indexId, hashtagQuery),
    enabled: hashtagQuery.length > 0 && !selectedFile,
  });
  console.log("🚀 > RecommendedAdsContent > searchData=", searchData)

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
      {searchData?.data?.length > 0 ? (
        searchData?.data?.map((recommendedAd) => (
          <RecommendedAd key={recommendedAd.id} recommendedAd={recommendedAd} indexId={indexId} />
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
