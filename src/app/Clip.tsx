import React, { useState, useRef } from 'react'
import ReactPlayer from 'react-player'
import clsx from 'clsx'
import { ClipProps } from './types'

const Clip: React.FC<ClipProps> = ({ clip, videoDetails }) => {
    const [playing, setPlaying] = useState(false);
    const playerRef = useRef<ReactPlayer>(null);

    const handleProgress = (state: { playedSeconds: number }) => {
        if (state.playedSeconds >= clip.end) {
            setPlaying(false);
            if (playerRef.current) {
                playerRef.current.seekTo(clip.start);
            }
        }
    };

    const handlePlay = () => {
        setPlaying(true);
        if (playerRef.current) {
            playerRef.current.seekTo(clip.start);
        }
    };

    return (
        <div className="flex flex-col w-full max-w-md">
          <div className="relative">
            <div
              className="w-full h-0 pb-[56.25%] relative overflow-hidden rounded cursor-pointer"
              onClick={() => setPlaying(!playing)}
            >
              <ReactPlayer
                ref={playerRef}
                url={videoDetails?.hls?.video_url}
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
                    {clip.confidence}

                  </p>
                </div>}
              </div>
            </div>
          </div>
        </div>
      );
}

export default Clip
