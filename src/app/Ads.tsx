"use client";

import React, { useState } from 'react'
import Video from './Video';
import LoadingSpinner from './LoadingSpinner';
import ErrorFallback from './ErrorFallback';
import { useQuery } from "@tanstack/react-query";
import Button from './Button'
import PageNav from './PageNav';
import clsx from 'clsx'

type VideoType = {
  _id: string;
  title: string;
};

function Ads() {
  const [adsIndexId, setAdsIndexId] = useState<string | null>(null);
  const [page, setPage] = useState(1);

	// Fetch the ads index ID
	const {
		error: indexIdError,
		isLoading: isIndexIdLoading,
	} = useQuery({
		queryKey: ["adsIndexId"],
		queryFn: async () => {
			const response = await fetch('/api/getAdsIndexId');
			if (!response.ok) {
				throw new Error("Failed to fetch ads index ID");
			}
			const data = await response.json();
			setAdsIndexId(data.adsIndexId);
			return data;
		},
	});

  /** Fetches videos for the specified page */
	const fetchVideos = async (page: number, adsIndexId: string) => {
		if (!adsIndexId) {
			throw new Error("ads index ID is required");
		}
		const response = await fetch(`/api/getVideos?indexId=${adsIndexId}&page=${page}`);
		if (!response.ok) {
			throw new Error("Network response was not ok");
		}
		return response.json();
	};

  /** Queries the videos data for the specified page using React Query */
	const {
		data: videosData,
		error: videosError,
		isLoading: isVideosLoading,
		isFetching: isVideosFetching,
	} = useQuery({
		queryKey: ["videos", page, adsIndexId],
		queryFn: () => fetchVideos(page, adsIndexId!),
		enabled: !!adsIndexId,
	});

  const totalPage = videosData?.page_info?.total_page || 1;

  if (indexIdError || videosError) return <ErrorFallback error={indexIdError || videosError || new Error('Unknown error')} />;

	const isLoading = isIndexIdLoading || isVideosLoading || isVideosFetching;
	const hasVideoData = videosData && videosData.data && videosData.data.length > 0;

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-center text-2xl">Ads Library</h2>
      {isLoading ? (
        <LoadingSpinner />
      ) : !hasVideoData ? (
        <div>No videos available</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 justify-items-center">
          {videosData.data.map((video: VideoType) => (
            <Video key={video._id} video={video} indexId={adsIndexId || ''} />
          ))}
        </div>
      )}
         <div className={clsx("w-full", "flex", "justify-center", "mt-8")}>
              <PageNav page={page} setPage={setPage} totalPage={totalPage} />
            </div>
      {!isLoading && hasVideoData && (
        <div className="flex justify-center">
          <Button
            type="button"
            size="sm"
            appearance="primary"
          >
            Recommend
          </Button>
        </div>
      )}
    </div>
  )
}

export default Ads
