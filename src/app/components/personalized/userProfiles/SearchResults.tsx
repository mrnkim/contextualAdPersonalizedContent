import React from 'react';
import Video from '../../common/Video';
import LoadingSpinner from '../../common/LoadingSpinner';
import { usePlayer } from '@/contexts/PlayerContext';
import { SearchResultsProps } from '@/app/types';
import { useQueries } from '@tanstack/react-query';
import { fetchVideoDetails } from '@/hooks/apiHooks';

function SearchResults({
  isLoading,
  searchResults,
  demographics,
  userId,
  indexId
}: SearchResultsProps) {
  const [currentVideoIndex, setCurrentVideoIndex] = React.useState(0);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const { currentPlayerId, setCurrentPlayerId } = usePlayer();

  // Pre-validate all videos by fetching their details
  const validationQueries = useQueries({
    queries: searchResults.map((result) => ({
      queryKey: ["videoDetails", result.id],
      queryFn: () => fetchVideoDetails(result.id, indexId),
      enabled: !!indexId,
      retry: false,
    })),
  });

  // Filter to only include videos that loaded successfully and map with their details
  const validSearchResults = React.useMemo(() => {
    return searchResults
      .map((result, index) => ({
        result,
        videoDetails: validationQueries[index]?.data,
      }))
      .filter(item => item.videoDetails);
  }, [searchResults, validationQueries]);

  // Check if we're still validating videos
  const isValidating = validationQueries.some(query => query.isLoading);

  const validCurrentVideoIndex = currentVideoIndex < validSearchResults.length ? currentVideoIndex : 0;

  if (isLoading || isValidating) {
    return (
      <div className="flex justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (validSearchResults.length === 0) {
    return <p className="text-center text-grey-500">No results found</p>;
  }

  return (
    <div className="w-full">
      <h3 className="font-semibold mb-2 mt-8">
        Search Results for {demographics.name}
      </h3>
      <div className="space-y-2">
        <div className="p-2 flex items-center justify-between gap-2">
          <button
            onClick={() => {
              setCurrentVideoIndex(prev =>
                prev === 0 ? validSearchResults.length - 1 : prev - 1
              );
              if (isPlaying) {
                const newIndex = currentVideoIndex === 0 ? validSearchResults.length - 1 : currentVideoIndex - 1;
                setCurrentPlayerId(`searchResult-${userId}-${validSearchResults[newIndex]?.result.id}`);
              }
            }}
            className="p-1 flex-shrink-0"
            disabled={validSearchResults.length === 1}
          >
            <svg
              className={`w-5 h-5 ${validSearchResults.length === 1 ? 'text-gray-300' : 'text-gray-700'}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="w-[240px] h-[135px] flex flex-col">
            {validSearchResults[validCurrentVideoIndex] && (
              <Video
                videoId={validSearchResults[validCurrentVideoIndex].result.id}
                indexId={indexId}
                showTitle={false}
                videoDetails={validSearchResults[validCurrentVideoIndex].videoDetails}
                playing={currentPlayerId === `searchResult-${userId}-${validSearchResults[validCurrentVideoIndex].result.id}`}
                onPlay={() => {
                  setCurrentPlayerId(`searchResult-${userId}-${validSearchResults[validCurrentVideoIndex].result.id}`);
                  setIsPlaying(true);
                }}
                onPause={() => {
                  setIsPlaying(false);
                }}
              />
            )}
          </div>

          <button
            onClick={() => {
              setCurrentVideoIndex(prev =>
                prev === validSearchResults.length - 1 ? 0 : prev + 1
              );
              if (isPlaying) {
                const newIndex = currentVideoIndex === validSearchResults.length - 1 ? 0 : currentVideoIndex + 1;
                setCurrentPlayerId(`searchResult-${userId}-${validSearchResults[newIndex]?.result.id}`);
              }
            }}
            className="p-1 flex-shrink-0"
            disabled={validSearchResults.length === 1}
          >
            <svg
              className={`w-5 h-5 ${validSearchResults.length === 1 ? 'text-gray-300' : 'text-gray-700'}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default SearchResults;
