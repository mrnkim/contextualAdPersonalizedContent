import React, { Suspense, useEffect, useState } from 'react'
import { useQueries } from "@tanstack/react-query";
import { textToVideoSearch } from '@/hooks/apiHooks';
import { ErrorBoundary } from 'react-error-boundary';
import LoadingSpinner from './LoadingSpinner';
import ErrorFallback from './ErrorFallback';
import { RecommendedAdsProps, RecommendedAdProps } from './types';
import RecommendedPlacements from './RecommendedPlacements';
import { fetchSearchPage } from '@/hooks/apiHooks';
import Button from './Button'
import RecommendedAdItem from './RecommendedAdItem';

export enum SearchOption {
  VISUAL = 'visual',
  AUDIO = 'audio'
}

const RecommendedAds = ({ hashtags, footageVideoId, adsIndexId, selectedFile, setIsRecommendClicked, searchOptionRef, customQueryRef, emotions, footageIndexId, isRecommendClicked, selectedAd, setSelectedAd, selectedChapter, setSelectedChapter }: RecommendedAdsProps) => {
  const [searchOptions, setSearchOptions] = useState<SearchOption[]>([]);
  const [searchQueries, setSearchQueries] = useState<string[]>([]);

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
      newQueries = [...hashtags.slice(0,2), customQueryRef.current?.value];
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
    setIsRecommendClicked(false);
  }, [isRecommendClicked, hashtags, emotions]);

  const searchResults = useQueries({
    queries: searchQueries.map(query => ({
      queryKey: ["search", adsIndexId, query, searchOptions],
      queryFn: () => textToVideoSearch(adsIndexId, query, searchOptions),
      enabled: query.length > 0 && searchOptions.length > 0 && !selectedFile,
    }))
  });

  const isLoading = searchResults.some(result => result.isLoading);
  const isError = searchResults.some(result => result.isError);

  // Combine all results and remove duplicates
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

  if (isError) return <ErrorFallback error={new Error("Search failed")} />;

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
              {combinedData.length > 0 ? (
                <div className="flex flex-col gap-12 p-2 overflow-y-auto max-h-[calc(100vh-200px)]">
                  {combinedData.map((recommendedAd) => (
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
                  ))}
                </div>
              ) : (
                !isLoading && <div className='flex justify-center items-center h-full my-5'>No search results found 😿 </div>
              )}
            </div>
          </Suspense>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default RecommendedAds
