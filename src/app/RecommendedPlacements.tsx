import { useQuery } from '@tanstack/react-query';
import { ChaptersData, VideoDetails } from './types';
import { generateChapters, fetchVideoDetails } from '@/hooks/apiHooks';
import React, {useState, useRef, useEffect} from 'react'
import ReactPlayer from 'react-player';
import VideoThumbnail from './VideoThumbnail';

interface RecommendedPlacementsProps {
  footageVideoId: string;
  indexId: string;
}

const RecommendedPlacements = ({ footageVideoId, indexId }: RecommendedPlacementsProps) => {
    const [playing, setPlaying] = useState(false);
    const playerRef = useRef<ReactPlayer>(null);
    const [currentChapterIndex, setCurrentChapterIndex] = useState<number | null>(null);

    const { data: chaptersData, error: chaptersError, isLoading: isChaptersLoading } = useQuery<ChaptersData, Error>({
        queryKey: ["chapters", footageVideoId],
        queryFn: () => generateChapters(footageVideoId),
    });

    const { data: videoDetail } = useQuery<VideoDetails, Error>({
        queryKey: ["videoDetail", footageVideoId],
        queryFn: () => {
          if (!footageVideoId) {
            throw new Error("Footage Video ID is missing");
          }
          return fetchVideoDetails(footageVideoId, indexId);
        },
        staleTime: 600000,
        gcTime: 900000,
        enabled: !!indexId && (!!footageVideoId),
      });

      const handleProgress = (state: { playedSeconds: number }) => {
        if (currentChapterIndex !== null && chaptersData?.chapters) {
            const chapter = chaptersData.chapters[currentChapterIndex];
            if (state.playedSeconds >= chapter.end + 2) {
                setPlaying(false);
                setCurrentChapterIndex(null);
                if (playerRef.current) {
                    playerRef.current.seekTo(chapter.end - 2, 'seconds');
                }
            }
        }
    };

    useEffect(() => {
        if (currentChapterIndex !== null && playerRef.current && chaptersData?.chapters) {
            const chapter = chaptersData.chapters[currentChapterIndex];
            const seekTime = chapter.end - 2;
            playerRef.current.seekTo(seekTime, 'seconds');
            setPlaying(true);
        }
    }, [currentChapterIndex, chaptersData]);

    const handlePlay = (index: number) => {
        if (currentChapterIndex === index) {
            setPlaying(!playing);
        } else {
            setCurrentChapterIndex(index);
            setPlaying(true);
        }
    };

    return (
		<div>
        <h2 className="text-2xl text-center font-bold mb-6">Recommended Placements</h2>
        <div className="grid grid-cols-3 items-center gap-4">
            {chaptersData?.chapters?.map((chapter, index) => (
                <div
                    key={`chapter-${index}`}
                    className="w-full h-0 pb-[56.25%] relative overflow-hidden rounded cursor-pointer"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handlePlay(index);
                    }}
                >
                    <div className="absolute inset-0">
                        <VideoThumbnail
                            indexId={indexId}
                            videoId={footageVideoId}
                            time={Math.round(chapter.end - 2)}
                        />
                    </div>

                    <div className={`absolute inset-0 transition-opacity duration-300 ${currentChapterIndex === index && playing ? 'opacity-100' : 'opacity-0'}`}>
                        <ReactPlayer
                            key={`player-${index}`}
                            ref={index === currentChapterIndex ? playerRef : null}
                            url={videoDetail?.hls?.video_url}
                            controls
                            width="100%"
                            height="100%"
                            style={{ position: 'absolute', top: 0, left: 0 }}
                            playing={currentChapterIndex === index && playing}
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
                    </div>
                </div>
            ))}
        </div>
        </div>
    );
}

export default RecommendedPlacements
