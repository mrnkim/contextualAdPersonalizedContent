import React from 'react'
import Video from './Video'
import Clips from './Clips'

interface RecommendedAdProps {
  recommendedAd: {
    id?: string;
    clips: Array<object>;
  };
  indexId: string;
}

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

const RecommendedAd: React.FC<RecommendedAdProps> = ({ recommendedAd, indexId }) => {
  console.log("🚀 > recommendedAd=", recommendedAd)

  return (
    <div className="flex gap-5">
      <div className="w-3/5">
        <Video video={recommendedAd} indexId={indexId} />
      </div>
      <div className="w-2/5 overflow-auto">
        <Clips clips={recommendedAd.clips as Clip[]} indexId={indexId} />
      </div>
    </div>
  )
}

export default RecommendedAd
