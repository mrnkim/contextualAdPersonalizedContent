import React, {useEffect} from 'react'
import { useQuery } from "@tanstack/react-query";
import { generateGist } from '@/hooks/apiHooks';

interface RecommendedAdsProps {
  hashtags: string[];
  setHashtags: (hashtags: string[]) => void;
  footageVideoId: string;
}

interface GistData {
  hashtags: string[];
}

const RecommendedAds = ({ hashtags, setHashtags, footageVideoId }: RecommendedAdsProps) => {
    console.log("🚀 > RecommendedAds > hashtags=", hashtags)
    //TODO: Add generageGist if hashtags are empty
      const { data: gistData, error: gistError, isLoading: isGistLoading } = useQuery<GistData, Error>({
        queryKey: ["gist", footageVideoId],
        queryFn: () => generateGist(footageVideoId),
        enabled: hashtags.length === 0,
      });

    useEffect(() => {
      if (gistData?.hashtags && hashtags.length === 0) {
        setHashtags(gistData.hashtags);
      }
    }, [gistData, setHashtags]);

  return (
    <div>

    </div>
  )
}

export default RecommendedAds
