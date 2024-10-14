import React, {useState} from 'react'
import Video from './Video'
import Clips from './Clips'
import { useQuery } from "@tanstack/react-query";
import { fetchVideoDetails, generateCustomTexts } from "@/hooks/apiHooks";
import Button from './Button'

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

const AD_COPY_PROMPT = "Based on the ad video, provide the headlines, ad copies, and hashtags. Provide the titles (Headline, Ad Copy, Hashtag) before each. Do not include any introductory text or comments. Start straight away with Headlines."

const RecommendedAd: React.FC<RecommendedAdProps> = ({ recommendedAd, indexId }) => {
  const [isAdCopyClicked, setIsAdCopyClicked] = useState(false);

  const { data: videoDetails} = useQuery({
    queryKey: ["videoDetails", recommendedAd.id],
    queryFn: () => fetchVideoDetails(recommendedAd.id!, indexId),
    enabled: !!recommendedAd.id && !!indexId
  });

  const { data: AdCopyData, error: adCopyError, isLoading: isAdCopyLoading } = useQuery({
    queryKey: ["adCopy", recommendedAd.id],
    queryFn: () => generateCustomTexts(recommendedAd.id, AD_COPY_PROMPT),
    enabled: !!recommendedAd.id
  });

  console.log("🚀 > AdCopyData=", AdCopyData)
  return (
    <div className="flex w-full my-5">
      <div className="w-1/2 pr-2">
        <Video video={recommendedAd} indexId={indexId}/>
        <div className="flex justify-center mt-4">
          <Button
            type="button"
            size="sm"
            appearance="primary"
            onClick={() => setIsAdCopyClicked(true)}
          >
            Generate Ad Copy
          </Button>
        </div>
      </div>
      <div className="flex justify-center">
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
