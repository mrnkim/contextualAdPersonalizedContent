"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react'
import Video from './Video';
import LoadingSpinner from './LoadingSpinner';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ReactPlayer from "react-player";
import Button from './Button'
import FootageSummary from './FootageSummary';
import { fetchVideos, uploadFootage, fetchTaskDetails } from '@/hooks/apiHooks';
import ErrorFallback from './ErrorFallback';

const PAGE = 1;

interface FootageProps {
	setHashtags: (hashtags: string[]) => void;
	indexId: string;
	isIndexIdLoading: boolean;
	footageVideoId: string;
	setFootageVideoId: (footageVideoId: string) => void;
	selectedFile: File | null;
	setSelectedFile: (file: File | null) => void;
  }

interface TaskDetails {
  status: string;
  videoUrl?: string;
  thumbnailUrl?: string;
}

function Footage({ setHashtags, indexId, isIndexIdLoading, footageVideoId, setFootageVideoId, selectedFile, setSelectedFile }: FootageProps) {
	const [isAnalyzeClicked, setIsAnalyzeClicked] = useState(false);
	const [taskId, setTaskId] = useState<string | null>(null);
	const [taskDetails, setTaskDetails] = useState<TaskDetails | null>(null);
	const [playing, setPlaying] = useState(false);

	const { data: videos, isLoading: isVideosLoading } = useQuery({
		queryKey: ['videos', PAGE, indexId],
		queryFn: () => fetchVideos(PAGE,indexId),
		enabled: !!indexId && !isIndexIdLoading,
	});

	const uploadMutation = useMutation({
		mutationFn: (file: File) => uploadFootage(file, indexId),
		onSuccess: (data) => {
			setTaskId(data.taskId);
		},
	});

	const hasVideoData = videos?.data && videos?.data?.length > 0;

	const reset = () => {
		setIsAnalyzeClicked(false);
		setSelectedFile(null);
		setTaskId(null);
		setTaskDetails(null);
		setHashtags([]);
		queryClient.invalidateQueries({ queryKey: ['videos'] });
	};

	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleUploadClick = () => {
		fileInputRef.current?.click();
	};

	const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			setSelectedFile(file);
			uploadMutation.mutate(file);
		}
	};

	const queryClient = useQueryClient();

	useEffect(() => {
		let intervalId: NodeJS.Timeout | null = null;

		if (taskId) {
			const fetchTask = async () => {
				try {
					const details = await fetchTaskDetails(taskId);
					setTaskDetails(details);

					if (details.status === 'ready' || details.status === 'failed') {
						if (intervalId) {
							clearInterval(intervalId);
						}
						reset();
					}
				} catch (error) {
					console.error('Error fetching task details:', error);
				}
			};

			fetchTask();
			intervalId = setInterval(fetchTask, 5000);
		}

		return () => {
			if (intervalId) {
				clearInterval(intervalId);
			}
		};
	}, [taskId]);

	useEffect(() => {
		if (videos?.data?.[0]?._id) {
			setFootageVideoId(videos.data[0]._id);
		}
	}, [videos]);

	useEffect(() => {
		queryClient.invalidateQueries({ queryKey: ['videos'] });
	}, [videos]);

	return (
		<div className="flex flex-col items-center gap-4 w-full">
			<h2 className="text-2xl">News Footage</h2>
			<div className="flex justify-end items-center w-full my-4">
				<Button
					type="button"
					size="sm"
					appearance="primary"
					onClick={handleUploadClick}
					disabled={!!selectedFile || !!taskId}
				>
					Upload Footage
				</Button>
				<input
					ref={fileInputRef}
					type="file"
					accept="video/*"
					onChange={handleFileSelect}
					className="hidden"
				/>
			</div>
			{uploadMutation.isPending && <LoadingSpinner />}
			{uploadMutation.isError && <ErrorFallback error={uploadMutation.error}/>}
			{taskId && (
				<div className="flex flex-col w-full max-w-sm gap-4 items-center">
					<LoadingSpinner />
					{taskDetails && <div className="capitalize text-center">{taskDetails.status}</div>}
					{taskDetails && taskDetails.videoUrl &&
					 <div className="w-full aspect-video relative overflow-hidden rounded cursor-pointer" onClick={() => setPlaying(!playing)}>
						<ReactPlayer
							url={taskDetails.videoUrl}
							controls
							width="100%"
							height="100%"
							style={{ position: 'absolute', top: 0, left: 0 }}
							light={
							<img
								src={
								taskDetails.thumbnailUrl ||
								'/videoFallback.jpg'
								}
								className="object-cover w-full h-full"
								alt="thumbnail"
							/>
							}
							playing={playing}
							config={{
							file: {
								attributes: {
								preload: "auto",
								},
							},
							}}
							progressInterval={100}
					/>
					    </div>
					}
				</div>
			)}
			{!selectedFile && (
				<>
					{isIndexIdLoading || isVideosLoading ? (
						<LoadingSpinner />
					) : !hasVideoData ? (
						<div>No videos available</div>
					) : (
						<>
							<Video video={videos.data[0]} indexId={indexId || ''} />
							<Button
								type="button"
								size="sm"
								appearance="primary"
								onClick={() => setIsAnalyzeClicked(true)}
							>
								Analyze
							</Button>
						</>
					)}
				</>
			)}
			{isAnalyzeClicked && hasVideoData && (
				<FootageSummary videoId={footageVideoId} setHashtags={setHashtags} />
			)}
		</div>
	)
}

export default Footage
