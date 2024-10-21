"use client";

import React, { useState, useEffect, useRef} from 'react'
import Video from './Video';
import LoadingSpinner from './LoadingSpinner';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Task from './Task';
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
	setIsRecommendClicked: (isRecommendClicked: boolean) => void;
  }



function Footage({ setHashtags, indexId, isIndexIdLoading, footageVideoId, setFootageVideoId, selectedFile, setSelectedFile, setIsRecommendClicked }: FootageProps) {
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
		setIsRecommendClicked(false)
		queryClient.invalidateQueries({ queryKey: ['videos'] });
		queryClient.invalidateQueries({ queryKey: ['gist'] });
		queryClient.invalidateQueries({ queryKey: ['search'] });
		queryClient.invalidateQueries({ queryKey: ['customTexts'] });
		queryClient.invalidateQueries({ queryKey: ['adCopy'] });
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
			setIsAnalyzeClicked(false);
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
			<h2 className="text-2xl font-bold">News Footage</h2>
			<div className="flex justify-end items-center w-full my-3">
				<Button
					type="button"
					size="sm"
					appearance="default"
					onClick={handleUploadClick}
					disabled={!!selectedFile || !!taskId}
				>
					<img
           	 			src={selectedFile ? "/uploadDisabled.svg" : "/upload.svg"}
						alt="upload icon"
						className="w-4 h-4"
					/>
					Upload
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
				<Task taskDetails={taskDetails} playing={playing} setPlaying={setPlaying} />
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
								disabled={isAnalyzeClicked}
							>
								<img
									src={isAnalyzeClicked ? "/analyzeDisabled.svg" : "/analyze.svg"}
									alt="magic stick icon"
									className="w-4 h-4"
								/>
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
