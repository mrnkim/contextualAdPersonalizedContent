"use client";

import React, { useState, useEffect } from 'react'
import Video from './Video';
import LoadingSpinner from './LoadingSpinner';
import { useQuery, useMutation } from "@tanstack/react-query";
import Button from './Button'
import FootageSummary from './FootageSummary';
import { fetchVideos, uploadFootage } from '@/hooks/apiHooks';

const PAGE = 1;

interface FootageProps {
	setHashtags: (hashtags: string[]) => void;
	indexId: string;
	isIndexIdLoading: boolean;
	footageVideoId: string;
	setFootageVideoId: (footageVideoId: string) => void;
  }

function Footage({ setHashtags, indexId, isIndexIdLoading, footageVideoId, setFootageVideoId }: FootageProps) {
	console.log("🚀 > Footage > indexId=", indexId)
	const [isAnalyzeClicked, setIsAnalyzeClicked] = useState(false);
	const [selectedFile, setSelectedFile] = useState(null);

	const { data: videos, isLoading: isVideosLoading } = useQuery({
		queryKey: ['videos', PAGE, indexId],
		queryFn: () => fetchVideos(PAGE,indexId),
		enabled: !!indexId && !isIndexIdLoading,
	});

	const uploadMutation = useMutation({
		mutationFn: (file: File) => uploadFootage(file, indexId),
	});

	const hasVideoData = videos?.data && videos?.data?.length > 0;

	useEffect(() => {
		if (videos?.data?.[0]?._id) {
			setFootageVideoId(videos.data[0]._id);
		}
	}, [videos, setFootageVideoId]);

	const handleFileChange = (event) => {
		setSelectedFile(event.target.files[0]);
	};

	const handleUpload = () => {
		if (!selectedFile) {
			alert('먼저 비디오를 선택해주세요.');
			return;
		}

		const formData = new FormData();
		formData.append('file', selectedFile);

		// 업로드 로직 실행
		uploadMutation.mutate(selectedFile);
	};

	return (
		<div className="flex flex-col items-center gap-4 w-full">
			<h2 className="text-2xl">News Footage</h2>
			<div className="flex justify-end items-center w-full">
				<input
					type="file"
					accept="video/*"
					onChange={handleFileChange}
					id="footage-upload"
				/>
				<button
					onClick={handleUpload}
					id="footage-upload-button"
				>
					Upload Footage
				</button>
			</div>
			{uploadMutation.isPending && <LoadingSpinner />}
			{uploadMutation.isError && <div>Upload failed: {uploadMutation.error.message}</div>}
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
