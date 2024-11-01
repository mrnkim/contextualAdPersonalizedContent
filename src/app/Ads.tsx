"use client";

import React, { useState, Suspense } from 'react'
import Video from './Video';
import LoadingSpinner from './LoadingSpinner';
import ErrorFallback from './ErrorFallback';
import { useQuery } from "@tanstack/react-query";
import Button from './Button'
import PageNav from './PageNav';
import clsx from 'clsx'
// import RecommendedAds from './RecommendedAds';
import { fetchVideos } from '@/hooks/apiHooks';
import { ErrorBoundary } from 'react-error-boundary';
import { AdsProps } from './types';
import { is } from '../../.next/static/webpack/main.ed2b4069190f5e6e.hot-update';

type VideoType = {
  _id: string;
  title: string;
};

function Ads({ hashtags, setHashtags, indexId, isIndexIdLoading, footageVideoId, selectedFile, isRecommendClicked, setIsRecommendClicked, emotions, searchOptionRef, customQueryRef, isAnalysisLoading }: AdsProps) {
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
            emotions={emotions}
            searchOptionRef={searchOptionRef}
            customQueryRef={customQueryRef}
            isAnalysisLoading={isAnalysisLoading}
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
  // hashtags,
  // setHashtags,
  // footageVideoId,
  // emotions,
  searchOptionRef,
  customQueryRef,
  isAnalysisLoading
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
  emotions: string[];
  searchOptionRef: React.RefObject<HTMLFormElement>;
  customQueryRef: React.RefObject<HTMLInputElement>;
  isAnalysisLoading: boolean;
}) {


  const { data: videosData, isLoading } = useQuery({
    queryKey: ["videos", page, indexId],
    queryFn: () => fetchVideos(page, indexId!),
    enabled: !!indexId,
  });

  const totalPage = videosData?.page_info?.total_page || 1;
  const hasVideoData = videosData && videosData.data && videosData.data.length > 0;

  if (isIndexIdLoading || isLoading) {
    return <LoadingSpinner />;
  }

  if (!hasVideoData) {
    return <div className="text-center py-8">There are no videos in this index</div>;
  }

  const handleSearchOptionChange = () => {
    setIsRecommendClicked(false);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsRecommendClicked(true);
  };

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
      <div className="flex flex-col items-center gap-4">
        <form ref={searchOptionRef} onSubmit={handleFormSubmit}>
          <div className="flex gap-4 items-center">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="searchOption"
                value="general"
                defaultChecked
                onChange={handleSearchOptionChange}
              />
              General
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="searchOption"
                value="emotion"
                onChange={handleSearchOptionChange}
              />
              Emotion
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="searchOption"
                value="visual"
                onChange={handleSearchOptionChange}
              />
              Visual
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="searchOption"
                value="conversation"
                onChange={handleSearchOptionChange}
              />
              Conversation
            </label>
          </div>
          <div className="flex items-center gap-2 w-full max-w-md">
            <label className="flex items-center gap-2 shrink-0">
              <input
                type="radio"
                name="searchOption"
                value="custom"
                id="customRadio"
                onChange={handleSearchOptionChange}
              />
              Custom
            </label>
            <input
              type="text"
              ref={customQueryRef}
              placeholder="Enter custom search query"
              className="border px-2 py-1 flex-1"
              onChange={handleSearchOptionChange}
              onFocus={() => {
                const customRadio = document.getElementById('customRadio') as HTMLInputElement;
                if (customRadio) customRadio.checked = true;
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  setIsRecommendClicked(true);
                }
              }}
            />
          </div>
        </form>
        <div className="w-fit">
									<span className="text-xs font-bold mb-0.5 text-left block">Step 2</span>
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              appearance="primary"
            onClick={() => setIsRecommendClicked(true)}
            disabled={!!selectedFile || isRecommendClicked || isAnalysisLoading}
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
      {/* {isRecommendClicked && !selectedFile && (
        <RecommendedAds
          hashtags={hashtags}
          setHashtags={setHashtags}
          footageVideoId={footageVideoId}
          indexId={indexId}
          selectedFile={selectedFile}
          setIsRecommendClicked={setIsRecommendClicked}
          searchOptionRef={searchOptionRef}
          customQueryRef={customQueryRef}
          emotions={emotions}
        />
      )} */}
    </>
  );
}

export default Ads
