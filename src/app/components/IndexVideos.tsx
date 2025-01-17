"use client";

import React, { useState, Suspense, useEffect } from 'react'
import Video from './Video';
import LoadingSpinner from './LoadingSpinner';
import ErrorFallback from './ErrorFallback';
import { useQuery } from "@tanstack/react-query";
import PageNav from './PageNav';
import { fetchVideos } from '@/hooks/apiHooks';
import { ErrorBoundary } from 'react-error-boundary';
import { usePlayer } from '@/contexts/PlayerContext';

const PAGE_LIMIT=8

type VideoType = {
  _id: string;
  title: string;
};

type IndexVideosProps = {
  indexId: string;
  isIndexIdLoading: boolean;
}

function IndexVideos({ indexId, isIndexIdLoading}: IndexVideosProps) {
  const [page, setPage] = useState(1);
  const { currentPlayerId, setCurrentPlayerId } = usePlayer();

  useEffect(() => {
    setPage(1);
  }, [indexId]);

  const { data: videosData, isLoading } = useQuery({
    queryKey: ["videos", page, indexId],
    queryFn: () => fetchVideos(page, indexId!, PAGE_LIMIT ),
    enabled: !!indexId,
  });

  const totalPage = videosData?.page_info?.total_page || 1;
  const hasVideoData = videosData?.data?.length > 0;

  const renderContent = () => {
    if (isIndexIdLoading || isLoading) {
      return <LoadingSpinner />;
    }

    if (!hasVideoData) {
      return <div className="text-center py-8">There are no videos in this index</div>;
    }

    return (
      <>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 justify-items-center w-full max-w-6xl">
          {videosData.data.map((video: VideoType) => (
            <Video
              key={video._id}
              videoId={video._id}
              indexId={indexId}
              playing={currentPlayerId === `ad-${video._id}`}
              onPlay={() => setCurrentPlayerId(`ad-${video._id}`)}
            />
          ))}
        </div>
        <div className="w-full flex justify-center mt-3">
          <PageNav page={page} setPage={setPage} totalPage={totalPage} />
        </div>
      </>
    );
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Suspense fallback={<LoadingSpinner />}>
          {renderContent()}
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}

export default IndexVideos
