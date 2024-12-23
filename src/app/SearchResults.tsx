import React from 'react'
import LoadingSpinner from './LoadingSpinner'
import Video from './Video'
import { SearchResultsProps } from './types'

const SearchResults: React.FC<SearchResultsProps> = ({
  isLoading,
  allSearchResults,
  currentVideoIndex,
  setCurrentVideoIndex,
  isPlaying,
  setIsPlaying,
  currentPlayerId,
  setCurrentPlayerId,
  userId,
  indexId,
  demographics
}) => {
  const validCurrentVideoIndex = currentVideoIndex < allSearchResults.length ? currentVideoIndex : 0;

  return (
    <div className="w-full">
      <h3 className="font-semibold mb-2 mt-8">Search Results for {demographics.name}</h3>
      {isLoading ? (
        <div className="flex justify-center">
          <LoadingSpinner />
        </div>
      ) : allSearchResults.length > 0 ? (
        <div className="space-y-2">
          <div className="p-2 flex items-center justify-between gap-2">
            <button
              onClick={() => {
                setCurrentVideoIndex(prev =>
                  prev === 0 ? allSearchResults.length - 1 : prev - 1
                );
                if (isPlaying) {
                  const newIndex = currentVideoIndex === 0 ? allSearchResults.length - 1 : currentVideoIndex - 1;
                  setCurrentPlayerId(`searchResult-${userId}-${allSearchResults[newIndex]?.id}`);
                }
              }}
              className="p-1 flex-shrink-0"
              disabled={allSearchResults.length === 1}
            >
              <svg
                className={`w-5 h-5 ${allSearchResults.length === 1 ? 'text-gray-300' : 'text-gray-700'}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div className="w-[240px] h-[135px]">
              <Video
                videoId={allSearchResults[validCurrentVideoIndex]?.id}
                indexId={indexId}
                showTitle={false}
                playing={currentPlayerId ? currentPlayerId === `searchResult-${userId}-${allSearchResults[validCurrentVideoIndex]?.id}` : false}
                onPlay={() => {
                  setCurrentPlayerId(`searchResult-${userId}-${allSearchResults[validCurrentVideoIndex]?.id}`);
                  setIsPlaying(true);
                }}
                onPause={() => {
                  setIsPlaying(false);
                }}
              />
            </div>

            <button
              onClick={() => {
                setCurrentVideoIndex(prev =>
                  prev === allSearchResults.length - 1 ? 0 : prev + 1
                );
                if (isPlaying) {
                  const newIndex = currentVideoIndex === allSearchResults.length - 1 ? 0 : currentVideoIndex + 1;
                  setCurrentPlayerId(`searchResult-${userId}-${allSearchResults[newIndex]?.id}`);
                }
              }}
              className="p-1 flex-shrink-0"
              disabled={allSearchResults.length === 1}
            >
              <svg
                className={`w-5 h-5 ${allSearchResults.length === 1 ? 'text-gray-300' : 'text-gray-700'}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      ) : (
        <p className="text-center text-grey-500">No results found</p>
      )}
    </div>
  )
}

export default SearchResults
