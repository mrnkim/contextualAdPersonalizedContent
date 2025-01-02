import { useQuery } from '@tanstack/react-query';
import { ChaptersData, RecommendedPlacementsProps, VideoDetails } from '@/app/types';
import { generateChapters, fetchVideoDetails } from '@/hooks/apiHooks';
import React, { useState, useRef, useEffect } from 'react'
import ReactPlayer from 'react-player';
import { ErrorBoundary } from 'react-error-boundary'
import ErrorFallback from './ErrorFallback'
import LoadingSpinner from './LoadingSpinner';
import { Toaster, toast } from 'react-hot-toast';
import { usePlayer } from '@/contexts/PlayerContext';

const displayTimeRange = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const RecommendedPlacements = ({ footageVideoId, footageIndexId, selectedAd, adsIndexId, selectedChapter, setSelectedChapter }: RecommendedPlacementsProps) => {
    const { currentPlayerId, setCurrentPlayerId } = usePlayer();
    const playerRef = useRef<ReactPlayer>(null);
    const [playbackSequence, setPlaybackSequence] = useState<'footage' | 'ad'>('footage');
    const [returnToTime, setReturnToTime] = useState<number | null>(null);
    const [hasPlayedAd, setHasPlayedAd] = useState<boolean>(false);
    const [isTransitioning, setIsTransitioning] = useState<boolean>(false);

    useEffect(() => {
        if (playbackSequence === 'footage' && returnToTime !== null && !isTransitioning) {
            setIsTransitioning(true);
            if (playerRef.current) {
                playerRef.current.seekTo(returnToTime, 'seconds');
            }
            setIsTransitioning(false);
        }
    }, [playbackSequence, returnToTime]);

    useEffect(() => {
        if (selectedAd) {
            setPlaybackSequence('footage');
            setSelectedChapter(null);
            setReturnToTime(null);
            setHasPlayedAd(false);
            setIsTransitioning(false);

            if (playerRef.current) {
                playerRef.current.seekTo(0, 'seconds');
            }
        }
    }, [selectedAd?.id]);

    useEffect(() => {
        if (playbackSequence === 'ad' && selectedAd) {
            setCurrentPlayerId(`recommended-ad-${selectedAd.id}`);
        }
    }, [playbackSequence, selectedAd]);

    const { data: chaptersData, isLoading: isChaptersLoading } = useQuery<ChaptersData, Error>({
        queryKey: ["chapters", footageVideoId],
        queryFn: () => generateChapters(footageVideoId),
    });

    const { data: footageVideoDetail } = useQuery<VideoDetails, Error>({
        queryKey: ["footageVideoDetail", footageVideoId],
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

    const { data: adVideoDetail } = useQuery<VideoDetails, Error>({
        queryKey: ["adVideoDetail", selectedAd?.id],
        queryFn: () => fetchVideoDetails(selectedAd!.id!, adsIndexId),
        enabled: !!selectedAd?.id && !!adsIndexId
    });

    const handleProgress = (state: { playedSeconds: number }) => {
        if (selectedChapter === null || !chaptersData || !adVideoDetail) {
            return;
        }

        const chapter = chaptersData.chapters[selectedChapter];
        const timeDiff = state.playedSeconds - chapter.end;
        const isLastChapter = selectedChapter === chaptersData.chapters.length - 1;

        if (playbackSequence === 'footage' &&
            !hasPlayedAd &&
            ((isLastChapter && Math.abs(timeDiff) < 0.5) ||
             (!isLastChapter && timeDiff >= 0))) {
            setPlaybackSequence('ad');
            setHasPlayedAd(true);

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
        setCurrentPlayerId(`recommended-${footageVideoId}`);

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
        setCurrentPlayerId(`recommended-${footageVideoId}`);

        if (isLastChapter) {
            setReturnToTime(0);
        } else {
            setReturnToTime(chapter.end);
        }
    };

    return (
        <ErrorBoundary FallbackComponent={ErrorFallback}>
            <Toaster
                position="top-center"
                toastOptions={{
                    duration: 1000,
                    style: {
                        marginTop: '50vh',
                        transform: 'translateY(-50%)'
                    }
                }}
            />
            <div className="mt-10">
                <h2 className="text-2xl text-center font-bold mt-6 mb-12">Recommended Placements</h2>

                <div className="w-full aspect-video relative mb-8">
                    {playbackSequence === 'ad' && adVideoDetail ? (
                        <ReactPlayer
                            url={adVideoDetail.hls.video_url}
                            controls
                            width="100%"
                            height="100%"
                            playing={currentPlayerId === `recommended-ad-${selectedAd?.id}`}
                            onPlay={() => setCurrentPlayerId(`recommended-ad-${selectedAd?.id}`)}
                            onProgress={handleProgress}
                            onEnded={handleAdEnded}
                        />
                    ) : (
                        footageVideoDetail && (
                            <ReactPlayer
                                ref={playerRef}
                                url={footageVideoDetail.hls.video_url}
                                controls
                                width="100%"
                                height="100%"
                                playing={currentPlayerId === `recommended-${footageVideoId}`}
                                onPlay={() => setCurrentPlayerId(`recommended-${footageVideoId}`)}
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
                                        left: `${(chapter.end / (footageVideoDetail?.metadata?.duration || 1)) * 100}%`,
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
