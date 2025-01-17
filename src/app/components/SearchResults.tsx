import React from 'react';
import Video from './Video';
import LoadingSpinner from './LoadingSpinner';
import { usePlayer } from '@/contexts/PlayerContext';
import { SearchResultsProps } from '@/app/types';

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

  const validCurrentVideoIndex = currentVideoIndex < searchResults.length ? currentVideoIndex : 0;

  if (isLoading) {
    return (
      <div className="flex justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (searchResults.length === 0) {
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
                prev === 0 ? searchResults.length - 1 : prev - 1
              );
              if (isPlaying) {
                const newIndex = currentVideoIndex === 0 ? searchResults.length - 1 : currentVideoIndex - 1;
                setCurrentPlayerId(`searchResult-${userId}-${searchResults[newIndex]?.id}`);
              }
            }}
            className="p-1 flex-shrink-0"
            disabled={searchResults.length === 1}
          >
            <svg
              className={`w-5 h-5 ${searchResults.length === 1 ? 'text-gray-300' : 'text-gray-700'}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="w-[240px] h-[135px] flex flex-col">
            <Video
              videoId={searchResults[validCurrentVideoIndex]?.id}
              indexId={indexId}
              showTitle={false}
              playing={currentPlayerId === `searchResult-${userId}-${searchResults[validCurrentVideoIndex]?.id}`}
              onPlay={() => {
                setCurrentPlayerId(`searchResult-${userId}-${searchResults[validCurrentVideoIndex]?.id}`);
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
                prev === searchResults.length - 1 ? 0 : prev + 1
              );
              if (isPlaying) {
                const newIndex = currentVideoIndex === searchResults.length - 1 ? 0 : currentVideoIndex + 1;
                setCurrentPlayerId(`searchResult-${userId}-${searchResults[newIndex]?.id}`);
              }
            }}
            className="p-1 flex-shrink-0"
            disabled={searchResults.length === 1}
          >
            <svg
              className={`w-5 h-5 ${searchResults.length === 1 ? 'text-gray-300' : 'text-gray-700'}`}
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
