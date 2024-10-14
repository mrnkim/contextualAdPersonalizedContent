import React from 'react'
import Video from './Video'
import Clips from './Clips'
import { useQuery } from "@tanstack/react-query";
import { fetchVideoDetails } from "@/hooks/apiHooks";

interface RecommendedAdProps {
  recommendedAd: {
    id?: string;
    clips: Array<object>
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
  const { data: videoDetails, isLoading, error } = useQuery({
    queryKey: ["videoDetails", recommendedAd.id],
    queryFn: () => fetchVideoDetails(recommendedAd.id!, indexId),
    enabled: !!recommendedAd.id && !!indexId
  });

  return (
    <div className="flex w-full my-5">
      <div className="w-1/2 pr-2">
        <Video video={recommendedAd} indexId={indexId}/>
      </div>
      <div className="w-1/2 pl-2 overflow-auto">
        <Clips
          clips={recommendedAd.clips as Clip[]}
          videoDetails={videoDetails}
        />
      </div>
    </div>
  )
}

export default RecommendedAd
