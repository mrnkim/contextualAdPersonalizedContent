"use client";

import React, { useState, useEffect } from 'react'
import Video from './Video';
import LoadingSpinner from './LoadingSpinner';
import { useQuery } from "@tanstack/react-query";
import Button from './Button'
import FootageSummary from './FootageSummary';
import { fetchVideos } from '@/hooks/apiHooks';

const PAGE = 1;

interface FootageProps {
	setHashtags: (hashtags: string[]) => void;
	indexId: string;
	isIndexIdLoading: boolean;
	footageVideoId: string;
	setFootageVideoId: (footageVideoId: string) => void;
  }

function Footage({ setHashtags, indexId, isIndexIdLoading, footageVideoId, setFootageVideoId }: FootageProps) {
	const [isAnalyzeClicked, setIsAnalyzeClicked] = useState(false);

	const { data: videos, isLoading: isVideosLoading } = useQuery({
		queryKey: ['videos', PAGE, indexId],
		queryFn: () => fetchVideos(PAGE,indexId),
		enabled: !!indexId && !isIndexIdLoading,
	});

	console.log("🚀 > Footage > videos=", videos)
	const hasVideoData = videos?.data && videos?.data?.length > 0;

	useEffect(() => {
		if (videos?.data?.[0]?._id) {
			setFootageVideoId(videos.data[0]._id);
		}
	}, [videos, setFootageVideoId]);

	return (
		<div className="flex flex-col items-center gap-4">
			<h2 className="text-2xl">News Footage</h2>
			{isIndexIdLoading || isVideosLoading ? (
				<LoadingSpinner />
			) : !hasVideoData ? (
				<div>No videos available</div>
			) : (
				<Video video={videos.data[0]} indexId={indexId || ''} />
			)}
			{!isIndexIdLoading && !isVideosLoading && hasVideoData && (
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
				<FootageSummary videoId={footageVideoId} setHashtags={setHashtags} />
			)}
		</div>
	)
}

export default Footage
