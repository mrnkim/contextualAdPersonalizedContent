"use client";

import React, { useState } from 'react'
import Video from './Video';
import LoadingSpinner from './LoadingSpinner';
import ErrorFallback from './ErrorFallback';
import { useQuery } from "@tanstack/react-query";
import Button from './Button'
import FootageSummary from './FootageSummary';

function Footage() {
   /** Fetches videos for the speficied page */
   const fetchVideos = async (page: number) => {
    const response = await fetch(`/api/getVideos?page=${page}`);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return response.json();
  };

   const [isAnalyzeClicked, setIsAnalyzeClicked] = useState(false);

   /** Queries the videos data for the specified page using React Query */
   const {
    data: videosData,
    error: videosError,
    isLoading: isVideosLoading,
    isFetching: isVideosFetching,
  } = useQuery({
    queryKey: ["videos", 1],
    queryFn: () => fetchVideos(1),
  });

  if (isVideosLoading || isVideosFetching) return <LoadingSpinner />;
  if (videosError) return <ErrorFallback error={videosError} />;

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-center text-2xl">News Footage</h2>
      <Video video={videosData.data[0]} />
      <div className="flex justify-center">
        <Button
          type="button"
          size="sm"
          appearance="primary"
          onClick={() => setIsAnalyzeClicked(true)}
        >
          Analyze
        </Button>
      </div>
      {isAnalyzeClicked && <FootageSummary videoId={videosData.data[0]._id} />}
    </div>
  )
}

export default Footage
