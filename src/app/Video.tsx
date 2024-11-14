"use client";

import React, { useState, Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { ErrorBoundary } from "react-error-boundary";
import ErrorFallback from "./ErrorFallback";
import clsx from "clsx";
import ReactPlayer from "react-player";
import { fetchVideoDetails } from "@/hooks/apiHooks";
import LoadingSpinner from "./LoadingSpinner";
import { VideoProps, VideoDetails } from "./types";

const Video: React.FC<VideoProps> = ({ videoId, indexId, showTitle = true, videoDetails: providedVideoDetails }) => {
  const [playing, setPlaying] = useState(false);

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    return [
      hours.toString().padStart(2, "0"),
      minutes.toString().padStart(2, "0"),
      secs.toString().padStart(2, "0"),
    ].join(":");
  };

  const { data: videoDetails } = useQuery<VideoDetails, Error>({
    queryKey: ["videoDetails", videoId],
    queryFn: () => {
      if (!videoId) {
        throw new Error("Video ID is missing");
      }
      return fetchVideoDetails((videoId)!, indexId);
    },
    staleTime: 600000,
    gcTime: 900000,
    enabled: !!indexId && (!!videoId) && !providedVideoDetails,
  });

  const finalVideoDetails = providedVideoDetails || videoDetails;

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Suspense fallback={<LoadingSpinner />}>
        <div className="flex flex-col w-full max-w-sm">
          <div className="relative">
            <div
              className="w-full h-0 pb-[56.25%] relative overflow-hidden rounded cursor-pointer"
              onClick={() => setPlaying(!playing)}
            >
              <ReactPlayer
                url={finalVideoDetails?.hls?.video_url}
                controls
                width="100%"
                height="100%"
                style={{ position: 'absolute', top: 0, left: 0 }}
                light={
                  <img
                    src={
                      finalVideoDetails?.hls?.thumbnail_urls?.[0] ||
                      '/videoFallback.jpg'
                    }
                    className="object-cover w-full h-full"
                    alt="thumbnail"
                  />
                }
                playing={playing}
                config={{
                  file: {
                    attributes: {
                      preload: "auto",
                    },
                  },
                }}
                progressInterval={100}
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
                <div
                  className={clsx(
                    "bg-grey-1000/60",
                    "px-2",
                    "py-1",
                    "rounded-sm"
                  )}
                >
                  <p className={clsx("text-white", "text-xs", "font-light")}>
                    {formatDuration(finalVideoDetails?.metadata?.duration ?? 0)}
                  </p>
                </div>
              </div>
            </div>
          </div>
          {showTitle && (
            <div className="mt-2">
              <p className={clsx("text-body3", "truncate", "text-grey-700")}>
                {finalVideoDetails?.metadata?.filename}
              </p>
            </div>
          )}
        </div>
      </Suspense>
    </ErrorBoundary>
  );
};

export default Video;
