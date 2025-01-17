import React, { Suspense, useEffect, useState, useMemo } from 'react'
import { useQueries } from "@tanstack/react-query";
import { textToVideoSearch } from '@/hooks/apiHooks';
import { ErrorBoundary } from 'react-error-boundary';
import LoadingSpinner from './LoadingSpinner';
import ErrorFallback from './ErrorFallback';
import { RecommendedAdsProps, RecommendedAdProps } from '@/app/types';
import RecommendedPlacements from '@/app/components/RecommendedPlacements';
import RecommendedAdItem from '@/app/components/RecommendedAdItem';
import InfiniteScroll from 'react-infinite-scroll-component';

export enum SearchOption {
  VISUAL = 'visual',
  AUDIO = 'audio'
}

const INITIAL_DISPLAY_COUNT = 3;

const RecommendedAds = ({ hashtags, footageVideoId, adsIndexId, selectedFile, setIsRecommendClicked, searchOptionRef, customQueryRef, emotions, footageIndexId, isRecommendClicked, selectedAd, setSelectedAd, selectedChapter, setSelectedChapter, useEmbeddings }: RecommendedAdsProps) => {
  const [searchOptions, setSearchOptions] = useState<SearchOption[]>([]);
  const [searchQueries, setSearchQueries] = useState<string[]>([]);
  const [displayCount, setDisplayCount] = useState(INITIAL_DISPLAY_COUNT);
  const [embeddingScores, setEmbeddingScores] = useState<Record<string, number>>({});
  const [embeddingSearchResults, setEmbeddingSearchResults] = useState<RecommendedAdProps["recommendedAd"][]>([]);

  const searchResults = useQueries({
    queries: searchQueries.map(query => ({
      queryKey: ["search", adsIndexId, query, searchOptions],
      queryFn: () => textToVideoSearch(adsIndexId, query, searchOptions),
      enabled: query.length > 0 && searchOptions.length > 0 && !selectedFile,
    }))
  });

  const combinedData = searchResults.reduce((acc, result) => {
    if (result.data?.data) {
      result.data.data.forEach((item: RecommendedAdProps["recommendedAd"]) => {
        if (!acc.some(existing => existing.id === item.id)) {
          acc.push(item);
        }
      });
    }
    return acc;
  }, [] as RecommendedAdProps["recommendedAd"][]);

  const displayedData = useMemo(() => {
    return combinedData.slice(0, displayCount);
  }, [combinedData, displayCount]);

  const isLoading = searchResults.some(result => result.isLoading);
  const isError = searchResults.some(result => result.isError);
  const hasMore = displayCount < combinedData.length;

  const fetchMoreData = () => {
    if (displayCount >= combinedData.length) return;
    setDisplayCount(prev => Math.min(prev + INITIAL_DISPLAY_COUNT, combinedData.length));
  };

  useEffect(() => {
    if (!isRecommendClicked) return;

    let newQueries: string[] = [];
    const radioInputs = Array.from(searchOptionRef.current?.elements || [])
      .filter(el => el.getAttribute('type') === 'radio') as HTMLInputElement[];

    if (radioInputs[0]?.checked || radioInputs[2]?.checked || radioInputs[3]?.checked) {
      newQueries = hashtags.slice(0, 3);
    } else if (radioInputs[1]?.checked) {
      newQueries = emotions;
    } else if (radioInputs[4]?.checked) {
      newQueries = [...hashtags.slice(0,2), customQueryRef.current?.value || ''];
    }

    setSearchQueries(newQueries);

    let newSearchOptions: SearchOption[] = [];
    if (radioInputs[0]?.checked || radioInputs[1]?.checked || radioInputs[4]?.checked) {
      newSearchOptions = [SearchOption.VISUAL, SearchOption.AUDIO];
    } else if (radioInputs[2]?.checked) {
      newSearchOptions = [SearchOption.VISUAL];
    } else if (radioInputs[3]?.checked) {
      newSearchOptions = [SearchOption.AUDIO];
    }

    setSearchOptions(newSearchOptions);

    const handleEmbeddingSearch = async () => {
      if (useEmbeddings) {
        try {
          const response = await fetch('/api/embeddingSearch', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              videoId: footageVideoId,
              indexId: adsIndexId
            })
          });
          const data = await response.json();

          // Transform embedding search results to match RecommendedAdProps structure
          const transformedResults = data.map((item: { id: string; metadata: { tl_video_id: string; start_time: number; end_time: number }; score: number }) => ({
            id: item.metadata?.tl_video_id,
            indexId: adsIndexId,
            videoDetails: {
              hls: {
                metadata: {
                  filename: item.id,
                  video_title: item.id
                },
              }
            }
          }));

          setEmbeddingScores(data.reduce((acc: Record<string, number>, item: { id: string; score: number }) => {
            acc[item.id] = item.score;
            return acc;
          }, {}));

          setEmbeddingSearchResults(transformedResults);
        } catch (error) {
          console.error('Error fetching embedding search:', error);
        }
      }
    };

    handleEmbeddingSearch();
    setIsRecommendClicked(false);
  }, [isRecommendClicked, hashtags, emotions]);

  if (isError) return <ErrorFallback error={new Error("Search failed")} />;

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <div className="flex flex-row w-full my-5 gap-16">
        {/* Left side - RecommendedPlacements */}
          <div className="w-2/3">
            <RecommendedPlacements
              footageVideoId={footageVideoId}
              footageIndexId={footageIndexId}
              selectedAd={selectedAd}
              adsIndexId={adsIndexId}
              selectedChapter={selectedChapter}
              setSelectedChapter={setSelectedChapter}
            />
          </div>

        {/* Right side - Recommended Ads */}
        <div className="flex flex-col w-1/3">
          <h2 className="text-center text-2xl font-bold my-10">Recommended Ads</h2>

          {isLoading && (
            <div className="flex justify-center items-center h-full my-5">
              <LoadingSpinner />
            </div>
          )}

          {combinedData.length > 0 && (
            <span className="text-xs font-bold mb-0.5 text-left block">Step 3: Choose an ad</span>
          )}

          <Suspense fallback={<LoadingSpinner />}>
            <div>
              {useEmbeddings ? (
                <div id="scrollableDiv" className="h-[calc(100vh-200px)] overflow-y-auto">
                  <InfiniteScroll
                    dataLength={embeddingSearchResults.length}
                    next={fetchMoreData}
                    hasMore={hasMore}
                    loader={<LoadingSpinner />}
                    scrollableTarget="scrollableDiv"
                    className="flex flex-col gap-12 p-2"
                    scrollThreshold={0.8}
                  >
                    {embeddingSearchResults.map((recommendedAd) => (
                      <div
                        key={recommendedAd.id}
                        onClick={() => setSelectedAd(recommendedAd)}
                        className={`cursor-pointer ${selectedAd?.id === recommendedAd.id ? 'ring-2 ring-green-600 rounded-lg' : ''}`}
                      >
                        <RecommendedAdItem
                          recommendedAd={recommendedAd}
                          adsIndexId={adsIndexId}
                          score={useEmbeddings ? embeddingScores[recommendedAd?.id || ''] : recommendedAd.clips?.[0]?.score ?? 0}
                        />
                      </div>
                    ))}
                  </InfiniteScroll>
                </div>
              ) : (
                combinedData.length > 0 ? (
                  <div id="scrollableDiv" className="h-[calc(100vh-200px)] overflow-y-auto">
                    <InfiniteScroll
                      dataLength={displayedData.length}
                      next={fetchMoreData}
                      hasMore={hasMore}
                      loader={<LoadingSpinner />}
                      scrollableTarget="scrollableDiv"
                      className="flex flex-col gap-12 p-2"
                      scrollThreshold={0.8}
                    >
                      {displayedData.map((recommendedAd) => (
                        <div
                          key={recommendedAd.id}
                          onClick={() => setSelectedAd(recommendedAd)}
                          className={`cursor-pointer ${selectedAd?.id === recommendedAd.id ? 'ring-2 ring-green-600 rounded-lg' : ''}`}
                        >
                          <RecommendedAdItem
                            recommendedAd={recommendedAd}
                            adsIndexId={adsIndexId}
                            score={useEmbeddings ? embeddingScores[recommendedAd?.id || ''] : recommendedAd.clips?.[0]?.score ?? 0}
                          />
                        </div>
                      ))}
                    </InfiniteScroll>
                  </div>
                ) : (
                  !isLoading && <div className='flex justify-center items-center h-full my-5'>No search results found 😿 </div>
                )
              )}
            </div>
          </Suspense>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default RecommendedAds
