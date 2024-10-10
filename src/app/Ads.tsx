"use client";

import React, { useState, useEffect } from 'react'
import Video from './Video';
import LoadingSpinner from './LoadingSpinner';
import ErrorFallback from './ErrorFallback';
import { useQuery } from "@tanstack/react-query";
import Button from './Button'
import PageNav from './PageNav';
import clsx from 'clsx'
import RecommendedAds from './RecommendedAds';
import { fetchVideos, fetchAdsIndexId } from '@/hooks/apiHooks';

type VideoType = {
  _id: string;
  title: string;
};

interface AdsProps {
  hashtags: string[];
  setHashtags: (hashtags: string[]) => void;
  indexId: string;
  isIndexIdLoading: boolean;
  footageVideoId: string;
}

function Ads({ hashtags, setHashtags, indexId, isIndexIdLoading, footageVideoId }: AdsProps) {
  const [page, setPage] = useState(1);
  const [isRecommendClicked, setIsRecommendClicked] = useState(false);

	/** Queries the videos data for the specified page using React Query */
	const {
		data: videosData,
		isLoading: isVideosLoading,
	} = useQuery({
		queryKey: ["videos", page, indexId],
		queryFn: () => fetchVideos(page, indexId!),
		enabled: !!indexId,
	});

  const totalPage = videosData?.page_info?.total_page || 1;


	const hasVideoData = videosData && videosData.data && videosData.data.length > 0;

  return (
    <div className="flex flex-col items-center gap-4">
      <h2 className="text-center text-2xl">Ads Library</h2>
      {isIndexIdLoading || isVideosLoading ? (
        <LoadingSpinner />
      ) : !hasVideoData ? (
        <div>No videos available</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 justify-items-center">
          {videosData.data.map((video: VideoType) => (
            <Video key={video._id} video={video} indexId={indexId || ''} />
          ))}
        </div>
      )}
         <div className={clsx("w-full", "flex", "justify-center", "mt-8")}>
              <PageNav page={page} setPage={setPage} totalPage={totalPage} />
            </div>
      {!isIndexIdLoading && hasVideoData && (
        <div className="flex justify-center">
          <Button
            type="button"
            size="sm"
            appearance="primary"
            onClick={() => setIsRecommendClicked(true)}
          >
            Recommend
          </Button>
        </div>
      )}
      {isRecommendClicked && hasVideoData && (
        <RecommendedAds hashtags={hashtags} setHashtags={setHashtags} footageVideoId={footageVideoId} indexId={indexId}/>
      )}
    </div>
  )
}

export default Ads
