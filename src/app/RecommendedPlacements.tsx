import { useQuery } from '@tanstack/react-query';
import { ChaptersData, RecommendedAdProps, VideoDetails } from './types';
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
  selectedAd: RecommendedAdProps["recommendedAd"] | null;
  adsIndexId: string;
}

const displayTimeRange = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const RecommendedPlacements = ({ footageVideoId, footageIndexId, selectedAd, adsIndexId }: RecommendedPlacementsProps) => {
    const playerRef = useRef<ReactPlayer>(null);
    const [playbackSequence, setPlaybackSequence] = useState<'footage' | 'ad'>('footage');
    const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
    const [returnToTime, setReturnToTime] = useState<number | null>(null);
    const [hasPlayedAd, setHasPlayedAd] = useState<boolean>(false);
    const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
    const [autoPlay, setAutoPlay] = useState<boolean>(false);

    useEffect(() => {
        // footage로 전환 시 returnToTime으로 이동
        if (playbackSequence === 'footage' && returnToTime !== null && !isTransitioning) {
            setIsTransitioning(true);
            if (playerRef.current) {
                console.log('Seeking to return time:', returnToTime);
                playerRef.current.seekTo(returnToTime, 'seconds');
            }
            setIsTransitioning(false);
        }
    }, [playbackSequence, returnToTime]);

    useEffect(() => {
        // Reset states when ad changes
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
    }, [selectedAd]);

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
        if (selectedChapter === null || !chaptersData || !adVideoDetails) return;

        const chapter = chaptersData.chapters[selectedChapter];

        // footage 재생 중이고 chapter 종료 지점에 도달했고 아직 광고를 재생하지 않았을 때
        if (playbackSequence === 'footage' &&
            Math.abs(state.playedSeconds - chapter.end) < 0.5 &&
            !hasPlayedAd) {
            console.log('Reached chapter end point, switching to ad');
            setPlaybackSequence('ad');
            setReturnToTime(chapter.end);  // 광고 후 같은 지점으로 돌아옴
            setHasPlayedAd(true);
        }
    };

    const handleChapterClick = (index: number) => {
        if (!selectedAd) {
            alert("Please select an ad first");
            return;
        }
        if (!chaptersData) return;

        const chapter = chaptersData.chapters[index];
        console.log('Selected chapter:', chapter);

        setSelectedChapter(index);
        setHasPlayedAd(false);

        if (playerRef.current) {
            playerRef.current.seekTo(chapter.start, 'seconds');
        }
    };

    const handleAdEnded = () => {
        console.log('Ad ended naturally');
        setPlaybackSequence('footage');
        setAutoPlay(true);
    };

    return (
        <ErrorBoundary FallbackComponent={ErrorFallback}>
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
                    <div className="absolute w-full h-1 bg-gray-300 top-1/2 -translate-y-1/2">
                        {chaptersData?.chapters?.map((chapter, index) => (
                            <div
                                key={`timeline-${index}`}
                                className={`absolute w-4 h-4 rounded-full -translate-y-1/2 -translate-x-1/2 cursor-pointer hover:scale-110 transition-transform
                                    ${selectedChapter === index ? 'bg-green-500' : 'bg-blue-500'}`}
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
                    </div>
                </div>
            </div>
        </ErrorBoundary>
    );
}

export default RecommendedPlacements
