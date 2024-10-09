"use client";

import React, { useState } from 'react'
import Video from './Video';
import LoadingSpinner from './LoadingSpinner';
import ErrorFallback from './ErrorFallback';
import { useQuery } from "@tanstack/react-query";
import Button from './Button'
import FootageSummary from './FootageSummary';

interface FootageProps {
	setHashtags: (hashtags: string[]) => void;
  }

function Footage({ setHashtags }: FootageProps) {
	const [footageIndexId, setFootageIndexId] = useState<string | null>(null);
	const [isAnalyzeClicked, setIsAnalyzeClicked] = useState(false);

	/** Fetch the footage index ID */
	const {
		error: indexIdError,
		isLoading: isIndexIdLoading,
	} = useQuery({
		queryKey: ["footageIndexId"],
		queryFn: async () => {
			const response = await fetch('/api/getFootageIndexId');
			if (!response.ok) {
				throw new Error("Failed to fetch footage index ID");
			}
			const data = await response.json();
			setFootageIndexId(data.footageIndexId);
			return data;
		},
	});

	/** Fetches videos for the specified page */
	const fetchVideos = async (page: number, footageIndexId: string) => {
		if (!footageIndexId) {
			throw new Error("Footage index ID is required");
		}
		const response = await fetch(`/api/getVideos?indexId=${footageIndexId}&page=${page}`);
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
		queryKey: ["videos", 1, footageIndexId],
		queryFn: () => fetchVideos(1, footageIndexId!),
		enabled: !!footageIndexId,
	});

	if (indexIdError || videosError) return <ErrorFallback error={indexIdError || videosError || new Error('Unknown error')} />;

	const isLoading = isIndexIdLoading || isVideosLoading || isVideosFetching;
	const hasVideoData = videosData && videosData.data && videosData.data.length > 0;

	return (
		<div className="flex flex-col items-center gap-4">
			<h2 className="text-2xl">News Footage</h2>
			{isLoading ? (
				<LoadingSpinner />
			) : !hasVideoData ? (
				<div>No videos available</div>
			) : (
				<Video video={videosData.data[0]} indexId={footageIndexId || ''} />
			)}
			{!isLoading && hasVideoData && (
				<Button
					type="button"
					size="sm"
					appearance="primary"
					onClick={() => setIsAnalyzeClicked(true)}
				>
					Analyze
				</Button>
			)}
			{isAnalyzeClicked && hasVideoData && (
				<FootageSummary videoId={videosData.data[0]._id} setHashtags={setHashtags} />
			)}
		</div>
	)
}

export default Footage
