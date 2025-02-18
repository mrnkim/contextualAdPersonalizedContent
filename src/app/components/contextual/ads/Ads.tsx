"use client";

import React, { useState, Suspense, useEffect, useCallback } from 'react'
import Video from '../../common/Video';
import LoadingSpinner from '../../common/LoadingSpinner';
import ErrorFallback from '../../common/ErrorFallback';
import { useQuery } from "@tanstack/react-query";
import Button from '../../common/Button';
import PageNav from './PageNav';
import clsx from 'clsx'
import { checkVectorExists, fetchVideos, getAndStoreEmbeddings } from '@/hooks/apiHooks';
import { ErrorBoundary } from 'react-error-boundary';
import { AdsProps } from '@/app/types';
import RecommendOptionForm from '@/app/components/contextual/ads/RecommendOptionForm';
import { usePlayer } from '@/contexts/PlayerContext';

type VideoType = {
  _id: string;
  title: string;
};

function Ads({ indexId, isIndexIdLoading, selectedFile, isRecommendClicked, setIsRecommendClicked, searchOptionRef, customQueryRef, isAnalysisLoading, setIsRecommendClickedEver, isRecommendClickedEver, setSelectedAd, setSelectedChapter, hashtags, hasProcessedAds, setHasProcessedAds, hasProcessedFootage, useEmbeddings }: AdsProps) {
  const [page, setPage] = useState(1);
  const [hasSearchOptionChanged, setHasSearchOptionChanged] = useState(false);
  const [processingVideos, setProcessingVideos] = useState(false);
  const { currentPlayerId, setCurrentPlayerId } = usePlayer();
  const { data: videosData, isLoading } = useQuery({
    queryKey: ["videos", page, indexId],
    queryFn: () => fetchVideos(page, indexId!),
    enabled: !!indexId,
  });

  const totalPage = videosData?.page_info?.total_page || 1;
  const hasVideoData = videosData && videosData.data && videosData.data.length > 0;

  const processAdVideos = useCallback(async () => {
    if (!indexId) return;
    setProcessingVideos(true);
    try {
      const firstPageData = await fetchVideos(1, indexId);
      const totalPages = firstPageData.page_info?.total_page || 1;

      for (let currentPage = 1; currentPage <= totalPages; currentPage++) {
        const pageData = await fetchVideos(currentPage, indexId);
        if (pageData.data) {
          for (const video of pageData.data) {
            const vectorExists = await checkVectorExists(video._id);
            if (!vectorExists) {
              await getAndStoreEmbeddings(indexId, video._id);
            }
          }
        }
      }
      if (typeof setHasProcessedAds === 'function') {
        setHasProcessedAds(true);
      }
    } catch (error) {
      console.error("Error processing videos:", error);
    } finally {
      setProcessingVideos(false);
    }
  }, [indexId, setHasProcessedAds]);

  useEffect(() => {
    if (isRecommendClicked) {
      setHasSearchOptionChanged(false);
    }
  }, [isRecommendClicked]);

  useEffect(() => {
    if (indexId && !hasProcessedAds && useEmbeddings) {
      processAdVideos();
    }
  }, [indexId, hasProcessedAds, processAdVideos, useEmbeddings]);

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold">Ads Library</h2>
      {processingVideos && (
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
          <LoadingSpinner size="sm" color="default" />
          Processing video embeddings...
        </div>
      )}
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Suspense fallback={<LoadingSpinner />}>
          {isIndexIdLoading || isLoading ? (
            <LoadingSpinner />
          ) : !hasVideoData ? (
            <div className="text-center py-8">There are no videos in this index</div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 justify-items-center">
                {videosData.data.map((video: VideoType) => {
                  return (
                    <Video
                      key={video._id}
                      videoId={video._id}
                      indexId={indexId || ''}
                      playing={currentPlayerId === `ad-library-${video._id}`}
                      onPlay={() => setCurrentPlayerId(`ad-library-${video._id}`)}
                    />
                  );
                })}
              </div>
              <div className={clsx("w-full", "flex", "justify-center", "mt-3")}>
                <PageNav page={page} setPage={setPage} totalPage={totalPage} />
              </div>
              <div className="flex flex-col items-center gap-4 my-5">
                {!useEmbeddings ? (
                  <>
                    <RecommendOptionForm
                      searchOptionRef={searchOptionRef}
                      customQueryRef={customQueryRef}
                      setIsRecommendClicked={setIsRecommendClicked}
                      setHasSearchOptionChanged={setHasSearchOptionChanged}
                    />
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
                          disabled={hashtags.length === 0 || !!selectedFile || isRecommendClicked || isAnalysisLoading || (!hasSearchOptionChanged && isRecommendClickedEver)}
                        >
                          <img
                            src={hashtags.length === 0 || !!selectedFile || isRecommendClicked || isAnalysisLoading || (!hasSearchOptionChanged && isRecommendClickedEver) ? "/magicDisabled.svg" : "/magic.svg"}
                            alt="Magic wand icon"
                            className="w-4 h-4"
                          />
                          Recommend
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
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
                    disabled={!hasProcessedFootage || !hasProcessedAds || !!selectedFile || isRecommendClicked }
                  >
                    <img
                      src={!hasProcessedFootage || !hasProcessedAds || !!selectedFile || isRecommendClicked ? "/magicDisabled.svg" : "/magic.svg"}
                      alt="Magic wand icon"
                      className="w-4 h-4"
                    />
                    Recommend by Embeddings
                  </Button>
                )}
              </div>
            </>
          )}
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}

export default Ads
