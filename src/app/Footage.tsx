"use client";

import React, { useState, useEffect, useCallback } from 'react'
import Video from './Video';
import LoadingSpinner from './LoadingSpinner';
import { useQuery, useMutation } from "@tanstack/react-query";
import Button from './Button'
import FootageSummary from './FootageSummary';
import { fetchVideos, uploadFootage, fetchTaskDetails } from '@/hooks/apiHooks';

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
	const [selectedFile, setSelectedFile] = useState(null);
	const [taskId, setTaskId] = useState<string | null>(null);
	const [taskDetails, setTaskDetails] = useState<object | null>(null);

	const { data: videos, isLoading: isVideosLoading } = useQuery({
		queryKey: ['videos', PAGE, indexId],
		queryFn: () => fetchVideos(PAGE,indexId),
		enabled: !!indexId && !isIndexIdLoading,
	});

	const uploadMutation = useMutation({
		mutationFn: (file: File) => uploadFootage(file, indexId),
		onSuccess: (data) => {
			setTaskId(data.taskId);
			// You might want to start polling for task status here
		},
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
			alert('Select a video file');
			return;
		}

		uploadMutation.mutate(selectedFile);
	};

	// Add this new useEffect
	useEffect(() => {
		let intervalId: NodeJS.Timeout;

		if (taskId) {
			const checkTaskStatus = async () => {
				try {
					const taskDetails = await fetchTaskDetails(taskId);
					setTaskDetails(taskDetails);

					// If task is completed or failed, clear the interval
					if (taskDetails.status === 'ready' || taskDetails.status === 'failed') {
						clearInterval(intervalId);
						setTaskId(null); // Reset taskId when the task is complete
					}
				} catch (error) {
					console.error('Failed to fetch task details:', error);
					clearInterval(intervalId); // Clear interval on error as well
				}
			};

			// Initial check
			checkTaskStatus();

			// Set up interval
			intervalId = setInterval(checkTaskStatus, 5000);
		}

		// Cleanup function
		return () => {
			if (intervalId) {
				clearInterval(intervalId);
			}
		};
	}, [taskId]);

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
			{taskId && (
				<div>
					Upload successful. Task ID: {taskId}
					{taskDetails && <div>Task Status: {taskDetails.status}</div>}
				</div>
			)}
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
