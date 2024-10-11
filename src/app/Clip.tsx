import React, { useState, useRef } from 'react'
import ReactPlayer from 'react-player'
import clsx from 'clsx'

// Clip 인터페이스 추가
interface Clip {
    confidence: "low" | "medium" | "high";
    end: number;
    metadata: Array<{ type: string }>;
    modules: Array<{ type: string, confidence: string }>;
    start: number;
    score: number;
    thumbnail_url: string;
    video_id: string;
}

interface ClipProps {
    clip: Clip;
    start: number;
    end: number;
    videoDetails: object;
}

const Clip: React.FC<ClipProps> = ({ clip, start, end, videoDetails }) => {
    const [playing, setPlaying] = useState(false);
    const playerRef = useRef<ReactPlayer>(null);

    const handleProgress = (state: { playedSeconds: number }) => {
        if (state.playedSeconds >= end) {
            setPlaying(false);
            if (playerRef.current) {
                playerRef.current.seekTo(start);
            }
        }
    };

    const handlePlay = () => {
        setPlaying(true);
        if (playerRef.current) {
            playerRef.current.seekTo(start);
        }
    };

    // formatDuration 함수 추가 (예시)
    const formatDuration = (seconds: number): string => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    return (
        <div className="flex flex-col w-full max-w-md"> {/* max-w-sm을 max-w-md로 변경 */}
          <div className="relative">
            <div
              className="w-full h-0 pb-[56.25%] relative overflow-hidden rounded cursor-pointer"
              onClick={() => setPlaying(!playing)}
            >
              <ReactPlayer
                ref={playerRef}
                url={`${videoDetails?.hls?.video_url}`}
                controls
                width="100%"
                height="100%"
                style={{ position: 'absolute', top: 0, left: 0 }}
                light={clip.thumbnail_url}
                playing={playing}
                config={{
                  file: {
                    attributes: {
                      preload: "auto",
                    },
                  },
                }}
                progressInterval={100}
                onProgress={handleProgress}
                onPlay={handlePlay}
              />
              <div
                className={clsx(
                  "absolute",
                  "top-2",
                  "left-1/2",
                  "transform",
                  "-translate-x-1/2",
                  "z-10"
                )}
              >
                {<div
                  className={clsx(
                    "bg-grey-1000/60",
                    "px-2",
                    "py-1",
                    "rounded-sm"
                  )}
                >
                  <p className={clsx("text-white", "text-xs", "font-light")}>
                    {formatDuration(end - start)}
                  </p>
                </div>}
              </div>
            </div>
          </div>
          <div className="mt-2">
            <p className={clsx("text-body3", "truncate", "text-grey-700")}>
              {clip.confidence}
            </p>
          </div>
        </div>
      );
}

export default Clip
