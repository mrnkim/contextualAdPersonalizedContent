"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import clsx from "clsx";
import ReactPlayer from "react-player";
import ErrorFallback from "./ErrorFallback";
import { fetchVideoDetail } from "@/hooks/apiHooks";

interface VideoDetail {
  hls: VideoHLS;
  metadata: VideoMetadata;
}

interface VideoMetadata {
  duration: number;
  engine_ids: string[];
  filename: string;
  fps: number;
  height: number;
  size: number;
  video_title: string;
  width: number;
}

interface VideoHLS {
  status: string;
  thumbnail_urls: string[];
  updated_at: string;
  video_url: string;
}

interface VideoProps {
  video: {
    _id?: string;
    metadata?: VideoMetadata;
    id?: string;
    clips?: object[];
  } | Clip;
  indexId: string;
  start?: number;
  end?: number;
}

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

const Video: React.FC<VideoProps> = ({ video, indexId, start, end }) => {
  console.log("🚀 > start=", start)
  const [playing, setPlaying] = useState(false);

  // 새로운 함수 추가
  const roundToInteger = (num: number | undefined): number | undefined => {
    return num !== undefined ? Math.round(num) : undefined;
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
    queryKey: ["videoDetail", 'video_id' in video ? video.video_id : ('_id' in video ? video._id : video.id)],
    queryFn: () => {
      const videoId = 'video_id' in video ? video.video_id : ('_id' in video ? video._id : video.id);
      if (!videoId) {
        throw new Error("Video ID is missing");
      }
      return fetchVideoDetail(videoId, indexId);
    },
    staleTime: 600000,
    gcTime: 900000,
    enabled: !!indexId && !!(
      (video as Clip).video_id ||
      ('_id' in video && video._id) ||
      ('id' in video && video.id) ||
      undefined
    )
  });

  if (!videoDetail) {
    return <div>Loading video details...</div>;
  }

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
            url={videoDetail.hls.video_url}
            controls
            width="100%"
            height="100%"
            style={{ position: 'absolute', top: 0, left: 0 }}
            light={
              <img
                src={
                  (video as Clip).thumbnail_url ||
                  videoDetail.hls.thumbnail_urls?.[0] ||
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
            start={roundToInteger(start)}
            end={roundToInteger(end)}
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
            {!video?.confidence && <div
              className={clsx(
                "bg-grey-1000/60",
                "px-2",
                "py-1",
                "rounded-sm"
              )}
            >
              <p className={clsx("text-white", "text-xs", "font-light")}>
                {formatDuration(videoDetail.metadata?.duration ?? 0)}
              </p>
            </div>}
          </div>
        </div>
      </div>
      <div className="mt-2">
        <p className={clsx("text-body3", "truncate", "text-grey-700")}>
          {videoDetail.metadata?.filename}
        </p>
      </div>
    </div>
  );
};

export default Video;
