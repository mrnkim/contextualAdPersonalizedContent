"use client";

import React, { useState, Suspense } from 'react'
import Video from './Video';
import LoadingSpinner from './LoadingSpinner';
import ErrorFallback from './ErrorFallback';
import { useQuery } from "@tanstack/react-query";
import Button from './Button'
import PageNav from './PageNav';
import clsx from 'clsx'
import RecommendedAds from './RecommendedAds';
import { fetchVideos } from '@/hooks/apiHooks';
import { ErrorBoundary } from 'react-error-boundary';
import { AdsProps } from './types';

type VideoType = {
  _id: string;
  title: string;
};

function Ads({ hashtags, setHashtags, indexId, isIndexIdLoading, footageVideoId, selectedFile, isRecommendClicked, setIsRecommendClicked }: AdsProps) {
  const [page, setPage] = useState(1);

  return (
    <div className="flex flex-col items-center gap-4">
			<h2 className="text-2xl font-bold">Ads Library</h2>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Suspense fallback={<LoadingSpinner />}>
          <AdsContent
            indexId={indexId}
            isIndexIdLoading={isIndexIdLoading}
            page={page}
            setPage={setPage}
            isRecommendClicked={isRecommendClicked}
            setIsRecommendClicked={setIsRecommendClicked}
            selectedFile={selectedFile}
            hashtags={hashtags}
            setHashtags={setHashtags}
            footageVideoId={footageVideoId}
          />
        </Suspense>
      </ErrorBoundary>
    </div>
  )
}

function AdsContent({
  indexId,
  isIndexIdLoading,
  page,
  setPage,
  isRecommendClicked,
  setIsRecommendClicked,
  selectedFile,
  hashtags,
  setHashtags,
  footageVideoId
}: {
  indexId: string;
  isIndexIdLoading: boolean;
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  isRecommendClicked: boolean;
  setIsRecommendClicked: (isClicked: boolean) => void;
  selectedFile: File | null;
  hashtags: string[];
  setHashtags: (hashtags: string[]) => void;
  footageVideoId: string;
}) {
  const { data: videosData, isLoading } = useQuery({
    queryKey: ["videos", page, indexId],
    queryFn: () => fetchVideos(page, indexId!),
    enabled: !!indexId,
  });

  console.log("🚀 > videosData=", videosData)
  const totalPage = videosData?.page_info?.total_page || 1;
  const hasVideoData = videosData && videosData.data && videosData.data.length > 0;

  if (isIndexIdLoading || isLoading) {
    return <LoadingSpinner />;
  }

  if (!hasVideoData) {
    return <div className="text-center py-8">There are no videos in this index</div>;
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 justify-items-center">
        {videosData.data.map((video: VideoType) => (
          <Video key={video._id} videoId={video._id} indexId={indexId || ''} />
        ))}
      </div>
      <div className={clsx("w-full", "flex", "justify-center", "mt-8")}>
        <PageNav page={page} setPage={setPage} totalPage={totalPage} />
      </div>
      <div className="flex justify-center">
        <Button
          type="button"
          size="sm"
          appearance="primary"
          onClick={() => setIsRecommendClicked(true)}
          disabled={!!selectedFile || isRecommendClicked}
        >
          <img
            src={selectedFile || isRecommendClicked? "/magicDisabled.svg" : "/magic.svg"}
            alt="Magic wand icon"
            className="w-4 h-4"
          />
          Recommend
        </Button>
      </div>
      {isRecommendClicked && !selectedFile && (
        <RecommendedAds
          hashtags={hashtags}
          setHashtags={setHashtags}
          footageVideoId={footageVideoId}
          indexId={indexId}
          selectedFile={selectedFile}
          setIsRecommendClicked={setIsRecommendClicked}
        />
      )}
    </>
  );
}

export default Ads
