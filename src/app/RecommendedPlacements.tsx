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

    console.log("🚀 > RecommendedPlacements > videoDetail=", videoDetail)
    const handleProgress = (state: { playedSeconds: number }) => {
        if (playingState.chapterIndex !== null && chaptersData?.chapters && videoDetail?.metadata?.duration) {
            const chapter = chaptersData.chapters[playingState.chapterIndex];
            const endTime = Math.min(chapter.end + 2, videoDetail.metadata.duration);
            if (state.playedSeconds >= endTime) {
                setPlayingState({
                    isPlaying: false,
                    chapterIndex: null
                });
                if (playerRef.current) {
                    playerRef.current.seekTo(chapter.end - 2, 'seconds');
                }
            }
        }
    };

    useEffect(() => {
        if (playingState.chapterIndex !== null && playerRef.current && chaptersData?.chapters) {
            const chapter = chaptersData.chapters[playingState.chapterIndex];
            const seekTime = chapter.end - 2;
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
        const start = Math.max(0, chapterEnd - 2);
        const end = videoDetail?.metadata?.duration
            ? Math.min(chapterEnd + 2, videoDetail.metadata?.duration)
            : chapterEnd + 2;

        // 시간을 mm:ss 형식으로 변환
        const formatTime = (seconds: number) => {
            const mins = Math.floor(seconds / 60);
            const secs = Math.floor(seconds % 60);
            return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        };

        return `${formatTime(start)} - ${formatTime(end)}`;
    };

    return (
        <ErrorBoundary
            FallbackComponent={({ error }) =>
                <ErrorFallback error={error} />
            }
        >
            <div>
                <h2 className="text-2xl text-center font-bold my-20">Recommended Ad Placements</h2>
                <div className="grid grid-cols-3 items-center gap-4">
                    {isChaptersLoading ? (
                        <div className="col-span-3 flex justify-center items-center">
                            <LoadingSpinner />
                        </div>
                    ) : chaptersData?.chapters?.map((chapter, index) => (
                        <div key={`chapter-${index}`}>
                            <div
                                className="w-full h-0 pb-[56.25%] relative overflow-hidden rounded cursor-pointer"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handlePlay(index);
                                }}
                            >
                                <div className="absolute inset-0">
                                    {!videoDetail ? (
                                        <div className="flex justify-center items-center h-full bg-gray-100">
                                            <LoadingSpinner />
                                        </div>
                                    ) : (
                                        <VideoThumbnail
                                            footageIndexId={footageIndexId}
                                            videoId={footageVideoId}
                                            time={Math.round(chapter.end - 2)}
                                        />
                                    )}
                                </div>

                                <div className={`absolute inset-0 transition-opacity duration-300 ${playingState.chapterIndex === index && playingState.isPlaying ? 'opacity-100' : 'opacity-0'}`}>
                                    {!videoDetail ? (
                                        <div className="flex justify-center items-center h-full bg-gray-100">
                                            <LoadingSpinner />
                                        </div>
                                    ) : (
                                        <ReactPlayer
                                            key={`player-${index}`}
                                            ref={index === playingState.chapterIndex ? playerRef : null}
                                            url={videoDetail?.hls?.video_url}
                                            controls
                                            width="100%"
                                            height="100%"
                                            style={{ position: 'absolute', top: 0, left: 0 }}
                                            playing={playingState.chapterIndex === index && playingState.isPlaying}
                                            config={{
                                                file: {
                                                    forceHLS: true,
                                                    hlsOptions: {},
                                                    attributes: {
                                                        preload: "auto",
                                                    }
                                                },
                                            }}
                                            progressInterval={100}
                                            onProgress={handleProgress}
                                        />
                                    )}
                                </div>
                            </div>
                            <div className="mt-2">
                                <p className="text-body3 text-grey-700 text-center">
                                    {displayTimeRange(chapter.end)}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </ErrorBoundary>
    );
}

export default RecommendedPlacements
