"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import clsx from "clsx";
import ReactPlayer from "react-player";
import ErrorFallback from "./ErrorFallback";

interface VideoMetadata {
  duration: number;
  filename: string;
}

interface VideoHLS {
  video_url: string;
  thumbnail_urls: string[];
  thumbnailUrls?: string[];
}

interface VideoProps {
  video: {
    _id?: string;
    metadata?: VideoMetadata;
  };
  indexId: string;
}

interface VideoDetail {
  hls: VideoHLS;
}

/**
 *
 * Videos ->  Video
 */
const Video: React.FC<VideoProps> = ({ video, indexId }) => {
  const [playing, setPlaying] = useState(false);

  /** Fetches detailed information of a video */
  const fetchVideoDetail = async (videoId: string, indexId: string): Promise<VideoDetail> => {
    const response = await fetch(`/api/getVideo?videoId=${videoId}&indexId=${indexId}`);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return response.json();
  };

  /** Formats a duration in seconds into a "HH:MM:SS" string format */
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

  /** Queries the detailed information of a video using React Query */
  const { data: videoDetail, error: videoError } = useQuery<VideoDetail, Error>({
    queryKey: ["videoDetail", video?._id],
    queryFn: () => {
      if (!video?._id) {
        throw new Error("Video ID is missing");
      }
      return fetchVideoDetail(video._id, indexId);
    },
    staleTime: 600000,
    gcTime: 900000,
  });

  if (videoError) {
    return <ErrorFallback error={videoError} />;
  }

  return (
    <div className="flex flex-col w-full max-w-sm">
      <div className="relative">
        <div
          className="w-full h-0 pb-[56.25%] relative overflow-hidden rounded cursor-pointer"
          onClick={() => setPlaying(!playing)}
        >
          <ReactPlayer
            url={videoDetail?.hls?.video_url}
            controls
            width="100%"
            height="100%"
            style={{ position: 'absolute', top: 0, left: 0 }}
            light={
              <img
                src={
                  videoDetail?.hls?.thumbnail_urls?.[0] ||
                  videoDetail?.hls?.thumbnailUrls?.[0] ||
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
                {formatDuration(video?.metadata?.duration ?? 0)}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-2">
        <p className={clsx("text-body3", "truncate", "text-grey-700")}>
          {video?.metadata?.filename}
        </p>
      </div>
    </div>
  );
};

export default Video;
