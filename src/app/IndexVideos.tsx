"use client";

import React, { useState, Suspense } from 'react'
import Video from './Video';
import LoadingSpinner from './LoadingSpinner';
import ErrorFallback from './ErrorFallback';
import { useQuery } from "@tanstack/react-query";
import PageNav from './PageNav';
import clsx from 'clsx'
import { fetchVideos } from '@/hooks/apiHooks';
import { ErrorBoundary } from 'react-error-boundary';

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

  const { data: videosData, isLoading } = useQuery({
    queryKey: ["videos", page, indexId],
    queryFn: () => fetchVideos(page, indexId!, PAGE_LIMIT ),
    enabled: !!indexId,
  });

  const totalPage = videosData?.page_info?.total_page || 1;
  const hasVideoData = videosData && videosData.data && videosData.data.length > 0;

  return (
    <div className="flex flex-col items-center gap-4">
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Suspense fallback={<LoadingSpinner />}>
          {isIndexIdLoading || isLoading ? (
            <LoadingSpinner />
          ) : !hasVideoData ? (
            <div className="text-center py-8">There are no videos in this index</div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 justify-items-center w-full max-w-6xl">
                {videosData.data.map((video: VideoType) => (
                  <Video key={video._id} videoId={video._id} indexId={indexId || ''} />
                ))}
              </div>
              <div className={clsx("w-full", "flex", "justify-center", "mt-3")}>
                <PageNav page={page} setPage={setPage} totalPage={totalPage} />
              </div>
            </>
          )}
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}

export default IndexVideos
