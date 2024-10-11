import React from 'react'
import Video from './Video'

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

interface ClipsProps {
  clips: Clip[];
  indexId: string;
}

const Clips: React.FC<ClipsProps> = ({ clips, indexId }) => {
  return (
    <div className="flex flex-wrap -mx-2">
      {clips.map((clip, index) => (
        <div key={index} className="w-1/2 px-2 mb-4">
        <Video video={clip} indexId={indexId} />
        </div>
      ))}
    </div>
  )
}

export default Clips
