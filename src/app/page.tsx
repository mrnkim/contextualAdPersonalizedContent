"use client";

import { useState } from 'react';
import { useQuery } from "@tanstack/react-query";
import Footage from './Footage';
import Ads from './Ads';
import { fetchFootageIndexId, fetchAdsIndexId } from '@/hooks/apiHooks';

export default function Page() {
  const [hashtags, setHashtags] = useState<string[]>([]);
  console.log("🚀 > Page > hashtags=", hashtags)
  const [footageVideoId, setFootageVideoId] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isRecommendClicked, setIsRecommendClicked] = useState(false);

  const { data: footageIndexId, isLoading: isFootageIndexIdLoading } = useQuery({
    queryKey: ['footageIndexId'],
    queryFn: fetchFootageIndexId,
  });

  const { data: adsIndexId, isLoading: isAdsIndexIdLoading } = useQuery({
    queryKey: ['adsIndexId'],
    queryFn: fetchAdsIndexId,
  });

 return (
    <main className="flex min-h-screen p-24">
    <div className="flex w-full max-w-7xl mx-auto">
      <div className="w-2/3 pr-4">
      <Footage
        setHashtags={setHashtags}
        indexId={footageIndexId?.footageIndexId}
        isIndexIdLoading={isFootageIndexIdLoading}
        footageVideoId={footageVideoId}
        setFootageVideoId={setFootageVideoId}
        selectedFile={selectedFile}
        setSelectedFile={setSelectedFile}
        setIsRecommendClicked={setIsRecommendClicked}
      />
      </div>
      <div className="w-1/6"></div>
      <div className="w-2/3 pl-4">
      <Ads
        hashtags={hashtags}
        setHashtags={setHashtags}
        indexId={adsIndexId?.adsIndexId}
        isIndexIdLoading={isAdsIndexIdLoading}
        footageVideoId={footageVideoId}
        selectedFile={selectedFile}
        isRecommendClicked={isRecommendClicked}
        setIsRecommendClicked={setIsRecommendClicked}
      />
      </div>
    </div>
  </main>
  );
}