"use client";

import { useEffect, useState } from 'react';
import { useInfiniteQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { fetchVideos, fetchTaskDetails, uploadFootage } from '@/hooks/apiHooks';
import Button from './Button';
import Video from './Video';
import FootageSummary from './FootageSummary';
import LoadingSpinner from './LoadingSpinner';
import VideosDropDown from './VideosDropDown';
import UploadForm from './UploadForm';
import Task from './Task';
import { FootageProps, TaskDetails, VideosData } from './types';

function Footage({ hashtags, setHashtags, indexId, isIndexIdLoading, footageVideoId, setFootageVideoId, selectedFile, setSelectedFile, setIsRecommendClicked, setEmotions }: FootageProps) {
	const [isAnalyzeClicked, setIsAnalyzeClicked] = useState(false);
	const [taskId, setTaskId] = useState<string | null>(null);
	const [taskDetails, setTaskDetails] = useState<TaskDetails | null>(null);
	const [playing, setPlaying] = useState(false);

	const handleVideoChange = (newVideoId: string) => {
		reset();
		setFootageVideoId(newVideoId);
		queryClient.invalidateQueries({ queryKey: ['videos'] });
	};

	const {
		data: videosData,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		isLoading: isVideosLoading,
	} = useInfiniteQuery({
		queryKey: ['videos', indexId],
		queryFn: ({ pageParam }) => fetchVideos(pageParam, indexId),
		initialPageParam: 1,
		getNextPageParam: (lastPage) => {
			if (lastPage.page_info.page < lastPage.page_info.total_page) {
				return lastPage.page_info.page + 1;
			}
			return undefined;
		},
		enabled: !!indexId && !isIndexIdLoading,
	});

	const queryClient = useQueryClient();
	const hasVideoData = videosData?.pages[0]?.data && videosData.pages[0].data.length > 0;

	const uploadMutation = useMutation({
		mutationFn: (file: File) => uploadFootage(file, indexId),
		onSuccess: (data) => {
			setTaskId(data.taskId);
		},
	});

	const handleFileUpload = (file: File) => {
		setSelectedFile(file);
		uploadMutation.mutate(file);
	};

	const reset = () => {
		setIsAnalyzeClicked(false);
		setSelectedFile(null);
		setTaskId(null);
		setTaskDetails(null);
		setHashtags([]);
		setIsRecommendClicked(false)
	};

	useEffect(() => {
		let intervalId: NodeJS.Timeout | null = null;

		if (taskId) {
			const fetchTask = async () => {
				try {
					const details = await fetchTaskDetails(taskId);
					setTaskDetails(details);

					if (details.status === 'ready' || details.status === 'failed') {
						queryClient.invalidateQueries({ queryKey: ['videos', indexId] });
						if (intervalId) {
							clearInterval(intervalId);
						}
						reset();
					}
				} catch (error) {
					console.error('Error fetching task details:', error);
					reset();
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
	}, [queryClient, setHashtags, setIsRecommendClicked, setSelectedFile, taskId, indexId]);

	useEffect(() => {
		if (videosData?.pages[0]?.data && videosData.pages[0].data.length > 0) {
			const latestVideo = videosData.pages[0].data[0];
			if (latestVideo._id !== footageVideoId) {
				setFootageVideoId(latestVideo._id);
			}
		}
	}, [videosData]);

	return (
		<div className="flex flex-col items-center gap-4 w-full">
			<h2 className="text-2xl font-bold">News Footage</h2>
			<div className="flex items-center justify-center w-full">
				<div className="flex-grow mr-4 w-64">
					<VideosDropDown
						indexId={indexId}
						onVideoChange={handleVideoChange}
						videosData={videosData as VideosData}
						fetchNextPage={fetchNextPage}
						hasNextPage={hasNextPage}
						isFetchingNextPage={isFetchingNextPage}
						isLoading={isVideosLoading}
						selectedFile={selectedFile}
						taskId={taskId}
						footageVideoId={footageVideoId}
					/>
				</div>
				<div className="flex-shrink-0">
					<UploadForm
						selectedFile={selectedFile}
						taskId={taskId}
						onFileUpload={handleFileUpload}
					/>
				</div>
			</div>
			{uploadMutation.isPending && !taskId && (
    			<div className="flex flex-col w-full max-w-sm gap-4 items-center">
				<div className="text-center">Starting up the indexing engine...</div>
				<LoadingSpinner />
				</div>
			)}
			{taskDetails && (
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
							<Video videoId={footageVideoId || ''} indexId={indexId || ''} />
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
			{!selectedFile && isAnalyzeClicked && hasVideoData && (
				<FootageSummary videoId={footageVideoId} hashtags={hashtags} setHashtags={setHashtags} setEmotions={setEmotions} />
			)}
		</div>
	)
}

export default Footage
