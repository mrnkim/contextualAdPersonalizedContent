import { useQuery } from '@tanstack/react-query';
import { ChaptersData, VideoDetails } from './types';
import { generateChapters, fetchVideoDetails } from '@/hooks/apiHooks';
import React, {useState, useRef, useEffect, Suspense} from 'react'
import ReactPlayer from 'react-player';
import VideoThumbnail from './VideoThumbnail';
import { ErrorBoundary } from 'react-error-boundary'
import ErrorFallback from './ErrorFallback'
import LoadingSpinner from './LoadingSpinner';

interface RecommendedPlacementsProps {
  footageVideoId: string;
  footageIndexId: string;
}

const RecommendedPlacements = ({ footageVideoId, footageIndexId }: RecommendedPlacementsProps) => {
    const [playingState, setPlayingState] = useState<{
        isPlaying: boolean;
        chapterIndex: number | null;
    }>({
        isPlaying: false,
        chapterIndex: null
    });
    const playerRef = useRef<ReactPlayer>(null);

    const { data: chaptersData, isLoading: isChaptersLoading } = useQuery<ChaptersData, Error>({
        queryKey: ["chapters", footageVideoId],
        queryFn: () => generateChapters(footageVideoId),
    });

    const { data: videoDetail } = useQuery<VideoDetails, Error>({
        queryKey: ["videoDetail", footageVideoId],
        queryFn: () => {
            if (!footageVideoId) {
                throw new Error("Footage Video ID is missing");
            }
            return fetchVideoDetails(footageVideoId, footageIndexId);
        },
        staleTime: 600000,
        gcTime: 900000,
        enabled: !!footageIndexId && (!!footageVideoId),
    });

    const handleProgress = (state: { playedSeconds: number }) => {
        if (playingState.chapterIndex !== null && chaptersData?.chapters && videoDetail?.metadata?.duration) {
            const chapter = chaptersData.chapters[playingState.chapterIndex];
            const endTime = Math.min(chapter.end, videoDetail.metadata.duration);
            if (state.playedSeconds >= endTime) {
                setPlayingState({
                    isPlaying: false,
                    chapterIndex: null
                });
                if (playerRef.current) {
                    playerRef.current.seekTo(chapter.end, 'seconds');
                }
            }
        }
    };

    useEffect(() => {
        if (playingState.chapterIndex !== null && playerRef.current && chaptersData?.chapters) {
            const chapter = chaptersData.chapters[playingState.chapterIndex];
            const seekTime = chapter.end;
            playerRef.current.seekTo(seekTime, 'seconds');
        }
    }, [playingState.chapterIndex, chaptersData]);

    const handlePlay = (index: number) => {
        setPlayingState(prev => {
            if (prev.chapterIndex === index) {
                return {
                    ...prev,
                    isPlaying: !prev.isPlaying
                };
            }
            return {
                isPlaying: true,
                chapterIndex: index
            };
        });
    };

    const displayTimeRange = (chapterEnd: number) => {
        const end = videoDetail?.metadata?.duration
            ? Math.min(chapterEnd, videoDetail.metadata?.duration)
            : chapterEnd;

        const formatTime = (seconds: number): string => {
            const hours = Math.floor(seconds / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            const secs = Math.floor(seconds % 60);

            return [
                hours.toString().padStart(2, "0"),
                minutes.toString().padStart(2, "0"),
                secs.toString().padStart(2, "0"),
            ].join(":");
        };

        return `${formatTime(end)}`;
    };

    const handleChapterClick = (time: number) => {
        if (playerRef.current) {
            playerRef.current.seekTo(time, 'seconds');
            setPlayingState({
                isPlaying: true,
                chapterIndex: null
            });
        }
    };

    return (
        <ErrorBoundary FallbackComponent={ErrorFallback}>
            <div className="mt-32">
                <h2 className="text-2xl text-center font-bold mt-20 mb-10">Video Timeline</h2>

                <div className="w-full aspect-video relative mb-8">
                    {videoDetail && (
                        <ReactPlayer
                            ref={playerRef}
                            url={videoDetail?.hls?.video_url}
                            controls
                            width="100%"
                            height="100%"
                            playing={playingState.isPlaying}
                            config={{
                                file: {
                                    forceHLS: true,
                                    hlsOptions: {},
                                    attributes: { preload: "auto" }
                                },
                            }}
                        />
                    )}
                </div>

                <div className="relative w-full h-16 bg-gray-100 rounded">
                    <div className="absolute w-full h-1 bg-gray-300 top-1/2 -translate-y-1/2">
                        {chaptersData?.chapters?.map((chapter, index) => (
                            <div
                                key={`timeline-${index}`}
                                className="absolute w-4 h-4 bg-blue-500 rounded-full -translate-y-1/2 -translate-x-1/2 cursor-pointer hover:scale-110 transition-transform"
                                style={{
                                    left: `${(chapter.end / (videoDetail?.metadata?.duration || 1)) * 100}%`,
                                    top: '50%'
                                }}
                                onClick={() => handleChapterClick(chapter.end)}
                            >
                                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-sm whitespace-nowrap">
                                    {displayTimeRange(chapter.end)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </ErrorBoundary>
    );
}

export default RecommendedPlacements
