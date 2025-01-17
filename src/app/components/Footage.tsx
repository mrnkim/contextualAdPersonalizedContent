"use client";

import { useEffect, useState, useCallback } from 'react';
import { useInfiniteQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { fetchVideos, fetchTaskDetails, uploadFootage, checkVectorExists, getAndStoreEmbeddings } from '@/hooks/apiHooks';
import Button from './Button';
import Video from './Video';
import FootageSummary from './FootageSummary';
import LoadingSpinner from './LoadingSpinner';
import VideosDropDown from './VideosDropDown';
import UploadForm from './UploadForm';
import Task from './Task';
import { FootageProps, TaskDetails, VideosData } from '@/app/types';
import { usePlayer } from '@/contexts/PlayerContext';

function Footage({ hashtags, setHashtags, indexId, isIndexIdLoading, footageVideoId, setFootageVideoId, selectedFile, setSelectedFile, setIsRecommendClicked, gistData, customTextsData, isLoading, error, setIsRecommendClickedEver, setSelectedAd, setSelectedChapter, isAnalyzeClicked, setIsAnalyzeClicked, hasProcessedFootage, setHasProcessedFootage, useEmbeddings }: FootageProps) {
	const [showAnalysis, setShowAnalysis] = useState(false);
	const [taskId, setTaskId] = useState<string | null>(null);
	const [taskDetails, setTaskDetails] = useState<TaskDetails | null>(null);
	const [playing, setPlaying] = useState(false);
	const [processingVideos, setProcessingVideos] = useState(false);

	const { currentPlayerId, setCurrentPlayerId } = usePlayer();
	const queryClient = useQueryClient();

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

	const uploadMutation = useMutation({
		mutationFn: (file: File) => {
			return uploadFootage(file, indexId);
		},
		onSuccess: (data) => {
			setTaskId(data.taskId);
		},
		onError: (error) => {
			console.error('Upload mutation failed:', {
				error,
				message: error instanceof Error ? error.message : 'Unknown error'
			});
		},
	});

	const hasVideoData = videosData?.pages[0]?.data && videosData.pages[0].data.length > 0;

	const handleVideoChange = (newVideoId: string) => {
		reset();
		setFootageVideoId(newVideoId);
		queryClient.invalidateQueries({ queryKey: ['videos'] });
		queryClient.invalidateQueries({ queryKey: ['search'] });
		queryClient.invalidateQueries({ queryKey: ['chapters'] });
		queryClient.invalidateQueries({ queryKey: ['videoDetails'] });
	};

	const handleFileUpload = (file: File) => {
		setSelectedFile(file);
		uploadMutation.mutate(file);
	};

	const reset = useCallback(() => {
		setIsAnalyzeClicked(false);
		setShowAnalysis(false);
		setSelectedFile(null);
		setTaskId(null);
		setTaskDetails(null);
		setHashtags([]);
		setIsRecommendClicked(false);
		setIsRecommendClickedEver(false);
		setSelectedAd(null);
		setSelectedChapter(null);
		setHasProcessedFootage(false);
	}, [
		setIsAnalyzeClicked,
		setShowAnalysis,
		setSelectedFile,
		setTaskId,
		setTaskDetails,
		setHashtags,
		setIsRecommendClicked,
		setIsRecommendClickedEver,
		setSelectedAd,
		setSelectedChapter,
		setHasProcessedFootage,
	]);

	const processFootageVideo = useCallback(async () => {
		if (!indexId || !footageVideoId) return;
		setProcessingVideos(true);
		try {
			const vectorExists = await checkVectorExists(footageVideoId);
			if (!vectorExists) {
				await getAndStoreEmbeddings(indexId, footageVideoId);
			}
			if (typeof setHasProcessedFootage === 'function') {
				setHasProcessedFootage(true);
			}
		} catch (error) {
			console.error("Error processing video:", error);
		} finally {
			setProcessingVideos(false);
		}
	}, [indexId, footageVideoId, setHasProcessedFootage]);

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
					console.error('Error in task polling:', {
						error,
						message: error instanceof Error ? error.message : 'Unknown error'
					});
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
	}, [queryClient, setHashtags, setIsRecommendClicked, setSelectedFile, taskId, indexId, reset]);

	useEffect(() => {
		if (videosData?.pages[0]?.data && videosData.pages[0].data.length > 0) {
			if (!footageVideoId) {
				setFootageVideoId(videosData.pages[0].data[0]._id);
			}
		}
	}, [videosData, footageVideoId, setFootageVideoId]);

	useEffect(() => {
		if (indexId && footageVideoId && !hasProcessedFootage && useEmbeddings) {
			processFootageVideo();
		}
	}, [indexId, footageVideoId, hasProcessedFootage, processFootageVideo, useEmbeddings]);

	return (
		<div className="flex flex-col gap-4 w-full">
			<h2 className="text-2xl font-bold text-left">Source Footage</h2>
			{processingVideos && (
				<div className="flex items-center justify-center gap-2 text-sm text-gray-500">
					<LoadingSpinner size="sm" color="default" />
					Processing video embeddings...
				</div>
			)}
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
						isLoading={isLoading}
						isAnalyzeClicked={isAnalyzeClicked}
					/>
				</div>
			</div>
			{uploadMutation.isPending && !taskId && (
				<div className="flex flex-col w-full max-w-sm gap-4 items-center mx-auto">
					<div className="text-center">Starting up the indexing engine...</div>
					<LoadingSpinner />
				</div>
			)}
			{taskDetails && (
				<div className="flex justify-center w-full">
					<Task taskDetails={taskDetails} playing={playing} setPlaying={setPlaying} />
				</div>
			)}
			{!selectedFile && (
				<>
					{isIndexIdLoading || isVideosLoading ? (
						<LoadingSpinner />
					) : !hasVideoData ? (
						<div>No videos available</div>
					) : (
						<div className="flex flex-col items-center">
							<Video
								videoId={footageVideoId || ''}
								indexId={indexId || ''}
								playing={currentPlayerId === `footage-${footageVideoId}`}
								onPlay={() => setCurrentPlayerId(`footage-${footageVideoId}`)}
							/>
							<div className="w-fit">
								{!useEmbeddings && (
									<span className="text-xs font-bold mb-0.5 mt-3 text-left block">Step 1</span>
								)}
								<div className={`flex gap-2 ${!useEmbeddings ? '' : 'mt-6'}`}>
									<Button
										type="button"
										size="sm"
										appearance="primary"
										onClick={() => setIsAnalyzeClicked(true)}
										disabled={isAnalyzeClicked || hashtags.length > 0 || customTextsData?.length > 0}
									>
										<div className="flex items-center">
											<img
												src={isAnalyzeClicked || hashtags.length > 0 || customTextsData?.length > 0 ? "/analyzeDisabled.svg" : "/analyze.svg"}
												alt="magic stick icon"
												className="w-4 h-4 mr-1"
											/>
											Analyze
										</div>
									</Button>
									{(isAnalyzeClicked || hashtags.length > 0 || customTextsData?.length > 0) && (
										<Button
											type="button"
											size="sm"
											appearance="secondary"
											onClick={() => {
												if (isAnalyzeClicked || (hashtags.length > 0 || customTextsData?.length > 0)) {
													setShowAnalysis(!showAnalysis);
												}
											}}
										>
											{isAnalyzeClicked && isLoading ? <LoadingSpinner /> : 'View Analysis'}
										</Button>
									)}
								</div>
							</div>
						</div>
					)}
				</>
			)}
			{!selectedFile && showAnalysis && hasVideoData && (
				<FootageSummary
					hashtags={hashtags}
					setHashtags={setHashtags}
					gistData={gistData}
					customTextsData={customTextsData}
					isLoading={isLoading}
					error={error}
					setShowAnalysis={setShowAnalysis}
				/>
			)}
		</div>
	)
}

export default Footage
