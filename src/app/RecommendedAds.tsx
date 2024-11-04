import React, { Suspense, useEffect, useMemo, useState } from 'react'
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { generateGist, textToVideoSearch, fetchVideoDetails } from '@/hooks/apiHooks';
import RecommendedAd from './RecommendedAd';
import { ErrorBoundary } from 'react-error-boundary';
import LoadingSpinner from './LoadingSpinner';
import ErrorFallback from './ErrorFallback';
import { RecommendedAdsProps, GistData, SearchData, VideoDetails, RecommendedAdProps } from './types';
import RecommendedPlacements from './RecommendedPlacements';
import { fetchSearchPage } from '@/hooks/apiHooks';
import Button from './Button'

export enum SearchOption {
  VISUAL = 'visual',
  CONVERSATION = 'conversation',
  TEXT_IN_VIDEO = 'text_in_video',
  LOGO = 'logo'
}

const RecommendedAdItem = ({ recommendedAd, adsIndexId }: { recommendedAd: RecommendedAdProps["recommendedAd"], adsIndexId: string }) => {
  const { data: videoDetails } = useQuery<VideoDetails, Error>({
    queryKey: ["videoDetails", recommendedAd.id],
    queryFn: () => fetchVideoDetails(recommendedAd.id!, adsIndexId),
    enabled: !!recommendedAd.id && !!adsIndexId
  });

  return (
    <div className="flex flex-col">
      {videoDetails?.metadata.filename && (
        <h3 className="mb-2 text-lg font-medium">
          {videoDetails.metadata.filename.split('.')[0]}
        </h3>
      )}
      {videoDetails && (
        <RecommendedAd
          recommendedAd={{ ...recommendedAd, clips: recommendedAd.clips || [] }}
          indexId={adsIndexId}
          videoDetails={videoDetails}
        />
      )}
    </div>
  );
};

const RecommendedAds = ({ hashtags, setHashtags, footageVideoId, adsIndexId, selectedFile, setIsRecommendClicked, searchOptionRef, customQueryRef, emotions, footageIndexId }: RecommendedAdsProps) => {
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
      return [...hashtags.slice(0,2), customQueryRef.current?.value].join(' ');
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

  const {
    data: searchData,
    error: searchError,
    isLoading: isSearchLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteQuery({
    queryKey: ["search", adsIndexId, searchQuery, searchOptions],
    initialPageParam: null,
    queryFn: async ({ pageParam = null }) => {
      if (pageParam) {
        return fetchSearchPage(pageParam);
      }
      return textToVideoSearch(adsIndexId, searchQuery, searchOptions);
    },
    getNextPageParam: (lastPage) => lastPage.page_info?.next_page_token || null,
    enabled: searchQuery.length > 0 && searchOptions.length > 0 && !selectedFile,
  });
    console.log("🚀 > RecommendedAds > searchData,=", searchData,)
    console.log("🚀 > RecommendedAds > hasNextPage=", hasNextPage)
    console.log("🚀 > RecommendedAds >  isFetchingNextPage=",  isFetchingNextPage)

  if (gistError) return <ErrorFallback error={gistError} />;
  if (searchError) return <ErrorFallback error={searchError} />;

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <div className="flex flex-col w-full my-5">
        <h2 className="text-center text-2xl font-bold my-10"> Recommended Ads </h2>

        {(isGistLoading || isSearchLoading) && (
          <div className="flex justify-center items-center h-full my-5">
            <LoadingSpinner />
          </div>
        )}

        <Suspense fallback={<LoadingSpinner />}>
          <div>
            {searchData?.pages[0]?.data && searchData.pages[0].data.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
                {searchData.pages.map((page) =>
                  page.data.map((recommendedAd: RecommendedAdProps["recommendedAd"]) => (
                    <RecommendedAdItem
                      key={recommendedAd.id}
                      recommendedAd={recommendedAd}
                      adsIndexId={adsIndexId}
                    />
                  ))
                )}
              </div>
            ) : (
              searchData && <div className='flex justify-center items-center h-full my-5'>No search results found 😿 </div>
            )}

            {hasNextPage && (
              <div className="flex justify-center mt-10">
                <Button
                type="button"
                size="sm"
                appearance="secondary"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                >
<img
													src={"/more.svg"}
													alt="more options icon"
													className="w-4 h-4 mr-1"
												/>
              Show More
            </Button>
              </div>
            )}

            {searchData?.pages[0]?.data && searchData.pages[0].data.length > 0 && (
             <RecommendedPlacements footageVideoId={footageVideoId} footageIndexId={footageIndexId} />
            )}

          </div>
        </Suspense>
      </div>
    </ErrorBoundary>
  );
};

export default RecommendedAds
