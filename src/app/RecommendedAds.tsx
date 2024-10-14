import React, { useEffect, useMemo } from 'react'
import { useQuery } from "@tanstack/react-query";
import { generateGist, textToVideoSearch } from '@/hooks/apiHooks';
import RecommendedAd from './RecommendedAd';
import { SearchResult } from '@/types'; // SearchResult 타입을 import 해야 합니다.

interface RecommendedAdsProps {
  hashtags: string[];
  setHashtags: (hashtags: string[]) => void;
  footageVideoId: string;
  indexId: string;
}

interface GistData {
  hashtags: string[];
}

interface SearchData {
  data: Array<{
    id: string;
    clips: Array<object>;
    search_pool: object;
  }>;
  search_pool: object,
  page_info: object,
}

const RecommendedAds = ({ hashtags, setHashtags, footageVideoId, indexId }: RecommendedAdsProps) => {
      const { data: gistData, error: gistError, isLoading: isGistLoading } = useQuery<GistData, Error>({
        queryKey: ["gist", footageVideoId],
        queryFn: () => generateGist(footageVideoId),
        enabled: hashtags.length === 0,
      });

    useEffect(() => {
      if (gistData?.hashtags && hashtags.length === 0) {
        setHashtags(gistData.hashtags);
      }
    }, [gistData, setHashtags, hashtags]); // hashtags를 의존성 배열에 추가

    const hashtagQuery = useMemo(() => {
      return hashtags.slice(0, 3).join(' ');
    }, [hashtags]);


    const { data: searchData, error: searchError, isLoading: isSearchLoading } = useQuery({
      queryKey: ["search", footageVideoId, hashtagQuery],
      queryFn: () => textToVideoSearch(indexId, hashtagQuery),
      enabled: hashtagQuery.length > 0,
    });

    return (
      <div className="flex flex-col w-full">
        {isGistLoading && <p>Loading gist...</p>}
        {gistError && <p>Error loading gist: {gistError.message}</p>}
        {isSearchLoading && <p>Searching for ads...</p>}
        {searchError && <p>Error searching for ads: {searchError.message}</p>}
        {searchData?.data?.length > 0 && searchData.data.map((recommendedAd) => (
          <RecommendedAd key={recommendedAd.id} recommendedAd={recommendedAd} indexId={indexId} />
        ))}
      </div>
    )
}

export default RecommendedAds
