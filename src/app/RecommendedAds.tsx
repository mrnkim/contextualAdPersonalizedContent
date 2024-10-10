import React, { useEffect, useMemo } from 'react'
import { useQuery } from "@tanstack/react-query";
import { generateGist, textToVideoSearch } from '@/hooks/apiHooks';

interface RecommendedAdsProps {
  hashtags: string[];
  setHashtags: (hashtags: string[]) => void;
  footageVideoId: string;
  indexId: string;
}

interface GistData {
  hashtags: string[];
}

const RecommendedAds = ({ hashtags, setHashtags, footageVideoId, indexId }: RecommendedAdsProps) => {
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

    const hashtagQuery = useMemo(() => {
      return hashtags.slice(0, 3).join(' ');
    }, [hashtags]);

    console.log("🚀 > RecommendedAds > hashtagQuery=", hashtagQuery);

    const { data: searchData, error: searchError, isLoading: isSearchLoading } = useQuery<GistData, Error>({
      queryKey: ["search", footageVideoId],
      queryFn: () => textToVideoSearch(indexId, hashtagQuery),
      enabled: hashtagQuery.length > 0,
    });

    console.log("🚀 > RecommendedAds > searchData=", searchData)
    return (
      <div>
        {/* You can use the hashtagQuery here for your text to video search */}
      </div>
    )
}

export default RecommendedAds
