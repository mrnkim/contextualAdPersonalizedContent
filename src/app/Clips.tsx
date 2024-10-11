import React from 'react'
import Clip from './Clip';

interface ClipData {
    confidence: "low" | "medium" | "high";
    end: number;
    metadata: Array<{ type: string }>;
    modules: Array<{ type: string, confidence: string }>;
    start: number;
    score: number;
    thumbnail_url: string;
    video_id: string;
  }

interface VideoDetails {
  hls: {
    video_url: string;
    thumbnail_urls: string[];
    status: string;
    updated_at: string;
  };
  metadata: {
    duration: number;
    engine_ids: string[];
    filename: string;
    fps: number;
    height: number;
    size: number;
    video_title: string;
    width: number;
  };
}

interface ClipsProps {
  clips: ClipData[];
  videoDetails: VideoDetails;
}

const Clips: React.FC<ClipsProps> = ({ clips, videoDetails }) => {
  return (
    <div className="flex flex-wrap -mx-2">
      {clips.map((clip, index) => (
        <div key={index} className="w-1/2 px-2 mb-4">
        <Clip clip={clip} start={clip.start} end={clip.end} videoDetails={videoDetails} />
        </div>
      ))}
    </div>
  )
}

export default Clips
