import { useQuery } from '@tanstack/react-query';
import { ChaptersData, RecommendedPlacementsProps, VideoDetails } from './types';
import { generateChapters, fetchVideoDetails } from '@/hooks/apiHooks';
import React, {useState, useRef, useEffect, Suspense} from 'react'
import ReactPlayer from 'react-player';
import VideoThumbnail from './VideoThumbnail';
import { ErrorBoundary } from 'react-error-boundary'
import ErrorFallback from './ErrorFallback'
import LoadingSpinner from './LoadingSpinner';
import { Toaster, toast } from 'react-hot-toast';

const displayTimeRange = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const RecommendedPlacements = ({ footageVideoId, footageIndexId, selectedAd, adsIndexId, selectedChapter, setSelectedChapter }: RecommendedPlacementsProps) => {
    const playerRef = useRef<ReactPlayer>(null);
    const [playbackSequence, setPlaybackSequence] = useState<'footage' | 'ad'>('footage');
    const [returnToTime, setReturnToTime] = useState<number | null>(null);
    const [hasPlayedAd, setHasPlayedAd] = useState<boolean>(false);
    const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
    const [autoPlay, setAutoPlay] = useState<boolean>(false);

    useEffect(() => {
        // footage로 전환 시 returnToTime으로 이동
        if (playbackSequence === 'footage' && returnToTime !== null && !isTransitioning) {
            setIsTransitioning(true);
            if (playerRef.current) {
                playerRef.current.seekTo(returnToTime, 'seconds');
            }
            setIsTransitioning(false);
        }
    }, [playbackSequence, returnToTime]);

    useEffect(() => {
        // selectedAd가 null이 아닐 때만 리셋
        if (selectedAd) {
            setPlaybackSequence('footage');
            setSelectedChapter(null);
            setReturnToTime(null);
            setHasPlayedAd(false);
            setIsTransitioning(false);
            setAutoPlay(false);

            // Reset video to start
            if (playerRef.current) {
                playerRef.current.seekTo(0, 'seconds');
            }
        }
    }, [selectedAd?.id]);

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

    const { data: adVideoDetails } = useQuery<VideoDetails, Error>({
        queryKey: ["videoDetails", selectedAd?.id],
        queryFn: () => fetchVideoDetails(selectedAd!.id!, adsIndexId),
        enabled: !!selectedAd?.id && !!adsIndexId
    });

    const handleProgress = (state: { playedSeconds: number }) => {
        if (selectedChapter === null || !chaptersData || !adVideoDetails) {
            return;
        }

        const chapter = chaptersData.chapters[selectedChapter];
        const timeDiff = state.playedSeconds - chapter.end;

        // 챕터 끝 시점을 지나쳤고, 아직 광고를 재생하지 않았다면
        if (playbackSequence === 'footage' &&
            timeDiff >= 0 &&  // 챕터 끝 시점을 지났거나 도달했을 때
            !hasPlayedAd) {
            setPlaybackSequence('ad');
            setHasPlayedAd(true);

            // 광고 재생 전에 현재 챕터의 끝 시점으로 이동
            if (playerRef.current) {
                playerRef.current.seekTo(chapter.end, 'seconds');
            }
        }
    };

    const handleChapterClick = (index: number) => {
        if (playbackSequence === 'ad') {
            return;
        }

        if (!selectedAd) {
            toast.error("Please select an ad first");
            return;
        }
        if (!chaptersData) return;

        const chapter = chaptersData.chapters[index];

        setSelectedChapter(index);
        setHasPlayedAd(false);
        setPlaybackSequence('footage');
        setAutoPlay(true);

        if (playerRef.current) {
            const startTime = Math.max(0, chapter.end - 3);
            playerRef.current.seekTo(startTime, 'seconds');
        }
    };

    const handleAdEnded = () => {
        if (selectedChapter === null || !chaptersData) return;

        const chapter = chaptersData.chapters[selectedChapter];
        const isLastChapter = selectedChapter === chaptersData.chapters.length - 1;

        setPlaybackSequence('footage');

        if (isLastChapter) {
            setReturnToTime(0);
            setAutoPlay(false);
        } else {
            setReturnToTime(chapter.end);
            setAutoPlay(true);
        }
    };

    return (
        <ErrorBoundary FallbackComponent={ErrorFallback}>
            <Toaster position="top-center" />
            <div className="mt-10">
                <h2 className="text-2xl text-center font-bold mt-6 mb-12">Recommended Placements</h2>

                <div className="w-full aspect-video relative mb-8">
                    {playbackSequence === 'ad' && adVideoDetails ? (
                        <ReactPlayer
                            url={adVideoDetails.hls.video_url}
                            controls
                            width="100%"
                            height="100%"
                            playing={true}
                            onProgress={handleProgress}
                            onEnded={handleAdEnded}
                        />
                    ) : (
                        videoDetail && (
                            <ReactPlayer
                                ref={playerRef}
                                url={videoDetail.hls.video_url}
                                controls
                                width="100%"
                                height="100%"
                                playing={autoPlay}
                                onProgress={handleProgress}
                            />
                        )
                    )}
                </div>

                <div className="relative w-full h-16 bg-gray-100 rounded">
                    {isChaptersLoading ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <LoadingSpinner />
                        </div>
                    ) : (
                        <>
                    {selectedAd && <span className="text-xs font-bold mb-0.5 text-left block">Step 4. Select a placement</span>}
                            <div className="absolute w-full h-1 bg-black top-1/2 -translate-y-1/2 z-0">
                            </div>
                            {chaptersData?.chapters?.map((chapter, index) => (
                                <div
                                    key={`timeline-${index}`}
                                    className={`absolute w-4 h-4 rounded-full -translate-y-1/2 -translate-x-1/2 z-10
                                        ${selectedChapter === index
                                            ? 'bg-green-700 ring-2 ring-black'
                                            : 'bg-white ring-2 ring-black'}
                                        ${playbackSequence === 'ad'
                                            ? 'cursor-not-allowed'
                                            : 'cursor-pointer hover:scale-110 transition-transform'}`}
                                    style={{
                                        left: `${(chapter.end / (videoDetail?.metadata?.duration || 1)) * 100}%`,
                                        top: '50%'
                                    }}
                                    onClick={() => handleChapterClick(index)}
                                >
                                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-sm whitespace-nowrap">
                                        {displayTimeRange(chapter.end)}
                                    </div>
                                </div>
                            ))}
                        </>
                    )}
                </div>
            </div>
        </ErrorBoundary>
    );
}

export default RecommendedPlacements
