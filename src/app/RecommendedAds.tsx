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
    <div className="flex flex-col p-2">
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

const RecommendedAds = ({ hashtags, setHashtags, footageVideoId, adsIndexId, selectedFile, setIsRecommendClicked, searchOptionRef, customQueryRef, emotions, footageIndexId, isRecommendClicked }: RecommendedAdsProps) => {
  const [searchOptions, setSearchOptions] = useState<SearchOption[]>([]);
  const [selectedAd, setSelectedAd] = useState<RecommendedAdProps["recommendedAd"] | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentSearchOption, setCurrentSearchOption] = useState<string>('');

  // Update search parameters when Recommend button is clicked
  useEffect(() => {
    if (!isRecommendClicked) return;

    console.log('Recommend clicked, updating search with:', {
      hashtags,
      emotions,
      currentSearchOption,
      customQueryValue: customQueryRef.current?.value
    });

    let newQuery = '';
    const radioInputs = Array.from(searchOptionRef.current?.elements || [])
      .filter(el => el.getAttribute('type') === 'radio') as HTMLInputElement[];

    if (radioInputs[0]?.checked || radioInputs[2]?.checked || radioInputs[3]?.checked) {
      newQuery = hashtags.slice(0, 3).join(' ');
    } else if (radioInputs[1]?.checked) {
      newQuery = emotions.join(' ');
    } else if (radioInputs[4]?.checked) {
      newQuery = [...hashtags.slice(0,2), customQueryRef.current?.value].join(' ');
    }

    console.log('New search query:', newQuery);
    setSearchQuery(newQuery);

    let newSearchOptions: SearchOption[] = [];
    if (radioInputs[0]?.checked || radioInputs[1]?.checked || radioInputs[4]?.checked) {
      newSearchOptions = [
        SearchOption.VISUAL,
        SearchOption.CONVERSATION,
        SearchOption.TEXT_IN_VIDEO,
        SearchOption.LOGO
      ];
    } else if (radioInputs[2]?.checked) {
      newSearchOptions = [SearchOption.VISUAL];
    } else if (radioInputs[3]?.checked) {
      newSearchOptions = [SearchOption.CONVERSATION];
    }

    console.log('New search options:', newSearchOptions);
    setSearchOptions(newSearchOptions);

    // Reset isRecommendClicked after updating search
    setIsRecommendClicked(false);
  }, [isRecommendClicked, hashtags, emotions]);

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
      console.log('Executing search with:', {
        adsIndexId,
        searchQuery,
        searchOptions,
        pageParam
      });

      if (pageParam) {
        return fetchSearchPage(pageParam);
      }
      return textToVideoSearch(adsIndexId, searchQuery, searchOptions);
    },
    getNextPageParam: (lastPage) => lastPage.page_info?.next_page_token || null,
    enabled: searchQuery.length > 0 && searchOptions.length > 0 && !selectedFile,
  });

  useEffect(() => {
    console.log('Query state:', {
      isSearchLoading,
      hasData: !!searchData,
      searchQuery,
      searchOptions,
      enabled: searchQuery.length > 0 && searchOptions.length > 0 && !selectedFile
    });
  }, [isSearchLoading, searchData, searchQuery, searchOptions, selectedFile]);

  if (searchError) return <ErrorFallback error={searchError} />;

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <div className="flex flex-row w-full my-5 gap-8">
        {/* Left side - RecommendedPlacements */}
          <div className="w-2/3">
            <RecommendedPlacements
              footageVideoId={footageVideoId}
              footageIndexId={footageIndexId}
              selectedAd={selectedAd}
              adsIndexId={adsIndexId}
            />
          </div>

        {/* Right side - Recommended Ads */}
        <div className="flex flex-col w-1/3">
          <h2 className="text-center text-2xl font-bold my-10">Recommended Ads</h2>

          {(isSearchLoading) && (
            <div className="flex justify-center items-center h-full my-5">
              <LoadingSpinner />
            </div>
          )}

          <Suspense fallback={<LoadingSpinner />}>
            <div>
              {searchData?.pages[0]?.data && searchData.pages[0].data.length > 0 ? (
                <div className="flex flex-col gap-12 p-2 overflow-y-auto max-h-[calc(100vh-200px)]">
                  {searchData.pages.map((page) =>
                    page.data.map((recommendedAd: RecommendedAdProps["recommendedAd"]) => (
                      <div
                        key={recommendedAd.id}
                        onClick={() => setSelectedAd(recommendedAd)}
                        className={`cursor-pointer ${selectedAd?.id === recommendedAd.id ? 'ring-2 ring-green-600 rounded-lg' : ''}`}
                      >
                        <RecommendedAdItem
                          recommendedAd={recommendedAd}
                          adsIndexId={adsIndexId}
                        />
                      </div>
                    ))
                  )}
                </div>
              ) : (
                searchData && <div className='flex justify-center items-center h-full my-5'>No search results found 😿 </div>
              )}

              {hasNextPage && (
                <div className="flex justify-center mt-4">
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
            </div>
          </Suspense>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default RecommendedAds
