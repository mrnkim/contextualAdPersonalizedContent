"use client";

import React, { useState, Suspense, useEffect } from 'react'
import Video from './Video';
import LoadingSpinner from './LoadingSpinner';
import ErrorFallback from './ErrorFallback';
import { useQuery } from "@tanstack/react-query";
import Button from './Button'
import PageNav from './PageNav';
import clsx from 'clsx'
import { fetchVideos } from '@/hooks/apiHooks';
import { ErrorBoundary } from 'react-error-boundary';
import { AdsProps } from './types';
import RecommendOptionForm from './RecommendOptionForm';

type VideoType = {
  _id: string;
  title: string;
};

function Ads({ indexId, isIndexIdLoading, selectedFile, isRecommendClicked, setIsRecommendClicked, searchOptionRef, customQueryRef, isAnalysisLoading, setIsRecommendClickedEver, isRecommendClickedEver, setSelectedAd, setSelectedChapter}: AdsProps) {
  const [page, setPage] = useState(1);
  const [hasSearchOptionChanged, setHasSearchOptionChanged] = useState(false);

  const { data: videosData, isLoading } = useQuery({
    queryKey: ["videos", page, indexId],
    queryFn: () => fetchVideos(page, indexId!),
    enabled: !!indexId,
  });

  const totalPage = videosData?.page_info?.total_page || 1;
  const hasVideoData = videosData && videosData.data && videosData.data.length > 0;



  useEffect(() => {
    if (isRecommendClicked) {
      setHasSearchOptionChanged(false);
    }
  }, [isRecommendClicked]);

  return (
    <div className="flex flex-col items-center gap-4">
      <h2 className="text-2xl font-bold">Ads Library</h2>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Suspense fallback={<LoadingSpinner />}>
          {isIndexIdLoading || isLoading ? (
            <LoadingSpinner />
          ) : !hasVideoData ? (
            <div className="text-center py-8">There are no videos in this index</div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 justify-items-center">
                {videosData.data.map((video: VideoType) => (
                  <Video key={video._id} videoId={video._id} indexId={indexId || ''} />
                ))}
              </div>
              <div className={clsx("w-full", "flex", "justify-center", "mt-3")}>
                <PageNav page={page} setPage={setPage} totalPage={totalPage} />
              </div>
              <div className="flex flex-col items-center gap-4 my-5">
                <RecommendOptionForm searchOptionRef={searchOptionRef} customQueryRef={customQueryRef} setIsRecommendClicked={setIsRecommendClicked} setHasSearchOptionChanged={setHasSearchOptionChanged}/>
                <div className="w-fit my-5">
                  <span className="text-xs font-bold mb-0.5 text-left block">Step 2</span>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      appearance="primary"
                      onClick={() => {
                        setIsRecommendClicked(true);
                        setIsRecommendClickedEver(true);
                        setSelectedAd(null);
                        setSelectedChapter(null);
                      }}
                      disabled={!!selectedFile || isRecommendClicked || isAnalysisLoading || (!hasSearchOptionChanged && isRecommendClickedEver)}
                    >
                      <img
                        src={selectedFile || isRecommendClicked || isAnalysisLoading ? "/magicDisabled.svg" : "/magic.svg"}
                        alt="Magic wand icon"
                        className="w-4 h-4"
                      />
                      Recommend
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}

export default Ads
